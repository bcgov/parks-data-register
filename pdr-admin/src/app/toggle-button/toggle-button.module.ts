import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToggleButtonComponent } from './toggle-button.component';
import { SideBarService } from 'src/app/services/sidebar.service';

@NgModule({
  declarations: [ToggleButtonComponent],
  imports: [CommonModule],
  exports: [ToggleButtonComponent],
  providers: [SideBarService],
})
export class ToggleButtonModule {}
