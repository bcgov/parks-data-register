import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InfiniteLoadingBarComponent } from './infinite-loading-bar.component';
import { LoadingService } from '../services/loading.service';

@NgModule({
  declarations: [InfiniteLoadingBarComponent],
  imports: [CommonModule],
  exports: [InfiniteLoadingBarComponent],
  providers: [LoadingService],
})
export class InfiniteLoadingBarModule {}
