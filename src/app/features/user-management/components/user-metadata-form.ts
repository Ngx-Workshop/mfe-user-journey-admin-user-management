import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
  input,
  output,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';
import { UserMetadataDto } from '@tmdjr/user-metadata-contracts';
import { ProfileFormViewModel } from '../pages/details/profile-form.view-model';
import { ProfileChange } from '../models/user-management.models';

@Component({
  selector: 'ngx-user-metadata-form',
  providers: [ProfileFormViewModel],
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatButtonModule,
  ],
  template: `
    <form
      class="metadata-form"
      [formGroup]="form"
      (ngSubmit)="retry()"
    >
      <div class="metadata-form__field-grid">
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
            <mat-error>Please enter a valid email address</mat-error>
          }
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Avatar URL</mat-label>
          <input matInput formControlName="avatarUrl" />
        </mat-form-field>

        <mat-form-field
          appearance="outline"
          class="metadata-form__description-field"
        >
          <mat-label>Description</mat-label>
          <textarea
            matInput
            formControlName="description"
            rows="4"
          ></textarea>
        </mat-form-field>
      </div>

      @if (error(); as message) {
        <p role="alert">{{ message }} Edits are retained.</p>
        <button
          matButton
          type="submit"
          [disabled]="form.invalid || saving()"
        >
          Retry save
        </button>
      }
      <p role="status">
        {{
          saving() ? 'Saving…' : 'Valid changes save automatically.'
        }}
      </p>
      @if (saving()) {
        <mat-progress-spinner
          mode="indeterminate"
          diameter="20"
        ></mat-progress-spinner>
      }
    </form>
  `,
  styles: [
    `
      .metadata-form {
        display: block;
      }

      .metadata-form__field-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
        gap: 1rem;
      }

      .metadata-form__description-field {
        grid-column: 1 / -1;
      }

      mat-progress-spinner {
        margin-right: 0.5rem;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserMetadataFormComponent {
  private readonly vm = inject(ProfileFormViewModel);
  readonly form = this.vm.form;
  readonly userMetadata = input.required<UserMetadataDto>();
  readonly saving = input(false);
  readonly error = input<string | null>(null);
  readonly save = output<ProfileChange>();
  constructor() {
    effect(() => this.vm.setUser(this.userMetadata()));
    this.vm.changes$
      .pipe(takeUntilDestroyed())
      .subscribe((change) => this.save.emit(change));
  }
  retry(): void {
    if (this.form.valid && !this.saving())
      this.save.emit(this.vm.value());
  }
}
