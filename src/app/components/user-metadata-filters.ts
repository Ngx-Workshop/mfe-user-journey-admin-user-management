import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  signal,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { UserMetadataDto } from '@tmdjr/user-metadata-contracts';

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
        <button matButton>
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
          />
          @if(query()) {
          <button mat-icon-button matSuffix>
            <mat-icon>close</mat-icon>
          </button>
          }
        </mat-form-field>

        <mat-form-field appearance="outline" class="subject">
          <mat-label>Roles</mat-label>
          <mat-select>
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
  readonly query = signal('');
  readonly roleTypes: UserMetadataDto['role'][] = [
    'admin',
    'publisher',
    'regular',
  ];
}
