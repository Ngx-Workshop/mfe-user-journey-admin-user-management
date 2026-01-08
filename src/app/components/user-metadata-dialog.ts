import {
  Component,
  EventEmitter,
  input,
  Input,
  Output,
} from '@angular/core';
import {
  UpdateUserMetadataDto,
  UserMetadataDto,
} from '@tmdjr/user-metadata-contracts';
import { AssessmentTestList } from './assessment-test-list';
import { UserMetadataFormComponent } from './user-metadata-form';

@Component({
  selector: 'ngx-user-metadata-dialog',
  imports: [UserMetadataFormComponent, AssessmentTestList],
  template: `
    <ngx-user-metadata-form
      [value]="value()"
      [loading]="loading"
      (cancel)="cancel.emit()"
      (submitForm)="submitForm.emit($event)"
    >
    </ngx-user-metadata-form>
    <ngx-assessment-test-list
      [userId]="value().uuid"
    ></ngx-assessment-test-list>
  `,
  styles: [
    `
      :host {
        display: flex;
      }
    `,
  ],
})
export class UserMetadataDialog {
  value = input.required<UserMetadataDto>();

  @Input()
  loading = false;

  @Output()
  cancel = new EventEmitter<void>();

  @Output()
  submitForm = new EventEmitter<UpdateUserMetadataDto>();
}
