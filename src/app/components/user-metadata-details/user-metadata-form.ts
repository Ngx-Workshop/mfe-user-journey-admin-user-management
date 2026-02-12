import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  Input,
  OnInit,
  inject,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
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
  EMPTY,
  catchError,
  debounceTime,
  distinctUntilChanged,
  filter,
  finalize,
  map,
  switchMap,
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
          <mat-error>Please enter a valid email address</mat-error>
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

      @if (loading) {
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
export class UserMetadataFormComponent implements OnInit {
  private readonly userMetadataService = inject(UserMetadataService);
  private readonly snackBar = inject(MatSnackBar);
  private readonly fb = inject(FormBuilder);
  private readonly destroyRef = inject(DestroyRef);

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

  ngOnInit(): void {
    this.form.valueChanges
      .pipe(
        debounceTime(500),
        filter(() => this.form.valid),
        map(() => {
          const raw = this.form.getRawValue();
          return {
            uuid: raw.uuid,
            payload: this.toPayload(raw),
          };
        }),
        distinctUntilChanged(
          (a, b) =>
            a.uuid === b.uuid &&
            JSON.stringify(a.payload) === JSON.stringify(b.payload)
        ),
        tap(() => (this.loading = true)),
        switchMap(({ uuid, payload }) =>
          this.userMetadataService.update(uuid, payload).pipe(
            catchError((error) => {
              this.snackBar.open(String(error), 'Dismiss', {
                duration: 4000,
              });
              return EMPTY;
            }),
            finalize(() => (this.loading = false))
          )
        ),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe();
  }

  private toPayload(
    raw: ReturnType<typeof this.form.getRawValue>
  ): UpdateUserMetadataDto {
    return {
      firstName: this.trimOrUndefined(raw.firstName),
      lastName: this.trimOrUndefined(raw.lastName),
      email: this.trimOrUndefined(raw.email),
      avatarUrl: this.trimOrUndefined(raw.avatarUrl),
      description: this.trimOrUndefined(raw.description),
    };
  }

  private setFormValue(value: UserMetadataDto): void {
    console.log('Setting form value', value);
    this.form.reset(
      {
        uuid: { value: value.uuid, disabled: true },
        firstName: value.firstName ?? '',
        lastName: value.lastName ?? '',
        email: value.email ?? '',
        avatarUrl: value.avatarUrl ?? '',
        description: value.description ?? '',
      },
      { emitEvent: false }
    );
  }

  private resetForm(): void {
    this.form.reset(
      {
        uuid: '',
        firstName: '',
        lastName: '',
        email: '',
        avatarUrl: '',
        description: '',
      },
      { emitEvent: false }
    );
    this.form.controls.uuid.enable({ emitEvent: false });
  }

  private trimOrUndefined(
    value: string | null | undefined
  ): string | undefined {
    const trimmed = value?.trim();
    return trimmed ? trimmed : undefined;
  }
}
