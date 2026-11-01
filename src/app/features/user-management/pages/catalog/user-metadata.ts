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
import {
  NgxPanel,
  NgxButton,
} from '@tmdjr/ngx-workshop-design-system';
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
    NgxPanel,
    NgxButton,
  ],
  providers: [CatalogViewModel],
  template: `
    <ngx-user-metadata-actions
      [write]="vm.write()"
      [count]="vm.catalog().data?.total ?? null"
    >
      <button
        mat-flat-button
        ngxButton
        shape="chevron"
        surface="outline"
        (click)="vm.create()"
      >
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
      <ngx-panel
        heading="User directory"
        eyebrow="ACCOUNTS / PROFILES"
        shape="chamfered"
        background="solid"
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
          <button
            mat-flat-button
            ngxButton
            surface="outline"
            (click)="vm.retry()"
          >
            Retry
          </button>
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
            (create)="vm.create()"
            (clearFilters)="vm.clear()"
            [filtered]="
              !!vm.query().query || vm.query().role !== 'all'
            "
          />
        }
      </ngx-panel>
    </main>
  `,
  styles: [
    `
      .user-catalog {
        display: grid;
        grid-template-columns: minmax(240px, 300px) minmax(0, 1fr);
        gap: var(--ngx-space-4);
        padding: 1rem;
        align-items: start;
      }
      .user-catalog__card {
        min-width: 0;
      }
      .user-catalog__loading {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 1rem;
        padding: 2rem;
      }
      @media (max-width: 1000px) {
        .user-catalog {
          grid-template-columns: minmax(0, 1fr);
        }
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserMetadataPageComponent {
  readonly vm = inject(CatalogViewModel);
}
