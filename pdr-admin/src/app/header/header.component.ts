import { Component, Input, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { ConfigService } from '../services/config.service';
import { KeycloakService } from '../services/keycloak.service';
import { SideBarService } from '../services/sidebar.service';

@Component({
    selector: 'app-header',
    templateUrl: './header.component.html',
    styleUrls: ['./header.component.scss'],
    standalone: false
})
export class HeaderComponent implements OnDestroy {
  @Input() showSideBar = true;

  private subscriptions = new Subscription();

  public envName: string;
  public showBanner = true;
  public welcomeMsg: String;
  public isAuthorized: boolean;
  public routes: any[] = [];

  constructor(
    protected configService: ConfigService,
    protected sidebarService: SideBarService,
    protected keycloakService: KeycloakService
  ) {
    this.subscriptions.add(
      sidebarService.routes.subscribe((routes) => {
        this.routes = routes;
      })
    );

    this.isAuthorized = this.keycloakService.isAuthorized();
    this.welcomeMsg = this.keycloakService.getWelcomeMessage();

    this.envName = this.configService.config['ENVIRONMENT'];
    if (this.envName === 'prod') {
      this.showBanner = false;
    }
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }
}
