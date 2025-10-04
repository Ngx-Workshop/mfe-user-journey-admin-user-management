import { Component, inject } from '@angular/core';
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
  selector: 'ngx-confirm-delete-dialog',
  imports: [
    MatButton,
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions,
  ],
  template: `
    <h3 mat-dialog-title>Confirm Delete</h3>
    <mat-dialog-content>
      <p>Are you sure you want to delete this User's Metadata?</p>
    </mat-dialog-content>
    <mat-dialog-actions>
      <button matButton (click)="dialogRef.close()">Cancel</button>
      <button matButton (click)="confirmDelete()">Delete</button>
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
  mfeRemote = inject<UserMetadataDto>(MAT_DIALOG_DATA);

  confirmDelete() {
    this.dialogRef.close(this.mfeRemote);
  }
}
