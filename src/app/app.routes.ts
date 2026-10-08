import { Route } from '@angular/router';
import { userAuthenticatedGuard } from '@tmdjr/ngx-user-metadata';
import App from './app';
import { UserMetadataPageComponent } from './features/user-management/pages/catalog/user-metadata';
import { UserMetadataDetails } from './features/user-management/pages/details/user-metadata-details';

export const Routes: Route[] = [
  {
    path: '',
    canActivate: [userAuthenticatedGuard],
    component: App,
    children: [
      { path: '', redirectTo: 'user-metadata', pathMatch: 'full' },
      {
        path: 'user-metadata',
        component: UserMetadataPageComponent,
      },
      {
        path: 'user-metadata/:userId',
        component: UserMetadataDetails,
      },
    ],
  },
];
