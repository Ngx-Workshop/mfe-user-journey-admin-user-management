import { Injectable, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  BehaviorSubject,
  Observable,
  Subject,
  catchError,
  combineLatest,
  concatMap,
  defer,
  distinctUntilChanged,
  finalize,
  forkJoin,
  map,
  of,
  shareReplay,
  switchMap,
  tap,
} from 'rxjs';
import { UserMetadataApi } from '../api/user-metadata.api';
import { AssessmentTestsApiService } from '../api/assessment-tests.api';
import { toTestInfoViewModel } from '../models/assessment.models';
import {
  CatalogQuery,
  UserCommand,
  WriteState,
} from '../models/user-management.models';
import { loadState } from './load-state';

@Injectable({ providedIn: 'root' })
export class UserManagementStore {
  private readonly users = inject(UserMetadataApi);
  private readonly assessments = inject(AssessmentTestsApiService);
  private readonly querySubject = new BehaviorSubject<CatalogQuery>({
    page: 1,
    limit: 10,
    query: '',
    role: 'all',
  });
  private readonly refreshSubject = new BehaviorSubject(0);
  private readonly commands = new Subject<UserCommand>();
  private readonly writeSubject = new BehaviorSubject<WriteState>({
    uuid: '',
    pending: 0,
    error: null,
    message: null,
  });
  private readonly notificationSubject = new Subject<string>();
  readonly notifications$ = this.notificationSubject.asObservable();
  readonly query$ = this.querySubject.asObservable();
  readonly write$ = this.writeSubject.asObservable();
  readonly catalog$ = combineLatest([
    this.query$,
    this.refreshSubject,
  ]).pipe(
    switchMap(([query]) =>
      loadState(
        this.users.findAll({
          ...query,
          role: query.role === 'all' ? undefined : query.role,
          query: query.query.trim() || undefined,
        }),
        'Unable to load user metadata'
      )
    ),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  constructor() {
    // Root-owned subscription: leaving a view cannot cancel an accepted write.
    this.commands
      .pipe(
        concatMap((command) =>
          defer(() => {
            this.writeSubject.next({
              ...this.writeSubject.value,
              uuid: command.uuid,
              error: null,
              message: null,
            });
            const request: Observable<unknown> =
              command.kind === 'profile'
                ? this.users.update(command.uuid, command.payload)
                : command.kind === 'role'
                  ? this.users.updateUserRole(
                      command.uuid,
                      command.role
                    )
                  : this.users.remove(command.uuid);
            return request.pipe(
              tap(() => {
                this.writeSubject.next({
                  ...this.writeSubject.value,
                  error: null,
                  message:
                    command.kind === 'delete'
                      ? 'User metadata deleted'
                      : 'User metadata saved',
                });
                this.notificationSubject.next(
                  this.writeSubject.value.message!
                );
                this.refresh();
              }),
              catchError(() => {
                if (command.kind !== 'profile') this.refresh();
                this.writeSubject.next({
                  ...this.writeSubject.value,
                  error:
                    command.kind === 'delete'
                      ? 'Unable to delete user metadata. Please retry.'
                      : command.kind === 'role'
                        ? 'Unable to update user role. Please retry.'
                        : 'Unable to save user metadata. Please retry.',
                  message: null,
                });
                this.notificationSubject.next(
                  this.writeSubject.value.error!
                );
                return of(null);
              }),
              finalize(() =>
                this.writeSubject.next({
                  ...this.writeSubject.value,
                  pending: this.writeSubject.value.pending - 1,
                })
              )
            );
          })
        ),
        takeUntilDestroyed()
      )
      .subscribe();
    // Recover after deletion of the final row on a later page.
    this.catalog$.pipe(takeUntilDestroyed()).subscribe((state) => {
      if (
        state.data &&
        state.data.data.length === 0 &&
        state.data.page > 1
      ) {
        this.setPage(
          Math.max(
            1,
            Math.min(state.data.page - 1, state.data.totalPages)
          ),
          state.data.limit
        );
      }
    });
  }

  setFilters(query: string, role: CatalogQuery['role']): void {
    this.querySubject.next({
      ...this.querySubject.value,
      query,
      role,
      page: 1,
    });
  }
  setPage(page: number, limit: number): void {
    this.querySubject.next({
      ...this.querySubject.value,
      page,
      limit,
    });
  }
  refresh(): void {
    this.refreshSubject.next(this.refreshSubject.value + 1);
  }

  profile$(uuid$: Observable<string>, retry$: Observable<unknown>) {
    return combineLatest([
      uuid$.pipe(distinctUntilChanged()),
      retry$,
    ]).pipe(
      switchMap(([uuid]) =>
        loadState(
          this.users.findOne(uuid),
          'Unable to load this user'
        )
      ),
      shareReplay({ bufferSize: 1, refCount: true })
    );
  }
  assessment$(
    uuid$: Observable<string>,
    retry$: Observable<unknown>
  ) {
    return combineLatest([
      uuid$.pipe(distinctUntilChanged()),
      retry$,
    ]).pipe(
      switchMap(([uuid]) =>
        loadState(
          forkJoin({
            subjectLevels:
              this.assessments.fetchUserSubjectEligibilities$(uuid),
            assessmentTests:
              this.assessments.fetchUsersAssessments$(uuid),
          }).pipe(map(toTestInfoViewModel)),
          'Unable to load assessment history'
        )
      ),
      shareReplay({ bufferSize: 1, refCount: true })
    );
  }
  execute(command: UserCommand): void {
    // Role/delete controls are disabled while commands are pending; guard repeats too.
    if (command.kind !== 'profile' && this.writeSubject.value.pending)
      return;
    this.writeSubject.next({
      ...this.writeSubject.value,
      pending: this.writeSubject.value.pending + 1,
    });
    this.commands.next(command);
  }
}
