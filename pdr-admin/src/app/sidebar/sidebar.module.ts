import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from './sidebar.component';
import { SideBarService } from 'src/app/services/sidebar.service';
import { AppRoutingModule } from 'src/app/app-routing.module';
import { KeycloakService } from '../services/keycloak.service';

@NgModule({
  declarations: [SidebarComponent],
  imports: [CommonModule, AppRoutingModule],
  exports: [SidebarComponent],
  providers: [SideBarService, KeycloakService],
})
export class SidebarModule {}
