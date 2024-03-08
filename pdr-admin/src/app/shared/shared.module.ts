import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NameHeaderComponent } from './name-header/name-header.component';

@NgModule({
  declarations: [NameHeaderComponent],
  imports: [
    CommonModule
  ],
  exports: [NameHeaderComponent]
})
export class SharedModule { }
