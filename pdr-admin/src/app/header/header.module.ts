import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from './header.component';
import { KeycloakService } from '../services/keycloak.service';
import { RouterModule } from '@angular/router';
import { ConfigService } from '../services/config.service';
import { SideBarService } from '../services/sidebar.service';
import { HttpClientModule } from '@angular/common/http';

@NgModule({
  declarations: [HeaderComponent],
  imports: [CommonModule, RouterModule, HttpClientModule],
  exports: [HeaderComponent],
  providers: [ConfigService, KeycloakService, SideBarService],
})
export class HeaderModule {}
