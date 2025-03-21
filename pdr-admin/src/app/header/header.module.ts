import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from './header.component';
import { KeycloakService } from '../services/keycloak.service';
import { RouterModule } from '@angular/router';
import { ConfigService } from '../services/config.service';
import { SideBarService } from '../services/sidebar.service';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

@NgModule({ declarations: [HeaderComponent],
    exports: [HeaderComponent], imports: [CommonModule, RouterModule], providers: [ConfigService, KeycloakService, SideBarService, provideHttpClient(withInterceptorsFromDi())] })
export class HeaderModule {}
