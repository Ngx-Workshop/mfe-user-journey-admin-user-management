import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { of } from 'rxjs';
import { UserMetadataDto } from '@tmdjr/user-metadata-contracts';
import { CatalogViewModel } from '../../../../../../src/app/features/user-management/pages/catalog/catalog.view-model';

describe('CatalogViewModel', () => {
  let vm: CatalogViewModel;
  let http: HttpTestingController;
  const dialog = { open: jasmine.createSpy('open') };
  beforeEach(() => {
    jasmine.clock().install();
    jasmine.clock().mockDate(new Date());
    dialog.open.and.returnValue({ afterClosed: () => of(false) });
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        CatalogViewModel,
        { provide: MatDialog, useValue: dialog },
        {
          provide: MatSnackBar,
          useValue: { open: jasmine.createSpy('snackbar') },
        },
      ],
    });
    http = TestBed.inject(HttpTestingController);
    vm = TestBed.inject(CatalogViewModel);
    http
      .expectOne((req) => req.url.endsWith('/all'))
      .flush({
        data: [],
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
      });
  });
  afterEach(() => {
    http.verify();
    jasmine.clock().uninstall();
  });
  it('debounces rapid searches and uses the latest draft when a role is chosen', () => {
    vm.searchFor('first');
    vm.searchFor('latest');
    jasmine.clock().tick(299);
    http.expectNone((req) => req.url.endsWith('/all'));
    jasmine.clock().tick(1);
    const search = http.expectOne((req) => req.url.endsWith('/all'));
    expect(search.request.params.get('query')).toBe('latest');
    search.flush({ data: [], page: 1 });
    vm.searchFor('new draft');
    vm.filterRole('admin');
    const role = http.expectOne((req) => req.url.endsWith('/all'));
    expect(role.request.params.get('query')).toBe('new draft');
    expect(role.request.params.get('role')).toBe('admin');
    role.flush({ data: [], page: 1 });
  });
  it('does not delete a user when the dialog is canceled', () => {
    vm.remove({ uuid: 'u1', role: 'regular' } as UserMetadataDto);
    expect(dialog.open).toHaveBeenCalled();
    http.expectNone((req) => req.method === 'DELETE');
  });
  it('deletes only after explicit dialog confirmation', () => {
    dialog.open.and.returnValue({ afterClosed: () => of(true) });
    vm.remove({ uuid: 'u1', role: 'regular' } as UserMetadataDto);
    const request = http.expectOne((req) => req.method === 'DELETE');
    expect(request.request.url.endsWith('/u1')).toBeTrue();
    request.flush(null);
    http
      .expectOne((req) => req.url.endsWith('/all'))
      .flush({
        data: [],
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
      });
  });
});
