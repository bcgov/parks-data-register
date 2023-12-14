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

  public pageSize = 6;

  constructor(
    private dataService: DataService,
    private apiService: ApiService,
    private loadingService: LoadingService,
    private loggerService: LoggerService,
    private toastService: ToastService,
    private eventService: EventService
  ) { }

  async fetchData(queryParams, cacheUrl = null, startFrom = 0) {
    this.loadingService.addToFetchList(Constants.dataIds.SEARCH_RESULTS);
    // Calling API with status = null gives you current and historical
    try {
      // Start from a certain value if provided
      queryParams['startFrom'] = startFrom;
      // Add 1 to the result limit. If the number of results returned is equal to this additional limit, we know there is at least 1 more page of results to query.
      let lastPage = true;
      queryParams['limit'] = this.pageSize + 1;
      const res = await lastValueFrom(this.apiService.get('search', queryParams));
      const data = this.apiService.getArrayFromSearchResults(res);
      if (data.length >= this.pageSize + 1) {
        // We know theres more pages of results because we were able to bring in more than the page size.
        // Remove the last result
        data.pop();
        lastPage = false;
      }
      const lastResultIndex = startFrom + data.length;
      for (let i = 0; i < data.length; i++) {
        data[i] = this.utils.setLastVersionDate(data[i]);
      }
      const searchParams = {
        lastPage: lastPage,
        lastResultIndex: lastResultIndex,
        lastQuery: queryParams
      }
      if (startFrom) {
        // we want to append to the previous results
        this.dataService.appendItemValue(Constants.dataIds.SEARCH_RESULTS, data);
      } else {
        // we want to overwrite the previous results
        this.dataService.setItemValue(Constants.dataIds.SEARCH_RESULTS, data);
      }
      this.dataService.setItemValue(Constants.dataIds.SEARCH_PARAMS, searchParams);
      if (cacheUrl) {
        this.dataService.setCacheValue(cacheUrl, this.dataService.getItemValue(Constants.dataIds.SEARCH_RESULTS), 300);
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

  watchSearchParams() {
    return this.dataService.watchItem(Constants.dataIds.SEARCH_PARAMS);
  }

  clearSearchResults() {
    return this.dataService.clearItemValue(Constants.dataIds.SEARCH_RESULTS);
  }

  checkCache(url) {
    return this.dataService.getCachedValue(url);
  }

  setSearchResults(data) {
    this.dataService.setItemValue(Constants.dataIds.SEARCH_RESULTS, data);
  }
}
