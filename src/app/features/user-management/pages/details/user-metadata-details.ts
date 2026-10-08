import {
  ChangeDetectionStrategy,
  Component,
  inject,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { AssessmentTestList } from '../../components/assessment-test-list';
import { UserMetadataActions } from '../../components/user-metadata-actions';
import { UserMetadataFormComponent } from '../../components/user-metadata-form';
import { DetailsViewModel } from './details.view-model';

@Component({
  selector: 'ngx-user-metadata-details',
  imports: [
    UserMetadataFormComponent,
    AssessmentTestList,
    MatButtonModule,
    MatIcon,
    UserMetadataActions,
    RouterLink,
  ],
  providers: [DetailsViewModel],
  template: `
    <ngx-user-metadata-actions>
      <button matButton="filled" routerLink="../">
        <mat-icon>arrow_back</mat-icon>
        Back to User Metadata List
      </button>
    </ngx-user-metadata-actions>
    <main class="user-details">
      <section
        class="user-details__card"
        [attr.aria-busy]="vm.profile().loading"
      >
        <h2>Edit user metadata</h2>
        @if (vm.profile().loading) {
        <p role="status">Loading user…</p>
        } @else if (vm.profile().error; as error) {
        <p role="alert">{{ error }}</p>
        <button matButton (click)="vm.retryProfile()">
          Retry user
        </button>
        } @else if (vm.profile().data; as user) {
        <ngx-user-metadata-form
          [userMetadata]="user"
          [saving]="
            vm.write().uuid === vm.uuid() && vm.write().pending > 0
          "
          [error]="
            vm.write().uuid === vm.uuid() ? vm.write().error : null
          "
          (save)="vm.save($event)"
        />
        }
      </section>
      <section
        class="user-details__card"
        [attr.aria-busy]="vm.assessments().loading"
      >
        <h2>Assessment Tests</h2>
        @if (vm.assessments().loading) {
        <p role="status">Loading assessments…</p>
        } @else if (vm.assessments().error; as error) {
        <p role="alert">{{ error }}</p>
        <button matButton (click)="vm.retryAssessments()">
          Retry assessments
        </button>
        } @else if (vm.assessments().data; as assessments) {
        <ngx-assessment-test-list [testInfo]="assessments" />
        }
      </section>
    </main>
  `,
  styles: [
    `
      .user-details {
        max-width: 1400px;
        width: 90%;
        margin: auto;
        padding: 1rem;
        box-sizing: border-box;
        &__card {
          background: var(--mat-sys-surface-container-low);
          padding: 1.5rem;
          border-radius: 12px;
          margin: 1rem 0 2rem;
        }
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserMetadataDetails {
  readonly vm = inject(DetailsViewModel);
}
