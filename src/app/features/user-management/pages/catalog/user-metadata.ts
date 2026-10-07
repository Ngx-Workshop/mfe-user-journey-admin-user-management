import {
  ChangeDetectionStrategy,
  Component,
  inject,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { NgxParticleHeader } from '@tmdjr/ngx-shared-headers';
import { UserMetadataFiltersComponent } from '../../components/user-metadata-filters';
import { UserMetadataListComponent } from '../../components/user-metadata-list';
import { CatalogViewModel } from './catalog.view-model';

@Component({
  selector: 'ngx-user-metadata-page',
  imports: [
    MatButtonModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    NgxParticleHeader,
    UserMetadataFiltersComponent,
    UserMetadataListComponent,
  ],
  providers: [CatalogViewModel],
  template: `
    <ngx-particle-header
      ><h1 class="user-catalog__title">
        User Management
      </h1></ngx-particle-header
    >
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
}
