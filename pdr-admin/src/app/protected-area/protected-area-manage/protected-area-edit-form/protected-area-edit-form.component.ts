import { ChangeDetectorRef, Component, Input } from '@angular/core';
import { UntypedFormGroup, UntypedFormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { LoadingService } from 'src/app/services/loading.service';
import { ProtectedAreaService } from 'src/app/services/protected-area.service';
import { Utils } from 'src/app/utils/utils';
import { ViewChild } from '@angular/core';
import { Constants } from 'src/app/utils/constants';
import { DateTime } from 'luxon';

@Component({
  selector: 'app-protected-area-edit-form',
  templateUrl: './protected-area-edit-form.component.html',
  styleUrls: ['./protected-area-edit-form.component.scss'],
})
export class ProtectedAreaEditFormComponent {
  @Input() updateType;
  @ViewChild('confirmSaveClose') confirmSaveClose;
  private subscriptions = new Subscription();
  private utils = new Utils();

  public form = new UntypedFormGroup({
    effectiveDate: new UntypedFormControl(null, { nonNullable: true, validators: [Validators.required] }),
    legalName: new UntypedFormControl(null, { nonNullable: true, validators: [Validators.required] }),
    phoneticName: new UntypedFormControl(null, { nonNullable: true }),
    audioClip: new UntypedFormControl(null, { nonNullable: true }),
  });

  public currentData;
  public loading = true;
  // Used for submiting change
  public modalObj = {};
  // Used for populating modal
  public modalObjArray = [];
  public attrDisplayNames = {
    effectiveDate: 'Effective date',
    legalName: 'New legal name',
    displayName: 'Display name',
    phoneticName: 'Phonetic Name',
    audioClip: 'Audio link',
    searchTerms: 'Search terms',
  };

  public tz = Constants.timeZoneIANA;
  public now = DateTime.now().setZone(this.tz);

  hideDisplayName = true;
  displayNameEdited = false;

  constructor(
    private router: Router,
    private protectedAreaService: ProtectedAreaService,
    private loadingService: LoadingService,
    private ref: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.subscriptions.add(
      this.protectedAreaService.watchCurrentProtectedArea().subscribe((res) => {
        this.currentData = res ? res : {};
        // Populate form with data
        if (this.currentData && this.updateType === 'minor') {
          // TODO: Prompt user is another change has been detected after init.
          this.initForm(this.form, this.currentData);
        }
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
      this.form.valueChanges.subscribe(() => {
        this.ref.detectChanges();
      })
    );
  }

  initForm(form, data) {
    if (data.displayName && data.displayName !== data.legalName) {
      this.hideDisplayName = false;
      this.form.addControl(
        'displayName',
        new UntypedFormControl(null, { nonNullable: true, validators: [Validators.required] })
      );
    }

    Object.keys(form.controls).forEach((element) => {
      // Allows us to reset to state on page load.
      form.controls[element].defaultValue = data[element] ? data[element] : null;
      form.reset();
    });

    this.form.markAsPristine();
  }

  onDatePickerInteract() {
    // TODO: Fix this bug
    // For some reason, if we do detectChanages outisde of a setTimeout
    // Month picker and year picker breaks
    setTimeout(() => {
      this.ref.detectChanges();
    }, 0);
  }

  cancel() {
    if (this.currentData.status === 'repealed') this.router.navigate(['protected-areas', this.currentData.pk]);
    else this.router.navigate(['protected-areas', this.currentData.pk, 'edit']);
  }

  setModalData() {
    this.modalObjArray = [];
    this.modalObj = {};

    if (this.hideDisplayName && this.displayNameEdited) {
      this.form.addControl(
        'displayName',
        new UntypedFormControl(null, { nonNullable: true, validators: [Validators.required] })
      );
      this.form.controls['displayName'].markAsDirty();
    }

    const changedProps = this.utils.getChangedProperties(this.form);
    changedProps.forEach((prop) => {
      this.modalObj[prop] = this.form.get(prop).value;
      this.modalObjArray.push({
        label: this.attrDisplayNames[prop],
        value: this.form.get(prop).value,
      });
    });

    this.ref.detectChanges();
  }

  async submit() {
    // API Requirement:
    // We need to pass lastVersionDate (which is updateDate)
    // We also need to pass in all fields regardless if we are changing them or not
    const baseObj =
      this.updateType === 'major'
        ? {
            effectiveDate: '',
            legalName: '',
            phoneticName: '',
            searchTerms: '',
            notes: '',
            audioClip: '',
            lastVersionDate: this.currentData.lastVersionDate,
          }
        : this.currentData;

    let mergedObj = { ...baseObj, ...this.modalObj };

    // We want display name to be same as legal name
    // API will set this if displayName is null
    if (this.hideDisplayName) {
      mergedObj.displayName = null;
    }

    await this.protectedAreaService.edit(this.currentData.pk, mergedObj, this.updateType);
    this.protectedAreaService.fetchData(this.currentData.pk);
    this.confirmSaveClose.nativeElement.click();
    this.router.navigate(['protected-areas', this.currentData.pk]);
  }

  toggleDisplayNameForm() {
    if (this.hideDisplayName) {
      // Toggle off
      // Remove form control
      this.form.removeControl('displayName');
      this.form.markAsDirty();
      this.displayNameEdited = true;
    } else {
      // Toggle on
      this.form.addControl(
        'displayName',
        new UntypedFormControl(null, { nonNullable: true, validators: [Validators.required] })
      );
    }

    this.ref.detectChanges();
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
    this.ref.detectChanges();
  }
}
