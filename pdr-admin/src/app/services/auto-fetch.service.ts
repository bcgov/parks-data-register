import { Injectable } from '@angular/core';
import { LoggerService } from './logger.service';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root',
})
export class AutoFetchService {
  // TODO: This should come in from the config service.
  public timeIntevalSeconds = 5 * 60;
  public fetchQueue = [];

  constructor(private loggerService: LoggerService, private apiService: ApiService) {}

  async run() {
    this.runFetches(this.fetchQueue);
    setInterval(() => {
      this.loggerService.debug(`RunFetches ${JSON.stringify(this.fetchQueue)}`);
      this.runFetches(this.fetchQueue);
    }, this.timeIntevalSeconds * 1000);
  }
  runFetches(fetchQueue) {
    // Only if we are online
    if (this.apiService.isNetworkOffline === false) {
      for (let i = 0; i < fetchQueue.length; i++) {
        const fetchId = fetchQueue[i];
        // Execute data fetch here
      }
    }
  }

  ignoreOrderCompare(a, b) {
    if (!Array.isArray(a) || !Array.isArray(b)) {
      this.loggerService.debug('Both inputs must be arrays.');
      return false;
    }

    if (a.length !== b.length) {
      this.loggerService.debug('Arrays have different sizes.');
      return false;
    }

    const elementCount = new Map();

    // Count occurrences of objects in array 'a'
    for (const obj of a) {
      const key = JSON.stringify(obj);
      elementCount.set(key, (elementCount.get(key) || 0) + 1);
    }

    // Compare the counts with array 'b'
    for (const obj of b) {
      const key = JSON.stringify(obj);
      const count = elementCount.get(key);
      if (!count) {
        this.loggerService.debug(`Object not found or has a different count: ${JSON.stringify(obj)}`);
        return false;
      }
      elementCount.set(key, count - 1);
    }

    // Ensure all objects in array 'b' have been accounted for
    for (const count of elementCount.values()) {
      if (count !== 0) {
        this.loggerService.debug('Object count mismatch for some objects.');
        return false;
      }
    }
    return true;
  }
}
