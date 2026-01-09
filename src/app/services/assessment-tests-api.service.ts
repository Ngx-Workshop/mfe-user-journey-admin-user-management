import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import {
  UserAssessmentTestDto,
  UserSubjectEligibilityDto,
} from '@tmdjr/service-nestjs-assessment-test-contracts';
import { Observable } from 'rxjs';

const subjects = ['ANGULAR', 'RXJS', 'NESTJS'];
const iconMap = new Map<string, string>([
  ['ANGULAR', 'devicon-angular-plain'],
  ['RXJS', 'devicon-rxjs-plain'],
  ['NESTJS', 'devicon-nestjs-original'],
]);

export type TestInfo = {
  assessmentTests: UserAssessmentTestDto[];
  subjectLevels: UserSubjectEligibilityDto[];
};

export interface TestInfoViewModel {
  subjectLevels: {
    subjectTitle: string;
    subjectIcon: string;
    levelCount: number;
    completedTests?: {
      testName: string;
      score: number;
      questionsLength: number;
      scorePercent: number;
    }[];
    incompleteTests?: {
      testName: string;
    }[];
  }[];
}

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

  marshallingTestInfoViewModel(data: TestInfo): TestInfoViewModel {
    const subjectLevels = data.subjectLevels.map((subjectLevel) => {
      const testsForSubject = data.assessmentTests.filter(
        (test) => test.subject === subjectLevel.subject
      );

      const incompleteTests = testsForSubject.filter(
        (test) => !test.completed
      );
      const completedTests = testsForSubject
        .filter((test) => test.completed)
        .map((test) => {
          return {
            testName: test.testName,
            score: test.score,
            questionsLength: test.userAnswers.length,
            scorePercent:
              (test.score / test.userAnswers.length) * 100,
          };
        });

      return {
        subjectTitle: subjectLevel.subject,
        subjectIcon: iconMap.get(subjectLevel.subject) ?? '',
        levelCount: subjectLevel.levelCount,
        incompleteTests,
        completedTests,
      };
    });

    return { subjectLevels };
  }
}
