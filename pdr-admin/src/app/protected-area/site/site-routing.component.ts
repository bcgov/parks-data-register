import { RouterModule, Routes } from "@angular/router";
import { SiteManageComponent } from "./site-manage/site-manage.component";
import { NgModule } from "@angular/core";
import { SiteComponent } from "./site.component";
import { DynamicRedirectGuard } from "src/app/guards/dynamic-redirect.guard";
import { NotFoundComponent } from "src/app/shared/not-found/not-found.component";
import { SiteDetailsComponent } from "./site-manage/site-details/site-details.component";

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
        children: [
          {
            path: '',
            component: SiteDetailsComponent,
            data: {
              breadcrumb: 'SITE_DETAILS'
            },
          }
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