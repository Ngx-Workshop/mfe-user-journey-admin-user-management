import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import {
  MatSnackBar,
  MatSnackBarModule,
} from '@angular/material/snack-bar';
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
import { ConfirmDeleteDialog } from './delete-confirm';
import { HeaderComponent } from './header.component';
import {
  UserMetadataFormComponent,
  UserMetadataFormSubmitEvent,
} from './user-metadata-form';
import { UserMetadataListComponent } from './user-metadata-list';

@Component({
  selector: 'ngx-user-metadata-page',
  standalone: true,
  imports: [
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    UserMetadataListComponent,
    UserMetadataFormComponent,
    HeaderComponent,
  ],
  template: `
    <ngx-menu-management-header></ngx-menu-management-header>
    <section class="page">
      <div class="content" [class.content--with-form]="formOpen()">
        <mat-card class="list-card">
          @if (!loading()) {
          <div class="list-wrapper">
            <ngx-user-metadata-list
              [data]="items()"
              [total]="pagination().total"
              [page]="pagination().page"
              [pageSize]="pagination().limit"
              (paginationChange)="handlePaginationChange($event)"
              (edit)="openEditForm($event)"
              (remove)="deleteRemote($event)"
            ></ngx-user-metadata-list>
          </div>
          } @else {
          <div class="loading-state">
            <mat-progress-spinner
              mode="indeterminate"
              diameter="48"
            ></mat-progress-spinner>
            <p>Loading user metadata…</p>
          </div>
          }
        </mat-card>

        @if (formOpen()) {
        <aside class="form-container">
          <ngx-user-metadata-form
            [value]="selectedUser()"
            [loading]="saving()"
            (submitForm)="handleSubmit($event)"
            (cancel)="closeForm()"
          ></ngx-user-metadata-form>
        </aside>
        }
      </div>
    </section>
  `,
  styles: [
    `
      .page {
        display: flex;
        flex-direction: column;
        gap: 2rem;
        padding: 1.5rem;
      }
      .content {
        display: flex;
        flex-direction: row;
        flex-wrap: wrap;
        justify-content: center;
        align-items: flex-start;
        gap: 2rem;
      }

      .content--with-form {
        flex-wrap: nowrap;
        justify-content: space-between;
      }

      .list-card {
        padding: 1rem;
        flex: 0 1 clamp(320px, 70vw, 1400px);
        max-width: 100%;
      }

      .content--with-form .list-card {
        flex: 1 1 0%;
        max-width: none;
      }

      .list-wrapper {
        min-height: 300px;
        display: flex;
        flex-direction: column;
      }

      .form-container {
        position: sticky;
        top: 1.5rem;
        align-self: flex-start;
        flex: 0 0 clamp(320px, 28vw, 420px);
        animation: form-container-slide-in 300ms ease;
      }

      .loading-state {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 1rem;
        padding: 3rem 1rem;
        color: rgba(0, 0, 0, 0.6);
      }

      @keyframes form-container-slide-in {
        from {
          opacity: 0;
          transform: translateY(12px);
        }

        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      @media (max-width: 1024px) {
        .content,
        .content--with-form {
          flex-direction: column;
          flex-wrap: wrap;
          justify-content: flex-start;
        }

        .list-card {
          flex: 1 1 100%;
          max-width: none;
        }

        .form-container {
          position: static;
          width: 100%;
          flex: 1 1 auto;
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

  readonly loading = signal(false);
  readonly saving = signal(false);
  readonly items = signal<UserMetadataDto[]>([]);
  readonly pagination = signal({ page: 1, limit: 10, total: 0 });
  readonly selectedUser = signal<UserMetadataDto | null>(null);

  readonly formOpen = signal(false);

  constructor() {
    this.loadPage();
  }

  loadPage(
    page = this.pagination().page,
    limit = this.pagination().limit
  ): void {
    this.loading.set(true);

    lastValueFrom(
      this.service.findAll({ page, limit }).pipe(
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
    this.selectedUser.set(user);
    this.formOpen.set(true);
  }

  closeForm(): void {
    this.formOpen.set(false);
    this.selectedUser.set(null);
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
    this.loadPage(event.page, event.limit);
  }

  handleSubmit(event: UserMetadataFormSubmitEvent): void {
    this.saving.set(true);
    lastValueFrom(
      this.service.update(event.uuid, event.payload).pipe(
        tap(() => {
          this.snackBar.open('User metadata updated', 'Dismiss', {
            duration: 3000,
          });
          this.closeForm();
          this.loadPage();
        }),
        catchError((error) => {
          this.handleError('Unable to save user metadata', error);
          return EMPTY;
        }),
        finalize(() => this.saving.set(false))
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

  private handleError(message: string, error: unknown): void {
    console.error(message, error);
    this.snackBar.open(message, 'Dismiss', { duration: 4000 });
  }
}
