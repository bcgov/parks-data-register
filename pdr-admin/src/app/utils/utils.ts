import { DateTime } from 'luxon';
import { Constants } from './constants';

export class Utils {
  public formatDateForDisplay(date) {
    let newDate = DateTime.fromISO(date).setZone(Constants.timeZoneIANA);
    if (newDate.toFormat('DDD') === 'Invalid DateTime') {
      return null;
    }
    return newDate.toFormat('DDD');
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
    for (let key in putObj) {
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

  public setLastVersionDate(item) {
    // TODO: When API has proper conflict resolution, update this code
    if (item.updateDate) {
      item.lastVersionDate = item.updateDate;
    }
    return item;
  }

  public setDisplayDate(item, attr) {
    if (item[attr]) {
      item[attr + 'Display'] = this.formatDateForDisplay(item[attr]);
    }
    return item;
  }
}
