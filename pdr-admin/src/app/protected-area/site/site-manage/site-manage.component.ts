import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { UrlService } from 'src/app/services/url.service';

@Component({
  selector: 'app-site-manage',
  templateUrl: './site-manage.component.html',
  styleUrls: ['./site-manage.component.scss']
})
export class SiteManageComponent implements OnInit, OnDestroy {

  public pAreaId;
  public siteId;

  constructor(
    private urlService: UrlService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    // placeholder text
    const tags = this.urlService.getRoutePathTags();
    this.pAreaId = tags[tags.indexOf('protected-areas') + 1];
    this.siteId = tags[tags.indexOf('sites') + 1];
  }

  ngOnDestroy(): void {
    this.cdr.detectChanges();
  }

}
