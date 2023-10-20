import { Injectable } from '@angular/core';
import { DataService } from './data.service';
import { Constants } from '../utils/constants';

@Injectable({
  providedIn: 'root',
})
export class ProtectedAreaService {
  constructor(private dataService: DataService) {}

  // Mock data
  mockData = [
    {
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
      searchTerms: 'here are the search terms',
    },
    {
      pk: '0001',
      sk: '2019-08-10T16:15:50.868Z',
      type: 'Protected area',
      legalName: 'Strathcona Awesome-o Park',
      displayName: 'Strathcona Awesome-o Park',
      phoneticName: 'strath park',
      audioClip: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      status: 'historical',
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
      status: 'historical',
      notes: 'Updated name',
    },
  ];

  async fetchData(status = null) {
    switch (status) {
      case null:
        // Calling API with status = null gives you current and historical
        // TODO: Get this data from the API
        let data = structuredClone(this.mockData);
        const currentProtectedAreaIndex = data.findIndex((element) => element.status === 'current');
        this.dataService.setItemValue(
          Constants.dataIds.CURRENT_PROTECTED_AREA,
          data.splice(currentProtectedAreaIndex, 1)[0]
        );
        this.dataService.setItemValue(Constants.dataIds.HISTORICAL_PROTECTED_AREA, data);
        break;
      case 'current':
        // To get just current, status = current
        break;
      case 'historical':
        // to get array of historical, status = historical
        break;
      default:
        break;
    }
  }

  watchCurrentProtectedArea() {
    return this.dataService.watchItem(Constants.dataIds.CURRENT_PROTECTED_AREA);
  }

  watchHistoricalProtectedArea() {
    return this.dataService.watchItem(Constants.dataIds.HISTORICAL_PROTECTED_AREA);
  }
}
