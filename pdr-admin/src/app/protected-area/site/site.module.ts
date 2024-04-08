import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SiteManageComponent } from './site-manage/site-manage.component';
import { RouterModule } from '@angular/router';
import { NgdsFormsModule } from '@digitalspace/ngds-forms';
import { FormsModule } from '@angular/forms';
import { SiteComponent } from './site.component';
import { SiteRoutingModule } from './site-routing.component';
import { SiteListComponent } from './site-list/site-list.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { SiteDetailsComponent } from './site-manage/site-details/site-details.component';
import { SiteEditFormComponent } from './site-manage/site-edit-form/site-edit-form.component';

@NgModule({
  declarations: [SiteManageComponent, SiteComponent, SiteListComponent, SiteDetailsComponent, SiteEditFormComponent],
  imports: [
    CommonModule, RouterModule, NgdsFormsModule, FormsModule, SharedModule
  ],
  exports: [SiteManageComponent, SiteComponent, SiteRoutingModule, SiteListComponent]
})
export class SiteModule { }
