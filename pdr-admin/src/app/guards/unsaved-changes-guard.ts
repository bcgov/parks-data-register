import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export interface HasUnsavedChanges {
  hasUnsavedChanges(): boolean;
}

@Injectable({
  providedIn: 'root',
})
export class UnsavedChangesGuard {
  canDeactivate(component: HasUnsavedChanges): Observable<boolean> | boolean {
    if (component.hasUnsavedChanges()) {
      // Prompt the user to confirm leaving the page or perform other checks
      return confirm('Changes you made may not be saved.');
    }
    return true;
  }
}
