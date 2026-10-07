import { TestBed } from '@angular/core/testing';
import { UserMetadataDto } from '@tmdjr/user-metadata-contracts';
import { UserMetadataListComponent } from '../../../../../src/app/features/user-management/components/user-metadata-list';

describe('UserMetadataListComponent', () => {
  it('renders empty state and translates paginator indices to API pages', async () => {
    await TestBed.configureTestingModule({
      imports: [UserMetadataListComponent],
    }).compileComponents();
    const fixture = TestBed.createComponent(
      UserMetadataListComponent
    );
    fixture.componentRef.setInput('userMetadata', []);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain(
      'No user metadata found'
    );
    const listener = jasmine.createSpy('pagination');
    fixture.componentInstance.paginationChange.subscribe(listener);
    fixture.componentInstance.onPageChange({
      pageIndex: 2,
      pageSize: 20,
      length: 100,
    });
    expect(listener).toHaveBeenCalledWith({ page: 3, limit: 20 });
  });
  it('emits role intent without mutating the supplied user and disables destructive controls while saving', async () => {
    await TestBed.configureTestingModule({
      imports: [UserMetadataListComponent],
    }).compileComponents();
    const fixture = TestBed.createComponent(
      UserMetadataListComponent
    );
    const user = { uuid: 'u1', role: 'regular' } as UserMetadataDto;
    fixture.componentRef.setInput('userMetadata', [user]);
    fixture.componentRef.setInput('busy', true);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    const listener = jasmine.createSpy('role');
    fixture.componentInstance.updateUserRole.subscribe(listener);
    fixture.componentInstance.roleChange(user, 'admin');
    expect(user.role).toBe('regular');
    expect(listener).toHaveBeenCalledWith({
      uuid: 'u1',
      role: 'admin',
    });
    expect(
      fixture.nativeElement.querySelector(
        'button[aria-label="Delete u1"]'
      ).disabled
    ).toBeTrue();
    expect(
      fixture.nativeElement
        .querySelector('mat-select[aria-label="Role for u1"]')
        .getAttribute('aria-disabled')
    ).toBe('true');
  });
});
