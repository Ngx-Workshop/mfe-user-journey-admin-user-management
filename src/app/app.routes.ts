import { Route } from '@angular/router';
import { userAuthenticatedGuard } from '@tmdjr/ngx-user-metadata';
import { UserMetadataPageComponent } from './components/user-metadata';

export const Routes: Route[] = [
  {
    path: '',
    canActivate: [userAuthenticatedGuard],
    children: [
      { path: '', redirectTo: 'user-metadata', pathMatch: 'full' },
      {
        path: 'user-metadata',
        component: UserMetadataPageComponent,
      },
    ],
  },
];
