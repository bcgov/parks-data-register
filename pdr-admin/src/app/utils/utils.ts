import { formatDate } from '@angular/common';

export class Utils {
  public formatDateForDisplay(date) {
    return date ? formatDate(date, 'MMMM dd, YYYY', 'en-CA', 'PST') : null;
  }
}
