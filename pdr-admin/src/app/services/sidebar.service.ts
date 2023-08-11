import { Injectable, Output, EventEmitter, OnDestroy } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { BehaviorSubject, filter, Subscription } from 'rxjs';
import { KeycloakService } from './keycloak.service';

@Injectable({
  providedIn: 'root',
})
export class SideBarService implements OnDestroy {
  @Output() toggleChange: EventEmitter<boolean> = new EventEmitter();

  private subscriptions = new Subscription();

  public currentRoute;
  public routes;
  public hide = false;

  constructor(protected router: Router, protected keyCloakService: KeycloakService) {
    let routesArray = router.config.filter((obj) => {
      if (obj.path === 'login') {
        return keyCloakService.isAuthenticated() ? false : true;
      } else {
        return obj.path !== '**' && obj.path !== 'unauthorized';
      }
    });
    this.routes = new BehaviorSubject(routesArray);

    this.subscriptions.add(
      router.events.pipe(filter((event) => event instanceof NavigationEnd)).subscribe((event) => {
        this.currentRoute = event;

        if (this.currentRoute.url === '/') {
          routesArray.map((route) => (route['active'] = false));
          routesArray[0]['active'] = true;
        } else {
          for (let i = 0; i < routesArray.length; i++) {
            if (routesArray[i].path && this.currentRoute.url.includes(routesArray[i].path as string)) {
              routesArray[i]['active'] = true;
            } else {
              routesArray[i]['active'] = false;
            }
          }
        }
      })
    );
  }

  toggle() {
    this.hide = !this.hide;
    this.toggleChange.emit(this.hide);
  }

  close() {
    this.hide = true;
    this.toggleChange.emit(this.hide);
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }
}
