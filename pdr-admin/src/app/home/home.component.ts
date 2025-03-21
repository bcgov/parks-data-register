import { Component } from '@angular/core';
import { KeycloakService } from 'src/app/services/keycloak.service';
import { ConfigService } from '../services/config.service';

@Component({
    selector: 'app-home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.scss'],
    standalone: false
})
export class HomeComponent {
  // This can be pulled in via the config.
  public cardConfig = [
    {
      cardHeader: 'Protected Area',
      cardTitle: 'Search and manage protected areas',
      cardText: 'Find, view, or change protected areas.',
      navigation: ['protected-areas'],
    },
    {
      cardHeader: 'Change Log',
      cardTitle: 'See changes',
      cardText: 'View changes by date, type, and actor.',
      navigation: ['change-log'],
    },
  ];
  constructor(protected keyCloakService: KeycloakService, protected configService: ConfigService) { }
}
