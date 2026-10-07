import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { UserMetadataApi } from '../../../../../src/app/features/user-management/api/user-metadata.api';
import { environment } from '../../../../../src/environments/environment';

describe('UserMetadataApi', () => {
  let api: UserMetadataApi;
  let http: HttpTestingController;
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    api = TestBed.inject(UserMetadataApi);
    http = TestBed.inject(HttpTestingController);
  });
  afterEach(() => http.verify());
  it('uses environment URL and encodes query parameters', () => {
    api
      .findAll({
        page: 2,
        limit: 20,
        query: 'a+b@example.com',
        role: 'admin',
      })
      .subscribe();
    const req = http.expectOne(
      (req) => req.url === `${environment.userMetadataApiBaseUrl}/all`
    );
    expect(req.request.params.get('query')).toBe('a+b@example.com');
    expect(req.request.params.get('page')).toBe('2');
    expect(req.request.params.get('role')).toBe('admin');
    req.flush({ data: [] });
  });
  it('keeps profile, role and deletion contracts separate', () => {
    api.update('u1', { description: '' }).subscribe();
    const profile = http.expectOne(
      `${environment.userMetadataApiBaseUrl}/u1/admin-override`
    );
    expect(profile.request.method).toBe('PATCH');
    expect(profile.request.body).toEqual({ description: '' });
    profile.flush({});
    api.updateUserRole('u1', 'publisher').subscribe();
    const role = http.expectOne(
      `${environment.userMetadataApiBaseUrl}/u1/role`
    );
    expect(role.request.body).toEqual({ role: 'publisher' });
    role.flush({});
    api.remove('u1').subscribe();
    const remove = http.expectOne(
      `${environment.userMetadataApiBaseUrl}/u1`
    );
    expect(remove.request.method).toBe('DELETE');
    remove.flush(null);
  });
});
