import { ChangeDetectorRef, Component, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-site',
  templateUrl: './site.component.html',
  styleUrls: ['./site.component.scss']
})
export class SiteComponent implements OnDestroy {

  public showList = false;
  public subscriptions = new Subscription();

  constructor(
    private cdr: ChangeDetectorRef
  ) {
    // TODO: subscribe to siteService - current site.

  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
    this.cdr.detectChanges();
  }
}
