import { Injectable } from '@angular/core';
import { DataService } from './data.service';
import { Constants } from '../utils/constants';
import { ApiService } from './api.service';
import { lastValueFrom } from 'rxjs';
import { LoadingService } from './loading.service';
import { LoggerService } from './logger.service';
import { ToastService, ToastTypes } from './toast.service';
import { EventKeywords, EventObject, EventService } from './event.service';

@Injectable({
  providedIn: 'root',
})
export class SearchService {
  constructor(
    private dataService: DataService,
    private apiService: ApiService,
    private loadingService: LoadingService,
    private loggerService: LoggerService,
    private toastService: ToastService,
    private eventService: EventService
  ) {}

  async fetchData(text) {
    this.loadingService.addToFetchList(Constants.dataIds.SEARCH_RESULTS);
    let queryParams = {};
    if (text) {
      queryParams['text'] = text;
    }
    // Calling API with status = null gives you current and historical
    try {
      const res = await lastValueFrom(this.apiService.get('search', queryParams));
      const data = this.apiService.getArrayFromSearchResults(res);
      this.dataService.setItemValue(Constants.dataIds.SEARCH_RESULTS, data);
    } catch (e) {
      this.loggerService.error(e);
      this.toastService.addMessage(`Something went wrong. Please try again.`, ``, ToastTypes.ERROR);
      this.eventService.setError(new EventObject(EventKeywords.ERROR, String(e), 'Park Service'));
    }
    this.loadingService.removeFromFetchList(Constants.dataIds.SEARCH_RESULTS);
  }

  watchSearchResults() {
    return this.dataService.watchItem(Constants.dataIds.SEARCH_RESULTS);
  }
  clearSearchResults() {
    return this.dataService.clearItemValue(Constants.dataIds.SEARCH_RESULTS);
  }
}
