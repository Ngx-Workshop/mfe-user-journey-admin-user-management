import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
  inject,
} from '@angular/core';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import {
  UpdateUserMetadataDto,
  UserMetadataDto,
} from '@tmdjr/user-metadata-contracts';

export type UserMetadataFormSubmitEvent = {
  type: 'update';
  uuid: string;
  payload: UpdateUserMetadataDto;
};

@Component({
  selector: 'ngx-user-metadata-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatSelectModule,
  ],
  template: `
    <form
      class="metadata-form"
      [formGroup]="form"
      (ngSubmit)="onSubmit()"
    >
      <mat-card>
        <mat-card-header>
          <mat-card-title> Edit user metadata </mat-card-title>
          <mat-card-subtitle>
            Update the selected user profile as needed.
          </mat-card-subtitle>
        </mat-card-header>

        <mat-card-content>
          <div class="field-grid">
            <mat-form-field appearance="outline">
              <mat-label>User UUID</mat-label>
              <input
                matInput
                formControlName="uuid"
                [disabled]="true"
              />
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
              <mat-error>
                Please enter a valid email address
              </mat-error>
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
        </mat-card-content>

        <mat-card-actions align="end">
          <button
            mat-button
            type="button"
            (click)="onCancel()"
            [disabled]="loading"
          >
            Cancel
          </button>
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
        </mat-card-actions>
      </mat-card>
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
export class UserMetadataFormComponent implements OnChanges {
  private readonly fb = inject(FormBuilder);

  readonly form = this.fb.nonNullable.group({
    uuid: ['', [Validators.required]],
    firstName: [''],
    lastName: [''],
    email: ['', [Validators.email]],
    avatarUrl: [''],
    description: [''],
  });

  @Input()
  value: UserMetadataDto | null = null;

  @Input()
  loading = false;

  @Output()
  cancel = new EventEmitter<void>();

  @Output()
  submitForm = new EventEmitter<UserMetadataFormSubmitEvent>();

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['value'] && this.value) {
      this.form.reset({
        uuid: this.value.uuid,
        firstName: this.value.firstName ?? '',
        lastName: this.value.lastName ?? '',
        email: this.value.email ?? '',
        avatarUrl: this.value.avatarUrl ?? '',
        description: this.value.description ?? '',
      });
    }
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const rawValue = this.form.getRawValue();
    const uuid = this.value?.uuid ?? rawValue.uuid.trim();
    const payload: UpdateUserMetadataDto = {
      uuid: this.trimOrUndefined(rawValue.uuid),
      firstName: this.trimOrUndefined(rawValue.firstName),
      lastName: this.trimOrUndefined(rawValue.lastName),
      email: this.trimOrUndefined(rawValue.email),
      avatarUrl: this.trimOrUndefined(rawValue.avatarUrl),
      description: this.trimOrUndefined(rawValue.description),
    };

    this.submitForm.emit({ type: 'update', uuid, payload });
  }

  onCancel(): void {
    this.cancel.emit();
  }

  private trimOrUndefined(
    value: string | null | undefined
  ): string | undefined {
    const trimmed = value?.trim();
    return trimmed ? trimmed : undefined;
  }
}
