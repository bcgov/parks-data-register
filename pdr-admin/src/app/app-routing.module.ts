import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { AuthGuard } from './guards/auth.guard';
import { NotAuthorizedComponent } from './not-authorized/not-authorized.component';
import { LoginComponent } from './login/login.component';
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
    path: 'protected-areas',
    canActivate: [AuthGuard],
    loadChildren: () => import('./protected-area/protected-area.module').then((m) => m.ProtectedAreaModule),
    data: {
      label: 'Protected Areas',
      icon: 'bi-shield-fill',
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
    // wildcard route
    path: '**',
    redirectTo: '/',
    pathMatch: 'full',
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { bindToComponentInputs: true })],
  exports: [RouterModule],
  providers: [],
})
export class AppRoutingModule {}
