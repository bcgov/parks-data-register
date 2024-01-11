import { HttpClient, HttpHandler } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';

import { Utils } from './utils';

describe('Utils', () => {
  let utils;
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [HttpClient, HttpHandler],
    });
    utils = new Utils();
  });

  it('should be created', () => {
    expect(utils).toBeTruthy();
  });

  it('should format date for display: returns null', () => {
    const res = utils.formatDateForDisplay(null);
    expect(res).toEqual(null);
  });

  it('should format date for display: success', () => {
    const date = new Date("1989-04-05T12:00:00.000+08:00");
    const res = utils.formatDateForDisplay(date);
    expect(res).toEqual('April 04, 1989');
  });

  it('should clean put object', () => {
    const validAttributes = ['hotdog', 'burger'];
    const putObj = {
      hotdog: 'yes',
      burger: 'yup',
      sushi: 'nope',
    };
    const res = utils.cleanPutObject(putObj, validAttributes);
    expect(res).toEqual({
      hotdog: 'yes',
      burger: 'yup',
    });
  });

  it('should show object is not empty', () => {
    const res = utils.isObjEmpty({ notEmpty: 'its not!' });
    expect(res).toEqual(false);
  });

  it('should show object is empty', () => {
    const res = utils.isObjEmpty({});
    expect(res).toEqual(true);
  });

  it('should make first char upper case', () => {
    const res = utils.upperCaseFirstChar('string');
    expect(res).toEqual('String');
  });

  it('should set last version date', () => {
    const obj = {
      updateDate: new Date(1989, 3, 5),
    };
    const res = utils.setLastVersionDate(obj);
    expect(res.lastVersionDate).toEqual(new Date(1989, 3, 5));
  });

  it('should set display date', () => {
    const obj = { hotdog: new Date("1989-04-05T12:00:00.000+08:00") };
    const res = utils.setDisplayDate(obj, 'hotdog');
    expect(res.hotdogDisplay).toEqual('April 04, 1989');
  });
});
