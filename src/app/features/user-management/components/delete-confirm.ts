import { NgxButton } from '@tmdjr/ngx-workshop-design-system';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
} from '@angular/core';
import { MatButton } from '@angular/material/button';
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle,
} from '@angular/material/dialog';
import { UserMetadataDto } from '@tmdjr/user-metadata-contracts';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'ngx-confirm-delete-dialog',
  imports: [
    NgxButton,
    MatButton,
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions,
  ],
  template: `
    <h3 mat-dialog-title>Delete user metadata?</h3>
    <mat-dialog-content>
      <p>
        Delete the profile for {{ user.email || user.uuid }}? The
        sign-in account will remain. This cannot be undone.
      </p>
    </mat-dialog-content>
    <mat-dialog-actions>
      <button
        mat-flat-button
        ngxButton
        surface="outline"
        (click)="dialogRef.close()"
      >
        Cancel
      </button>
      <button
        mat-flat-button
        ngxButton
        surface="outline"
        tone="danger"
        (click)="confirmDelete()"
      >
        Delete
      </button>
    </mat-dialog-actions>
  `,
  styles: [
    `
      :host {
        mat-dialog-content {
          display: flex;
          flex-direction: column;
          gap: 0.5em;
        }
      }
    `,
  ],
})
export class ConfirmDeleteDialog {
  dialogRef = inject(MatDialogRef<ConfirmDeleteDialog>);
  user = inject<UserMetadataDto>(MAT_DIALOG_DATA);

  confirmDelete() {
    this.dialogRef.close(this.user);
  }
}
