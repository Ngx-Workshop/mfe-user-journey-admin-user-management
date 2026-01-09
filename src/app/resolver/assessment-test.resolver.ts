import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { combineLatest, map, Observable } from 'rxjs';
import {
  AssessmentTestsApiService,
  TestInfoViewModel,
} from '../services/assessment-tests-api.service';

type AssessmentTestResolver = ResolveFn<
  Observable<TestInfoViewModel>
>;

export const assessmentTestResolver: AssessmentTestResolver = (
  route
) => {
  const apiService = inject(AssessmentTestsApiService);
  return combineLatest([
    apiService.fetchUserSubjectEligibilities$(route.params['userId']),
    apiService.fetchUsersAssessments$(route.params['userId']),
  ]).pipe(
    map(([subjectLevels, assessmentTests]) =>
      apiService.marshallingTestInfoViewModel({
        subjectLevels,
        assessmentTests,
      })
    )
  );
};
