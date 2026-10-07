import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { BehaviorSubject } from 'rxjs';
import { UserManagementStore } from '../../../../../src/app/features/user-management/state/user-management.store';
import { environment } from '../../../../../src/environments/environment';

const base = environment.userMetadataApiBaseUrl;
const page = (page = 1, total = 1) => ({
  data: total ? [{ uuid: 'u1', role: 'regular' }] : [],
  page,
  total,
  limit: 10,
  totalPages: Math.ceil(total / 10),
});

describe('UserManagementStore', () => {
  let store: UserManagementStore;
  let http: HttpTestingController;
  const catalog = () =>
    http.expectOne((req) => req.url === `${base}/all`);
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    http = TestBed.inject(HttpTestingController);
    store = TestBed.inject(UserManagementStore);
    catalog().flush(page());
  });
  afterEach(() => http.verify());

  it('cancels stale queries and applies filters atomically at page one', () => {
    store.setPage(3, 20);
    const old = catalog();
    store.setFilters('new', 'admin');
    expect(old.cancelled).toBeTrue();
    const latest = catalog();
    expect(latest.request.params.get('page')).toBe('1');
    expect(latest.request.params.get('query')).toBe('new');
    expect(latest.request.params.get('role')).toBe('admin');
    latest.flush(page());
  });

  it('keeps the catalog stream alive after request failure', () => {
    let error: string | null = null;
    const sub = store.catalog$.subscribe(
      (state) => (error = state.error)
    );
    store.refresh();
    catalog().flush({}, { status: 500, statusText: 'Failure' });
    expect(error).toContain('Unable to load');
    store.refresh();
    catalog().flush(page());
    expect(error).toBeNull();
    sub.unsubscribe();
  });

  it('serializes profile writes and keeps accepted writes alive without view subscribers', () => {
    store.execute({
      kind: 'profile',
      uuid: 'u1',
      payload: { firstName: 'first' },
    });
    store.execute({
      kind: 'profile',
      uuid: 'u1',
      payload: { firstName: 'second' },
    });
    const first = http.expectOne(`${base}/u1/admin-override`);
    expect(first.request.body.firstName).toBe('first');
    first.flush({ uuid: 'u1' });
    catalog().flush(page());
    const second = http.expectOne(`${base}/u1/admin-override`);
    expect(second.request.body.firstName).toBe('second');
    second.flush({ uuid: 'u1' });
    catalog().flush(page());
    let pending = -1;
    store.write$
      .subscribe((state) => (pending = state.pending))
      .unsubscribe();
    expect(pending).toBe(0);
  });

  it('recovers after a failed profile write and allows explicit retry', () => {
    const command = {
      kind: 'profile' as const,
      uuid: 'u1',
      payload: { description: '' },
    };
    store.execute(command);
    http
      .expectOne(`${base}/u1/admin-override`)
      .flush({}, { status: 403, statusText: 'Forbidden' });
    let error: string | null = null;
    store.write$
      .subscribe((state) => (error = state.error))
      .unsubscribe();
    expect(error).toContain('retry');
    store.execute(command);
    const retry = http.expectOne(`${base}/u1/admin-override`);
    expect(retry.request.body.description).toBe('');
    retry.flush({ uuid: 'u1' });
    catalog().flush(page());
  });

  it('guards duplicate role/delete commands while a write is pending', () => {
    store.execute({ kind: 'role', uuid: 'u1', role: 'admin' });
    store.execute({ kind: 'delete', uuid: 'u1' });
    http.expectNone(`${base}/u1`);
    const role = http.expectOne(`${base}/u1/role`);
    expect(role.request.body).toEqual({ role: 'admin' });
    role.flush({ uuid: 'u1', role: 'admin' });
    catalog().flush(page());
  });

  it('moves back when deleting the last row on a later page', () => {
    store.setPage(2, 10);
    catalog().flush(page(2, 11));
    store.execute({ kind: 'delete', uuid: 'u1' });
    http.expectOne(`${base}/u1`).flush(null);
    catalog().flush({
      data: [],
      page: 2,
      total: 10,
      limit: 10,
      totalPages: 1,
    });
    const previous = catalog();
    expect(previous.request.params.get('page')).toBe('1');
    previous.flush(page());
  });

  it('follows UUID changes and cancels the previous profile read', () => {
    const uuid = new BehaviorSubject('u1');
    const retry = new BehaviorSubject(0);
    const sub = store.profile$(uuid, retry).subscribe();
    const old = http.expectOne(
      (req) => req.url === `${base}/u1/find-one`
    );
    uuid.next('u2');
    expect(old.cancelled).toBeTrue();
    http
      .expectOne((req) => req.url === `${base}/u2/find-one`)
      .flush({ uuid: 'u2' });
    sub.unsubscribe();
  });

  it('isolates assessment failures and retries both assessment reads', () => {
    const retry = new BehaviorSubject(0);
    let error: string | null = null;
    const sub = store
      .assessment$(new BehaviorSubject('u1'), retry)
      .subscribe((state) => (error = state.error));
    const eligibility = http.expectOne((req) =>
      req.url.includes('admin-user-subjects-eligibility')
    );
    const history = http.expectOne((req) =>
      req.url.includes('admin-user-asssessments')
    );
    eligibility.flush({}, { status: 500, statusText: 'Failure' });
    expect(history.cancelled).toBeTrue();
    expect(error).toContain('assessment');
    retry.next(1);
    http
      .expectOne((req) =>
        req.url.includes('admin-user-subjects-eligibility')
      )
      .flush([]);
    http
      .expectOne((req) => req.url.includes('admin-user-asssessments'))
      .flush([]);
    expect(error).toBeNull();
    sub.unsubscribe();
  });
  it('does not replay stale success notifications when a catalog view opens', () => {
    store.execute({
      kind: 'profile',
      uuid: 'u1',
      payload: { firstName: 'First' },
    });
    http.expectOne(`${base}/u1/admin-override`).flush({ uuid: 'u1' });
    catalog().flush(page());
    const listener = jasmine.createSpy('notification');
    const subscription = store.notifications$.subscribe(listener);
    expect(listener).not.toHaveBeenCalled();
    store.execute({
      kind: 'profile',
      uuid: 'u1',
      payload: { firstName: 'Next' },
    });
    http.expectOne(`${base}/u1/admin-override`).flush({ uuid: 'u1' });
    catalog().flush(page());
    expect(listener).toHaveBeenCalledTimes(1);
    subscription.unsubscribe();
  });
});
