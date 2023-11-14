import { Injectable } from '@angular/core';
import { DataService } from './data.service';
import { Constants } from '../utils/constants';
import { ApiService } from './api.service';
import { lastValueFrom } from 'rxjs';
import { EventObject, EventKeywords, EventService } from './event.service';
import { ToastService, ToastTypes } from './toast.service';
import { LoadingService } from './loading.service';
import { LoggerService } from './logger.service';

@Injectable({
  providedIn: 'root',
})
export class ProtectedAreaService {
  constructor(
    private dataService: DataService,
    private apiService: ApiService,
    private loadingService: LoadingService,
    private loggerService: LoggerService,
    private toastService: ToastService,
    private eventService: EventService
  ) {}
  async fetchData(id) {
    this.loadingService.addToFetchList(Constants.dataIds.SEARCH_RESULTS);
    let queryParams = {};
    try {
      let res = [];
      if (id) {
        res = (await lastValueFrom(this.apiService.get(`parks/${id}/name`, queryParams)))['data']['items'];
      }
      const currentProtectedAreaIndex = res.findIndex((element) => element.status === 'current');
      this.dataService.setItemValue(
        Constants.dataIds.CURRENT_PROTECTED_AREA,
        res.splice(currentProtectedAreaIndex, 1)[0]
      );
      this.dataService.setItemValue(Constants.dataIds.HISTORICAL_PROTECTED_AREA, res);
    } catch (e) {
      this.loggerService.error(e);
      this.toastService.addMessage(`Something went wrong. Please try again.`, ``, ToastTypes.ERROR);
      this.eventService.setError(new EventObject(EventKeywords.ERROR, String(e), 'Park Service'));
    }
    this.loadingService.removeFromFetchList(Constants.dataIds.SEARCH_RESULTS);
  }

  watchCurrentProtectedArea() {
    return this.dataService.watchItem(Constants.dataIds.CURRENT_PROTECTED_AREA);
  }

  watchHistoricalProtectedArea() {
    return this.dataService.watchItem(Constants.dataIds.HISTORICAL_PROTECTED_AREA);
  }
}
