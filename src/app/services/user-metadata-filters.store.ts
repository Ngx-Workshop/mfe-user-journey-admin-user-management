import { Injectable, computed, signal } from '@angular/core';
import { UserMetadataDto } from '@tmdjr/user-metadata-contracts';

export type UserMetadataRoleFilter = UserMetadataDto['role'] | 'all';

export interface UserMetadataFilters {
  query: string;
  role: UserMetadataRoleFilter;
}

@Injectable({ providedIn: 'root' })
export class UserMetadataFiltersStore {
  private readonly querySignal = signal('');
  private readonly roleSignal = signal<UserMetadataRoleFilter>('all');

  readonly query = this.querySignal.asReadonly();
  readonly role = this.roleSignal.asReadonly();
  readonly filters = computed<UserMetadataFilters>(() => ({
    query: this.querySignal().trim(),
    role: this.roleSignal(),
  }));

  setQuery(value: string): void {
    this.querySignal.set(value);
  }

  setRole(value: UserMetadataRoleFilter): void {
    this.roleSignal.set(value);
  }

  clear(): void {
    this.querySignal.set('');
    this.roleSignal.set('all');
  }
}
