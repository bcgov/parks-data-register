import { Injectable } from '@angular/core';
import { LoadingService } from './loading.service';
import { DataService } from './data.service';
import { Constants } from '../utils/constants';
import { lastValueFrom } from 'rxjs';
import { ApiService } from './api.service';
import { LoggerService } from './logger.service';
import { ToastService, ToastTypes } from './toast.service';
import { EventKeywords, EventObject, EventService } from './event.service';
import { Utils } from '../utils/utils';

@Injectable({
  providedIn: 'root'
})
export class SiteService {
  private utils = new Utils();

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

  async editSite(pk, putObj, updateType) {
    this.loadingService.addToFetchList(Constants.dataIds.SITE_PUT);

    if (!Object.values(Constants.editTypes).includes(updateType)) {
      throw new Error(`'${updateType}' is not a valid update type.`);
    }

    if (updateType === Constants.editTypes.EDIT_REPEAL_EDIT_TYPE) {
      updateType = Constants.editTypes.MINOR_EDIT_TYPE;
    }

    delete putObj.pk;
    delete putObj.sk;

    try {
      putObj = this.utils.cleanPutObject(putObj, Constants.putAttributes);
      await lastValueFrom(this.apiService.put(['sites', pk], putObj, { updateType: updateType }));
      this.toastService.addMessage(`Your changes were saved.`, ``, ToastTypes.SUCCESS);
      this.clearCurrentSite();
    } catch (error) {
      this.loggerService.error(error);
      this.toastService.addMessage(`Something went wrong. Please try again.`, ``, ToastTypes.ERROR);
      this.eventService.setError(new EventObject(EventKeywords.ERROR, String(error), 'Site Service - Put'));
    }
    this.loadingService.removeFromFetchList(Constants.dataIds.SITE_PUT);
  }

  // PK has the format <protected-area-id>::Site::<site-id>
  getSiteIdFromPK(pk) {
    return pk.split('::')[2];
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

