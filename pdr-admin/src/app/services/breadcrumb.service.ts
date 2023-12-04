import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Data, NavigationEnd, Router } from '@angular/router';
import { BehaviorSubject, Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import { Breadcrumb } from '../models/breadcrumb.model';
import { ProtectedAreaService } from './protected-area.service';

@Injectable({
  providedIn: 'root',
})
export class BreadcrumbService {
  // Subject emitting the breadcrumb hierarchy
  private readonly _breadcrumbs = new BehaviorSubject<Breadcrumb[]>([]);
  public protectedArea;
  public subscriptions = new Subscription();

  // Observable exposing the breadcrumb hierarchy
  readonly breadcrumbs = this._breadcrumbs.asObservable();

  constructor(private router: Router, private protectedAreaService: ProtectedAreaService) {
    // Initial seed
    this.setBreadcrumb();

    this.subscriptions.add(
      this.protectedAreaService.watchCurrentProtectedArea().subscribe((res) => {
        if (res) {
          this.protectedArea = res;
          this.setBreadcrumb();
        }
      })
    );

    this.router.events
      .pipe(
        // Filter the NavigationEnd events as the breadcrumb is updated only when the route reaches its end
        filter((event) => event instanceof NavigationEnd)
      )
      .subscribe(() => {
        this.setBreadcrumb();
      });
  }

  private setBreadcrumb() {
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
        let altLabel;
        switch (route.data['breadcrumb']) {
          case 'PROTECTED_AREA_DETAILS':
            label = `${this.protectedArea?.displayName || '-'}`;
            altLabel = 'Details';
            break;
          case 'PROTECTED_AREA_EDIT':
            label =
              `${routeUrl[routeUrl.length - 1]}`.charAt(0).toUpperCase() + `${routeUrl[routeUrl.length - 1]}`.slice(1);
            break;
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

        if (altLabel) {
          breadcrumb['altLabel'] = altLabel;
        }

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
