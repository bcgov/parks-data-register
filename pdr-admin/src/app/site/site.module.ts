import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SiteRoutingModule } from './site-routing.module';
import { SiteDetailsComponent } from './site-details/site-details.component';
import { SiteEditComponent } from './site-edit/site-edit.component';
import { SiteComponent } from './site.component';
import { RouterModule } from '@angular/router';

@NgModule({
  declarations: [SiteDetailsComponent, SiteEditComponent, SiteComponent],
  imports: [CommonModule, SiteRoutingModule, RouterModule],
})
export class SiteModule {}
