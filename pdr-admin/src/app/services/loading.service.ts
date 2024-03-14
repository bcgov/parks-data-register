import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { LoggerService } from './logger.service';

@Injectable({
  providedIn: 'root',
})
export class LoadingService {
  public fetchList = new BehaviorSubject({});
  public loading = new BehaviorSubject(false);

  constructor(private logger: LoggerService) { }

  addToFetchList(id, attributes = { loading: true }) {
    this.logger.debug(`addToFetchList: ${id} ${JSON.stringify(attributes)}`);
    let obj = { ...this.fetchList.value };
    obj[id] = attributes;
    this.fetchList.next(obj);
    this.updateLoadingStatus();
  }

  removeFromFetchList(id) {
    this.logger.debug(`removeFromFetchList: ${id}`);
    let obj = { ...this.fetchList.value };
    delete obj[id];
    this.fetchList.next(obj);
    this.updateLoadingStatus();
  }

  updateLoadingStatus() {
    this.logger.debug(`updateLoadingStatus`);
    // We have these extra checks so we don't constantly spam the subscribers.
    if (Object.keys(this.fetchList.value).length > 0 && !this.loading.value) {
      this.loading.next(true);
    } else if (Object.keys(this.fetchList.value).length <= 0 && this.loading.value) {
      this.loading.next(false);
    }
  }

  isLoading(): boolean {
    return this.loading?.value || false;
  }

  getFetchList() {
    return this.fetchList.asObservable();
  }

  getLoadingStatus() {
    return this.loading.asObservable();
  }
}
