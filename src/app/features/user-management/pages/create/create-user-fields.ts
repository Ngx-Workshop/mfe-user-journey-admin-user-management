import {
  Component,
  ChangeDetectionStrategy,
  input,
  signal,
} from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { CreateUserViewModel } from './create-user.view-model';
@Component({
  selector: 'ngx-create-user-fields',
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIcon,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<div class="create-fields" [formGroup]="form()">
 @if(mode() === 'account') {
   <mat-form-field appearance="outline" subscriptSizing="dynamic"><mat-label>Email</mat-label>
     <input matInput type="email" formControlName="email" autocomplete="off" />
     @if(form().controls.email.invalid){<mat-error>Enter a valid email address.</mat-error>}
   </mat-form-field>
   <mat-form-field appearance="outline"><mat-label>Role</mat-label>
     <mat-select formControlName="role" panelClass="ngx-design-system-overlay ngx-select-panel">
       <mat-option value="regular">Regular</mat-option><mat-option value="publisher">Publisher</mat-option><mat-option value="admin">Admin</mat-option>
     </mat-select>
   </mat-form-field>
   <mat-form-field appearance="outline" subscriptSizing="dynamic"><mat-label>Password</mat-label>
     <input matInput [type]="visible() ? 'text' : 'password'" formControlName="password" autocomplete="new-password" />
     <button matSuffix mat-icon-button type="button" [attr.aria-label]="visible() ? 'Hide password' : 'Show password'" (click)="visible.set(!visible())"><mat-icon>{{visible() ? 'visibility_off' : 'visibility'}}</mat-icon></button>
     <mat-hint>12–100 characters; include a digit. Letters and !@#$%^&amp;* are supported.</mat-hint>
     @if(form().controls.password.invalid){<mat-error>Password must match the requirements.</mat-error>}
   </mat-form-field>
   <mat-form-field appearance="outline"><mat-label>Confirm password</mat-label>
     <input matInput type="password" formControlName="confirmPassword" autocomplete="new-password" />
   </mat-form-field>
   @if(form().controls.confirmPassword.value && form().controls.password.value !== form().controls.confirmPassword.value) {
     <p class="create-fields__error" role="alert">Passwords must match.</p>
   }
 } @else {
   <mat-form-field appearance="outline"><mat-label>First name</mat-label><input matInput formControlName="firstName" /></mat-form-field>
   <mat-form-field appearance="outline"><mat-label>Last name</mat-label><input matInput formControlName="lastName" /></mat-form-field>
   <mat-form-field appearance="outline"><mat-label>Avatar URL</mat-label><input matInput formControlName="avatarUrl" /></mat-form-field>
   <mat-form-field appearance="outline"><mat-label>Description</mat-label><textarea matInput rows="3" formControlName="description"></textarea></mat-form-field>
 }
 </div>`,
  styles: [
    `
      .create-fields {
        display: grid;
        grid-template-columns: repeat(
          auto-fit,
          minmax(min(100%, 250px), 1fr)
        );
        gap: 1rem;
      }
      .create-fields__error {
        color: var(--ngx-color-error);
      }
    `,
  ],
})
export class CreateUserFields {
  readonly form = input.required<CreateUserViewModel['form']>();
  readonly mode = input<'account' | 'profile'>('account');
  readonly visible = signal(false);
}
