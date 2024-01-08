import { Injectable } from '@angular/core';
import { LoadingService } from './loading.service';
import { Constants } from '../utils/constants';
import { lastValueFrom } from 'rxjs';
import { ApiService } from './api.service';
import { LoggerService } from './logger.service';
import { EventKeywords, EventObject, EventService } from './event.service';
import { ToastService, ToastTypes } from './toast.service';
import { Utils } from '../utils/utils';
import { DataService } from './data.service';

@Injectable({
  providedIn: 'root'
})
export class ChangelogService {
  private utils = new Utils();
  public pageSize = 20;

  constructor(
    private dataService: DataService,
    private loadingService: LoadingService,
    private apiService: ApiService,
    private loggerService: LoggerService,
    private eventService: EventService,
    private toastService: ToastService
  ) { }

  async fetchData(queryParams, cacheUrl = null, startFrom = 0) {
    this.loadingService.addToFetchList(Constants.dataIds.CHANGELOG_SEARCH_RESULTS);
    try {
      queryParams['startFrom'] = startFrom;
      let lastPage = true;
      queryParams['limit'] = this.pageSize + 1;
      const res = await lastValueFrom(this.apiService.get('changelog/search', queryParams));
      let data = this.apiService.getArrayFromSearchResults(res);
      if (data.length >= this.pageSize + 1) {
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
      // Get previous results array if it exists and concat new data to the end of it
      if (this.dataService.getItemValue(Constants.dataIds.CHANGELOG_SEARCH_RESULTS)?.data)
        data = this.dataService.getItemValue(Constants.dataIds.CHANGELOG_SEARCH_RESULTS).data.concat(data);
      this.dataService.setItemValue(Constants.dataIds.CHANGELOG_SEARCH_RESULTS, {
        data: data,
        searchParams: searchParams,
      });
      if (cacheUrl) {
        this.dataService.setCacheValue(cacheUrl, this.dataService.getItemValue(Constants.dataIds.CHANGELOG_SEARCH_RESULTS), 300);
        this.loggerService.debug(`Cache update ${cacheUrl}`);
      }
    } catch (e) {
      this.loggerService.error(e);
      this.toastService.addMessage(`Something went wrong. Please try again.`, ``, ToastTypes.ERROR);
      this.eventService.setError(new EventObject(EventKeywords.ERROR, String(e), 'Park Service'));
    }
    this.loadingService.removeFromFetchList(Constants.dataIds.CHANGELOG_SEARCH_RESULTS);
  }

  watchChangelogResults() {
    return this.dataService.watchItem(Constants.dataIds.CHANGELOG_SEARCH_RESULTS);
  }

  clearChangelogResults() {
    return this.dataService.clearItemValue(Constants.dataIds.CHANGELOG_SEARCH_RESULTS);
  }

  setSearchResults(data) {
    this.dataService.setItemValue(Constants.dataIds.SEARCH_RESULTS, data);
  }

}
