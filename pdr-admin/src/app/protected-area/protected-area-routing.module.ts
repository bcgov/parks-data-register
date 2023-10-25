import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ProtectedAreaDetailsComponent } from './protected-area-details/protected-area-details.component';
import { ProtectedAreaEditComponent } from './protected-area-edit/protected-area-edit.component';
import { AuthGuard } from '../guards/auth.guard';
import { ProtectedAreaEditLegalComponent } from './protected-area-edit-legal/protected-area-edit-legal.component';
import { ProtectedAreaEditCurrentComponent } from './protected-area-edit-current/protected-area-edit-current.component';
import { ProtectedAreaEditRepealComponent } from './protected-area-edit-repeal/protected-area-edit-repeal.component';

const routes: Routes = [
  {
    path: '',
    component: ProtectedAreaDetailsComponent,
    canActivate: [AuthGuard],
    data: {
      breadcrumb: 'Details',
    },
  },
  {
    path: 'edit',
    component: ProtectedAreaEditComponent,
    canActivate: [AuthGuard],
    data: {
      breadcrumb: 'Edit',
    },
  },
  {
    path: 'edit/current',
    component: ProtectedAreaEditCurrentComponent,
    canActivate: [AuthGuard],
    data: {
      breadcrumb: 'Current Name',
    },
  },
  {
    path: 'edit/legal',
    component: ProtectedAreaEditLegalComponent,
    canActivate: [AuthGuard],
    data: {
      breadcrumb: 'Legal Name',
    },
  },
  {
    path: 'edit/repeal',
    component: ProtectedAreaEditRepealComponent,
    canActivate: [AuthGuard],
    data: {
      breadcrumb: 'Repeal',
    },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ProtectedAreaRoutingModule {}
