import { CommonModule } from '@angular/common';
import { Component, input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDivider } from '@angular/material/divider';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { RouterLink } from '@angular/router';
import { map, timer } from 'rxjs';
import { TestInfoViewModel } from '../../services/assessment-tests-api.service';

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
    @if (testInfo(); as vm) {
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
            <i [class]="subject.subjectIcon"></i>
            {{ subject.subjectTitle }}
          </mat-panel-title>
          <mat-panel-description>
            Level {{ subject.levelCount }}
          </mat-panel-description>
        </mat-expansion-panel-header>
        <!-- <p>{{ subject | json }}</p> -->
        @if (subject.incompleteTests?.length) {
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
        } @if (subject.completedTests?.length) {
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
        i {
          font-size: 1.5rem;
          inline-size: 2rem;
        }
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
  testInfo = input.required<TestInfoViewModel>();
}
