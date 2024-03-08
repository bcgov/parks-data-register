import { AfterViewInit, ChangeDetectorRef, Component, Input, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { BreadcrumbService } from 'src/app/services/breadcrumb.service';
import { ProtectedAreaService } from 'src/app/services/protected-area.service';
import { SiteService } from 'src/app/services/site.service';
import { UrlService } from 'src/app/services/url.service';
import { headerData } from 'src/app/shared/name-header/name-header.component';
import { Utils } from 'src/app/utils/utils';

@Component({
  selector: 'app-protected-area-manage',
  templateUrl: './protected-area-manage.component.html',
  styleUrls: ['./protected-area-manage.component.scss'],
})
export class ProtectedAreaManageComponent implements OnInit, OnDestroy, AfterViewInit {
  @Input() id;

  private subscriptions = new Subscription();
  public utils = new Utils();

  public state = 'details';
  public displayLevel = '';
  public headerData: headerData = {};

  @ViewChild('interactionTemplate') interactionTemplate: TemplateRef<any>;

  constructor(
    private router: Router,
    private protectedAreaService: ProtectedAreaService,
    private breadcrumbService: BreadcrumbService,
    private ref: ChangeDetectorRef,
    private siteService: SiteService,
    private urlService: UrlService,
  ) { }

  ngOnInit(): void {
    this.subscriptions.add(
      this.protectedAreaService.watchCurrentProtectedArea().subscribe((res) => {
        if (!res) {
          this.protectedAreaService.fetchData(this.id);
        } else {
          this.headerData['displayId'] = res?.displayId,
          this.headerData['legalName'] = res?.legalName,
          this.headerData['status'] = res?.status,
          this.headerData['type'] = 'Protected Area',
          this.headerData['effectiveDateDisplay'] = res?.effectiveDate,
          this.headerData['updateDateDisplay'] = res?.updateDate ? this.utils.formatDateForDisplay(res.updateDate) : ''
          this.ref.detectChanges();
        }
      })
    );

    this.subscriptions.add(
      this.breadcrumbService.breadcrumbs.subscribe((res) => {
        if (res) {
          const tail = res[res.length - 1]['altLabel'];
          switch (tail) {
            case 'Protected Area Details':
              this.displayLevel = 'protected-area';
              this.state = 'details';
              break;
            case 'Site Details':
              this.displayLevel = 'site';
              this.state = 'details';
              break;
            default:
              this.state = 'edit';
          }
          this.ref.detectChanges();
        }
      })
    );

    // pull in sites
    this.siteService.fetchSitesByProtectedArea(this.id);
  }

  ngAfterViewInit(): void {
    this.headerData['interactionTemplate'] = this.interactionTemplate;
    this.ref.detectChanges();
  }

  checkNoSubpath(){
    // this will need to be more robust in the future
    const tags = this.urlService.getRoutePathTags();
    return tags.indexOf('sites') === -1;
  }

  navigate(path) {
    let route = ['protected-areas', this.id];
    // Business rule: if record is repealed we skip directly to minor edit.
    if (path === 'edit' && this.headerData.status === 'repealed') {
      route.push('edit-repealed');
    } else if (path) {
      route.push(path);
    }

    this.state = path;
    this.router.navigate(route);
    this.ref.detectChanges();
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
    this.protectedAreaService.clearCurrentProtectedArea();
    this.ref.detectChanges();
  }
}
