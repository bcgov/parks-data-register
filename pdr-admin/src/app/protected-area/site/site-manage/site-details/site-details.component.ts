import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { SiteService } from 'src/app/services/site.service';

@Component({
  selector: 'app-site-details',
  templateUrl: './site-details.component.html',
  styleUrls: ['./site-details.component.scss']
})
export class SiteDetailsComponent implements OnInit, OnDestroy {
  public currentData = null;
  public historicalData = null;
  public subscriptions = new Subscription();

  constructor(
    private siteService: SiteService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.subscriptions.add(
      this.siteService.watchCurrentSite().subscribe((res) => {
        this.currentData = res;
        this.cdr.detectChanges();
      })
    );
    this.subscriptions.add(
      this.siteService.watchHistoricalSites().subscribe((res) => {
        this.historicalData = res;
        this.cdr.detectChanges();
      })
    );
  }

  getDisplayedEffectiveDate() {
    if (this.currentData?.effectiveDate) {
      return this.currentData?.effectiveDate;
    }
    return this.currentData?.createDate || '';
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
