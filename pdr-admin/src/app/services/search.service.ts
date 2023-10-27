import { Injectable } from '@angular/core';
import { DataService } from './data.service';
import { Constants } from '../utils/constants';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root',
})
export class SearchService {
  constructor(private dataService: DataService, private apiService: ApiService) {}

  async fetchData(text) {
    let queryParams = {};
    if (text) {
      queryParams['text'] = text;
    }

    // Calling API with status = null gives you current and historical
    let res = await this.apiService.get('search', queryParams);
    let data = this.apiService.getArrayFromSearchResults(res);
    this.dataService.setItemValue(Constants.dataIds.SEARCH_RESULTS, data);
    return data;
  }

  watchSearchResults() {
    return this.dataService.watchItem(Constants.dataIds.SEARCH_RESULTS);
  }
}
