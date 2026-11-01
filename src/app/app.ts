import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterOutlet } from '@angular/router';
@Component({
  selector: 'ngx-seed-mfe',
  imports: [RouterOutlet],
  host: { class: 'user-management-app ngx-design-system' },
  template: '<router-outlet />',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: [
    `
      :host {
        display: block;
        min-width: 0;
        color: var(--ngx-color-text);
        background: var(--ngx-color-canvas);
      }
    `,
  ],
})
export class App {}
export default App;
