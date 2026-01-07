import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
  signal,
  untracked,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import {
  MatSnackBar,
  MatSnackBarModule,
} from '@angular/material/snack-bar';
import {
  UpdateUserMetadataDto,
  UserMetadataDto,
} from '@tmdjr/user-metadata-contracts';
import {
  EMPTY,
  catchError,
  defaultIfEmpty,
  finalize,
  lastValueFrom,
  switchMap,
  tap,
} from 'rxjs';
import { UserMetadataService } from '../services/user-metadata-api';
import {
  UserMetadataFilters,
  UserMetadataFiltersStore,
} from '../services/user-metadata-filters.store';
import { ConfirmDeleteDialog } from './delete-confirm';
import { HeaderComponent } from './header.component';
import { UserMetadataFiltersComponent } from './user-metadata-filters';
import { UserMetadataFormComponent } from './user-metadata-form';
import { UserMetadataListComponent } from './user-metadata-list';

@Component({
  selector: 'ngx-user-metadata-page',
  imports: [
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    UserMetadataListComponent,
    HeaderComponent,
    UserMetadataFiltersComponent,
  ],
  template: `
    <ngx-menu-management-header></ngx-menu-management-header>
    <div class="shell">
      <div class="container">
        <ngx-user-metadata-filters></ngx-user-metadata-filters>
        <div class="content">
          <div class="list-card">
            <div class="list-wrapper">
              @if (!loading()) {
              <ngx-user-metadata-list
                [data]="items()"
                [total]="pagination().total"
                [page]="pagination().page"
                [pageSize]="pagination().limit"
                (paginationChange)="handlePaginationChange($event)"
                (edit)="openEditForm($event)"
                (remove)="deleteRemote($event)"
                (updateUserRole)="updateUserRole($event)"
              ></ngx-user-metadata-list>

              } @else {
              <div class="loading-state">
                <mat-progress-spinner
                  mode="indeterminate"
                  diameter="48"
                ></mat-progress-spinner>
                <p>Loading user metadata…</p>
              </div>
              }
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .shell {
        display: flex;
        justify-content: center;
      }
      .container {
        padding: 1rem;
        flex: 0 1 clamp(480px, 70vw, 1400px);
        max-width: 100%;
      }

      .list-card {
        background: var(--mat-sys-surface-container-low);
        padding: 1.5rem;
        border-radius: var(
          --mat-card-elevated-container-shape,
          var(--mat-sys-corner-medium)
        );
      }

      .list-wrapper {
        min-height: 300px;
        display: flex;
        flex-direction: column;
      }

      .loading-state {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 1rem;
        padding: 3rem 1rem;
        color: rgba(0, 0, 0, 0.6);
      }

      @media (max-width: 1024px) {
        .content {
          flex-direction: column;
          flex-wrap: wrap;
          justify-content: flex-start;
        }

        .list-card {
          flex: 1 1 100%;
          max-width: none;
        }
      }

      :root {
        .solid-dialog-backdrop {
          background: red !important;
        }
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserMetadataPageComponent {
  private readonly dialog = inject(MatDialog);
  private readonly service = inject(UserMetadataService);
  private readonly snackBar = inject(MatSnackBar);
  private readonly filtersStore = inject(UserMetadataFiltersStore);

  readonly loading = signal(false);
  readonly saving = signal(false);
  readonly items = signal<UserMetadataDto[]>([]);
  readonly pagination = signal({ page: 1, limit: 10, total: 0 });
  constructor() {
    effect(() => {
      const filters = this.filtersStore.filters();
      const limit = untracked(() => this.pagination().limit);

      this.pagination.update((state) => ({ ...state, page: 1 }));
      this.loadPage(1, limit, filters);
    });
  }

  loadPage(
    page = this.pagination().page,
    limit = this.pagination().limit,
    filters: UserMetadataFilters = this.filtersStore.filters()
  ): void {
    this.loading.set(true);

    lastValueFrom(
      this.service
        .findAll({
          page,
          limit,
          query: filters.query || undefined,
          role: filters.role === 'all' ? undefined : filters.role,
        })
        .pipe(
          tap((response) => {
            this.items.set(response.data);
            this.pagination.set({
              page: response.page,
              limit: response.limit,
              total: response.total,
            });
          }),
          catchError((error) => {
            this.handleError('Unable to load user metadata', error);
            return EMPTY;
          }),
          finalize(() => this.loading.set(false))
        )
    );
  }

  openEditForm(user: UserMetadataDto): void {
    const dialogRef = this.dialog.open(UserMetadataFormComponent, {
      width: '720px',
      backdropClass: 'solid-dialog-backdrop',
    });

    dialogRef.componentInstance.value = user;
    dialogRef.componentInstance.loading = this.saving();

    const submitSubscription =
      dialogRef.componentInstance.submitForm.subscribe((payload) =>
        this.handleSubmit(payload, dialogRef)
      );

    const cancelSubscription =
      dialogRef.componentInstance.cancel.subscribe(() =>
        dialogRef.close()
      );

    dialogRef.afterClosed().subscribe(() => {
      submitSubscription.unsubscribe();
      cancelSubscription.unsubscribe();
    });
  }

  handlePaginationChange(event: {
    page: number;
    limit: number;
  }): void {
    this.pagination.set({
      ...this.pagination(),
      page: event.page,
      limit: event.limit,
    });
    this.loadPage(
      event.page,
      event.limit,
      this.filtersStore.filters()
    );
  }

  handleSubmit(
    userMetadata: UpdateUserMetadataDto,
    dialogRef?: MatDialogRef<UserMetadataFormComponent>
  ): void {
    this.saving.set(true);
    if (dialogRef) {
      dialogRef.componentInstance.loading = true;
    }
    lastValueFrom(
      this.service.update(userMetadata).pipe(
        tap(() => {
          this.snackBar.open('User metadata updated', 'Dismiss', {
            duration: 3000,
          });
          dialogRef?.close();
          this.loadPage();
        }),
        catchError((error) => {
          this.handleError('Unable to save user metadata', error);
          return EMPTY;
        }),
        finalize(() => {
          this.saving.set(false);
          if (dialogRef?.componentInstance) {
            dialogRef.componentInstance.loading = false;
          }
        })
      )
    );
  }

  handleDelete(uuid: string) {
    return this.service.remove(uuid).pipe(
      tap(() => {
        this.snackBar.open('User metadata deleted', 'Dismiss', {
          duration: 3000,
        });
        const currentPage = this.pagination().page;
        this.loadPage(currentPage, this.pagination().limit);
      }),
      catchError((error) => {
        this.handleError('Unable to delete user metadata', error);
        return EMPTY;
      }),
      finalize(() => this.loading.set(false))
    );
  }

  deleteRemote(user: UserMetadataDto) {
    lastValueFrom(
      this.dialog
        .open(ConfirmDeleteDialog, { data: user })
        .afterClosed()
        .pipe(
          switchMap((mfeRemote) =>
            mfeRemote ? this.handleDelete(user.uuid) : EMPTY
          ),
          defaultIfEmpty(void 0)
        )
    );
  }

  updateUserRole(user: UserMetadataDto) {
    this.saving.set(true);
    lastValueFrom(
      this.service.updateUserRole(user.uuid, user.role).pipe(
        tap(() => {
          this.snackBar.open('User role updated', 'Dismiss', {
            duration: 3000,
          });
          this.loadPage();
        }),
        catchError((error) => {
          this.handleError('Unable to update user role', error);
          return EMPTY;
        }),
        finalize(() => this.saving.set(false))
      )
    );
  }

  private handleError(message: string, error: unknown): void {
    console.error(message, error);
    this.snackBar.open(message, 'Dismiss', { duration: 4000 });
  }
}
