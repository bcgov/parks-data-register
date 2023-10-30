import { Injectable } from '@angular/core';
import { DataService } from './data.service';
import { Constants } from '../utils/constants';
import { ApiService } from './api.service';
import { lastValueFrom } from 'rxjs';
import { LoadingService } from './loading.service';

@Injectable({
  providedIn: 'root',
})
export class SearchService {
  constructor(
    private dataService: DataService,
    private apiService: ApiService,
    private loadingService: LoadingService
  ) {}

  async fetchData(text) {
    let queryParams = {};
    if (text) {
      queryParams['text'] = text;
    }

    this.loadingService.addToFetchList(Constants.dataIds.SEARCH_RESULTS);
    // Calling API with status = null gives you current and historical
    const res = await lastValueFrom(this.apiService.get('search', queryParams));
    const data = this.apiService.getArrayFromSearchResults(res);
    this.dataService.setItemValue(Constants.dataIds.SEARCH_RESULTS, data);
    this.loadingService.removeFromFetchList(Constants.dataIds.SEARCH_RESULTS);
    return data;
  }

  watchSearchResults() {
    return this.dataService.watchItem(Constants.dataIds.SEARCH_RESULTS);
  }
}
