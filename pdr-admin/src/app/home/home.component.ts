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
      cardHeader: 'Name Search',
      cardTitle: 'Search data records',
      cardText: 'View, add, or change name records',
      navigation: 'name-search',
    },
    {
      cardHeader: 'ID Generator',
      cardTitle: 'Create new legal name or IDs',
      cardText: 'Create, view, or cancel pending IDs.',
      navigation: 'id-generator',
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
