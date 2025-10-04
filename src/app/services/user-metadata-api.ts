import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import {
  CreateUserMetadataDto,
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

  create(
    payload: CreateUserMetadataDto
  ): Observable<UserMetadataDto> {
    return this.http.post<UserMetadataDto>(this.baseUrl, payload);
  }

  update(
    uuid: string,
    payload: UpdateUserMetadataDto
  ): Observable<UserMetadataDto> {
    const params = new HttpParams().set('uuid', uuid);
    return this.http.patch<UserMetadataDto>(this.baseUrl, payload, {
      params,
    });
  }

  remove(uuid: string): Observable<void> {
    return this.http.delete<void>(this.baseUrl + '/' + uuid);
  }
}
