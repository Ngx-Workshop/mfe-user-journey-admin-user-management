import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
  signal,
  untracked,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import {
  MatSnackBar,
  MatSnackBarModule,
} from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { UserMetadataDto } from '@tmdjr/user-metadata-contracts';
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
import { UserMetadataFiltersComponent } from './user-metadata-list/user-metadata-filters';
import { UserMetadataListComponent } from './user-metadata-list/user-metadata-list';

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
                [userMetadata]="paginatedUserMetadata()"
                [total]="pagination().total"
                [page]="pagination().page"
                [pageSize]="pagination().limit"
                (paginationChange)="handlePaginationChange($event)"
                (edit)="navigateToUserDetails($event)"
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
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserMetadataPageComponent {
  protected readonly router = inject(Router);
  protected readonly route = inject(ActivatedRoute);
  private readonly dialog = inject(MatDialog);
  private readonly userMetadataService = inject(UserMetadataService);
  private readonly snackBar = inject(MatSnackBar);
  private readonly filtersStore = inject(UserMetadataFiltersStore);

  readonly loading = signal(false);
  readonly saving = signal(false);
  readonly paginatedUserMetadata = signal<UserMetadataDto[]>([]);
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
      this.userMetadataService
        .findAll({
          page,
          limit,
          query: filters.query || undefined,
          role: filters.role === 'all' ? undefined : filters.role,
        })
        .pipe(
          tap((response) => {
            this.paginatedUserMetadata.set(response.data);
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

  handleDelete(uuid: string) {
    return this.userMetadataService.remove(uuid).pipe(
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
      this.userMetadataService
        .updateUserRole(user.uuid, user.role)
        .pipe(
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

  navigateToUserDetails(userMetadata: UserMetadataDto): void {
    this.router.navigate(['../user-metadata', userMetadata.uuid], {
      relativeTo: this.route,
      state: { userMetadata },
    });
  }

  private handleError(message: string, error: unknown): void {
    console.error(message, error);
    this.snackBar.open(message, 'Dismiss', { duration: 4000 });
  }
}
