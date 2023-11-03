import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, Subscription } from 'rxjs';
import { Guid } from 'guid-typescript';
import { ToastrService } from 'ngx-toastr';

export enum ToastTypes {
  SUCCESS = 0,
  WARNING = 1,
  INFO = 2,
  ERROR = 3,
}

@Injectable({
  providedIn: 'root',
})
export class ToastService implements OnDestroy {
  private subscriptions = new Subscription();

  constructor(private toastr: ToastrService) {
    this.subscriptions.add(
      this.messages.subscribe((messages) => {
        messages.forEach((msg) => {
          switch (msg.type) {
            case ToastTypes.SUCCESS:
              if (msg.title === 'QR Service') {
                this.toastr.success(msg.body, msg.title, {
                  timeOut: 1000,
                  positionClass: 'toast-top-center',
                });
              } else {
                this.toastr.success(msg.body, msg.title);
              }
              break;
            case ToastTypes.WARNING:
              this.toastr.warning(msg.body, msg.title);
              break;
            case ToastTypes.INFO:
              this.toastr.info(msg.body, msg.title);
              break;
            case ToastTypes.ERROR:
              this.toastr.error(msg.body, msg.title, {
                extendedTimeOut: 0,
                timeOut: 0,
                closeButton: true,
              });
              break;
          }
          // Remove message from memory
          this.removeMessage(msg.guid);
        });
      })
    );
  }

  private _messages = new BehaviorSubject<any[]>([]);
  private dataStore: { messages: any[] } = { messages: [] };

  get messages() {
    return this._messages.asObservable();
  }

  addMessage(body: string, title: string, type: number) {
    this.dataStore.messages.push({
      body: body,
      title: title,
      type: type,
      guid: Guid.create(),
      date: new Date().toISOString(),
    });
    // tslint:disable-next-statement
    this._messages.next(Object.assign({}, this.dataStore).messages);
  }

  // Allow messages to be removed once displayed
  removeMessage(guid: string) {
    const newList = this.dataStore.messages.filter((item) => item.guid !== guid);
    this.dataStore.messages = newList;
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }
}
