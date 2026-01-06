import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import {
  UpdateUserMetadataDto,
  UserMetadataDto,
} from '@tmdjr/user-metadata-contracts';
import { Observable } from 'rxjs';

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

@Injectable({ providedIn: 'root' })
export class UserMetadataService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/api/user-metadata';

  findAll(
    params: PaginationOptions = {}
  ): Observable<PaginatedUserMetadataDto> {
    let httpParams = new HttpParams();

    if (params.page != undefined) {
      httpParams = httpParams.set('page', params.page.toString());
    }

    if (params.limit != undefined) {
      httpParams = httpParams.set('limit', params.limit.toString());
    }

    if (params.query) {
      httpParams = httpParams.set('query', params.query);
    }

    if (params.role) {
      httpParams = httpParams.set('role', params.role);
    }

    return this.http.get<PaginatedUserMetadataDto>(
      `${this.baseUrl}/all`,
      {
        params: httpParams,
      }
    );
  }

  findOne(uuid: string): Observable<UserMetadataDto> {
    const params = new HttpParams().set('uuid', uuid);
    return this.http.get<UserMetadataDto>(this.baseUrl, { params });
  }

  update({
    uuid,
    ...payload
  }: UpdateUserMetadataDto): Observable<UserMetadataDto> {
    return this.http.patch<UserMetadataDto>(
      `${this.baseUrl}/${uuid}/admin-override`,
      payload
    );
  }

  remove(uuid: string): Observable<void> {
    return this.http.delete<void>(this.baseUrl + '/' + uuid);
  }

  updateUserRole(
    uuid: string,
    newRole: UserMetadataDto['role']
  ): Observable<UserMetadataDto> {
    return this.http.patch<UserMetadataDto>(
      `${this.baseUrl}/${uuid}/role`,
      { role: newRole }
    );
  }
}
