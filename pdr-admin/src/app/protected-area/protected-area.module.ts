import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ProtectedAreaRoutingModule } from './protected-area-routing.module';
import { ProtectedAreaDetailsComponent } from './protected-area-details/protected-area-details.component';
import { ProtectedAreaEditComponent } from './protected-area-edit/protected-area-edit.component';
import { ProtectedAreaComponent } from './protected-area.component';
import { RouterModule } from '@angular/router';
import { ProtectedAreaDetailsSectionComponent } from './protected-area-details-section/protected-area-details-section.component';

@NgModule({
  declarations: [ProtectedAreaDetailsComponent, ProtectedAreaEditComponent, ProtectedAreaComponent, ProtectedAreaDetailsSectionComponent],
  imports: [CommonModule, ProtectedAreaRoutingModule, RouterModule],
})
export class ProtectedAreaModule {}
