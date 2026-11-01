import { NgxStatus } from '@tmdjr/ngx-workshop-design-system';
import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  input,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDivider } from '@angular/material/divider';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { TestInfoViewModel } from '../models/assessment.models';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'ngx-assessment-test-list',
  imports: [
    NgxStatus,
    CommonModule,
    MatExpansionModule,
    MatProgressBarModule,
    MatDivider,
    MatButtonModule,
    MatIconModule,
  ],
  template: `
    @if (testInfo(); as vm) {
      @if (!vm.subjectLevels.length) {
        <p>No assessment subjects found.</p>
      }
      <mat-accordion>
        @for (subject of vm.subjectLevels; track $index) {
          <mat-expansion-panel
            [expanded]="subject.subjectTitle === 'ANGULAR'"
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
            @if (subject.incompleteTests?.length) {
              <div class="assessments__info-container">
                <h2>Incomplete Test:</h2>
                <mat-divider></mat-divider>
                @for (test of subject.incompleteTests; track $index) {
                  <div class="assessments__incomplete-test">
                    <h3>{{ test.testName }}</h3>
                    <ngx-status label="Not attempted" tone="info" />
                  </div>
                }
              </div>
            }
            @if (subject.completedTests?.length) {
              <div class="assessments__info-container">
                <h2>Completed Tests:</h2>
                <mat-divider></mat-divider>
                @for (test of subject.completedTests; track $index) {
                  <h3>{{ test.testName }}</h3>
                  <p class="assessments__float-left-clear">
                    Score: {{ test.score }}/{{ test.questionsLength }}
                  </p>
                  <p class="assessments__float-right">
                    {{ test.scorePercent }}%
                  </p>
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
      @use '@tmdjr/ngx-workshop-design-system/theme' as ngx;
      :host {
        @include ngx.expansion-theme();
        i {
          font-size: 1.5rem;
          inline-size: 2rem;
        }
        .assessments__info-container {
          margin-bottom: 36px;
        }
        .assessments__incomplete-test {
          display: flex;
          flex-direction: row;
          align-items: flex-end;
          justify-content: space-between;
        }
        .assessments__subject-icon {
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
        .assessments__float-left-clear {
          float: left;
          clear: both;
        }
        .assessments__float-right {
          float: right;
        }
      }
    `,
  ],
})
export class AssessmentTestList {
  testInfo = input.required<TestInfoViewModel>();
}
