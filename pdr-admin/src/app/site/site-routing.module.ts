import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SiteDetailsComponent } from './site-details/site-details.component';
import { AuthGuard } from '../guards/auth.guard';
import { SiteEditComponent } from './site-edit/site-edit.component';

const routes: Routes = [
  {
    path: '',
    component: SiteDetailsComponent,
    canActivate: [AuthGuard],
    data: {
      breadcrumb: 'Details',
    },
    children: [
      {
        path: 'edit',
        component: SiteEditComponent,
        canActivate: [AuthGuard],
        data: {
          breadcrumb: 'Edit',
        },
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SiteRoutingModule {}
