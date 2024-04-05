import { RouterModule, Routes, mapToCanDeactivate } from "@angular/router";
import { SiteManageComponent } from "./site-manage/site-manage.component";
import { NgModule } from "@angular/core";
import { SiteComponent } from "./site.component";
import { DynamicRedirectGuard } from "src/app/guards/dynamic-redirect.guard";
import { NotFoundComponent } from "src/app/shared/not-found/not-found.component";
import { SiteDetailsComponent } from "./site-manage/site-details/site-details.component";
import { SiteEditFormComponent } from "./site-manage/site-edit-form/site-edit-form.component";
import { Constants } from "src/app/utils/constants";
import { UnsavedChangesGuard } from "src/app/guards/unsaved-changes-guard";

const routes: Routes = [
  {
    path: '',
    component: SiteComponent,
    data: {
      breadcrumb: 'Sites'
    },
    children: [
      {
        path: '',
        component: NotFoundComponent,
        canActivate: [DynamicRedirectGuard],
        data: {
          segmentStart: 'protected-areas'
        }
      },
      {
        path: ':siteId',
        component: SiteManageComponent,
        data: {
          breadcrumb: 'SITE_DETAILS'
        },
        children: [
          {
            path: '',
            component: SiteDetailsComponent,
            data: {
              breadcrumb: null
            }
          },
          {
            path: Constants.editRoutes.MINOR_EDIT_ROUTE_SEGMENT,
            component: SiteEditFormComponent,
            canDeactivate: mapToCanDeactivate([UnsavedChangesGuard]),
            data: {
              breadcrumb: 'Minor edit',
              updateType: Constants.editRoutes.MINOR_EDIT_ROUTE_SEGMENT
            }
          },
          {
            path: Constants.editRoutes.MAJOR_EDIT_ROUTE_SEGMENT,
            component: SiteEditFormComponent,
            canDeactivate: mapToCanDeactivate([UnsavedChangesGuard]),
            data: {
              breadcrumb: 'Legal name change',
              updateType: Constants.editRoutes.MAJOR_EDIT_ROUTE_SEGMENT
            }
          },
          {
            path: Constants.editRoutes.REPEAL_EDIT_ROUTE_SEGMENT,
            component: SiteEditFormComponent,
            canDeactivate: mapToCanDeactivate([UnsavedChangesGuard]),
            data: {
              breadcrumb: 'Repeal',
              updateType: Constants.editRoutes.REPEAL_EDIT_ROUTE_SEGMENT,
            }
          },
          {
            path: Constants.editRoutes.EDIT_REPEAL_EDIT_ROUTE_SEGMENT,
            component: SiteEditFormComponent,
            canDeactivate: mapToCanDeactivate([UnsavedChangesGuard]),
            data: {
              breadcrumb: 'Edit Repealed',
              updateType: Constants.editRoutes.EDIT_REPEAL_EDIT_ROUTE_SEGMENT,            }
          },
        ]
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SiteRoutingModule { }