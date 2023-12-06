import { ChangeDetectorRef, Component, Input, ViewChild } from '@angular/core';
import { UntypedFormGroup, UntypedFormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { LoadingService } from 'src/app/services/loading.service';
import { ProtectedAreaService } from 'src/app/services/protected-area.service';
import { Utils } from 'src/app/utils/utils';

@Component({
  selector: 'app-protected-area-edit-repeal',
  templateUrl: './protected-area-edit-repeal.component.html',
  styleUrls: ['./protected-area-edit-repeal.component.scss'],
})
export class ProtectedAreaEditRepealComponent {
  @Input() id;
  @ViewChild('confirmSaveClose') confirmSaveClose;

  private subscriptions = new Subscription();
  private utils = new Utils();

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

  public form = new UntypedFormGroup({
    effectiveDate: new UntypedFormControl(null, { nonNullable: true, validators: [Validators.required] }),
    notes: new UntypedFormControl(null, { nonNullable: true }),
  });

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
        this.ref.detectChanges();
      })
    );

    this.subscriptions.add(
      this.loadingService.getLoadingStatus().subscribe((res) => {
        this.loading = res;
        this.ref.detectChanges();
      })
    );
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
    const mergedObj = { ...this.currentData, ...this.modalObj };

    await this.protectedAreaService.repeal(this.currentData.pk, mergedObj);
    this.protectedAreaService.fetchData(this.currentData.pk);
    this.confirmSaveClose.nativeElement.click();
    this.router.navigate(['protected-areas', this.currentData.pk, 'edit']);
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
    this.ref.detectChanges();
  }
}
