import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ReloadConfirmationDialogueService {
  private confirmationSubject: Subject<boolean>;

  constructor() {
    this.confirmationSubject = new Subject<boolean>();
  }

  confirm(message: string): Observable<boolean> {
    const confirmation = window.confirm(message);
    this.confirmationSubject.next(confirmation);
    return this.confirmationSubject.asObservable();
  }

  beforeUnload(self, functionName, event: BeforeUnloadEvent) {
    if (self[functionName]()) {
      // Display confirmation dialog
      event.preventDefault();
      event.returnValue = ''; // Chrome requires this to be set
      const confirmation = this.confirm('Changes you made may not be saved.');

      // Handle the user's response
      confirmation.subscribe((result) => {
        if (result) {
          // User confirmed to leave, navigate to another page
          return result;
        } else {
          return false;
        }
      });
    }
  }
}
