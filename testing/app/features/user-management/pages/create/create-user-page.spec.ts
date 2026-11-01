import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { inject } from '@angular/core';
import { provideRouter, Router } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { CreateUserPage } from '../../../../../../src/app/features/user-management/pages/create/create-user-page';
import { UserMetadataDetails } from '../../../../../../src/app/features/user-management/pages/details/user-metadata-details';
import { UserManagementStore } from '../../../../../../src/app/features/user-management/state/user-management.store';
import { environment } from '../../../../../../src/environments/environment';
const base = environment.userMetadataApiBaseUrl;
const empty = {
  data: [],
  total: 0,
  page: 1,
  limit: 10,
  totalPages: 1,
};
describe('Create sign-in account and profile journey', () => {
  let http: HttpTestingController;
  let harness: RouterTestingHarness;
  beforeEach(async () => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([
          {
            path: 'admin/user-management',
            children: [
              { path: 'user-metadata', component: CreateUserPage },
              {
                path: 'user-metadata/new',
                component: CreateUserPage,
                canDeactivate: [
                  () => inject(UserManagementStore).pending === 0,
                ],
              },
              {
                path: 'user-metadata/:userId',
                component: UserMetadataDetails,
              },
            ],
          },
        ]),
      ],
    });
    http = TestBed.inject(HttpTestingController);
    harness = await RouterTestingHarness.create(
      '/admin/user-management/user-metadata/new'
    );
    http.expectOne((req) => req.url.endsWith('/all')).flush(empty);
    await settle();
  });
  afterEach(() => http.verify());
  const settle = async () => {
    harness.detectChanges();
    await harness.fixture.whenStable();
    harness.detectChanges();
  };
  const button = (text: string) =>
    Array.from(
      harness.routeNativeElement!.querySelectorAll('button')
    ).find((b) => b.textContent?.trim() === text)!;
  const enter = async (field: string, value: string) => {
    const input = harness.routeNativeElement!.querySelector(
      `[formControlName=${field}]`
    ) as HTMLInputElement;
    input.value = value;
    input.dispatchEvent(new Event('input', { bubbles: true }));
    await settle();
  };
  const review = async () => {
    await enter('email', 'journey@example.invalid');
    await enter('password', 'Examplepass12345');
    await enter('confirmPassword', 'Examplepass12345');
    button('Continue to profile').click();
    await settle();
    await enter('firstName', 'Journey');
    button('Review account').click();
    await settle();
  };
  it('gates mismatched/weak credentials and early submit, then retains values while stepping back', async () => {
    expect(button('Continue to profile').disabled).toBeTrue();
    await enter('email', 'journey@example.invalid');
    await enter('password', 'short1');
    await enter('confirmPassword', 'short1');
    expect(button('Continue to profile').disabled).toBeTrue();
    await enter('password', 'Examplepass12345');
    expect(button('Continue to profile').disabled).toBeTrue();
    harness
      .routeNativeElement!.querySelector('form')!
      .dispatchEvent(
        new Event('submit', { bubbles: true, cancelable: true })
      );
    http.expectNone((req) => req.method === 'POST');
    await enter('confirmPassword', 'Examplepass12345');
    button('Continue to profile').click();
    await settle();
    await enter('firstName', 'Retained');
    button('Back').click();
    await settle();
    expect(
      (
        harness.routeNativeElement!.querySelector(
          '[formControlName=email]'
        ) as HTMLInputElement
      ).value
    ).toBe('journey@example.invalid');
    button('Continue to profile').click();
    await settle();
    expect(
      (
        harness.routeNativeElement!.querySelector(
          '[formControlName=firstName]'
        ) as HTMLInputElement
      ).value
    ).toBe('Retained');
  });
  it('retains a failed creation, retries the same operation, blocks duplicates/exit and opens the persisted UUID under the shell mount', async () => {
    await review();
    button('Create User').click();
    await settle();
    const first = http.expectOne(`${base}/admin/users`);
    const body = first.request.body;
    expect(body.email).toBe('journey@example.invalid');
    expect(body.firstName).toBe('Journey');
    expect(body.role).toBe('regular');
    expect(body.confirmPassword).toBeUndefined();
    expect(body.uuid).toBeUndefined();
    expect(body.requestId).toMatch(/^[0-9a-f-]{36}$/);
    expect(button('Creating…').disabled).toBeTrue();
    expect(
      await TestBed.inject(Router).navigateByUrl(
        '/admin/user-management/user-metadata'
      )
    ).toBeFalse();
    first.flush(
      { message: 'Account service unavailable. Retry safely.' },
      { status: 503, statusText: 'Unavailable' }
    );
    http.expectOne((req) => req.url.endsWith('/all')).flush(empty);
    await settle();
    expect(harness.routeNativeElement!.textContent).toContain(
      'Retry safely'
    );
    button('Create User').click();
    const retry = http.expectOne(`${base}/admin/users`);
    expect(retry.request.body.requestId).toBe(body.requestId);
    retry.flush({
      uuid: 'created-id',
      email: body.email,
      firstName: 'Journey',
      role: 'regular',
    });
    http.expectOne((req) => req.url.endsWith('/all')).flush(empty);
    await settle();
    http
      .expectOne((req) => req.url.endsWith('/created-id/find-one'))
      .flush({
        uuid: 'created-id',
        firstName: 'Journey',
        role: 'regular',
      });
    http
      .expectOne((req) => req.url.includes('subjects-eligibility'))
      .flush([]);
    http
      .expectOne((req) => req.url.includes('asssessments'))
      .flush([]);
    await settle();
    expect(TestBed.inject(Router).url).toBe(
      '/admin/user-management/user-metadata/created-id'
    );
    expect(
      harness.routeNativeElement!.querySelector(
        'input[type=password]'
      )
    ).toBeNull();
  });
});
