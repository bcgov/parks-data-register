import { Component, OnDestroy } from '@angular/core';
import { UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-manage-records',
  templateUrl: './manage-records.component.html',
  styleUrls: ['./manage-records.component.scss'],
})
export class ManageRecordsComponent implements OnDestroy {
  constructor(private router: Router) {}

  private subscriptions = new Subscription();

  data = [];
  parkNames = [
    'Garibaldi Provincial Park',
    'Golden Ears Provincial Park',
    'Joffre Lakes Provincial Park',
    'Mount Seymour Provincial Park',
  ];
  typePicklistItems = ['Any', 'Protected area'];
  statusPicklistItems = ['Any', 'Established', 'Repealed'];
  form = new UntypedFormGroup({
    search: new UntypedFormControl(null),
    type: new UntypedFormControl(null),
    status: new UntypedFormControl(this.statusPicklistItems[0]),
  });

  submit() {
    // TODO: Connect this to service layer
    console.log('Form:', this.form);
    this.data = [
      {
        pk: '0001',
        legalName: 'Strathcona Park',
        type: 'Protected area',
        status: 'Established',
      },
    ];
  }

  viewItem(item) {
    this.router.navigate([this.getPathFromType(item.type), item.pk]);
  }

  editItem(item) {
    this.router.navigate([this.getPathFromType(item.type), item.pk, 'edit']);
  }

  getPathFromType(type) {
    switch (type) {
      case 'Protected area':
        return 'protected-area';
      // case 'Site':
      //   return 'site';
      // case 'Unofficial site':
      //   return 'site';
      default:
        return '';
    }
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }
}
