import { RouterModule, Routes } from "@angular/router";
import { SiteManageComponent } from "./site-manage/site-manage.component";
import { NgModule } from "@angular/core";
import { SiteComponent } from "./site.component";

const routes: Routes = [
  {
    path: '',
    component: SiteComponent,
    data: {
      breadcrumb: 'Sites'
    },
    children: [
      {
        path: ':siteId',
        component: SiteManageComponent,
        data: {
          breadcrumb: 'SITE_DETAILS'
        }
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SiteRoutingModule { }