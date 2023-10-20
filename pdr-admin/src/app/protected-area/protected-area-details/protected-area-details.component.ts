import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-protected-area-details',
  templateUrl: './protected-area-details.component.html',
  styleUrls: ['./protected-area-details.component.scss'],
})
export class ProtectedAreaDetailsComponent {
  constructor(private router: Router, private route: ActivatedRoute) {}

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
    searchTerms: 'here are the search terms'
  };
  historicalData = [
    {
      pk: '0001',
      sk: '2019-08-10T16:15:50.868Z',
      type: 'Protected area',
      legalName: 'Strathcona Awesome-o Park',
      displayName: 'Strathcona Awesome-o Park',
      phoneticName: 'strath park',
      audioClip: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      status: 'old',
      notes: 'Initial Park created for BC',
    },
    {
      pk: '0001',
      sk: '2020-08-10T16:15:50.868Z',
      type: 'Protected area',
      legalName: 'Strath Park',
      displayName: 'Strath Park',
      phoneticName: 'strath park',
      audioClip: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      status: 'old',
      notes: 'Updated name',
    },
  ];

  editItem() {
    this.router.navigate(['edit'], { relativeTo: this.route });
  }
}
