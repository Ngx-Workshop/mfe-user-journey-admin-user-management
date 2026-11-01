import {
  Injectable,
  inject,
  signal,
  computed,
  DestroyRef,
} from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import {
  toSignal,
  takeUntilDestroyed,
} from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { combineLatest, filter } from 'rxjs';
import { UserManagementStore } from '../../state/user-management.store';
import { CreateAccountRequest } from '../../models/user-management.models';
@Injectable()
export class CreateUserViewModel {
  readonly store = inject(UserManagementStore);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly fb = inject(FormBuilder);
  readonly step = signal(0);
  readonly state = toSignal(this.store.creation$, {
    requireSync: true,
  });
  readonly write = toSignal(this.store.write$, { requireSync: true });
  readonly requestId = signal<string>(crypto.randomUUID());
  readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: [
      '',
      [
        Validators.required,
        Validators.pattern(
          /^(?=.*[0-9])[a-zA-Z0-9!@#$%^&*]{12,100}$/
        ),
      ],
    ],
    confirmPassword: ['', Validators.required],
    role: [
      'regular' as CreateAccountRequest['role'],
      Validators.required,
    ],
    firstName: [''],
    lastName: [''],
    avatarUrl: [''],
    description: [''],
  });
  readonly error = computed(() =>
    this.state().requestId === this.requestId()
      ? this.state().error
      : null
  );
  readonly feedback = computed(() =>
    this.write().uuid === this.requestId() ? this.write() : null
  );
  constructor() {
    combineLatest([this.store.creation$, this.store.write$])
      .pipe(
        filter(
          ([state, write]) =>
            state.requestId === this.requestId() &&
            !!state.user &&
            write.pending === 0
        ),
        takeUntilDestroyed()
      )
      .subscribe(([state]) => {
        this.form.controls.password.reset();
        this.form.controls.confirmPassword.reset();
        void this.router.navigate(
          ['user-metadata', state.user!.uuid],
          { relativeTo: this.route.parent }
        );
      });
    this.store.write$
      .pipe(takeUntilDestroyed())
      .subscribe((write) => {
        if (write.pending) this.form.disable({ emitEvent: false });
        else this.form.enable({ emitEvent: false });
      });
    // A different target account is a new operation; retries of the same account keep their key.
    let identity = '';
    this.form.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe((value) => {
        const next = `${value.email?.trim().toLowerCase()}|${value.role}`;
        if (identity && next !== identity)
          this.requestId.set(crypto.randomUUID());
        identity = next;
      });
    inject(DestroyRef).onDestroy(() => {
      this.form.controls.password.reset();
      this.form.controls.confirmPassword.reset();
    });
  }
  credentialsValid() {
    const c = this.form.controls;
    return (
      c.email.valid &&
      c.password.valid &&
      c.confirmPassword.valid &&
      c.password.value === c.confirmPassword.value &&
      c.role.valid
    );
  }
  busy() {
    return this.write().pending > 0;
  }
  submit() {
    if (
      this.step() !== 2 ||
      this.form.invalid ||
      !this.credentialsValid() ||
      this.busy()
    ) {
      this.form.markAllAsTouched();
      return;
    }
    const { confirmPassword, ...value } = this.form.getRawValue();
    this.store.execute({
      kind: 'create',
      uuid: this.requestId(),
      payload: {
        ...value,
        requestId: this.requestId(),
        email: value.email.trim().toLowerCase(),
        firstName: value.firstName.trim(),
        lastName: value.lastName.trim(),
        avatarUrl: value.avatarUrl.trim(),
        description: value.description.trim(),
      },
    });
  }
}
