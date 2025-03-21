import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { KeycloakService } from '../services/keycloak.service';

@Component({
    selector: 'app-not-authorized',
    templateUrl: './not-authorized.component.html',
    styleUrls: ['./not-authorized.component.scss'],
    standalone: false
})
export class NotAuthorizedComponent implements OnInit {
  constructor(
    private router: Router,
    private keycloakService: KeycloakService
  ) {}

  ngOnInit() {
    if (this.keycloakService.isAuthenticated()) {
      if (this.keycloakService.isAuthorized()) {
        this.router.navigate(['/']);
        return;
      }
    } else {
      this.router.navigate(['/login']);
      return;
    }
  }

}
