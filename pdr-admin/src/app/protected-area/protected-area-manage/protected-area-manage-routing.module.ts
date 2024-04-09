import { NgModule } from '@angular/core';
import { RouterModule, Routes, mapToCanDeactivate } from '@angular/router';
import { ProtectedAreaEditRepealComponent } from './protected-area-edit-repeal/protected-area-edit-repeal.component';
import { ProtectedAreaManageComponent } from './protected-area-manage.component';
import { ProtectedAreaEditFormComponent } from './protected-area-edit-form/protected-area-edit-form.component';
import { UnsavedChangesGuard } from 'src/app/guards/unsaved-changes-guard';

const routes: Routes = [
  {
    path: '',
    component: ProtectedAreaManageComponent,
    data: {
      breadcrumb: 'PROTECTED_AREA_DETAILS',
    },
    children: [
      {
        path: 'sites',
        loadChildren: () =>
          import('../site/site.module').then((m) => m.SiteModule),
      },
      {
        path: 'edit-repealed',
        component: ProtectedAreaEditFormComponent,
        data: {
          breadcrumb: 'Edit Repealed',
          updateType: 'edit-repeal',
        },
      },
      {
        path: 'repeal',
        component: ProtectedAreaEditRepealComponent,
        canDeactivate: mapToCanDeactivate([UnsavedChangesGuard]),
        data: {
          breadcrumb: 'Repeal',
          updateType: 'repeal'
        },
      },
      {
        path: 'minor',
        component: ProtectedAreaEditFormComponent,
        canDeactivate: mapToCanDeactivate([UnsavedChangesGuard]),
        data: {
          breadcrumb: 'Minor Edit',
          updateType: 'minor'
        },
      },
      {
        path: 'major',
        component: ProtectedAreaEditFormComponent,
        canDeactivate: mapToCanDeactivate([UnsavedChangesGuard]),
        data: {
          breadcrumb: 'Legal Name Change',
          updateType: 'major'
        },
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ProtectedAreaManageRoutingModule { }
