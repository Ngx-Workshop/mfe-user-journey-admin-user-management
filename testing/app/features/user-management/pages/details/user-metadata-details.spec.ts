import { firstValueFrom } from 'rxjs';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { By } from '@angular/platform-browser';
import { MatSelect } from '@angular/material/select';
import { provideRouter, Router } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { UserMetadataDetails } from '../../../../../../src/app/features/user-management/pages/details/user-metadata-details';
import { environment } from '../../../../../../src/environments/environment';

@Component({ template: 'Directory' })
class Directory {}

describe('User details route', () => {
  it('retains profile drafts after role failure, confirms deletion and returns to the host-relative directory', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([
          {
            path: 'admin/user-management',
            children: [
              { path: 'user-metadata', component: Directory },
              {
                path: 'user-metadata/:userId',
                component: UserMetadataDetails,
              },
            ],
          },
        ]),
      ],
    });
    const http = TestBed.inject(HttpTestingController);
    const harness = await RouterTestingHarness.create(
      '/admin/user-management/user-metadata/u1'
    );
    http
      .expectOne((req) => req.url.endsWith('/all'))
      .flush({
        data: [],
        page: 1,
        total: 0,
        limit: 10,
        totalPages: 1,
      });
    http
      .expectOne((req) => req.url.endsWith('/u1/find-one'))
      .flush({ uuid: 'u1', firstName: 'First', role: 'regular' });
    http
      .expectOne((req) => req.url.includes('subjects-eligibility'))
      .flush([]);
    http
      .expectOne((req) => req.url.includes('asssessments'))
      .flush([]);
    harness.detectChanges();
    await harness.fixture.whenStable();
    harness.detectChanges();
    const name = harness.routeNativeElement!.querySelector(
      '[formControlName=firstName]'
    ) as HTMLInputElement;
    name.value = 'Unsaved draft';
    name.dispatchEvent(new Event('input', { bubbles: true }));
    const email = harness.routeNativeElement!.querySelector(
      '[formControlName=email]'
    ) as HTMLInputElement;
    email.value = 'unfinished';
    email.dispatchEvent(new Event('input', { bubbles: true }));
    const select = harness.routeDebugElement!.query(
      By.directive(MatSelect)
    ).componentInstance as MatSelect;
    select.valueChange.emit('publisher');
    select.selectionChange.emit({
      source: select,
      value: 'publisher',
    });
    harness.detectChanges();
    await harness.fixture.whenStable();
    const role = http.expectOne((req) =>
      req.url.endsWith('/u1/role')
    );
    expect(role.request.body).toEqual({ role: 'publisher' });
    role.flush({}, { status: 503, statusText: 'Unavailable' });
    http
      .expectOne((req) => req.url.endsWith('/all'))
      .flush({
        data: [],
        page: 1,
        total: 0,
        limit: 10,
        totalPages: 1,
      });
    harness.detectChanges();
    await harness.fixture.whenStable();
    harness.detectChanges();
    expect(name.value).toBe('Unsaved draft');
    expect(select.value).toBe('regular');
    const page = harness.routeDebugElement!
      .componentInstance as UserMetadataDetails;
    const dialog = TestBed.inject(MatDialog);
    page.vm.remove({ uuid: 'u1', role: 'regular' } as any);
    harness.detectChanges();
    await harness.fixture.whenStable();
    const canceled = firstValueFrom(
      dialog.openDialogs[0].afterClosed()
    );
    dialog.openDialogs[0].close();
    await canceled;
    await harness.fixture.whenStable();
    http.expectNone((req) => req.method === 'DELETE');
    page.vm.remove({ uuid: 'u1', role: 'regular' } as any);
    harness.detectChanges();
    await harness.fixture.whenStable();
    const confirmed = firstValueFrom(
      dialog.openDialogs[0].afterClosed()
    );
    dialog.openDialogs[0].close(true);
    await confirmed;
    await harness.fixture.whenStable();
    harness.detectChanges();
    expect(name.disabled).toBeTrue();
    http.expectOne((req) => req.method === 'DELETE').flush(null);
    http
      .expectOne((req) => req.url.endsWith('/all'))
      .flush({
        data: [],
        page: 1,
        total: 0,
        limit: 10,
        totalPages: 1,
      });
    await harness.fixture.whenStable();
    expect(TestBed.inject(Router).url).toBe(
      '/admin/user-management/user-metadata'
    );
    http.verify();
  });

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
