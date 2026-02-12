import { AsyncPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ActivatedRoute, Router } from '@angular/router';
import { map } from 'rxjs';
import { TestInfoViewModel } from '../../services/assessment-tests-api.service';
import { UserMetadataService } from '../../services/user-metadata-api';
import { AssessmentTestList } from './assessment-test-list';
import { UserMetadataFormComponent } from './user-metadata-form';

@Component({
  selector: 'ngx-user-metadata-details',
  imports: [
    UserMetadataFormComponent,
    AssessmentTestList,
    MatProgressSpinnerModule,
    MatButtonModule,
    MatIcon,
    AsyncPipe,
  ],
  template: `
    <div class="container">
      <!-- Back Button -->
      <button
        mat-button
        class="back-button"
        (click)="router.navigate(['../'], { relativeTo: route })"
      >
        <mat-icon>arrow_back</mat-icon>
        Back to User Metadata List
      </button>
      @if (userMetadata$ | async; as userMetadata) {
      <div class="list-card">
        <h2>Edit user metadata</h2>
        <ngx-user-metadata-form
          [userMetadata]="userMetadata"
        ></ngx-user-metadata-form>
      </div>
      }
      <div class="list-card">
        @if(testInfoViewModel$ | async; as testInfo) {
        <h2>Assessment Tests</h2>
        <ngx-assessment-test-list
          [testInfo]="testInfo"
        ></ngx-assessment-test-list>
        }
      </div>
    </div>
  `,
  styles: [
    `
      :host {
        display: flex;
        justify-content: center;
      }
      .container {
        padding: 1rem;
        flex: 0 1 clamp(480px, 70vw, 1400px);
        max-width: 100%;
      }
      .list-card {
        background: var(--mat-sys-surface-container-low);
        padding: 1.5rem;
        border-radius: var(
          --mat-card-elevated-container-shape,
          var(--mat-sys-corner-medium)
        );
        margin-bottom: 2rem;
      }
      .back-button {
        margin-bottom: 1rem;
      }
    `,
  ],
})
export class UserMetadataDetails {
  protected readonly router = inject(Router);
  protected readonly route = inject(ActivatedRoute);
  protected readonly userMetadataService = inject(
    UserMetadataService
  );

  userMetadata$ = this.userMetadataService.findOne(
    this.route.snapshot.paramMap.get('userId')!
  );

  testInfoViewModel$ = this.route.data.pipe(
    map(({ testInfoViewModel: test }) => test as TestInfoViewModel)
  );
}
