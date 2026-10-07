import { Injectable, inject } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import {
  debounceTime,
  distinctUntilChanged,
  filter,
  map,
  BehaviorSubject,
  switchMap,
} from 'rxjs';
import { UserMetadataDto } from '@tmdjr/user-metadata-contracts';
import { ProfileChange } from '../../models/user-management.models';

@Injectable()
export class ProfileFormViewModel {
  private readonly fb = inject(FormBuilder);
  private readonly reset$ = new BehaviorSubject<void>(undefined);
  readonly form = this.fb.nonNullable.group({
    uuid: [{ value: '', disabled: true }],
    firstName: [''],
    lastName: [''],
    email: ['', Validators.email],
    avatarUrl: [''],
    description: [''],
  });
  // Reset cancels a pending debounce when a reused form receives another user.
  readonly changes$ = this.reset$.pipe(
    switchMap(() =>
      this.form.valueChanges.pipe(
        debounceTime(500),
        filter(() => this.form.valid),
        map(() => this.value()),
        distinctUntilChanged(
          (previous, next) =>
            JSON.stringify(previous) === JSON.stringify(next)
        )
      )
    )
  );
  setUser(user: UserMetadataDto): void {
    this.reset$.next();
    this.form.reset(
      {
        uuid: user.uuid,
        firstName: user.firstName ?? '',
        lastName: user.lastName ?? '',
        email: user.email ?? '',
        avatarUrl: user.avatarUrl ?? '',
        description: user.description ?? '',
      },
      { emitEvent: false }
    );
  }
  value(): ProfileChange {
    const {
      uuid,
      firstName,
      lastName,
      email,
      avatarUrl,
      description,
    } = this.form.getRawValue();
    return {
      uuid,
      payload: {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        avatarUrl: avatarUrl.trim(),
        description: description.trim(),
      },
    };
  }
}
