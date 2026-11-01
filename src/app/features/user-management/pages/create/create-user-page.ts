import {
  Component,
  ChangeDetectionStrategy,
  inject,
} from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatStepperModule } from '@angular/material/stepper';
import {
  NgxPanel,
  NgxButton,
  NgxBackground,
} from '@tmdjr/ngx-workshop-design-system';
import { UserMetadataActions } from '../../components/user-metadata-actions';
import { CreateUserViewModel } from './create-user.view-model';
import { CreateUserFields } from './create-user-fields';
@Component({
  selector: 'ngx-create-user-page',
  providers: [CreateUserViewModel],
  imports: [
    ReactiveFormsModule,
    RouterLink,
    MatButtonModule,
    MatStepperModule,
    NgxPanel,
    NgxButton,
    NgxBackground,
    UserMetadataActions,
    CreateUserFields,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<ngx-user-metadata-actions
      [write]="vm.feedback()"
      [name]="vm.form.controls.email.value"
    >
      <a
        mat-flat-button
        ngxButton
        shape="chevron"
        surface="outline"
        routerLink="../"
        >User directory</a
      >
    </ngx-user-metadata-actions>
    <main class="create-user">
      <ngx-background placement="viewport" />
      <ngx-panel
        heading="Create user"
        eyebrow="ACCOUNT / PROFILE"
        shape="stepped"
        background="glass"
      >
        <p>
          Create a sign-in account and user profile. The administrator
          stays signed in. No invitation email is sent.
        </p>
        @if (vm.error(); as error) {
          <p role="alert" class="create-user__error">
            {{ error }} Your entries are retained.
          </p>
        }
        <form
          id="create-user-form"
          [formGroup]="vm.form"
          (ngSubmit)="vm.submit()"
        >
          <mat-stepper
            #wizard
            linear
            orientation="vertical"
            [selectedIndex]="vm.step()"
            (selectionChange)="vm.step.set($event.selectedIndex)"
          >
            <mat-step
              label="Account and access"
              [completed]="vm.credentialsValid()"
              [editable]="!vm.busy()"
            >
              <ng-template matStepContent
                ><ngx-create-user-fields [form]="vm.form"
              /></ng-template>
            </mat-step>
            <mat-step
              label="Profile details"
              [completed]="true"
              [editable]="!vm.busy()"
            >
              <ng-template matStepContent
                ><ngx-create-user-fields
                  [form]="vm.form"
                  mode="profile"
              /></ng-template>
            </mat-step>
            <mat-step
              label="Review and create"
              [editable]="!vm.busy()"
            >
              <ng-template matStepContent
                ><dl class="create-user__review">
                  <dt>Email</dt>
                  <dd>{{ vm.form.controls.email.value }}</dd>
                  <dt>Role</dt>
                  <dd>{{ vm.form.controls.role.value }}</dd>
                  <dt>Name</dt>
                  <dd>
                    {{ vm.form.controls.firstName.value }}
                    {{ vm.form.controls.lastName.value }}
                  </dd>
                  <dt>Password</dt>
                  <dd>Set; hidden for privacy</dd>
                </dl>
                <p>
                  Creating this account grants its selected role.
                  Review the email and role before continuing.
                </p></ng-template
              >
            </mat-step>
          </mat-stepper>
        </form>
        <div ngxPanelActions class="create-user__actions">
          @if (vm.step() > 0) {
            <button
              mat-flat-button
              ngxButton
              surface="outline"
              type="button"
              [disabled]="vm.busy()"
              (click)="wizard.previous()"
            >
              Back
            </button>
          }
          @if (vm.step() < 2) {
            <button
              mat-flat-button
              ngxButton
              shape="chevron"
              type="button"
              [disabled]="vm.busy() || !vm.credentialsValid()"
              (click)="wizard.next()"
            >
              {{
                vm.step() === 0
                  ? 'Continue to profile'
                  : 'Review account'
              }}
            </button>
          } @else {
            <button
              mat-flat-button
              ngxButton
              shape="chevron"
              type="submit"
              form="create-user-form"
              [disabled]="vm.busy() || !vm.credentialsValid()"
            >
              {{ vm.busy() ? 'Creating…' : 'Create User' }}
            </button>
          }
        </div>
      </ngx-panel>
    </main>`,
  styles: [
    `
      :host {
        display: block;
        min-width: 0;
      }
      .create-user {
        position: relative;
        isolation: isolate;
        max-width: 797px;
        margin: 2rem auto;
        padding: 0 1rem;
        min-width: 0;
      }
      mat-stepper {
        background: transparent;
      }
      .create-user__error {
        color: var(--ngx-color-error);
      }
      .create-user__actions {
        display: flex;
        flex-wrap: wrap;
        gap: 1rem;
        justify-content: flex-end;
        width: 100%;
      }
      .create-user__review {
        display: grid;
        grid-template-columns: auto minmax(0, 1fr);
        gap: 1rem;
      }
      dd {
        margin: 0;
        overflow-wrap: anywhere;
      }
    `,
  ],
})
export class CreateUserPage {
  readonly vm = inject(CreateUserViewModel);
}
