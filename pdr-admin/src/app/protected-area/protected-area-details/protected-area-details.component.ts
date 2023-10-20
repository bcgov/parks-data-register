import { Component } from '@angular/core';
import { Subscription } from 'rxjs';
import { ProtectedAreaService } from 'src/app/services/protected-area.service';

@Component({
  selector: 'app-protected-area-details',
  templateUrl: './protected-area-details.component.html',
  styleUrls: ['./protected-area-details.component.scss'],
})
export class ProtectedAreaDetailsComponent {
  private subscriptions = new Subscription();

  currentData = null;
  historicalData = null;

  constructor(private protectedAreaService: ProtectedAreaService) {
    this.protectedAreaService.fetchData();
    this.subscriptions.add(
      this.protectedAreaService.watchCurrentProtectedArea().subscribe((res) => {
        this.currentData = res;
      })
    );
    this.subscriptions.add(
      this.protectedAreaService.watchHistoricalProtectedArea().subscribe((res) => {
        this.historicalData = res;
      })
    );
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }
}
