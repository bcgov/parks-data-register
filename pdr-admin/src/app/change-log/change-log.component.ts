import { ChangeDetectorRef, Component } from '@angular/core';
import { UntypedFormGroup, UntypedFormControl } from '@angular/forms';
import { Subscription } from 'rxjs';
import { LoadingService } from '../services/loading.service';
import { LoggerService } from '../services/logger.service';
import { UrlService } from '../services/url.service';
import { Utils } from '../utils/utils';
import { ChangelogService } from '../services/changelog.service';

@Component({
  selector: 'app-change-log',
  templateUrl: './change-log.component.html',
  styleUrls: ['./change-log.component.scss'],
})
export class ChangeLogComponent {
  private subscriptions = new Subscription();

  public changeTypeList = ['legalNameChanged', 'statusChanged'];

  public utils = new Utils();
  loading = false;
  data = [];
  form = new UntypedFormGroup({
    text: new UntypedFormControl(null),
    legalNameChanged: new UntypedFormControl(false),
    statusChanged: new UntypedFormControl(false),
  });

  public searchParams = {
    lastResultIndex: null,
    lastPage: true,
  };

  constructor(
    private changelogService: ChangelogService,
    private loadingService: LoadingService,
    private ref: ChangeDetectorRef,
    private urlService: UrlService,
    private logger: LoggerService
  ) { }

  ngOnInit(): void {
    this.subscriptions.add(
      this.changelogService.watchChangelogResults().subscribe((res) => {
        this.data = res?.data || [];
        this.searchParams =
          res?.searchParams || {
            lastResultIndex: null,
            lastPage: true,
          };
        this.ref.detectChanges();
      })
    );
    this.subscriptions.add(
      this.loadingService.getLoadingStatus().subscribe((res) => {
        this.loading = res;
        this.ref.detectChanges();
      })
    );
    this.subscriptions.add(
      this.form.valueChanges.subscribe((changes) => {
        this.ref.detectChanges();
      })
    );
    this.checkForQueryParams();
  }

  checkForQueryParams() {
    // Get query params and set form values accordingly
    // We've been instructed to load the latest results on page load
    // even if no filters applied (see https://github.com/bcgov/parks-data-register/issues/31)
    let params = { ...this.urlService.getQueryParams() };
    if (Object.keys(params).length) {
      params = this.setChangelogFilters(params);
      for (const param in params) {
        if (this.form.controls[param]) {
          this.form.controls[param].setValue(params[param]);
        }
      }
      // Check cache.
      const url = this.urlService.getRoute();
      const cache = this.urlService.checkCache(url);
      if (cache) {
        // Cache hit.
        this.logger.debug(`Cache hit: ${url}`);
        this.changelogService.setSearchResults(cache);
      } else {
        this.logger.debug(`Cache miss or expiry: ${url}`);
        this.submit(false);
      }
    } else {
      this.submit();
    }

  }

  getChangeTypeString(item) {
    if (item?.statusChanged) {
      return 'Status';
    }
    if (item?.legalNameChanged) {
      return 'Legal Name';
    }
    return '-';
  }

  getOldFieldString(item) {
    if (item?.statusChanged) {
      // hard-coded for now because this is the only value it can be
      return 'established';
    }
    if (item?.legalNameChanged) {
      return item?.legalName || '-';
    }
    return '-'
  }

  getNewFieldString(item) {
    if (item?.statusChanged) {
      return item?.newStatus || '-';
    }
    if (item?.legalNameChanged) {
      return item?.newLegalName || '-';
    }
    return '-'
  }

  async submit(updateQueryParams = true, startFrom = 0) {
    if (!startFrom) {
      this.changelogService.clearChangelogResults();
    }
    if (this.form.valid) {
      let searchObj = {
        startFrom: startFrom,
        sortField: 'updateDate',
        sortOrder: 'desc'
      }
      // If none of the status toggles are true, this is equivalent to all of them being true.
      // This will create divergent behaviour between the URL and the actual search payload.
      if (this.form.controls['text'].value) {
        searchObj['text'] = this.form.controls['text'].value;
      }
      this.getChangelogFilters(searchObj);
      const urlObj = { ...searchObj };
      if (updateQueryParams) {
        // await this change before
        await this.urlService.setQueryParams(urlObj);
      }
      this.changelogService.fetchData(searchObj, this.urlService.getRoute(), startFrom);
    }
  }

  getChangelogFilters(searchObj) {
    let filters = [];
    for (const filter of this.changeTypeList)
      if (this.form.controls[filter].value) {
        filters.push(filter);
      }
    if (filters.length) {
      searchObj['changeType'] = filters.join(",");
    }
  }

  setChangelogFilters(params) {
    if (params?.changeType) {
      const filters = params.changeType.split(",");
      for (const filter of filters) {
        if (this.changeTypeList.indexOf(filter) > -1) {
          params[filter] = true;
        }
      }
    }
    return params;
  }

  loadMore() {
    this.submit(false, this.searchParams.lastResultIndex);
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
    this.changelogService.clearChangelogResults();
  }
}
