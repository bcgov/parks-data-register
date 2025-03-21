import { Component, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { LoadingService } from '../services/loading.service';

@Component({
    selector: 'app-infinite-loading-bar',
    templateUrl: './infinite-loading-bar.component.html',
    styleUrls: ['./infinite-loading-bar.component.scss'],
    standalone: false
})
export class InfiniteLoadingBarComponent implements OnDestroy {
  private subscriptions = new Subscription();

  public loading = false;

  constructor(protected loadingService: LoadingService) {
    this.subscriptions.add(
      loadingService.getLoadingStatus().subscribe((res) => {
        this.loading = res;
      })
    );
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }
}
