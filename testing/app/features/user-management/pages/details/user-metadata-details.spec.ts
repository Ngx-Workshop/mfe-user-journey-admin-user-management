import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { UserMetadataDetails } from '../../../../../../src/app/features/user-management/pages/details/user-metadata-details';
import { environment } from '../../../../../../src/environments/environment';

describe('User details route', () => {
  it('opens without waiting for assessments, retains the profile on assessment failure and follows route changes', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([
          { path: 'users/:userId', component: UserMetadataDetails },
        ]),
      ],
    });
    const http = TestBed.inject(HttpTestingController);
    const harness = await RouterTestingHarness.create('/users/u1');
    expect(harness.routeNativeElement?.textContent).toContain(
      'Loading user'
    );
    http
      .expectOne((req) => req.url.endsWith('/all'))
      .flush({
        data: [],
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
      });
    http
      .expectOne((req) => req.url.endsWith('/u1/find-one'))
      .flush({
        uuid: 'u1',
        firstName: 'First user',
        role: 'regular',
      });
    const eligibility = http.expectOne((req) =>
      req.url.includes('subjects-eligibility')
    );
    const history = http.expectOne((req) =>
      req.url.includes('asssessments')
    );
    eligibility.flush({}, { status: 500, statusText: 'Failure' });
    expect(history.cancelled).toBeTrue();
    harness.detectChanges();
    await harness.fixture.whenStable();
    harness.detectChanges();
    const input = harness.routeNativeElement?.querySelector(
      'input[formControlName="firstName"]'
    ) as HTMLInputElement;
    expect(input.value).toBe('First user');
    expect(harness.routeNativeElement?.textContent).toContain(
      'Retry assessments'
    );
    await harness.navigateByUrl('/users/u2');
    http
      .expectOne(
        (req) =>
          req.url ===
          `${environment.userMetadataApiBaseUrl}/u2/find-one`
      )
      .flush({
        uuid: 'u2',
        firstName: 'Second user',
        role: 'regular',
      });
    http
      .expectOne((req) => req.url.includes('subjects-eligibility'))
      .flush([]);
    http
      .expectOne((req) => req.url.includes('asssessments'))
      .flush([]);
    harness.detectChanges();
    await harness.fixture.whenStable();
    harness.detectChanges();
    expect(
      (
        harness.routeNativeElement?.querySelector(
          'input[formControlName="firstName"]'
        ) as HTMLInputElement
      ).value
    ).toBe('Second user');
    http.verify();
  });
});
