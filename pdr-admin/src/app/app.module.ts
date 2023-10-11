import { APP_INITIALIZER, ApplicationRef, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HeaderModule } from './header/header.module';
import { InfiniteLoadingBarModule } from './infinite-loading-bar/infinite-loading-bar.module';
import { FooterModule } from './footer/footer.module';
import { SidebarModule } from './sidebar/sidebar.module';
import { LoginComponent } from './login/login.component';
import { NotAuthorizedComponent } from './not-authorized/not-authorized.component';
import { ConfigService } from './services/config.service';
import { KeycloakService } from './services/keycloak.service';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { LoadingService } from './services/loading.service';
import { LoggerService } from './services/logger.service';
import { ToastService } from './services/toast.service';
import { AutoFetchService } from './services/auto-fetch.service';
import { ApiService } from './services/api.service';
import { DataService } from './services/data.service';
import { TokenInterceptor } from './utils/token-interceptor';
import { EventService } from './services/event.service';
import { ToggleButtonModule } from './toggle-button/toggle-button.module';
import { BreadcrumbModule } from './breadcrumb/breadcrumb.module';
import { HomeModule } from './home/home.module';
import { NameSearchComponent } from './name-search/name-search.component';
import { NgdsFormsModule } from '@digitalspace/ngds-forms';
import { IdGeneratorComponent } from './id-generator/id-generator.component';
import { DataExportComponent } from './data-export/data-export.component';
import { ChangeLogComponent } from './change-log/change-log.component';

export function initConfig(
  configService: ConfigService,
  apiService: ApiService,
  autoFetchService: AutoFetchService,
  keycloakService: KeycloakService
) {
  return async () => {
    await configService.init();
    apiService.init();
    await keycloakService.init();
    if (keycloakService.isAuthorized()) {
      autoFetchService.run();
    }
  };
}

@NgModule({
  declarations: [AppComponent, LoginComponent, NotAuthorizedComponent, NameSearchComponent, IdGeneratorComponent, DataExportComponent, ChangeLogComponent],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HeaderModule,
    InfiniteLoadingBarModule,
    FooterModule,
    SidebarModule,
    ToggleButtonModule,
    BreadcrumbModule,
    HomeModule,
    NgdsFormsModule,
  ],
  providers: [
    {
      provide: APP_INITIALIZER,
      useFactory: initConfig,
      deps: [ConfigService, ApiService, AutoFetchService, KeycloakService],
      multi: true,
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: TokenInterceptor,
      multi: true,
    },
    ConfigService,
    KeycloakService,
    LoggerService,
    DataService,
    EventService,
    ToastService,
    AutoFetchService,
    LoadingService,
  ],
  bootstrap: [AppComponent],
})
export class AppModule {
  constructor(applicationRef: ApplicationRef) {
    Object.defineProperty(applicationRef, '_rootComponents', {
      get: () => applicationRef['components'],
    });
  }
}
