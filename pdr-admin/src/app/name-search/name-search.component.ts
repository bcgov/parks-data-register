import { Component, OnDestroy, OnInit } from '@angular/core';
import { UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-name-search',
  templateUrl: './name-search.component.html',
  styleUrls: ['./name-search.component.scss'],
})
export class NameSearchComponent implements OnInit, OnDestroy {
  constructor(private router: Router) {}

  private subscriptions = new Subscription();

  data = [];
  parkNames = [
    'Garibaldi Provincial Park',
    'Golden Ears Provincial Park',
    'Joffre Lakes Provincial Park',
    'Mount Seymour Provincial Park',
  ];
  statusPicklistItems = ['Any', 'Current', 'Repealed'];
  audioPicklistItems = ['Any', 'Has Audio', 'No Audio'];
  nameControlDisabled = false;
  pkControlDisabled = false;
  form = new UntypedFormGroup({
    name: new UntypedFormControl(null),
    pk: new UntypedFormControl(null),
    status: new UntypedFormControl(this.statusPicklistItems[0]),
    audioClip: new UntypedFormControl(this.audioPicklistItems[0]),
  });

  ngOnInit() {
    this.subscriptions.add(
      this.form.get('name').valueChanges.subscribe((name) => {
        this.pkControlDisabled = !!name;
      })
    );
    this.subscriptions.add(
      this.form.get('pk').valueChanges.subscribe((pk) => {
        this.nameControlDisabled = !!pk;
      })
    );
  }

  submit() {
    // TODO: Connect this to service layer
    console.log('Form:', this.form);
    this.data = [
      {
        pk: '0001',
        legalName: 'Strathcona Park',
        type: 'Protected area',
        status: 'Current',
        audioClip: true,
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
      case 'Site':
        return 'site';
      case 'Unofficial site':
        return 'site';
      default:
        return '';
    }
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }
}
