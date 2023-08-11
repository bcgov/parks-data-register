import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BreadcrumbComponent } from './breadcrumb.component';
import { AppRoutingModule } from 'src/app/app-routing.module';
import { BreadcrumbService } from '../services/breadcrumb.service';

@NgModule({
  declarations: [BreadcrumbComponent],
  imports: [CommonModule, AppRoutingModule],
  exports: [BreadcrumbComponent],
  providers: [BreadcrumbService],
})
export class BreadcrumbModule {}
