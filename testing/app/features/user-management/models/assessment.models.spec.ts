import {
  toTestInfoViewModel,
  TestInfo,
} from '../../../../../src/app/features/user-management/models/assessment.models';

describe('assessment view model mapping', () => {
  it('groups subjects, separates incomplete tests and keeps zero-answer percentages finite', () => {
    const result = toTestInfoViewModel({
      subjectLevels: [{ subject: 'ANGULAR', levelCount: 2 }],
      assessmentTests: [
        {
          subject: 'ANGULAR',
          completed: true,
          testName: 'Empty',
          score: 0,
          userAnswers: [],
        },
        { subject: 'ANGULAR', completed: false, testName: 'Pending' },
        {
          subject: 'RXJS',
          completed: true,
          testName: 'Other',
          score: 1,
          userAnswers: [{}],
        },
      ],
    } as TestInfo);
    expect(
      result.subjectLevels[0].completedTests?.[0].scorePercent
    ).toBe(0);
    expect(result.subjectLevels[0].completedTests?.length).toBe(1);
    expect(
      result.subjectLevels[0].incompleteTests?.[0].testName
    ).toBe('Pending');
  });
});
