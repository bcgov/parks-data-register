import { AfterViewInit, ChangeDetectorRef, Component, OnDestroy, TemplateRef, ViewChild } from '@angular/core';
import { NavigationCancel, NavigationEnd, Router } from '@angular/router';
import { BehaviorSubject, Subscription, filter } from 'rxjs';
import { LoadingService } from 'src/app/services/loading.service';
import { SiteService } from 'src/app/services/site.service';
import { UrlService } from 'src/app/services/url.service';
import { HeaderData } from 'src/app/shared/name-header/name-header.component';
import { Constants } from 'src/app/utils/constants';
import { Utils } from 'src/app/utils/utils';

@Component({
  selector: 'app-site-manage',
  templateUrl: './site-manage.component.html',
  styleUrls: ['./site-manage.component.scss']
})
export class SiteManageComponent implements AfterViewInit, OnDestroy {

  public pAreaId;
  public siteId;
  public urlPath;
  public siteData;
  public subscriptions = new Subscription();
  public headerData: HeaderData = {};
  public utils = new Utils();
  public _state = new BehaviorSubject('details');
  get state() {
    return this._state.value;
  }
  set state(value) {
    this._state.next(value);
  }

  @ViewChild('interactionTemplate') interactionTemplate: TemplateRef<any>;

  constructor(
    private urlService: UrlService,
    private siteService: SiteService,
    private cdr: ChangeDetectorRef,
    private loadingService: LoadingService,
    private router: Router,
  ) {
    this.subscriptions.add(
      this.siteService.watchCurrentSite().subscribe((res) => {
        if (res) {
          this.siteData = res;
          this.headerData['displayId'] = res?.displayId;
          this.headerData['legalName'] = res?.legalName;
          this.headerData['status'] = res?.status;
          this.headerData['type'] = 'Site';
          this.headerData['effectiveDateDisplay'] = res?.effectiveDate ? this.utils.formatDateForDisplay(res.effectiveDate) : '';
          this.headerData['updateDateDisplay'] = res?.updateDate ? this.utils.formatDateForDisplay(res.updateDate) : '';
        }
      })
    );
    this.subscriptions.add(
      this.router.events.pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd)).subscribe(() => {
        this.checkIfEditing();
      })
    );
    this.subscriptions.add(
      this.router.events.pipe(filter((e): e is NavigationCancel => e instanceof NavigationCancel)).subscribe((ev) => {
        this.checkIfEditing();
      })
    );
  }

  ngAfterViewInit(): void {
    this.fetchSiteByUrl();
    this.headerData['interactionTemplate'] = this.interactionTemplate;
    this.subscriptions.add(
      this._state.subscribe(() => {
        this.cdr.detectChanges();
      })
    );
    this.cdr.detectChanges();
  }

  isLoading() {
    return this.loadingService.isLoading();
  }

  navigate(path) {
    if (path === Constants.editTypes.MINOR_EDIT_TYPE && this.headerData.status === 'repealed') {
      path = Constants.editTypes.EDIT_REPEAL_EDIT_TYPE;
    }
    const id = this.siteService.getSiteIdFromPK(this.siteData.pk);
    let newPath = `${this.urlService.getRouteUpTo(id)}/${path}`;
    this.router.navigate([newPath])
    this.state = path ? path : 'details';
    this.cdr.detectChanges();
  }

  isRepealed() {
    return this.headerData?.status === 'repealed';
  }

  checkIfEditing() {
    const tags = this.urlService.getRoutePathTags();
    // Check if we are in one of the edit subroutes
    const tailSegment = tags[tags.length - 1];
    const isEditing = Object.values(Constants.editRoutes).find((e) => e === tailSegment);
    if (isEditing) {
      this.state = tailSegment;
    } else {
      this.state = 'details';
    }
    this.cdr.detectChanges();
  }

  fetchSiteByUrl() {
    this.checkIfEditing();
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
