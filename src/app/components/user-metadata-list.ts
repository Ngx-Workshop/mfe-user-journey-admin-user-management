import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import {
  MatPaginatorModule,
  PageEvent,
} from '@angular/material/paginator';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { UserMetadataDto } from '@tmdjr/user-metadata-contracts';

@Component({
  selector: 'ngx-user-metadata-list',
  standalone: true,
  imports: [
    MatTableModule,
    MatPaginatorModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
  ],
  template: `<section
    class="list-container"
    aria-label="User metadata list"
  >
    @if (data.length) {
    <table mat-table [dataSource]="data" class="table">
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
        <th mat-header-cell *matHeaderCellDef class="actions-column">
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
      <p class="hint">Use the create button to add a new user.</p>
    </div>
    }

    <mat-paginator
      [length]="total"
      [pageIndex]="page - 1"
      [pageSize]="pageSize"
      [pageSizeOptions]="[5, 10, 20, 50]"
      (page)="onPageChange($event)"
      aria-label="Pagination"
    ></mat-paginator>
  </section> `,
  styles: [
    `
      .list-container {
        display: flex;
        flex-direction: column;
        gap: 1rem;
      }

      .table {
        width: 100%;
      }

      .data-row:hover {
        background-color: rgba(0, 0, 0, 0.04);
      }

      .empty-state {
        text-align: center;
        padding: 2rem 1rem;
        color: rgba(0, 0, 0, 0.6);
      }

      .empty-state .hint {
        font-size: 0.85rem;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserMetadataListComponent {
  @Input({ required: true })
  data: UserMetadataDto[] = [];

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

  readonly displayedColumns = [
    'uuid',
    'firstName',
    'lastName',
    'email',
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
}
