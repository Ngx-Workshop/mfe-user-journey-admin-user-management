import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { UserMetadataHeader } from './features/user-management/components/user-metadata-header';

@Component({
  selector: 'ngx-seed-mfe',
  imports: [RouterModule, UserMetadataHeader],
  template: `
    <ngx-user-metadata-header></ngx-user-metadata-header>
    <router-outlet></router-outlet>
  `,
})
export class App {}

// 👇 **IMPORTANT FOR DYMANIC LOADING**
export default App;
