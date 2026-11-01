import {
  Injectable,
  inject,
  DestroyRef,
  signal,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDeleteDialog } from '../../components/delete-confirm';
import { UserMetadataDto } from '@tmdjr/user-metadata-contracts';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import {
  BehaviorSubject,
  distinctUntilChanged,
  filter,
  map,
} from 'rxjs';
import { UserManagementStore } from '../../state/user-management.store';
import { ProfileChange } from '../../models/user-management.models';

@Injectable()
export class DetailsViewModel {
  private readonly router = inject(Router);
  private readonly dialog = inject(MatDialog);
  private readonly destroyRef = inject(DestroyRef);
  private readonly store = inject(UserManagementStore);
  private readonly route = inject(ActivatedRoute);
  private readonly profileRetry = new BehaviorSubject(0);
  private readonly assessmentRetry = new BehaviorSubject(0);
  readonly selectedRole = signal<UserMetadataDto['role'] | null>(
    null
  );
  readonly uuid$ = this.route.paramMap.pipe(
    map((params) => params.get('userId')),
    filter((uuid): uuid is string => !!uuid),
    distinctUntilChanged()
  );
  readonly uuid = toSignal(this.uuid$, { initialValue: '' });
  readonly profile = toSignal(
    this.store.profile$(this.uuid$, this.profileRetry),
    {
      initialValue: { data: null, loading: true, error: null },
    }
  );
  readonly assessments = toSignal(
    this.store.assessment$(this.uuid$, this.assessmentRetry),
    {
      initialValue: { data: null, loading: true, error: null },
    }
  );
  readonly write = toSignal(this.store.write$, { requireSync: true });
  constructor() {
    this.uuid$
      .pipe(takeUntilDestroyed())
      .subscribe(() => this.selectedRole.set(null));
    this.store.write$
      .pipe(
        filter(
          (write) => write.uuid === this.uuid() && write.pending === 0
        ),
        takeUntilDestroyed()
      )
      .subscribe((write) => {
        if (write.kind === 'delete' && write.message)
          void this.router.navigate(['user-metadata'], {
            relativeTo: this.route.parent,
          });
        if (write.kind === 'role' && write.error)
          this.selectedRole.set(null);
      });
  }
  role(user: UserMetadataDto, role: UserMetadataDto['role']) {
    this.selectedRole.set(role);
    this.store.execute({ kind: 'role', uuid: user.uuid, role });
  }
  remove(user: UserMetadataDto) {
    if (this.store.pending) return;
    this.dialog
      .open(ConfirmDeleteDialog, {
        data: user,
        panelClass: 'ngx-design-system-overlay',
        backdropClass: 'ngx-design-system-backdrop',
        maxWidth: 'calc(100vw - 32px)',
      })
      .afterClosed()
      .pipe(filter(Boolean), takeUntilDestroyed(this.destroyRef))
      .subscribe(() =>
        this.store.execute({ kind: 'delete', uuid: user.uuid })
      );
  }
  save(change: ProfileChange): void {
    this.store.execute({ kind: 'profile', ...change });
  }
  retryProfile(): void {
    this.profileRetry.next(this.profileRetry.value + 1);
  }
  retryAssessments(): void {
    this.assessmentRetry.next(this.assessmentRetry.value + 1);
  }
}
