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

@NgModule({
  declarations: [SiteManageComponent, SiteComponent, SiteListComponent],
  imports: [
    CommonModule, RouterModule, NgdsFormsModule, FormsModule, SharedModule
  ],
  exports: [SiteManageComponent, SiteComponent, SiteRoutingModule, SiteListComponent]
})
export class SiteModule { }
