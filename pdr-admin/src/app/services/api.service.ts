import { HttpClient, HttpErrorResponse } from '@angular/common/http';
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

  apiPath: string;
  env: 'local' | 'dev' | 'test' | 'prod';

  constructor(private http: HttpClient, private configService: ConfigService) {}

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
    this.apiPath =
      this.configService.config['API_LOCATION'] +
      this.configService.config['API_PATH'];
    this.env = this.configService.config['ENVIRONMENT'];
    this.checkNetworkStatus();
  }

  checkNetworkStatus() {
    this.networkStatus = navigator.onLine;
    this.networkStatus$ = merge(
      of(null),
      fromEvent(window, 'online'),
      fromEvent(window, 'offline')
    )
      .pipe(map(() => navigator.onLine))
      .subscribe(status => {
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
      return this.http.get<any>(`${this.apiPath}/${pk}?${queryString}`)
        .pipe(catchError(this.errorHandler));
    } else {
      throw 'Network Offline';
    }
  }

  put(pk, obj, queryParamsObject = null as any) {
    if (this.networkStatus) {
      let queryString = this.generateQueryString(queryParamsObject);
      return this.http.put<any>(`${this.apiPath}/${pk}?${queryString}`, obj)
        .pipe(catchError(this.errorHandler));
    } else {
      throw 'Network Offline';
    }
  }

  post(pk, obj, queryParamsObject = null as any) {
    if (this.networkStatus) {
      let queryString = this.generateQueryString(queryParamsObject);
      return this.http.post<any>(`${this.apiPath}/${pk}?${queryString}`, obj)
        .pipe(catchError(this.errorHandler));
    } else {
      throw 'Network Offline';
    }
  }

  delete(pk, queryParamsObject = null as any) {
    if (this.networkStatus) {
      let queryString = this.generateQueryString(queryParamsObject);
      return this.http.delete<any>(`${this.apiPath}/${pk}?${queryString}`)
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
}
