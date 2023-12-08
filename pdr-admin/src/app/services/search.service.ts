import { Injectable } from '@angular/core';
import { DataService } from './data.service';
import { Constants } from '../utils/constants';
import { ApiService } from './api.service';
import { lastValueFrom } from 'rxjs';
import { LoadingService } from './loading.service';
import { LoggerService } from './logger.service';
import { ToastService, ToastTypes } from './toast.service';
import { EventKeywords, EventObject, EventService } from './event.service';
import { Utils } from '../utils/utils';

@Injectable({
  providedIn: 'root',
})
export class SearchService {
  private utils = new Utils();

  constructor(
    private dataService: DataService,
    private apiService: ApiService,
    private loadingService: LoadingService,
    private loggerService: LoggerService,
    private toastService: ToastService,
    private eventService: EventService
  ) {}

  async fetchData(queryParams, cacheUrl = null) {
    this.loadingService.addToFetchList(Constants.dataIds.SEARCH_RESULTS);
    // Calling API with status = null gives you current and historical
    try {
      const res = await lastValueFrom(this.apiService.get('search', queryParams));
      const data = this.apiService.getArrayFromSearchResults(res);
      for (let i = 0; i < data.length; i++) {
        data[i] = this.utils.setLastVersionDate(data[i]);
      }
      this.dataService.setItemValue(Constants.dataIds.SEARCH_RESULTS, data);
      if (cacheUrl) {
        this.dataService.setCacheValue(cacheUrl, data, 300);
        this.loggerService.debug(`Cache update ${cacheUrl}`);
      }
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

  checkCache(url){
    return this.dataService.getCachedValue(url);
  }

  setSearchResults(data) {
    this.dataService.setItemValue(Constants.dataIds.SEARCH_RESULTS, data);
  }
}
