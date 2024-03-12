import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgdsFormsModule } from '@digitalspace/ngds-forms';
import { ProtectedAreaDetailsSectionComponent } from './protected-area-details-section/protected-area-details-section.component';
import { ProtectedAreaDetailsComponent } from './protected-area-details/protected-area-details.component';
import { ProtectedAreaEditRepealComponent } from './protected-area-edit-repeal/protected-area-edit-repeal.component';
import { ProtectedAreaEditComponent } from './protected-area-edit/protected-area-edit.component';
import { ProtectedAreaManageComponent } from './protected-area-manage.component';
import { ProtectedAreaManageRoutingModule } from './protected-area-manage-routing.module';
import { ProtectedAreaEditFormComponent } from './protected-area-edit-form/protected-area-edit-form.component';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { SiteModule } from '../site/site.module';
import { SharedModule } from 'src/app/shared/shared.module';

@NgModule({
  declarations: [
    ProtectedAreaDetailsComponent,
    ProtectedAreaEditComponent,
    ProtectedAreaDetailsSectionComponent,
    ProtectedAreaEditRepealComponent,
    ProtectedAreaManageComponent,
    ProtectedAreaEditFormComponent,
  ],
  imports: [CommonModule, RouterModule, ProtectedAreaManageRoutingModule, NgdsFormsModule, FormsModule, SiteModule, SharedModule],
})
export class ProtectedAreaManageModule { }
