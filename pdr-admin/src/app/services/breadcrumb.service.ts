import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Data, NavigationEnd, Router } from '@angular/router';
import { BehaviorSubject, Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import { Breadcrumb } from '../models/breadcrumb.model';
import { DataService } from './data.service';

@Injectable({
  providedIn: 'root',
})
export class BreadcrumbService {
  // Subject emitting the breadcrumb hierarchy
  private readonly _breadcrumbs = new BehaviorSubject<Breadcrumb[]>([]);
  public park;
  public subscriptions = new Subscription();

  // Observable exposing the breadcrumb hierarchy
  readonly breadcrumbs = this._breadcrumbs.asObservable();

  constructor(private router: Router, private dataService: DataService) {
    // Initial seed
    this.setBreadcrum();

    // this.subscriptions.add(
    //   this.dataService.watchItem(Constants.dataIds.CURRENT_PARK_KEY).subscribe((res) => {
    //     if (res) {
    //       this.park = this.parkService.getCachedPark(res);
    //       this.setBreadcrum();
    //     }
    //   })
    // );

    this.router.events
      .pipe(
        // Filter the NavigationEnd events as the breadcrumb is updated only when the route reaches its end
        filter((event) => event instanceof NavigationEnd)
      )
      .subscribe(() => {
        this.setBreadcrum();
      });
  }

  private setBreadcrum() {
    // Construct the breadcrumb hierarchy
    const root = this.router.routerState.snapshot.root;
    const breadcrumbs: Breadcrumb[] = [];
    this.addBreadcrumb(root, [], breadcrumbs);

    // Emit the new hierarchy
    this._breadcrumbs.next(breadcrumbs);
  }

  private addBreadcrumb(route: ActivatedRouteSnapshot, parentUrl: string[], breadcrumbs: Breadcrumb[]) {
    if (route) {
      // Construct the route URL
      const routeUrl = parentUrl.concat(route.url.map((url) => url.path));

      // Add an element for the current route part
      if (route.data['breadcrumb']) {
        let label = '';
        switch (route.data['breadcrumb']) {
          // case 'PARK NAME':
          //   label = this.park?.name || route.params['parkId'];
          //   break;
          // case 'FACILITY NAME':
          //   label = route.params['facilityId'];
          //   break;
          // case 'PASS NAME':
          //   label = route.params['passId'];
          //   break;
          default:
            label = this.getLabel(route.data);
            break;
        }

        const breadcrumb = {
          label: label,
          url: `/${routeUrl.join('/')}`,
        };
        breadcrumbs.push(breadcrumb);
      }

      // Add another element for the next route part
      this.addBreadcrumb(route.firstChild as any, routeUrl, breadcrumbs);
    }
  }

  private getLabel(data: Data) {
    // The breadcrumb can be defined as a static string or as a function to construct the breadcrumb element out of the route data
    return typeof data['breadcrumb'] === 'function' ? data['breadcrumb'](data) : data['breadcrumb'];
  }
}
