import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import {
  MatPaginatorModule,
  PageEvent,
} from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { UserMetadataDto } from '@tmdjr/user-metadata-contracts';

@Component({
  selector: 'ngx-user-metadata-list',
  imports: [
    MatTableModule,
    MatPaginatorModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatFormFieldModule,
    MatSelectModule,
  ],
  template: `
    <section class="list-container" aria-label="User metadata list">
      <div class="header">
        <h2>User Metadata</h2>
        <div class="flex-spacer"></div>
        <mat-paginator
          [length]="total"
          [pageIndex]="page - 1"
          [pageSize]="pageSize"
          [pageSizeOptions]="[5, 10, 20, 50]"
          (page)="onPageChange($event)"
          aria-label="Pagination"
        ></mat-paginator>
      </div>
      @if (userMetadata.length) {
      <table mat-table [dataSource]="userMetadata" class="table">
        <ng-container matColumnDef="role">
          <th mat-header-cell *matHeaderCellDef>Role</th>
          <td mat-cell *matCellDef="let item">
            <mat-select
              class="role-select"
              hideSingleSelectionIndicator
              formControlName="role"
              [value]="item.role"
              (valueChange)="roleChange(item, $event)"
            >
              @for (role of roleTypes; track role) {
              <mat-option [value]="role">{{ role }}</mat-option>
              }
            </mat-select>
          </td>
        </ng-container>
        <ng-container matColumnDef="uuid">
          <th mat-header-cell *matHeaderCellDef>UUID</th>
          <td mat-cell *matCellDef="let item">{{ item.uuid }}</td>
        </ng-container>
        <ng-container matColumnDef="firstName">
          <th mat-header-cell *matHeaderCellDef>First name</th>
          <td mat-cell *matCellDef="let item">
            {{ item.firstName || '—' }}
          </td>
        </ng-container>
        <ng-container matColumnDef="lastName">
          <th mat-header-cell *matHeaderCellDef>Last name</th>
          <td mat-cell *matCellDef="let item">
            {{ item.lastName || '—' }}
          </td>
        </ng-container>
        <ng-container matColumnDef="email">
          <th mat-header-cell *matHeaderCellDef>Email</th>
          <td mat-cell *matCellDef="let item">
            {{ item.email || '—' }}
          </td>
        </ng-container>
        <ng-container matColumnDef="actions">
          <th
            mat-header-cell
            *matHeaderCellDef
            class="actions-column"
          >
            Actions
          </th>
          <td mat-cell *matCellDef="let item" class="actions-column">
            <button
              mat-icon-button
              matTooltip="Edit"
              type="button"
              (click)="onEdit(item)"
              [attr.aria-label]="'Edit ' + item.uuid"
            >
              <mat-icon>edit</mat-icon>
            </button>
            <button
              mat-icon-button
              matTooltip="Delete"
              type="button"
              (click)="onRemove(item)"
              [attr.aria-label]="'Delete ' + item.uuid"
            >
              <mat-icon>delete</mat-icon>
            </button>
          </td>
        </ng-container>
        <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
        <tr
          mat-row
          *matRowDef="let row; columns: displayedColumns"
          class="data-row"
        ></tr>
      </table>
      } @else {
      <div class="empty-state">
        <p>No user metadata found.</p>
      </div>
      }
    </section>
  `,
  styles: [
    `
      @use '@angular/material' as mat;
      :host {
        width: 100%;

        .header {
          display: flex;
        }
      }
      .list-container {
        display: flex;
        flex-direction: column;
        gap: 1rem;
      }

      mat-paginator {
        background: var(--mat-sys-surface-container-low);
      }

      .table {
        padding: 1.5rem;
        background: var(--mat-sys-surface-container-high);
        border-radius: var(
          --mat-card-elevated-container-shape,
          var(--mat-sys-corner-medium)
        );
      }

      .data-row:hover {
        background-color: var(--mat-sys-secondary-container);
      }

      .empty-state {
        text-align: center;
        padding: 2rem 1rem;
        color: var(--mat-sys-on-surface);
      }

      .role-select {
        width: 100px;
        font-size: 0.85rem;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserMetadataListComponent {
  @Input({ required: true })
  userMetadata: UserMetadataDto[] = [];

  @Input()
  total = 0;

  @Input()
  page = 1;

  @Input()
  pageSize = 10;

  @Output()
  paginationChange = new EventEmitter<{
    page: number;
    limit: number;
  }>();

  @Output()
  edit = new EventEmitter<UserMetadataDto>();

  @Output()
  remove = new EventEmitter<UserMetadataDto>();

  @Output()
  updateUserRole = new EventEmitter<UserMetadataDto>();

  readonly roleTypes: UserMetadataDto['role'][] = [
    'admin',
    'publisher',
    'regular',
  ];

  readonly displayedColumns = [
    'role',
    'uuid',
    'email',
    'firstName',
    'lastName',
    'actions',
  ];

  onPageChange(event: PageEvent): void {
    this.paginationChange.emit({
      page: event.pageIndex + 1,
      limit: event.pageSize,
    });
  }

  onEdit(user: UserMetadataDto): void {
    this.edit.emit(user);
  }

  onRemove(user: UserMetadataDto): void {
    this.remove.emit(user);
  }

  roleChange(
    user: UserMetadataDto,
    newRole: UserMetadataDto['role']
  ): void {
    const updatedUser = { ...user, role: newRole };
    this.updateUserRole.emit(updatedUser);
  }
}
