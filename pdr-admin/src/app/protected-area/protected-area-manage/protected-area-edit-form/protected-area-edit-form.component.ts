import { ChangeDetectorRef, Component, HostListener, Input, ViewChild } from '@angular/core';
import { UntypedFormGroup, UntypedFormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { LoadingService } from 'src/app/services/loading.service';
import { ProtectedAreaService } from 'src/app/services/protected-area.service';
import { Utils } from 'src/app/utils/utils';
import { Constants } from 'src/app/utils/constants';
import { DateTime } from 'luxon';
import { ReloadConfirmationDialogueService } from 'src/app/services/reload-confirmation-dialogue.service';
import { ToastService } from 'src/app/services/toast.service';

@Component({
    selector: 'app-protected-area-edit-form',
    templateUrl: '../../../shared/edit-form/edit-form.html',
    // templateUrl: './protected-area-edit-form.component.html',
    styleUrls: ['./protected-area-edit-form.component.scss'],
    standalone: false
})
export class ProtectedAreaEditFormComponent {
  @Input() updateType;
  @ViewChild('confirmSaveClose') confirmSaveClose;
  private subscriptions = new Subscription();
  private utils = new Utils();

  public form = new UntypedFormGroup({
    effectiveDate: new UntypedFormControl(null, { nonNullable: true, validators: [Validators.required] }),
    legalName: new UntypedFormControl(null, { nonNullable: true, validators: [Validators.required] }),
    displayName: new UntypedFormControl(null, { nonNullable: true }),
    phoneticName: new UntypedFormControl(null, { nonNullable: true }),
    audioClip: new UntypedFormControl(null, { nonNullable: true }),
    searchTerms: new UntypedFormControl(null, { nonNullable: true }),
    notes: new UntypedFormControl(null, { nonNullable: true }),
    hideDisplayName: new UntypedFormControl(false)
  });

  public currentData;
  public dataType = 'protected area';
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
    notes: 'Notes',
  };

  public invalidConfig = {
    showMessage: false
  };

  public tz = Constants.timeZoneIANA;
  public now = DateTime.now().setZone(this.tz);
  public submitting = false;

  hideDisplayName = false;
  displayNameEdited = false;

  constructor(
    private router: Router,
    private protectedAreaService: ProtectedAreaService,
    private loadingService: LoadingService,
    private ref: ChangeDetectorRef,
    private reloadConfirmationDialogueService: ReloadConfirmationDialogueService,
    private toastService: ToastService,
  ) { }

  ngOnInit(): void {
    this.subscriptions.add(
      this.protectedAreaService.watchCurrentProtectedArea().subscribe((res) => {
        this.currentData = res || {};
        // Populate form with data
        if (this.currentData) {
          if (this.updateType === 'minor' || this.updateType === 'edit-repeal') {
            // TODO: Prompt user is another change has been detected after init.
            this.initForm();
          } else if (this.currentData.status === 'repealed') {
            // no major edits on a repealed protected area
            this.toastService.addMessage(
              'No major edits permitted on a repealed protected area.',
              'Invalid action',
              3
            );
            this.router.navigate(['/protected-areas']);
          }
        }
        this.ref.detectChanges();
      })
    );

    this.subscriptions.add(
      this.loadingService.getLoadingStatus().subscribe((res) => {
        this.ref.detectChanges();
      })
    );

    this.subscriptions.add(
      this.form.valueChanges.subscribe(() => {
        this.ref.detectChanges();
      })
    );
  }

  getDateSubLabel() {
    switch (this.updateType) {
      case Constants.editTypes.REPEAL_EDIT_TYPE:
        return 'The date the protected area was repealed.';
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


  showDisplayNameField() {
    return !this.form?.controls?.['hideDisplayName']?.value;
  }

  initForm() {
    if (this.currentData.displayName === this.currentData.legalName) {
      this.form.controls['hideDisplayName'].setValue(true);
    }

    Object.keys(this.form.controls).forEach((element) => {
      // Allows us to reset to state on page load.
      this.form.controls[element]['defaultValue'] = this.currentData[element] ? this.currentData[element] : null;
      this.form.reset();
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
    this.router.navigate(['protected-areas', this.currentData.pk]);
  }

  setModalData() {
    this.modalObjArray = [];
    this.modalObj = {};

    if (this.hideDisplayName && this.displayNameEdited) {
      this.form.addControl('displayName', new UntypedFormControl(null, { nonNullable: true }));
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
    this.hideDisplayName = this.form.controls['hideDisplayName'].value;
    this.submitting = true;
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

  isLoading() {
    return this.loadingService.isLoading();
  }

  hasUnsavedChanges() {
    return !this.form.pristine && !this.submitting;
  }

  // Set up the event listner
  @HostListener('window:beforeunload', ['$event'])
  onBeforeUnload(event: BeforeUnloadEvent) {
    this.reloadConfirmationDialogueService.beforeUnload(this, 'hasUnsavedChanges', event);
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
    this.ref.detectChanges();
  }
}
