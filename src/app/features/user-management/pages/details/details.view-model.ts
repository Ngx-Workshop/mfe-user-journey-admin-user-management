import { Injectable, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
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
  private readonly store = inject(UserManagementStore);
  private readonly route = inject(ActivatedRoute);
  private readonly profileRetry = new BehaviorSubject(0);
  private readonly assessmentRetry = new BehaviorSubject(0);
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
