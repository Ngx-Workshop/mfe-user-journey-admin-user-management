import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { UserMetadataDto } from '@tmdjr/user-metadata-contracts';
import {
  UserMetadataFiltersStore,
  UserMetadataRoleFilter,
} from '../../services/user-metadata-filters.store';

@Component({
  selector: 'ngx-user-metadata-filters',
  imports: [
    CommonModule,
    MatButtonModule,
    MatButtonToggleModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule,
  ],
  template: `
    <div class="filters">
      <div class="filter-row header">
        <h3>Filters</h3>
        <button
          matButton
          type="button"
          (click)="clearAll()"
          [disabled]="!hasActiveFilters()"
        >
          <mat-icon>clear_all</mat-icon> Clear All
        </button>
      </div>
      <div class="filter-row">
        <mat-form-field appearance="outline" class="search-bar">
          <mat-label>Search</mat-label>
          <input
            matInput
            [value]="query()"
            placeholder="Filter by name or subject"
            (input)="onQueryChange($any($event.target).value)"
          />
          @if(query()) {
          <button
            mat-icon-button
            matSuffix
            type="button"
            (click)="clearQuery()"
          >
            <mat-icon>close</mat-icon>
          </button>
          }
        </mat-form-field>

        <mat-form-field appearance="outline" class="subject">
          <mat-label>Roles</mat-label>
          <mat-select
            [value]="role()"
            (valueChange)="onRoleChange($event)"
          >
            <mat-option value="all">All roles</mat-option>
            @for (role of roleTypes; track $index) {
            <mat-option [value]="role">{{ role }}</mat-option>
            }
          </mat-select>
        </mat-form-field>
      </div>
    </div>
  `,
  styles: [
    `
      .filters {
        background: var(--mat-sys-surface-container-low);
        padding: 1.5rem;
        border-radius: var(
          --mat-card-elevated-container-shape,
          var(--mat-sys-corner-medium)
        );
        margin-bottom: 2rem;
        h3 {
          margin-top: 0;
          margin-bottom: 1rem;
        }
      }
      .filter-row {
        display: flex;
        gap: 1rem;
        flex-wrap: wrap;
        align-items: center;
        margin-bottom: 1rem;

        &.header {
          justify-content: space-between;
        }
        &:last-child {
          margin-bottom: 0;
        }
      }

      .search-bar {
        width: 100%;
        max-width: 600px;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserMetadataFiltersComponent {
  private readonly filtersStore = inject(UserMetadataFiltersStore);

  readonly query = this.filtersStore.query;
  readonly role = this.filtersStore.role;
  readonly hasActiveFilters = computed(
    () => !!this.query().trim() || this.role() !== 'all'
  );

  readonly roleTypes: UserMetadataDto['role'][] = [
    'admin',
    'publisher',
    'regular',
  ];

  onQueryChange(value: string): void {
    this.filtersStore.setQuery(value);
  }

  clearQuery(): void {
    this.filtersStore.setQuery('');
  }

  onRoleChange(role: UserMetadataRoleFilter): void {
    this.filtersStore.setRole(role);
  }

  clearAll(): void {
    this.filtersStore.clear();
  }
}
