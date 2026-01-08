import { CommonModule } from '@angular/common';
import { Component, inject, Input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDivider } from '@angular/material/divider';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { RouterLink } from '@angular/router';
import {
  UserAssessmentTestDto,
  UserSubjectEligibilityDto,
} from '@tmdjr/service-nestjs-assessment-test-contracts';
import {
  BehaviorSubject,
  combineLatest,
  filter,
  map,
  switchMap,
  timer,
} from 'rxjs';
import { AssessmentTestsApiService } from '../services/assessment-tests-api.service';

type TestInfo = {
  assessmentTests: UserAssessmentTestDto[];
  subjectLevels: UserSubjectEligibilityDto[];
};

interface TestInfoViewModel {
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

const iconMap = new Map<string, string>([
  ['ANGULAR', 'angular_white_logomark'],
  ['RXJS', 'rxjs_white_logomark'],
  ['NESTJS', 'nestjs_white_logomark'],
]);

@Component({
  selector: 'ngx-assessment-test-list',
  imports: [
    CommonModule,
    MatExpansionModule,
    MatProgressBarModule,
    MatDivider,
    MatButtonModule,
    MatIconModule,
    RouterLink,
  ],
  template: `
    @if (viewModel$ | async; as vm) {

    <h2>Assessment Tests</h2>
    <mat-accordion>
      @for (subject of vm.subjectLevels; track $index) {
      <mat-expansion-panel
        [expanded]="
          subject.subjectTitle === 'ANGULAR' &&
          (openPanelDelay | async)
        "
      >
        <mat-expansion-panel-header>
          <mat-panel-title>
            <mat-icon
              class="subject-icon"
              [svgIcon]="subject.subjectIcon"
            ></mat-icon>
            {{ subject.subjectTitle }}
          </mat-panel-title>
          <mat-panel-description>
            Level {{ subject.levelCount }}
          </mat-panel-description>
        </mat-expansion-panel-header>
        <!-- <p>{{ subject | json }}</p> -->

        @if (subject.incompleteTests.length) {
        <div class="info-container">
          <h2>Incomplete Test:</h2>
          <mat-divider></mat-divider>
          @for (test of subject.incompleteTests; track $index) {
          <div class="incomplete-test">
            <h3>{{ test.testName }}</h3>
            <a mat-stroked-button routerLink="/assessment-test"
              >Start Test</a
            >
          </div>
          }
        </div>
        } @if (subject.completedTests.length) {
        <div class="info-container">
          <h2>Completed Tests:</h2>
          <mat-divider></mat-divider>
          @for (test of subject.completedTests; track $index) {
          <h3>{{ test.testName }}</h3>
          <p class="float-left-clear">
            Score: {{ test.score }}/{{ test.questionsLength }}
          </p>
          <p class="float-right">{{ test.scorePercent }}%</p>
          <mat-progress-bar
            mode="determinate"
            value="{{ test.scorePercent }}"
          ></mat-progress-bar>
          }
        </div>
        } @else {
        <h2>No completed tests</h2>
        }
      </mat-expansion-panel>
      }
    </mat-accordion>
    }
  `,
  styles: [
    `
      :host {
        .info-container {
          margin-bottom: 36px;
        }
        .incomplete-test {
          display: flex;
          flex-direction: row;
          align-items: flex-end;
          justify-content: space-between;
        }
        .subject-icon {
          margin-right: 12px;
        }
        h2 {
          font-weight: 300;
          margin: 12px 0;
        }
        h3 {
          font-weight: 400;
          margin: 24px 0 4px;
        }
        p {
          font-weight: 300;
          margin: 0 0 4px;
        }
        .float-left-clear {
          float: left;
          clear: both;
        }
        .float-right {
          float: right;
        }
      }
    `,
  ],
})
export class AssessmentTestList {
  openPanelDelay = timer(800).pipe(map(() => true));

  private readonly assessmentTestsApiService = inject(
    AssessmentTestsApiService
  );

  _userId = new BehaviorSubject<string | null>(null);
  @Input()
  set userId(value: string) {
    this._userId.next(value);
  }

  viewModel$ = this._userId.asObservable().pipe(
    filter((userId): userId is string => userId !== null),
    switchMap((userId) =>
      combineLatest({
        assessmentTests:
          this.assessmentTestsApiService.fetchUsersAssessments$(
            userId
          ),
        subjectLevels:
          this.assessmentTestsApiService.fetchUserSubjectEligibilities$(
            userId
          ),
      })
    ),
    map((data) => this.testInfoViewModel(data))
  );

  testInfoViewModel(data: TestInfo) {
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
