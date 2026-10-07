import {
  DestroyRef,
  Injectable,
  inject,
  signal,
} from '@angular/core';
import {
  takeUntilDestroyed,
  toSignal,
} from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { UserMetadataDto } from '@tmdjr/user-metadata-contracts';
import {
  Subject,
  debounceTime,
  distinctUntilChanged,
  filter,
} from 'rxjs';
import { ConfirmDeleteDialog } from '../../components/delete-confirm';
import { UserManagementStore } from '../../state/user-management.store';
import { CatalogQuery } from '../../models/user-management.models';

@Injectable()
export class CatalogViewModel {
  private readonly store = inject(UserManagementStore);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);
  private readonly search = new Subject<string>();
  readonly query = toSignal(this.store.query$, { requireSync: true });
  readonly searchQuery = signal(this.query().query);
  readonly catalog = toSignal(this.store.catalog$, {
    requireSync: true,
  });
  readonly write = toSignal(this.store.write$, { requireSync: true });

  constructor() {
    this.search
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        takeUntilDestroyed()
      )
      .subscribe((query) =>
        this.store.setFilters(query, this.query().role)
      );
    this.store.notifications$
      .pipe(takeUntilDestroyed())
      .subscribe((message) =>
        this.snackBar.open(message, 'Dismiss', { duration: 4000 })
      );
  }
  searchFor(query: string): void {
    this.searchQuery.set(query);
    this.search.next(query);
  }
  filterRole(role: CatalogQuery['role']): void {
    this.store.setFilters(this.searchQuery(), role);
  }
  clear(): void {
    this.searchQuery.set('');
    this.search.next('');
    this.store.setFilters('', 'all');
  }
  page(event: { page: number; limit: number }): void {
    this.store.setPage(event.page, event.limit);
  }
  retry(): void {
    this.store.refresh();
  }
  edit(user: UserMetadataDto): void {
    void this.router.navigate([user.uuid], {
      relativeTo: this.route,
    });
  }
  role(user: UserMetadataDto): void {
    this.store.execute({
      kind: 'role',
      uuid: user.uuid,
      role: user.role,
    });
  }
  remove(user: UserMetadataDto): void {
    if (this.write().pending) return;
    this.dialog
      .open(ConfirmDeleteDialog, { data: user })
      .afterClosed()
      .pipe(filter(Boolean), takeUntilDestroyed(this.destroyRef))
      .subscribe(() =>
        this.store.execute({ kind: 'delete', uuid: user.uuid })
      );
  }
  private readonly destroyRef = inject(DestroyRef);
}
