import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HomeComponent } from './home.component';
import { NavCardModule } from '../nav-card/nav-card.module';

@NgModule({
  declarations: [HomeComponent],
  imports: [CommonModule, NavCardModule],
  exports: [HomeComponent],
})
export class HomeModule {}
