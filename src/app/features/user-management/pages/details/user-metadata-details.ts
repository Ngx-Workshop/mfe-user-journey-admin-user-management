import { NgxPanel } from '@tmdjr/ngx-workshop-design-system';
import { MatSelectModule } from '@angular/material/select';
import { NgxButton } from '@tmdjr/ngx-workshop-design-system';
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
    NgxPanel,
    MatSelectModule,
    NgxButton,
    UserMetadataFormComponent,
    AssessmentTestList,
    MatButtonModule,
    MatIcon,
    UserMetadataActions,
    RouterLink,
  ],
  providers: [DetailsViewModel],
  template: `
    <ngx-user-metadata-actions
      [write]="vm.write()"
      [name]="vm.profile().data?.email ?? ''"
    >
      <button
        mat-flat-button
        ngxButton
        shape="chevron"
        surface="outline"
        routerLink="../"
      >
        <mat-icon>arrow_back</mat-icon>
        Back to User Metadata List
      </button>
    </ngx-user-metadata-actions>
    <main class="user-details">
      <ngx-panel
        heading="Edit user metadata"
        eyebrow="USER / PROFILE"
        background="glass"
        class="user-details__card"
        [attr.aria-busy]="vm.profile().loading"
      >
        @if (vm.profile().loading) {
          <p role="status">Loading user…</p>
        } @else if (vm.profile().error; as error) {
          <p role="alert">{{ error }}</p>
          <button
            mat-flat-button
            ngxButton
            surface="outline"
            (click)="vm.retryProfile()"
          >
            Retry user
          </button>
        } @else if (vm.profile().data; as user) {
          <ngx-user-metadata-form
            [userMetadata]="user"
            [locked]="
              vm.write().kind === 'delete' && vm.write().pending > 0
            "
            [saving]="
              vm.write().uuid === vm.uuid() && vm.write().pending > 0
            "
            [error]="
              vm.write().uuid === vm.uuid() ? vm.write().error : null
            "
            (save)="vm.save($event)"
          />
        }
      </ngx-panel>
      @if (vm.profile().data; as user) {
        <ngx-panel
          heading="Access and lifecycle"
          eyebrow="USER / ACCESS"
          background="solid"
        >
          <mat-form-field appearance="outline"
            ><mat-label>User role</mat-label>
            <mat-select
              panelClass="ngx-design-system-overlay ngx-select-panel"
              [value]="vm.selectedRole() ?? user.role"
              [disabled]="vm.write().pending > 0"
              (selectionChange)="vm.role(user, $event.value)"
            >
              <mat-option value="regular">Regular</mat-option
              ><mat-option value="publisher">Publisher</mat-option
              ><mat-option value="admin">Admin</mat-option>
            </mat-select>
          </mat-form-field>
          <p>
            Deleting metadata removes this profile. The sign-in
            account remains.
          </p>
          <button
            mat-flat-button
            ngxButton
            surface="outline"
            tone="danger"
            type="button"
            [disabled]="vm.write().pending > 0"
            (click)="vm.remove(user)"
          >
            Delete metadata
          </button>
        </ngx-panel>
      }
      <ngx-panel
        heading="Assessment Tests"
        eyebrow="LEARNING / HISTORY"
        background="solid"
        class="user-details__card"
        [attr.aria-busy]="vm.assessments().loading"
      >
        @if (vm.assessments().loading) {
          <p role="status">Loading assessments…</p>
        } @else if (vm.assessments().error; as error) {
          <p role="alert">{{ error }}</p>
          <button
            mat-flat-button
            ngxButton
            surface="outline"
            (click)="vm.retryAssessments()"
          >
            Retry assessments
          </button>
        } @else if (vm.assessments().data; as assessments) {
          <ngx-assessment-test-list [testInfo]="assessments" />
        }
      </ngx-panel>
    </main>
  `,
  styles: [
    `
      :host {
        display: block;
        min-width: 0;
      }
      .user-details {
        display: grid;
        gap: 1rem;
        max-width: 1200px;
        margin: 1.5rem auto;
        padding: 0 1rem;
        min-width: 0;
      }
      ngx-panel {
        min-width: 0;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserMetadataDetails {
  readonly vm = inject(DetailsViewModel);
}
