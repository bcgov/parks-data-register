import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ProtectedAreaEditCurrentComponent } from './protected-area-edit-current/protected-area-edit-current.component';
import { ProtectedAreaEditLegalComponent } from './protected-area-edit-legal/protected-area-edit-legal.component';
import { ProtectedAreaEditRepealComponent } from './protected-area-edit-repeal/protected-area-edit-repeal.component';
import { ProtectedAreaEditComponent } from './protected-area-edit/protected-area-edit.component';
import { ProtectedAreaManageComponent } from './protected-area-manage.component';

const routes: Routes = [
  {
    path: '',
    component: ProtectedAreaManageComponent,
    data: {
      breadcrumb: 'PROTECTED_AREA_DETAILS',
    },
    children: [
      {
        path: 'edit',
        component: ProtectedAreaEditComponent,
        data: {
          breadcrumb: 'Edit',
        },
        children: [
          {
            path: 'current',
            component: ProtectedAreaEditCurrentComponent,
            data: {
              breadcrumb: 'Current Name',
            },
          },
          {
            path: 'legal',
            component: ProtectedAreaEditLegalComponent,
            data: {
              breadcrumb: 'Legal Name',
            },
          },
          {
            path: 'repeal',
            component: ProtectedAreaEditRepealComponent,
            data: {
              breadcrumb: 'Repeal',
            },
          },
        ],
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ProtectedAreaManageRoutingModule {}
