import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { RoleFilter } from '../models/user-management.models';

@Component({
  selector: 'ngx-user-metadata-filters',
  imports: [
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
  ],
  template: `
    <section class="user-filters" aria-label="User filters">
      <div class="user-filters__header">
        <h3>Filters</h3>
        <button matButton type="button" (click)="clear.emit()">
          Clear All
        </button>
      </div>
      <div class="user-filters__fields">
        <mat-form-field
          appearance="outline"
          class="user-filters__search"
        >
          <mat-label>Search</mat-label>
          <input
            matInput
            #search
            [value]="query()"
            placeholder="Name, UUID or email"
            (input)="queryChange.emit(search.value)"
          />
        </mat-form-field>
        <mat-form-field appearance="outline">
          <mat-label>Roles</mat-label>
          <mat-select
            [value]="role()"
            (valueChange)="roleChange.emit($event)"
          >
            <mat-option value="all">All roles</mat-option>
            @for (role of roles; track role) {
              <mat-option [value]="role">{{ role }}</mat-option>
            }
          </mat-select>
        </mat-form-field>
      </div>
    </section>
  `,
  styles: [
    `
      .user-filters {
        background: var(--mat-sys-surface-container-low);
        padding: 1.5rem;
        border-radius: 12px;
        margin-bottom: 2rem;
        &__header {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        &__fields {
          display: flex;
          gap: 1rem;
          flex-wrap: wrap;
        }
        &__search {
          flex: 1 1 240px;
        }
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserMetadataFiltersComponent {
  readonly query = input('');
  readonly role = input<RoleFilter>('all');
  readonly queryChange = output<string>();
  readonly roleChange = output<RoleFilter>();
  readonly clear = output<void>();
  readonly roles = ['admin', 'publisher', 'regular'];
}
