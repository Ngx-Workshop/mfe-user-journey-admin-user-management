import { Route } from '@angular/router';
import { userAuthenticatedGuard } from '@tmdjr/ngx-user-metadata';
import { UserMetadataPageComponent } from './components/user-metadata';
import { UserMetadataDetails } from './components/user-metadata-details/user-metadata-details';
import { assessmentTestResolver } from './resolver/assessment-test.resolver';

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
      {
        path: 'user-metadata/:userId',
        resolve: { testInfoViewModel: assessmentTestResolver },
        component: UserMetadataDetails,
      },
    ],
  },
];
