import {
  UpdateUserMetadataDto,
  UserMetadataDto,
} from '@tmdjr/user-metadata-contracts';

export interface PaginatedUserMetadataDto {
  data: UserMetadataDto[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PaginationOptions {
  page?: number;
  limit?: number;
  query?: string;
  role?: UserMetadataDto['role'];
}

export type RoleFilter = UserMetadataDto['role'] | 'all';
export interface CatalogQuery {
  page: number;
  limit: number;
  query: string;
  role: RoleFilter;
}
export interface LoadState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}
export interface ProfileChange {
  uuid: string;
  payload: UpdateUserMetadataDto;
}
export type UserCommand =
  | ({ kind: 'profile' } & ProfileChange)
  | { kind: 'role'; uuid: string; role: UserMetadataDto['role'] }
  | { kind: 'delete'; uuid: string };
export interface WriteState {
  uuid: string;
  pending: number;
  error: string | null;
  message: string | null;
}
