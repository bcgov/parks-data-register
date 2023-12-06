import { Injectable } from '@angular/core';
import { DataService } from './data.service';
import { Constants } from '../utils/constants';
import { ApiService } from './api.service';
import { lastValueFrom } from 'rxjs';
import { EventObject, EventKeywords, EventService } from './event.service';
import { ToastService, ToastTypes } from './toast.service';
import { LoadingService } from './loading.service';
import { LoggerService } from './logger.service';
import { Utils } from '../utils/utils';

@Injectable({
  providedIn: 'root',
})
export class ProtectedAreaService {
  private utils = new Utils();
  validAttributes = [
    'effectiveDate',
    'legalName',
    'phoneticName',
    'displayName',
    'searchTerms',
    'audioClip',
    'notes',
    'lastVersionDate',
  ];

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

      const currentProtectedArea = this.processProtectedArea(res.splice(currentProtectedAreaIndex, 1)[0]);

      for (let i = 0; i < res.length; i++) {
        res[i] = this.processProtectedArea(res[i]);
      }

      // Sort historical by descending effective date
      res.sort((a, b) => new Date(b.effectiveDate).valueOf() - new Date(a.effectiveDate).valueOf());

      this.dataService.setItemValue(Constants.dataIds.CURRENT_PROTECTED_AREA, currentProtectedArea);
      this.dataService.setItemValue(Constants.dataIds.HISTORICAL_PROTECTED_AREA, res);
    } catch (err) {
      this.loggerService.error(err);
      this.toastService.addMessage(`Something went wrong. Please try again.`, ``, ToastTypes.ERROR);
      this.eventService.setError(new EventObject(EventKeywords.ERROR, String(err), 'Protected Area Service - Search'));
    }
    this.loadingService.removeFromFetchList(Constants.dataIds.SEARCH_RESULTS);
  }

  async edit(pk, putObj, updateType) {
    this.loadingService.addToFetchList(Constants.dataIds.PROTECTED_AREA_PUT);

    if (updateType !== 'minor' && updateType !== 'major') throw 'UpdateType must be either minor or major.';

    delete putObj.pk;
    delete putObj.sk;

    try {
      putObj = this.utils.cleanPutObject(putObj, this.validAttributes);
      const res = await lastValueFrom(this.apiService.put(['parks', pk, 'name'], putObj, { updateType: updateType }));
      this.dataService.setItemValue(Constants.dataIds.CURRENT_PROTECTED_AREA, res.data);
      this.toastService.addMessage(`Your changes were saved.`, ``, ToastTypes.SUCCESS);
    } catch (err) {
      this.loggerService.error(err);
      this.toastService.addMessage(`Something went wrong. Please try again.`, ``, ToastTypes.ERROR);
      this.eventService.setError(new EventObject(EventKeywords.ERROR, String(err), 'Protected Area Service - Put'));
    }
    this.loadingService.removeFromFetchList(Constants.dataIds.PROTECTED_AREA_PUT);
  }

  async repeal(pk, putObj) {
    this.loadingService.addToFetchList(Constants.dataIds.PROTECTED_AREA_PUT);

    delete putObj.pk;
    delete putObj.sk;

    try {
      putObj = this.utils.cleanPutObject(putObj, this.validAttributes);
      const res = await lastValueFrom(this.apiService.put(['parks', pk, 'name'], putObj, { updateType: 'repeal' }));
      this.dataService.setItemValue(Constants.dataIds.CURRENT_PROTECTED_AREA, res.data);
      this.toastService.addMessage(`Your changes were saved.`, ``, ToastTypes.SUCCESS);
    } catch (err) {
      this.loggerService.error(err);
      this.toastService.addMessage(`Something went wrong. Please try again.`, ``, ToastTypes.ERROR);
      this.eventService.setError(new EventObject(EventKeywords.ERROR, String(err), 'Protected Area Service - Put'));
    }
    this.loadingService.removeFromFetchList(Constants.dataIds.PROTECTED_AREA_PUT);
  }

  watchCurrentProtectedArea() {
    return this.dataService.watchItem(Constants.dataIds.CURRENT_PROTECTED_AREA);
  }

  watchHistoricalProtectedArea() {
    return this.dataService.watchItem(Constants.dataIds.HISTORICAL_PROTECTED_AREA);
  }

  processProtectedArea(protectedArea) {
    // Set lastVersionDate for PUTs
    protectedArea = this.utils.setLastVersionDate(protectedArea);

    // Set readable dates
    protectedArea = this.utils.setDisplayDate(protectedArea, 'createDate');
    protectedArea = this.utils.setDisplayDate(protectedArea, 'effectiveDate');
    protectedArea = this.utils.setDisplayDate(protectedArea, 'updateDate');

    return protectedArea;
  }
}
