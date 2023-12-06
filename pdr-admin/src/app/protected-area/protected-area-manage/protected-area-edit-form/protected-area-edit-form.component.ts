import { ChangeDetectorRef, Component, Input } from '@angular/core';
import { UntypedFormGroup, UntypedFormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { LoadingService } from 'src/app/services/loading.service';
import { ProtectedAreaService } from 'src/app/services/protected-area.service';
import { Utils } from 'src/app/utils/utils';
import { ViewChild } from '@angular/core';

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
    displayName: new UntypedFormControl(null, { nonNullable: true }),
    phoneticName: new UntypedFormControl(null, { nonNullable: true }),
    audioClip: new UntypedFormControl(null, { nonNullable: true }),
  });

  public currentData;
  public loading = true;
  public modalObj = {};
  public attrDisplayNames = {
    effectiveDate: 'Effective date',
    legalName: 'New legal name',
    displayName: 'Display name',
    phoneticName: 'Phonetic Name',
    audioClip: 'Audio link',
    searchTerms: 'Search terms',
  };

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
    Object.keys(form.controls).forEach((element) => {
      // Allows us to reset to state on page load.
      form.controls[element].defaultValue = data[element] ? data[element] : null;
      form.reset();
    });
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
    this.router.navigate(['protected-areas', this.currentData.pk, 'edit']);
  }

  setModalData() {
    const changedProps = this.utils.getChangedProperties(this.form);
    changedProps.forEach((prop) => {
      this.modalObj[prop] = this.form.get(prop).value;
    });
    this.ref.detectChanges();
  }

  async submit() {
    // Business rule:
    // Latest change always trumps whatever is in the database
    // If you and another person is editing at the same time, the person who submits last gets their change reflected.
    const baseObj =
      this.updateType === 'major'
        ? {
            effectiveDate: '',
            legalName: '',
            phoneticName: '',
            displayName: '',
            searchTerms: '',
            notes: '',
            audioClip: '',
          }
        : this.currentData;

    let mergedObj = { ...baseObj, ...this.modalObj };

    await this.protectedAreaService.edit(this.currentData.pk, mergedObj, this.updateType);
    this.protectedAreaService.fetchData(this.currentData.pk);
    this.confirmSaveClose.nativeElement.click();
    this.router.navigate(['protected-areas', this.currentData.pk]);
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
    this.ref.detectChanges();
  }
}
