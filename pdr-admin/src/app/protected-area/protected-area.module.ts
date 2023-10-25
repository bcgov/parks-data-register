import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ProtectedAreaRoutingModule } from './protected-area-routing.module';
import { ProtectedAreaDetailsComponent } from './protected-area-details/protected-area-details.component';
import { ProtectedAreaEditComponent } from './protected-area-edit/protected-area-edit.component';
import { ProtectedAreaComponent } from './protected-area.component';
import { RouterModule } from '@angular/router';
import { ProtectedAreaDetailsSectionComponent } from './protected-area-details-section/protected-area-details-section.component';
import { ProtectedAreaEditLegalComponent } from './protected-area-edit-legal/protected-area-edit-legal.component';
import { ProtectedAreaEditCurrentComponent } from './protected-area-edit-current/protected-area-edit-current.component';
import { ProtectedAreaEditRepealComponent } from './protected-area-edit-repeal/protected-area-edit-repeal.component';

@NgModule({
  declarations: [ProtectedAreaDetailsComponent, ProtectedAreaEditComponent, ProtectedAreaComponent, ProtectedAreaDetailsSectionComponent, ProtectedAreaEditLegalComponent, ProtectedAreaEditCurrentComponent, ProtectedAreaEditRepealComponent],
  imports: [CommonModule, ProtectedAreaRoutingModule, RouterModule],
})
export class ProtectedAreaModule {}
