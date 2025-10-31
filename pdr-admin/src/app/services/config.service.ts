import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

//
// This service/class provides a centralized place to persist config values
// (eg, to share values between multiple components).
//

@Injectable()
export class ConfigService {
  private configuration: any = {};
  private build: any = '';

  constructor(private httpClient: HttpClient) {}
  /**
   * Initialize the Config Service.  Get configuration data from front-end build, or back-end if nginx
   * is configured to pass the /config endpoint to a dynamic service that returns JSON.
   */
  async init() {
    // Initially set the configuration and see if we should be contacting our hostname endpoint for
    // any configuration data.
    this.configuration = window['__env'];
    this.build = this.configuration['GH_HASH'];

    console.log('Initial configuration from window.__env:', this.configuration);

    if (this.configuration['configEndpoint'] === true) {
      try {
        // Attempt to get application via this.httpClient. This uses the url of the application that you are running it from
        // This will not work for local because it will try and get localhost:4200/api instead of 3000/api...
        console.log('Attempting to fetch configuration from API...');
        this.configuration = await this.getConfigFromApi();
        console.log('Configuration loaded from API:', this.configuration);
      } catch (e) {
        // If all else fails, we'll just use the variables found in env.js
        console.error('Error getting configuration from API, falling back to window.__env:', e);
        this.configuration = window['__env'];
      }
    }
    if (this.configuration['logLevel'] === 0) {
      console.log('Configuration:', this.configuration);
    }

    return Promise.resolve();
  }

  get logLevel(): any {
    if (window['__env'] && window['__env'].logLevel != undefined)
      // Can be overidden by the js console.
      return window['__env'].logLevel;
  }

  get config(): any {
    return this.configuration;
  }

  async delay(delayInms) {
    return new Promise((resolve) => setTimeout(resolve, delayInms));
  }

  async getConfigFromApi() {
    let n1 = 0;
    let n2 = 1;
    let retryCount = 0;
    const maxRetries = 5; // Add a maximum retry limit for development
    
    // We want to try and connect to API forever.
    // The delay is increased based on the fibonacci sequence.
    while (true) {
      try {
        console.log(`Fetching config from API (attempt ${retryCount + 1})...`);
        const response = await firstValueFrom(this.httpClient.get(`/api/config`));
        console.log('API config response:', response);
        
        if (!response || !response['data']) {
          throw new Error('Invalid API config response: missing data property');
        }
        
        return response['data'];
      } catch (err) {
        retryCount++;
        console.error(`Failed to fetch config from API (attempt ${retryCount}):`, err);
        
        // In development, limit retries to avoid infinite loop
        if (window['__env']?.ENVIRONMENT === 'local' && retryCount >= maxRetries) {
          console.error(`Max retries (${maxRetries}) reached, giving up on API config`);
          throw err;
        }
        
        const delay = n1 + n2;
        console.log(`Retrying in ${delay} seconds...`);
        await this.delay(delay * 1000);
        n1 = n2;
        n2 = delay;
      }
    }
  }
}
