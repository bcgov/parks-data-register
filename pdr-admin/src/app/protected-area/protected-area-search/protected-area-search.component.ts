import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { UntypedFormGroup, UntypedFormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { LoadingService } from 'src/app/services/loading.service';
import { LoggerService } from 'src/app/services/logger.service';
import { ProtectedAreaService } from 'src/app/services/protected-area.service';
import { SearchService } from 'src/app/services/search.service';
import { UrlService } from 'src/app/services/url.service';
import { Utils } from 'src/app/utils/utils';

declare let bootstrap: any;

@Component({
  selector: 'app-protected-area-search',
  templateUrl: './protected-area-search.component.html',
  styleUrls: ['./protected-area-search.component.scss'],
})
export class ProtectedAreaSearchComponent implements OnInit {
  private subscriptions = new Subscription();

  // TODO: This will be a switch for all searches. (protectedArea, sites, etc)
  private searchType = 'protectedArea';

  public toggleList = ['established', 'repealed', 'pending'];

  public utils = new Utils();
  loading = false;
  data = [];
  form = new UntypedFormGroup({
    text: new UntypedFormControl(null, { nonNullable: true, validators: [Validators.required] }),
    type: new UntypedFormControl(null),
    establishedToggle: new UntypedFormControl(false),
    pendingToggle: new UntypedFormControl(false),
    repealedToggle: new UntypedFormControl(false),
  });

  public searchParams = {
    lastResultIndex: null,
    lastPage: true,
  };

  constructor(
    private router: Router,
    private searchService: SearchService,
    private protectedAreaService: ProtectedAreaService,
    private loadingService: LoadingService,
    private ref: ChangeDetectorRef,
    private urlService: UrlService,
    private logger: LoggerService
  ) { }

  ngOnInit(): void {
    this.subscriptions.add(
      this.searchService.watchSearchResults().subscribe((res) => {
        this.data = res?.data ? res.data : [];
        this.searchParams =
          res?.searchParams
            ? res.searchParams
            : {
              lastResultIndex: null,
              lastPage: true,
            };
        this.initializeToolTips();
        this.ref.detectChanges();
      })
    );
    this.subscriptions.add(
      this.loadingService.getLoadingStatus().subscribe((res) => {
        this.loading = res;
        this.initializeToolTips();
        this.ref.detectChanges();
      })
    );
    this.subscriptions.add(
      this.form.valueChanges.subscribe((changes) => {
        this.initializeToolTips();
        this.ref.detectChanges();
      })
    );
    this.checkForQueryParams();

  }

  initializeToolTips() {
    setTimeout(() => {
      let tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
      tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
      });
    }, 250);
  }

  checkForQueryParams() {
    // Get query params and set form values accordingly
    let params = { ...this.urlService.getQueryParams() };
    if (Object.keys(params).length) {
      params = this.setStatusFilters(params);
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
        this.searchService.setSearchResults(cache);
      } else {
        this.logger.debug(`Cache miss or expiry: ${url}`);
        this.submit(false);
      }
    }
  }

  async submit(updateQueryParams = true, startFrom = 0, clearExisting = true) {
    if (this.form.valid) {
      this.form.controls['type'].setValue(this.searchType);
      // If none of the status toggles are true, this is equivalent to all of them being true.
      // This will create divergent behaviour between the URL and the actual search payload.
      const searchObj = this.getStatusFilters({ ...this.form.value });
      const urlObj = this.getStatusFilters({ ...this.form.value }, false);
      if (updateQueryParams) {
        // update url query params
        delete urlObj.type;
        // await this change before
        await this.urlService.setQueryParams(urlObj);
      }
      if (clearExisting) {
        this.searchService.clearSearchResults();
      }
      this.searchService.fetchData(searchObj, this.urlService.getRoute(), startFrom);
    }
  }

  getStatusFilters(obj, persistToggles = true) {
    let filters = [];

    this.toggleList.forEach((toggle) => {
      if (obj[`${toggle}Toggle`] === true) {
        filters.push(toggle);
      }
      delete obj[`${toggle}Toggle`];
    });

    obj.status = filters.length > 0 ? filters.toString() : persistToggles ? this.toggleList.toString() : '';
    return obj;
  }

  setStatusFilters(obj) {
    const statuses = obj?.status?.split(',');
    if (!statuses) {
      return obj;
    }
    for (const toggle of this.toggleList) {
      if (statuses.indexOf(toggle) > -1) {
        obj[`${toggle}Toggle`] = true;
      }
    }
    delete obj?.status;
    return obj;
  }

  viewItem(item) {
    if (item.type === 'protectedArea') {
      this.protectedAreaService.fetchData(item.pk);
      // TODO: When we have historical park names, we want to set HISTORICAL_PROTECTED_AREA here.
      this.router.navigate(['protected-areas', item.pk]);
    }
  }

  editItem(item) {
    if (item.type === 'protectedArea') {
      this.protectedAreaService.fetchData(item.pk);
      if (item.status === 'repealed') {
        this.router.navigate(['protected-areas', item.pk, 'edit-repealed']);
      } else {
        this.router.navigate(['protected-areas', item.pk, 'edit']);
      }
    }
  }

  loadMore() {
    this.submit(false, this.searchParams.lastResultIndex, false);
  }

  ngOnDestroy() {
    let tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.forEach((tt) => {
      const el = bootstrap.Tooltip.getInstance(tt);
      el.hide();
    });
    this.subscriptions.unsubscribe();
    this.searchService.clearSearchResults();
  }
}
