import {
  ChangeDetectionStrategy,
  Component,
  input,
} from '@angular/core';
import {
  NgxActionBar,
  NgxInlineStatus,
  NgxSaveFeedback,
} from '@tmdjr/ngx-workshop-design-system';
import { WriteState } from '../models/user-management.models';
@Component({
  selector: 'ngx-user-metadata-actions',
  imports: [NgxActionBar, NgxInlineStatus, NgxSaveFeedback],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<ngx-action-bar heading="User Management">
    <ngx-inline-status
      ngxActionBarIndicators
      [label]="
        count() === null ? 'User directory' : count() + ' users'
      "
    />
    <ngx-save-feedback
      ngxActionBarFeedback
      [state]="
        write()?.error
          ? 'error'
          : (write()?.pending ?? 0) > 0
            ? 'saving'
            : write()?.message
              ? 'saved'
              : 'idle'
      "
      [message]="write()?.error ?? write()?.message ?? ''"
      [name]="name()"
    />
    <ng-content />
  </ngx-action-bar>`,
  styles: [
    `
      :host {
        display: contents;
        --ngx-action-bar-top: var(
          --user-management-toolbar-top,
          96px
        );
      }
      @media (max-width: 720px) {
        :host {
          --ngx-action-bar-top: var(
            --user-management-toolbar-top,
            76px
          );
        }
      }
    `,
  ],
})
export class UserMetadataActions {
  readonly write = input<WriteState | null>(null);
  readonly count = input<number | null>(null);
  readonly name = input('');
}
