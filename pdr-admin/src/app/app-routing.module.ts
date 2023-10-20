import { NgModule } from '@angular/core';
import { RouterModule, Routes, provideRouter, withComponentInputBinding } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { AuthGuard } from './guards/auth.guard';
import { NotAuthorizedComponent } from './not-authorized/not-authorized.component';
import { LoginComponent } from './login/login.component';
import { NameSearchComponent } from './name-search/name-search.component';
import { ChangeLogComponent } from './change-log/change-log.component';
import { ProtectedAreaRoutingModule } from './protected-area/protected-area-routing.module';
import { SiteRoutingModule } from './site/site-routing.module';
import { ProtectedAreaComponent } from './protected-area/protected-area.component';
import { SiteComponent } from './site/site.component';

const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
    data: {
      label: 'Home',
      breadcrumb: 'Home',
      icon: 'bi-house-fill',
    },
  },
  {
    path: 'unauthorized',
    pathMatch: 'full',
    component: NotAuthorizedComponent,
    data: {
      showSideBar: false,
      showBreadCrumb: false,
    },
  },
  {
    path: 'login',
    pathMatch: 'full',
    component: LoginComponent,
    data: {
      showSideBar: false,
      showBreadCrumb: false,
    },
  },
  {
    path: 'name-search',
    pathMatch: 'full',
    component: NameSearchComponent,
    canActivate: [AuthGuard],
    data: {
      label: 'Name search',
      breadcrumb: 'Name search',
      icon: 'bi-search',
    },
  },
  {
    path: 'change-log',
    pathMatch: 'full',
    component: ChangeLogComponent,
    data: {
      label: 'Change log',
      breadcrumb: 'Change log',
      icon: 'bi-clock-history',
    },
  },
  {
    path: 'protected-area/:id',
    component: ProtectedAreaComponent,
    data: {
      breadcrumb: 'Protected Area',
    },
    loadChildren: () => ProtectedAreaRoutingModule,
  },
  {
    path: 'site/:id',
    component: SiteComponent,
    data: {
      breadcrumb: 'Site',
    },
    loadChildren: () => SiteRoutingModule,
  },
  {
    // wildcard route
    path: '**',
    redirectTo: '/',
    pathMatch: 'full',
  },
];

@NgModule({
  imports: [],
  exports: [RouterModule],
  providers: [provideRouter(routes, withComponentInputBinding())],
})
export class AppRoutingModule {}
