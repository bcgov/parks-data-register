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
      cardHeader: 'Card 1',
      cardTitle: 'Card 1',
      cardText: 'Description goes here.',
      navigation: '/',
    },
  ];
  constructor(protected keyCloakService: KeycloakService, protected configService: ConfigService) {
    this.cardConfig.push({
      cardHeader: 'Card 2',
      cardTitle: 'Card 2',
      cardText: 'Description goes here.',
      navigation: '/',
    });

    if (keyCloakService.isAllowed('metrics')) {
      this.cardConfig.push({
        cardHeader: 'Card 3',
        cardTitle: 'Card 3',
        cardText: 'Description goes here.',
        navigation: '/',
      });
    }
  }
}
