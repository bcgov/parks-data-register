;
import { NotFoundComponent } from './not-found/not-found.component';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NameHeaderComponent } from './name-header/name-header.component';
import { InfoSectionComponent } from './info-section/info-section.component';
import { InfoSectionRowComponent } from './info-section/info-section-row/info-section-row.component';

@NgModule({
  declarations: [NameHeaderComponent, NotFoundComponent, InfoSectionComponent, InfoSectionRowComponent],
  imports: [
    CommonModule
  ],
  exports: [NameHeaderComponent, InfoSectionComponent, InfoSectionRowComponent]
})
export class SharedModule { }
