import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import {
  UserAssessmentTestDto,
  UserSubjectEligibilityDto,
} from '@tmdjr/service-nestjs-assessment-test-contracts';
import { Observable } from 'rxjs';

const subjects = ['ANGULAR', 'RXJS', 'NESTJS'];

@Injectable({ providedIn: 'root' })
export class AssessmentTestsApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = 'api/assessment-test';

  fetchUsersAssessments$(
    userId: UserAssessmentTestDto['uuid']
  ): Observable<UserAssessmentTestDto[]> {
    return this.http.get<UserAssessmentTestDto[]>(
      `${this.baseUrl}/admin-user-asssessments/${userId}`
    );
  }

  fetchUserSubjectEligibilities$(
    userId: UserAssessmentTestDto['uuid']
  ): Observable<UserSubjectEligibilityDto[]> {
    return this.http.get<UserSubjectEligibilityDto[]>(
      `${
        this.baseUrl
      }/admin-user-subjects-eligibility/${userId}?subjects=${subjects.join(
        ','
      )}`
    );
  }
}
