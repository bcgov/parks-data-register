import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { AuthGuard } from './guards/auth.guard';
import { NotAuthorizedComponent } from './not-authorized/not-authorized.component';
import { LoginComponent } from './login/login.component';
import { NameSearchComponent } from './name-search/name-search.component';
import { IdGeneratorComponent } from './id-generator/id-generator.component';
import { ChangeLogComponent } from './change-log/change-log.component';

const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
    canActivate: [AuthGuard],
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
    children: [],
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
    data: {
      label: 'Name search',
      breadcrumb: 'Name search',
      icon: 'bi-search',
    },
  },
  {
    path: 'id-generator',
    pathMatch: 'full',
    component: IdGeneratorComponent,
    data: {
      label: 'ID generator',
      breadcrumb: 'ID generator',
      icon: 'bi-fingerprint',
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
    // wildcard route
    path: '**',
    redirectTo: '/',
    pathMatch: 'full',
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { scrollPositionRestoration: 'enabled' })],
  exports: [RouterModule],
})
export class AppRoutingModule {}
