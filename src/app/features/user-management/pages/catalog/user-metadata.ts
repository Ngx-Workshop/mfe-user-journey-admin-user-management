import {
  ChangeDetectionStrategy,
  Component,
  inject,
} from '@angular/core';
import { MatButton, MatButtonModule } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { UserMetadataActions } from '../../components/user-metadata-actions';
import { UserMetadataFiltersComponent } from '../../components/user-metadata-filters';
import { UserMetadataListComponent } from '../../components/user-metadata-list';
import { CatalogViewModel } from './catalog.view-model';

@Component({
  selector: 'ngx-user-metadata-page',
  imports: [
    MatButtonModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    UserMetadataActions,
    UserMetadataFiltersComponent,
    UserMetadataListComponent,
    MatButton,
    MatIcon,
  ],
  providers: [CatalogViewModel],
  template: `
    <ngx-user-metadata-actions>
      <div class="flex-spacer"></div>
      <button matButton="filled" (click)="createUser()">
        <mat-icon>add</mat-icon>
        Create User
      </button>
    </ngx-user-metadata-actions>
    <main class="user-catalog">
      <ngx-user-metadata-filters
        [query]="vm.searchQuery()"
        [role]="vm.query().role"
        (queryChange)="vm.searchFor($event)"
        (roleChange)="vm.filterRole($event)"
        (clear)="vm.clear()"
      />
      <section
        class="user-catalog__card"
        [attr.aria-busy]="vm.catalog().loading"
      >
        @if (vm.catalog().loading) {
        <div class="user-catalog__loading" role="status">
          <mat-progress-spinner
            mode="indeterminate"
            diameter="48"
            aria-label="Loading users"
          />
          <p>Loading user metadata…</p>
        </div>
        } @else if (vm.catalog().error; as error) {
        <p role="alert">{{ error }}</p>
        <button matButton (click)="vm.retry()">Retry</button>
        } @else if (vm.catalog().data; as data) {
        <ngx-user-metadata-list
          [userMetadata]="data.data"
          [total]="data.total"
          [page]="data.page"
          [pageSize]="data.limit"
          [busy]="vm.write().pending > 0"
          (paginationChange)="vm.page($event)"
          (edit)="vm.edit($event)"
          (remove)="vm.remove($event)"
          (updateUserRole)="vm.role($event)"
        />
        }
      </section>
    </main>
  `,
  styles: [
    `
      .user-catalog {
        max-width: 1400px;
        width: 90%;
        margin: auto;
        padding: 1rem;
        box-sizing: border-box;
        &__title {
          font-size: 1.85rem;
          font-weight: 100;
          margin: 1.7rem 1rem;
        }
        &__card {
          background: var(--mat-sys-surface-container-low);
          padding: 1.5rem;
          border-radius: 12px;
          min-height: 300px;
        }
        &__loading {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1rem;
          padding: 3rem 1rem;
        }
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserMetadataPageComponent {
  readonly vm = inject(CatalogViewModel);

  createUser() {
    console.log('Create user clicked');
  }
}
