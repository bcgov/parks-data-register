import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Injectable, OnDestroy } from '@angular/core';
import { Subscription, merge, of, fromEvent, map, throwError, catchError } from 'rxjs';
import { ConfigService } from './config.service';

@Injectable({
  providedIn: 'root',
})
export class ApiService implements OnDestroy {
  public token: string;
  public isMS: boolean; // IE, Edge, etc
  networkStatus: boolean = false;
  networkStatus$: Subscription = Subscription.EMPTY;
  private headers;

  apiPath: string;
  env: 'local' | 'dev' | 'test' | 'prod';

  constructor(private http: HttpClient, private configService: ConfigService) { }

  // Provide a getter for others to check current state.
  get isNetworkOffline() {
    return !this.networkStatus;
  }

  errorHandler(error: HttpErrorResponse) {
    return throwError(() => new Error(error.message));
  }

  ngOnDestroy(): void {
    this.networkStatus$.unsubscribe();
  }

  init() {
    // If config is setting api, override.
    if (this.configService.config['API_LOCATION']) {
      if (this.configService.config['API_PATH']) {
        this.apiPath = this.configService.config['API_LOCATION'] + this.configService.config['API_PATH'];
      } else {
        this.apiPath = this.configService.config['API_LOCATION'];
      }
    } else {
      this.apiPath = window.location.origin + '/api';
    }

    this.headers = new HttpHeaders().set('x-api-key', this.configService.config['API_KEY']);
    if (!this.headers) {
      console.log('No API key provided.');
    }

    this.env = this.configService.config['ENVIRONMENT'];
    this.checkNetworkStatus();
  }

  checkNetworkStatus() {
    this.networkStatus = navigator.onLine;
    this.networkStatus$ = merge(of(null), fromEvent(window, 'online'), fromEvent(window, 'offline'))
      .pipe(map(() => navigator.onLine))
      .subscribe((status) => {
        console.log(status === false ? 'Network Offline' : 'Network Online');
        this.networkStatus = status;
      });
  }

  public getEnvironment(): string {
    return this.env;
  }

  get(pk, queryParamsObject = null as any) {
    if (this.networkStatus) {
      let queryString = this.generateQueryString(queryParamsObject);
      return this.http
        .get<any>(`${this.apiPath}/${pk}?${queryString}`, { headers: this.headers })
        .pipe(catchError(this.errorHandler));
    } else {
      throw 'Network Offline';
    }
  }

  put(pathArray, obj, queryParamsObject = null as any) {
    if (this.networkStatus) {
      const url = this.buildUrl(this.apiPath, pathArray, queryParamsObject);
      return this.http.put<any>(`${url}`, obj, { headers: this.headers }).pipe(catchError(this.errorHandler));
    } else {
      throw 'Network Offline';
    }
  }

  post(pk, obj, queryParamsObject = null as any) {
    if (this.networkStatus) {
      let queryString = this.generateQueryString(queryParamsObject);
      return this.http
        .post<any>(`${this.apiPath}/${pk}?${queryString}`, obj, { headers: this.headers })
        .pipe(catchError(this.errorHandler));
    } else {
      throw 'Network Offline';
    }
  }

  delete(pk, queryParamsObject = null as any) {
    if (this.networkStatus) {
      let queryString = this.generateQueryString(queryParamsObject);
      return this.http
        .delete<any>(`${this.apiPath}/${pk}?${queryString}`, { headers: this.headers })
        .pipe(catchError(this.errorHandler));
    } else {
      throw 'Network Offline';
    }
  }

  private generateQueryString(queryParamsObject) {
    let queryString = '';
    if (queryParamsObject) {
      for (let key of Object.keys(queryParamsObject)) {
        queryString += `&${key}=${queryParamsObject[key]}`;
      }
      queryString = queryString.substring(1);
    }
    return queryString;
  }

  public getArrayFromSearchResults(data) {
    let res = [];
    for (const record of data.data.hits) {
      res.push(record._source);
    }
    return res;
  }

  private buildUrl(apiPath, pathArray, queryParamsObject) {
    let url = apiPath;
    pathArray.forEach((path) => {
      url += `/${path}`;
    });
    url += `?${this.generateQueryString(queryParamsObject)}`;

    return url;
  }
}
