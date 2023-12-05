import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { UntypedFormGroup, UntypedFormControl, Validators } from '@angular/forms';
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
  data = [];
  statusPicklistItems = [
    { value: 'established', display: 'Established' },
    { value: 'historical', display: 'Historical' },
    { value: 'repealed', display: 'Repealed' },
    { value: 'pending', display: 'Pending' },
  ];
  form = new UntypedFormGroup({
    text: new UntypedFormControl(null, { nonNullable: true, validators: [Validators.required] }),
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
        this.ref.detectChanges();
      })
    );
  }

  submit() {
    if (this.form.valid) {
      this.form.controls['type'].setValue(this.searchType);
      let getObj = { ...this.form.value };
      if (getObj.status) {
        getObj.status = getObj.status.toString();
      } else {
        delete getObj.status;
      }
      this.searchService.fetchData(getObj);
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
