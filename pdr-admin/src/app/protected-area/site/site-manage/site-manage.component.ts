import { ChangeDetectorRef, Component, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { SiteService } from 'src/app/services/site.service';
import { UrlService } from 'src/app/services/url.service';
import { HeaderData } from 'src/app/shared/name-header/name-header.component';
import { Utils } from 'src/app/utils/utils';

@Component({
  selector: 'app-site-manage',
  templateUrl: './site-manage.component.html',
  styleUrls: ['./site-manage.component.scss']
})
export class SiteManageComponent implements OnDestroy {

  public pAreaId;
  public siteId;
  public urlPath;
  public siteData;
  public subscriptions = new Subscription();
  public headerData: HeaderData = {};
  public utils = new Utils();
  public detailMode: boolean = true;

  constructor(
    private urlService: UrlService,
    private siteService: SiteService,
    private cdr: ChangeDetectorRef
  ) {
    // Get route from url
    this.fetchSiteByUrl();
    this.subscriptions.add(
      this.siteService.watchCurrentSite().subscribe((res) => {
        if (res) {
          this.headerData['displayId'] = res?.displayId;
          this.headerData['legalName'] = res?.legalName;
          this.headerData['status'] = res?.status;
          this.headerData['type'] = 'Site';
          this.headerData['effectiveDateDisplay'] = res?.effectiveDate;
          this.headerData['updateDateDisplay'] = res?.updateDate ? this.utils.formatDateForDisplay(res.updateDate) : '';
        }
      })
    );
    this.subscriptions.add(
      this.siteService.watchHistoricalSites().subscribe((res) => {
      })
    );
  }

  fetchSiteByUrl() {
    const tags = this.urlService.getRoutePathTags();
    this.pAreaId = tags[tags.indexOf('protected-areas') + 1];
    this.siteId = tags[tags.indexOf('sites') + 1];
    this.siteData = this.siteService.fetchSpecificSite(this.pAreaId, this.siteId);
  }

  ngOnDestroy(): void {
    this.cdr.detectChanges();
    this.subscriptions.unsubscribe();
    this.siteService.clearHistoricalSites();
    this.siteService.clearCurrentSite();
  }

}
