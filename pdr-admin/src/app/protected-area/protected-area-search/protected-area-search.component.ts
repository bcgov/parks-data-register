import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { UntypedFormGroup, UntypedFormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { DataService } from 'src/app/services/data.service';
import { LoadingService } from 'src/app/services/loading.service';
import { SearchService } from 'src/app/services/search.service';
import { Constants } from 'src/app/utils/constants';
import { Utils } from 'src/app/utils/utils';

@Component({
  selector: 'app-protected-area-search',
  templateUrl: './protected-area-search.component.html',
  styleUrls: ['./protected-area-search.component.scss'],
})
export class ProtectedAreaSearchComponent implements OnInit {
  private subscriptions = new Subscription();

  // TODO: This will be a switch for all searches. (protectedArea, sites, etc)
  private searchType = 'protectedArea';

  public utils = new Utils();
  loading = false;
  disableSearch = true;
  data = [];
  statusPicklistItems = ['Any', 'Established', 'Historical'];
  form = new UntypedFormGroup({
    text: new UntypedFormControl(null),
    type: new UntypedFormControl(null),
    status: new UntypedFormControl(this.statusPicklistItems[0]),
  });

  constructor(
    private router: Router,
    private searchService: SearchService,
    private dataService: DataService,
    private loadingService: LoadingService,
    private ref: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.subscriptions.add(
      this.searchService.watchSearchResults().subscribe((res) => {
        this.data = res ? res : [];
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
        if (!changes.text && changes.type === 'Any' && changes.status === 'Any') {
          this.disableSearch = true;
        } else {
          this.disableSearch = false;
        }
        this.ref.detectChanges();
      })
    );
  }

  submit() {
    if (!this.disableSearch) {
      this.form.controls['type'].setValue(this.searchType);

      this.form.value.status.toLowerCase();
      this.searchService.fetchData(this.form.value);
    }
  }

  viewItem(item) {
    this.dataService.setItemValue(Constants.dataIds.CURRENT_PROTECTED_AREA, item);
    // TODO: When we have historical park names, we want to set HISTORICAL_PROTECTED_AREA here.
    this.router.navigate(['protected-areas', item.pk]);
  }

  editItem(item) {
    this.dataService.setItemValue(Constants.dataIds.CURRENT_PROTECTED_AREA, item);
    this.router.navigate(['protected-areas', item.pk, 'edit']);
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
    this.searchService.clearSearchResults();
  }
}
