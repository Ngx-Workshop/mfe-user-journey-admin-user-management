import {
  ChangeDetectionStrategy,
  Component,
  output,
} from '@angular/core';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'user-metadata-actions' },
  selector: 'ngx-user-metadata-actions',
  template: ` <ng-content></ng-content> `,
  styles: [
    `
      :host {
        position: sticky;
        top: 56px;
        z-index: 10;
        display: flex;
        align-items: center;
        // justify-content: flex-end;
        min-height: 64px;
        padding: 0 1.5rem;
        background: var(--mat-sys-primary);
        backdrop-filter: blur(16px);
        box-shadow: 0 8px 24px rgba(20, 24, 40, 0.04);
      }

      @media (max-width: 700px) {
        :host {
          padding: 0 1rem;
        }
      }
    `,
  ],
})
export class UserMetadataActions {
  createUser = output<void>();
}
