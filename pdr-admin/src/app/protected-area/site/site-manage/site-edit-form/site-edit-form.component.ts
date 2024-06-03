import { ChangeDetectorRef, Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { LoadingService } from 'src/app/services/loading.service';
import { SiteService } from 'src/app/services/site.service';
import { HeaderData } from 'src/app/shared/name-header/name-header.component';
import { Constants } from 'src/app/utils/constants';
import { DateTime } from 'luxon';
import { Utils } from 'src/app/utils/utils';
import { UrlService } from 'src/app/services/url.service';

@Component({
  selector: 'app-site-edit-form',
  templateUrl: '../../../../shared/edit-form/edit-form.html',
  styleUrls: ['./site-edit-form.component.scss']
})
export class SiteEditFormComponent implements OnInit, OnDestroy {
  @Input() updateType = 'minor';
  @ViewChild('confirmSaveClose') confirmSaveClose;

  private utils = new Utils();
  public dataType = 'site';
  public subscriptions = new Subscription();
  public headerData: HeaderData = {};
  public currentData = null;
  public loading = true;
  public modalObjArray = [];
  public modalObj = {};
  public attrDisplayNames = {
    effectiveDate: 'Effective date',
    legalName: 'New legal name',
    displayName: 'Display name',
    phoneticName: 'Phonetic Name',
    audioClip: 'Audio link',
    searchTerms: 'Search terms',
    notes: 'Notes',
  };


  public form = new UntypedFormGroup({
    effectiveDate: new UntypedFormControl(null, { nonNullable: true, validators: [Validators.required] }),
    legalName: new UntypedFormControl(null, { nonNullable: true }),
    displayName: new UntypedFormControl(null, { nonNullable: true }),
    phoneticName: new UntypedFormControl(null, { nonNullable: true }),
    audioClip: new UntypedFormControl(null, { nonNullable: true }),
    searchTerms: new UntypedFormControl(null, { nonNullable: true }),
    notes: new UntypedFormControl(null, { nonNullable: true }),
    hideDisplayName: new UntypedFormControl(false)
  });

  public invalidConfig = {
    showMessage: false
  };

  public tz = Constants.timeZoneIANA;
  public now = DateTime.now().setZone(this.tz);

  constructor(
    private cdr: ChangeDetectorRef,
    private loadingService: LoadingService,
    private siteService: SiteService,
    private urlService: UrlService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.subscriptions.add(
      this.siteService.watchCurrentSite().subscribe((res) => {
        if (res) {
          this.currentData = res;
          if (this.updateType === Constants.editTypes.MINOR_EDIT_TYPE || this.updateType === Constants.editTypes.EDIT_REPEAL_EDIT_TYPE) {
            this.initForm();
          }
          this.setDisplayNameToggle();
          this.cdr.detectChanges();
        }
      })
    );
    this.subscriptions.add(
      this.loadingService.getLoadingStatus().subscribe((res) => {
        this.loading = res;
        this.cdr.detectChanges();
      })
    );
    this.cdr.detectChanges();
    this.subscriptions.add(
      this.form.controls['hideDisplayName'].valueChanges.subscribe((res) => {
        this.cdr.detectChanges();
      })
    );
    // if major or minor edit, legalname must be supplied.
    if (this.updateType === Constants.editTypes.MINOR_EDIT_TYPE || this.updateType === Constants.editTypes.MAJOR_EDIT_TYPE) {
      this.form.controls['legalName'].addValidators([Validators.required]);
    }
  };

  initForm() {
    for (const control of Object.keys(this.form.controls)) {
      this.form.controls[control]['defaultValue'] = this.currentData[control] ?? null;
    }
    if (this.currentData.displayName === this.currentData.legalName) {
      this.form.controls['hideDisplayName']['defaultValue'] = true;
    }
    this.form.reset();
    this.form.markAsPristine();
  }

  setDisplayNameToggle() {
    if (this.currentData?.legalName === this.currentData?.displayName) {
      this.form.controls['hideDisplayName'].setValue(true);
    }
  }

  showDisplayNameField() {
    return !this.form?.controls?.['hideDisplayName']?.value;
  }

  getDateSubLabel() {
    switch (this.updateType) {
      case Constants.editTypes.REPEAL_EDIT_TYPE:
        return `The date the ${this.dataType} was repealed.`;
      case Constants.editTypes.MAJOR_EDIT_TYPE:
        return 'The date the legal name change became effective';
      default:
        return 'Change only if effective date was entered incorrectly.';
    }
  }


  getEffectiveDateLabel() {
    switch (this.updateType) {
      case Constants.editTypes.REPEAL_EDIT_TYPE:
      case Constants.editTypes.EDIT_REPEAL_EDIT_TYPE:
        return 'Repealed Date';
      default:
        return 'Effective Date';
    }
  }

  cancel() {
    this.navigateToDetails();
  }

  async submit() {
    let putObj = { ...this.currentData, ...this.form.value };
    putObj['lastVersionDate'] = this.currentData.updateDate;

    delete putObj?.type;
    if (putObj.hideDisplayName) {
      putObj['displayName'] = putObj?.legalName;
    }
    delete putObj?.hideDisplayName;

    await this.siteService.editSite(this.currentData.pk, putObj, this.updateType);
    this.siteService.fetchSpecificSite(
      this.currentData.pk.split('::')[0],
      this.currentData.pk.split('::')[2]
    );
    this.confirmSaveClose.nativeElement.click();
    this.navigateToDetails();
  }

  setModalData() {
    this.modalObjArray = [];
    this.modalObj = {};

    const changedProperties = this.utils.getChangedProperties(this.form);
    for (const prop of changedProperties) {
      if (prop !== 'hideDisplayName') {
        this.modalObj[prop] = this.form.controls[prop].value;
        this.modalObjArray.push({
          label: this.attrDisplayNames[prop],
          value: this.form.controls[prop].value
        });
      }
    }
  }

  navigateToDetails() {
    const id = this.siteService.getSiteIdFromPK(this.currentData.pk);
    let newPath = `${this.urlService.getRouteUpTo(id)}`;
    this.router.navigate([newPath]).then(() => {
      this.cdr.detectChanges();
    });
  }

  // empty function to allow use of shared template
  onDatePickerInteract() {
    // TODO: Fix this bug
    // For some reason, if we do detectChanages outisde of a setTimeout
    // Month picker and year picker breaks
    setTimeout(() => {
      this.cdr.detectChanges();
    }, 0);
  }

  // empty function to allow use of shared template
  toggleDisplayNameForm() {
    return;
  }

  isLoading() {
    return this.loadingService.isLoading();
  }

  hasUnsavedChanges() {
    return !this.form.pristine && !this.loading;
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
