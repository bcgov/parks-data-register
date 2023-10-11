import { Component, OnDestroy, OnInit } from '@angular/core';
import { UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-name-search',
  templateUrl: './name-search.component.html',
  styleUrls: ['./name-search.component.scss'],
})
export class NameSearchComponent implements OnInit, OnDestroy {
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
    console.log('Form:', this.form);
    return;
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }
}
