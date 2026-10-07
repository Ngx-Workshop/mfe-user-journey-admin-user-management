import { TestBed } from '@angular/core/testing';
import { UserMetadataDto } from '@tmdjr/user-metadata-contracts';
import { ProfileFormViewModel } from '../../../../../../src/app/features/user-management/pages/details/profile-form.view-model';
import { ProfileChange } from '../../../../../../src/app/features/user-management/models/user-management.models';

const user = (uuid: string) =>
  ({
    uuid,
    role: 'regular',
    firstName: 'Original',
  }) as UserMetadataDto;
describe('ProfileFormViewModel', () => {
  let vm: ProfileFormViewModel;
  let changes: ProfileChange[];
  beforeEach(() => {
    jasmine.clock().install();
    jasmine.clock().mockDate(new Date());
    TestBed.configureTestingModule({
      providers: [ProfileFormViewModel],
    });
    vm = TestBed.inject(ProfileFormViewModel);
    changes = [];
    vm.changes$.subscribe((change) => changes.push(change));
    vm.setUser(user('u1'));
  });
  afterEach(() => jasmine.clock().uninstall());
  it('debounces valid edits and excludes the immutable UUID from the payload', () => {
    vm.form.controls.firstName.setValue('  Updated  ');
    jasmine.clock().tick(499);
    expect(changes.length).toBe(0);
    jasmine.clock().tick(1);
    expect(changes[0].uuid).toBe('u1');
    expect(changes[0].payload.firstName).toBe('Updated');
    expect('uuid' in changes[0].payload).toBeFalse();
    expect(vm.form.controls.uuid.disabled).toBeTrue();
  });
  it('preserves blank strings for clearing optional fields', () => {
    vm.form.controls.firstName.setValue('  ');
    jasmine.clock().tick(500);
    expect(changes[0].payload.firstName).toBe('');
  });
  it('blocks invalid email then resumes when corrected', () => {
    vm.form.controls.email.setValue('invalid');
    jasmine.clock().tick(500);
    expect(changes.length).toBe(0);
    vm.form.controls.email.setValue('valid@example.com');
    jasmine.clock().tick(500);
    expect(changes.length).toBe(1);
  });
  it('cancels pending autosave on user change and never saves initialization', () => {
    vm.form.controls.firstName.setValue('Old edit');
    jasmine.clock().tick(200);
    vm.setUser(user('u2'));
    jasmine.clock().tick(500);
    expect(changes.length).toBe(0);
    vm.form.controls.lastName.setValue('New edit');
    jasmine.clock().tick(500);
    expect(changes[0].uuid).toBe('u2');
  });
  it('avoids resaving equivalent normalized payloads', () => {
    vm.form.controls.firstName.setValue(' Updated ');
    jasmine.clock().tick(500);
    vm.form.controls.firstName.setValue('Updated');
    jasmine.clock().tick(500);
    expect(changes.length).toBe(1);
  });
});
