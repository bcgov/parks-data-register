import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgdsFormsModule } from '@digitalspace/ngds-forms';
import { ProtectedAreaDetailsSectionComponent } from './protected-area-details-section/protected-area-details-section.component';
import { ProtectedAreaDetailsComponent } from './protected-area-details/protected-area-details.component';
import { ProtectedAreaEditCurrentComponent } from './protected-area-edit-current/protected-area-edit-current.component';
import { ProtectedAreaEditLegalComponent } from './protected-area-edit-legal/protected-area-edit-legal.component';
import { ProtectedAreaEditRepealComponent } from './protected-area-edit-repeal/protected-area-edit-repeal.component';
import { ProtectedAreaEditComponent } from './protected-area-edit/protected-area-edit.component';
import { ProtectedAreaManageComponent } from './protected-area-manage.component';
import { ProtectedAreaManageRoutingModule } from './protected-area-manage-routing.module';

@NgModule({
  declarations: [
    ProtectedAreaDetailsComponent,
    ProtectedAreaEditComponent,
    ProtectedAreaDetailsSectionComponent,
    ProtectedAreaEditLegalComponent,
    ProtectedAreaEditCurrentComponent,
    ProtectedAreaEditRepealComponent,
    ProtectedAreaManageComponent,
  ],
  imports: [CommonModule, ProtectedAreaManageRoutingModule, NgdsFormsModule],
})
export class ProtectedAreaManageModule {}
