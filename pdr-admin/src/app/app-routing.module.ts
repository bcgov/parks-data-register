import { NgModule } from '@angular/core';
import { RouterModule, Routes, provideRouter, withComponentInputBinding } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { AuthGuard } from './guards/auth.guard';
import { NotAuthorizedComponent } from './not-authorized/not-authorized.component';
import { LoginComponent } from './login/login.component';
import { ChangeLogComponent } from './change-log/change-log.component';
import { ProtectedAreaRoutingModule } from './protected-area/protected-area-routing.module';
import { ProtectedAreaComponent } from './protected-area/protected-area.component';
import { ManageRecordsComponent } from './manage-records/manage-records.component';

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
    path: 'manage-records',
    pathMatch: 'full',
    component: ManageRecordsComponent,
    canActivate: [AuthGuard],
    data: {
      label: 'Manage records',
      breadcrumb: 'Manage records',
      icon: 'bi-search',
    },
  },
  {
    path: 'change-log',
    pathMatch: 'full',
    component: ChangeLogComponent,
    canActivate: [AuthGuard],
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
