import { ChangeDetectorRef, Component, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BehaviorSubject, Subscription } from 'rxjs';
import { SiteService } from 'src/app/services/site.service';

@Component({
    selector: 'app-site-list',
    templateUrl: './site-list.component.html',
    styleUrls: ['./site-list.component.scss'],
    standalone: false
})
export class SiteListComponent implements OnDestroy {

  public subscriptions = new Subscription();
  public sites = [];
  public siteLinksList = new BehaviorSubject([]);

  constructor(
    private siteService: SiteService,
    private router: Router,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef
  ) {
    this.subscriptions.add(
      this.siteService.watchSitesList().subscribe((res) => {
        this.sites = res;
        if (this.sites?.length) {
          this.createSiteLinksList();
        } else {
          this.siteLinksList.next([]);
        }
      })
    );
  }

  createSiteLinksList() {
    let list = [];
    for (const site of this.sites) {
      const siteId = site?.sk.split('::')[1];
      const str = {
        siteId: siteId,
        strong: `${site?.pk}-${siteId}`,
        paName: site?.displayName
      };
      list.push(str);
    }
    list.sort((a, b) => Number(a.siteId) - Number(b.siteId));
    this.siteLinksList.next(list);
  }

  navToSite(site) {
    if (site?.siteId) {
      this.router.navigate([`./sites/${site.siteId}`], { relativeTo: this.route });
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
    this.cdr.detectChanges();
  }

}
