import { Injectable, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UrlService implements OnInit, OnDestroy {
  public queryParams = new BehaviorSubject<any>({});

  constructor(
    private router: Router,
    private route: ActivatedRoute
  ) { }

  ngOnInit() {
    this.route.queryParams.subscribe((changes) => {
      this.queryParams.next(changes);
    })
  }

  /**
   * Gets the current url route.
   * @returns {String} The current url route.
   */
  getRoute() {
    return this.router.url;
  }

  /**
   * Gets an array of the current url path tags.
   * @returns {String[]} An array of the current url path tags.
   */
  getRoutePathTags() {
    return this.router.url.split('/').filter((e) => e !== '');
  }

  /**
   * Gets the current url query params.
   * @returns {Object} The key value pairs of the current query params.
   */
  getQueryParams() {
    return this.queryParams?.value;
  }

  /**
   * Updates the url query params with key value pairs. No navigation is performed. The browser history is replaced with the new updated url.
   * @param {Object} params The key value pairs to update the url query params with.
   */
  async setQueryParams(params) {
    // Don't set empty params
    for (const param of Object.keys(params)) {
      if (!params[param]) {
        delete params[param];
      }
    }
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: params,
      replaceUrl: true
    })

  }

  ngOnDestroy() {
    this.queryParams.next(null);
    this.queryParams.complete();
  }

}
