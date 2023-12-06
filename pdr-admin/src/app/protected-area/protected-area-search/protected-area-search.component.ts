import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { UntypedFormGroup, UntypedFormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { LoadingService } from 'src/app/services/loading.service';
import { ProtectedAreaService } from 'src/app/services/protected-area.service';
import { SearchService } from 'src/app/services/search.service';
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
    private protectedAreaService: ProtectedAreaService,
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
    if (item.type === 'protectedArea') {
      this.protectedAreaService.fetchData(item.pk);
      // TODO: When we have historical park names, we want to set HISTORICAL_PROTECTED_AREA here.
      this.router.navigate(['protected-areas', item.pk]);
    }
  }

  editItem(item) {
    if (item.status !== 'historical') {
      if (item.type === 'protectedArea') {
        this.protectedAreaService.fetchData(item.pk);
        if (item.status === 'repealed') {
          this.router.navigate(['protected-areas', item.pk, 'edit-repealed']);
        } else {
          this.router.navigate(['protected-areas', item.pk, 'edit']);
        }
      }
    }
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
    this.searchService.clearSearchResults();
  }
}
