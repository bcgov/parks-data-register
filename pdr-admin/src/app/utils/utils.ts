import { formatDate } from '@angular/common';

export class Utils {
  public formatDateForDisplay(date) {
    return date ? formatDate(date, 'MMMM dd, YYYY', 'en-CA', 'PST') : null;
  }

  public getChangedProperties(form): string[] {
    let changedProperties = [];

    Object.keys(form.controls).forEach((name) => {
      const currentControl = form.controls[name];
      if (currentControl.dirty) {
        changedProperties.push(name);
      }
    });
    return changedProperties;
  }

  public cleanPutObject(putObj, validAttributes) {
    for (var key in putObj) {
      if (putObj.hasOwnProperty(key) && validAttributes.includes(key)) {
        // Ensure things we want to delete is set to null.
        if (putObj[key] === null || this.isObjEmpty(putObj[key])) putObj[key] = null;
      } else {
        delete putObj[key];
      }
    }
    return putObj;
  }

  public isObjEmpty(obj) {
    for (const prop in obj) {
      if (Object.hasOwn(obj, prop)) {
        return false;
      }
    }

    return true;
  }

  public upperCaseFirstChar(string) {
    return `${string}`.charAt(0).toUpperCase() + `${string}`.slice(1);
  }
}
