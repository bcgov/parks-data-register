import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';

/* Sometimes we want to be able to navigate back up the url tree to a dynamic url beyond the scope of whatever routing module we are in. We can use a router guard to intercept the path and extract the necessary url route from the existing url tree.

This router guard takes an argument `startSegment` which locates the segment of the existing url tree to start from. It takes another optional argument `segmentCount` (default = 1) that takes the number of segments beyond the routeStartMatch to return.

Example:
  sites-router.module.ts:
      {
        path: '',
        component: NotFoundComponent,
        canActivate: [DynamicRedirectGuard],
        data: {
          segmentStart: 'protected-areas'
        }
      },

  When the url is /protected-areas/300/sites, there is not a page associated with '/sites' so we want to redirect back to /protected-areas/300. The 300 is a dynamic url segment that we wont know until navigation time.
*/

@Injectable({
  providedIn: 'root',
})
export class DynamicRedirectGuard {
  constructor(private router: Router) { }
  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | boolean {
    const segmentStart = route.data?.['segmentStart'] || null;
    if (!segmentStart) {
      return false;
    } else {
      const segmentCount = route.data?.['segmentCount'] || 1;
      let segmentArray = state.url.split('/');
      const leafIndex = segmentArray.indexOf(segmentStart) + segmentCount;
      // construct new url
      let newUrl = segmentArray.slice(0, leafIndex + 1).join('/');
      this.router.navigate([newUrl]);
      return true;
    }
  }
}
