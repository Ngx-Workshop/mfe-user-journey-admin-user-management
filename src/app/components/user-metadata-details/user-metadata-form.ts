import {
  ChangeDetectionStrategy,
  Component,
  inject,
  Input,
} from '@angular/core';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatButton } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import {
  UpdateUserMetadataDto,
  UserMetadataDto,
} from '@tmdjr/user-metadata-contracts';
import {
  catchError,
  EMPTY,
  finalize,
  lastValueFrom,
  tap,
} from 'rxjs';
import { UserMetadataService } from '../../services/user-metadata-api';

@Component({
  selector: 'ngx-user-metadata-form',
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    MatButton,
  ],
  template: `
    <form class="metadata-form" [formGroup]="form">
      <div class="field-grid">
        <mat-form-field appearance="outline">
          <mat-label>User UUID</mat-label>
          <input matInput formControlName="uuid" />
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>First name</mat-label>
          <input matInput formControlName="firstName" />
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Last name</mat-label>
          <input matInput formControlName="lastName" />
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Email</mat-label>
          <input matInput formControlName="email" type="email" />
          @if (form.controls.email.hasError('email')) {
          <mat-error> Please enter a valid email address </mat-error>
          }
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Avatar URL</mat-label>
          <input matInput formControlName="avatarUrl" />
        </mat-form-field>

        <mat-form-field
          appearance="outline"
          class="description-field"
        >
          <mat-label>Description</mat-label>
          <textarea
            matInput
            formControlName="description"
            rows="4"
          ></textarea>
        </mat-form-field>
      </div>
      <div class="actions">
        <button
          matButton="outlined"
          color="primary"
          type="submit"
          [disabled]="loading"
        >
          @if (loading) {
          <mat-progress-spinner
            mode="indeterminate"
            diameter="20"
          ></mat-progress-spinner>
          } @if (!loading) {
          <span>Save changes</span>
          }
        </button>
      </div>
    </form>
  `,
  styles: [
    `
      .metadata-form {
        display: block;
      }

      .field-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
        gap: 1rem;
      }

      .description-field {
        grid-column: 1 / -1;
      }

      mat-card {
        display: flex;
        flex-direction: column;
        gap: 1rem;
      }

      mat-card-actions {
        display: flex;
        gap: 0.75rem;
      }

      mat-progress-spinner {
        margin-right: 0.5rem;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserMetadataFormComponent {
  private readonly userMetadataService = inject(UserMetadataService);
  private readonly snackBar = inject(MatSnackBar);
  private readonly fb = inject(FormBuilder);
  private _value: UserMetadataDto | null = null;
  loading = false;

  readonly form = this.fb.nonNullable.group({
    uuid: ['', [Validators.required]],
    firstName: [''],
    lastName: [''],
    email: ['', [Validators.email]],
    avatarUrl: [''],
    description: [''],
  });

  @Input()
  get userMetadata(): UserMetadataDto | null {
    return this._value;
  }

  set userMetadata(value: UserMetadataDto | null) {
    this._value = value;
    value ? this.setFormValue(value) : this.resetForm();
  }

  onChanges(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const rawValue = this.form.getRawValue();
    const payload: UpdateUserMetadataDto = {
      firstName: this.trimOrUndefined(rawValue.firstName),
      lastName: this.trimOrUndefined(rawValue.lastName),
      email: this.trimOrUndefined(rawValue.email),
      avatarUrl: this.trimOrUndefined(rawValue.avatarUrl),
      description: this.trimOrUndefined(rawValue.description),
    };

    this.handleSubmit(rawValue.uuid, payload);
  }

  handleSubmit(
    uuid: string,
    userMetadata: UpdateUserMetadataDto
  ): void {
    this.loading = true;
    lastValueFrom(
      this.userMetadataService.update(uuid, userMetadata).pipe(
        tap(() =>
          this.snackBar.open('User metadata updated', 'Dismiss', {
            duration: 3000,
          })
        ),
        catchError((error) => {
          this.snackBar.open(error, 'Dismiss', { duration: 4000 });
          return EMPTY;
        }),
        finalize(() => (this.loading = false))
      )
    );
  }

  private setFormValue(value: UserMetadataDto): void {
    this.form.reset({
      uuid: { value: value.uuid, disabled: true },
      firstName: value.firstName ?? '',
      lastName: value.lastName ?? '',
      email: value.email ?? '',
      avatarUrl: value.avatarUrl ?? '',
      description: value.description ?? '',
    });
  }

  private resetForm(): void {
    this.form.reset({
      uuid: '',
      firstName: '',
      lastName: '',
      email: '',
      avatarUrl: '',
      description: '',
    });
    this.form.controls.uuid.enable();
  }

  private trimOrUndefined(
    value: string | null | undefined
  ): string | undefined {
    const trimmed = value?.trim();
    return trimmed ? trimmed : undefined;
  }
}
