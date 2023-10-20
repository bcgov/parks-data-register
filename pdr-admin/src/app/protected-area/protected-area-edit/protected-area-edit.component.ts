import { Component } from '@angular/core';

@Component({
  selector: 'app-protected-area-edit',
  templateUrl: './protected-area-edit.component.html',
  styleUrls: ['./protected-area-edit.component.scss'],
})
export class ProtectedAreaEditComponent {
  currentData = {
    pk: '0001',
    sk: 'Details',
    type: 'Protected area',
    createDate: '2019-08-10T16:15:50.868Z',
    updateDate: '2023-08-10T16:11:54.513Z',
    effectiveDate: '2023-08-5T16:11:54.513Z',
    legalName: 'Strathcona Park',
    displayName: 'Strathcona Park',
    phoneticName: 'stɹæθˈkoʊnə ˈpɑrk',
    audioClip: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    status: 'current',
    notes: 'Name changed because the old one was terrible',
  };
}
