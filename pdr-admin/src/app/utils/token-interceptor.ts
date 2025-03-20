import { HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, Subject, throwError } from 'rxjs';
import { catchError, switchMap, tap } from 'rxjs/operators';
import { KeycloakService } from 'src/app/services/keycloak.service';

/**
 * Intercepts all http requests and allows for the request and/or response to be manipulated.
 *
 * @export
 * @class TokenInterceptor
 * @implements {HttpInterceptor}
 */
@Injectable()
export class TokenInterceptor implements HttpInterceptor {
  private refreshTokenInProgress = false;

  private tokenRefreshedSource = new Subject();
  private tokenRefreshed$ = this.tokenRefreshedSource.asObservable();

  constructor(private auth: KeycloakService) { }

  /**
   * Main request intercept handler to automatically add the bearer auth token to every request.
   * If the auth token expires mid-request, the requests 403 response will be caught, the auth token will be
   * refreshed, and the request will be re-tried.
   *
   * @param {HttpRequest<any>} request
   * @param {HttpHandler} next
   * @returns {Observable<HttpEvent<any>>}
   * @memberof TokenInterceptor
   */
  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<any> {
    request = this.addAuthHeader(request);

    return next.handle(request).pipe(
      catchError(error => {
        if (error.status === 403) {
          return this.refreshToken().pipe(
            switchMap(() => {
              request = this.addAuthHeader(request);
              return next.handle(request);
            }),
            catchError(err => {
              return throwError(err);
            })
          );
        }
        return throwError(error);
      })
    );
  }

  /**
   * Fetches and adds the bearer auth token to the request.
   *
   * @private
   * @param {HttpRequest<any>} request to modify
   * @returns {HttpRequest<any>}
   * @memberof TokenInterceptor
   */
  private addAuthHeader(request: HttpRequest<any>): HttpRequest<any> {
    const authToken: string = this.auth.getToken() || '';

    request = request.clone({
      setHeaders: { Authorization: 'Bearer ' + authToken }
    });

    return request;
  }

  /**
   * Attempts to refresh the auth token.
   *
   * @private
   * @returns {Observable<any>}
   * @memberof TokenInterceptor
   */
  private refreshToken(): Observable<any> {
    if (this.refreshTokenInProgress) {
      return new Observable(observer => {
        this.tokenRefreshed$.subscribe(() => {
          observer.next(null);
          observer.complete();
        });
      });
    } else {
      this.refreshTokenInProgress = true;

      return this.auth.refreshToken().pipe(
        tap(() => {
          this.refreshTokenInProgress = false;
          this.tokenRefreshedSource.next(1);
        })
      );
    }
  }
}
