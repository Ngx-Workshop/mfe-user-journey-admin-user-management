import {
  UserAssessmentTestDto,
  UserSubjectEligibilityDto,
} from '@tmdjr/service-nestjs-assessment-test-contracts';

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

export function toTestInfoViewModel(
  data: TestInfo
): TestInfoViewModel {
  const subjectLevels = data.subjectLevels.map((subjectLevel) => {
    const testsForSubject = data.assessmentTests.filter(
      (test) => test.subject === subjectLevel.subject
    );

    const incompleteTests = testsForSubject
      .filter((test) => !test.completed)
      .map((test) => ({ testName: test.testName }));
    const completedTests = testsForSubject
      .filter((test) => test.completed)
      .map((test) => {
        return {
          testName: test.testName,
          score: test.score,
          questionsLength: test.userAnswers.length,
          scorePercent: test.userAnswers.length
            ? (test.score / test.userAnswers.length) * 100
            : 0,
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
