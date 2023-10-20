import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ProtectedAreaDetailsComponent } from './protected-area-details/protected-area-details.component';
import { ProtectedAreaEditComponent } from './protected-area-edit/protected-area-edit.component';
import { AuthGuard } from '../guards/auth.guard';

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
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ProtectedAreaRoutingModule {}
