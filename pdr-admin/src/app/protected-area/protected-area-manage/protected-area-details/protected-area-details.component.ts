import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { ProtectedAreaService } from 'src/app/services/protected-area.service';

@Component({
    selector: 'app-protected-area-details',
    templateUrl: './protected-area-details.component.html',
    styleUrls: ['./protected-area-details.component.scss'],
    standalone: false
})
export class ProtectedAreaDetailsComponent implements OnInit {
  private subscriptions = new Subscription();

  currentData = null;
  historicalData = null;

  constructor(private protectedAreaService: ProtectedAreaService, private ref: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.subscriptions.add(
      this.protectedAreaService.watchCurrentProtectedArea().subscribe((res) => {
        this.currentData = res;
        this.ref.detectChanges();
      })
    );
    this.subscriptions.add(
      this.protectedAreaService.watchHistoricalProtectedArea().subscribe((res) => {
        this.historicalData = res;
        this.ref.detectChanges();
      })
    );
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }
}
