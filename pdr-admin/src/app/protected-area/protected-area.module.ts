import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ProtectedAreaRoutingModule } from './protected-area-routing.module';
import { ProtectedAreaComponent } from './protected-area.component';
import { ProtectedAreaSearchComponent } from './protected-area-search/protected-area-search.component';
import { NgdsFormsModule } from '@digitalspace/ngds-forms';

@NgModule({
  declarations: [ProtectedAreaSearchComponent, ProtectedAreaComponent],
  imports: [CommonModule, ProtectedAreaRoutingModule, NgdsFormsModule],
})
export class ProtectedAreaModule {}
