import { Injectable } from '@angular/core';
import { LoadingService } from './loading.service';
import { DataService } from './data.service';
import { Constants } from '../utils/constants';
import { lastValueFrom } from 'rxjs';
import { ApiService } from './api.service';
import { LoggerService } from './logger.service';
import { ToastService, ToastTypes } from './toast.service';
import { EventKeywords, EventObject, EventService } from './event.service';

@Injectable({
  providedIn: 'root'
})
export class SiteService {

  constructor(
    private loadingService: LoadingService,
    private dataService: DataService,
    private apiService: ApiService,
    private loggerService: LoggerService,
    private toastService: ToastService,
    private eventService: EventService
  ) { }


  async fetchSitesByProtectedArea(id) {
    this.loadingService.addToFetchList(Constants.dataIds.CURRENT_SITES_LIST);
    let queryParams = {};
    try {
      let res = [];
      if (id) {
        res = (await lastValueFrom(this.apiService.get(`parks/${id}/sites`, queryParams)))['data']['items'];
      }
      this.dataService.setItemValue(Constants.dataIds.CURRENT_SITES_LIST, res);
    } catch (error) {
      this.loggerService.error(error);
      this.toastService.addMessage(`Something went wrong. Please try again.`, ``, ToastTypes.ERROR);
      this.eventService.setError(new EventObject(EventKeywords.ERROR, String(error), 'Protected Area Service - Sites GET'));
    }
    this.loadingService.removeFromFetchList(Constants.dataIds.CURRENT_SITES_LIST);
  }

  async fetchSpecificSite(pAreaId, siteId) {
    this.loadingService.addToFetchList(Constants.dataIds.CURRENT_SITE);
    const identifier = `${pAreaId}::Site::${siteId}`;
    try {
      let res = (await lastValueFrom(this.apiService.get(`sites/${identifier}`)))['data']['items'];
      let historicalSites = res.filter((e) => e.status === 'historical') || [];
      if (historicalSites.length) {
        historicalSites.sort((a, b) => new Date(b.effectiveDate).valueOf() - new Date(a.effectiveDate).valueOf());
      }
      let currentSite = res.filter((e) => e.status === 'established' || e.status === 'repealed')[0] || null;
      this.dataService.setItemValue(Constants.dataIds.CURRENT_SITE, currentSite);
      this.dataService.setItemValue(Constants.dataIds.HISTORICAL_SITES, historicalSites);
    } catch (error) {
      this.loggerService.error(error);
      this.toastService.addMessage(`Something went wrong. Please try again.`, ``, ToastTypes.ERROR);
      this.eventService.setError(new EventObject(EventKeywords.ERROR, String(error), 'Specific Sites GET'));
    }
    this.loadingService.removeFromFetchList(Constants.dataIds.CURRENT_SITE);
  }

  watchSitesList() {
    return this.dataService.watchItem(Constants.dataIds.CURRENT_SITES_LIST);
  }

  watchCurrentSite() {
    return this.dataService.watchItem(Constants.dataIds.CURRENT_SITE);
  }

  watchHistoricalSites() {
    return this.dataService.watchItem(Constants.dataIds.HISTORICAL_SITES);
  }

  clearCurrentSite() {
    return this.dataService.setItemValue(Constants.dataIds.CURRENT_SITE, null);
  }

  clearSitesList() {
    this.dataService.setItemValue(Constants.dataIds.CURRENT_SITES_LIST, null);
  }

  clearHistoricalSites() {
    this.dataService.setItemValue(Constants.dataIds.HISTORICAL_SITES, null);
  }

}

