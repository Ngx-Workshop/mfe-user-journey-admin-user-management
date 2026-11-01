import { NgxPanel } from '@tmdjr/ngx-workshop-design-system';
import { NgxButton } from '@tmdjr/ngx-workshop-design-system';
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
    NgxPanel,
    NgxButton,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
  ],
  template: `
    <ngx-panel
      heading="Filter console"
      eyebrow="DIRECTORY / FILTER"
      background="solid"
      class="user-filters"
      aria-label="User filters"
    >
      <div ngxPanelHeader class="user-filters__header">
        <button
          mat-flat-button
          ngxButton
          surface="outline"
          type="button"
          (click)="clear.emit()"
        >
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
            panelClass="ngx-design-system-overlay ngx-select-panel"
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
    </ngx-panel>
  `,
  styles: [
    `
      .user-filters {
        &__header {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        &__fields {
          display: flex;
          gap: 1rem;
          flex-direction: column;
        }
        &__search {
          width: 100%;
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
