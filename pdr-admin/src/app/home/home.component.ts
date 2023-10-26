import { Component } from '@angular/core';
import { KeycloakService } from 'src/app/services/keycloak.service';
import { ConfigService } from '../services/config.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent {
  // This can be pulled in via the config.
  public cardConfig = [
    {
      cardHeader: 'Manage Records',
      cardTitle: 'Search and manage records',
      cardText: 'Find, view, or change records.',
      navigation: 'manage-records',
    },
    {
      cardHeader: 'Change Log',
      cardTitle: 'See changes',
      cardText: 'View changes by date, type, and actor.',
      navigation: 'change-log',
    },
  ];
  constructor(protected keyCloakService: KeycloakService, protected configService: ConfigService) {
    // if (keyCloakService.isAllowed('metrics')) {
    //   this.cardConfig.push({
    //     cardHeader: 'Card 3',
    //     cardTitle: 'Card 3',
    //     cardText: 'Description goes here.',
    //     navigation: '/',
    //   });
    // }
  }
}
