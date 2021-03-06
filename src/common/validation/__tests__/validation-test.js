/**
 * Copyright (с) 2015-present, SoftIndex LLC.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import ValidationError from '../ValidationErrors';
import boolean from '../rules/boolean';
import date from '../rules/date';
import enumValidator from '../rules/enum';
import float from '../rules/float';
import notNull from '../rules/notNull';
import number from '../rules/number';
import regExp from '../rules/regExp';
import set from '../rules/set';
import Validator from '../Validator';

describe('ValidationError', () => {
  describe('Check "static createWithError" method', () => {
    it('Should create ValidationErrors instance with one error', () => {
      const validationError = ValidationError.createWithError('test', 'error');
      expect(validationError.toJSON()).toEqual({test: [{message: 'error'}]});
    });
  });

  it('add', () => {
    const validationError = ValidationError.createFromJSON({test: ['error']});
    validationError.add('test2', 'error2');
    expect(validationError.toJSON()).toEqual({test: [{message: 'error'}], test2: [{message: 'error2'}]});
  });

  it('hasError', () => {
    const validationError = ValidationError.createFromJSON({test: ['error']});
    expect(validationError.hasError('test')).toBeTruthy();
  });

  it('getFieldErrorMessages', () => {
    const validationError = ValidationError.createFromJSON({test: ['error']});
    expect(validationError.getFieldErrorMessages('test')).toEqual(['error']);
  });

  it('getFailedFields', () => {
    const validationError = ValidationError.createFromJSON({test: ['error']});
    expect(validationError.getFailedFields()).toEqual(['test']);
  });

  it('isEmpty', () => {
    const validationError = ValidationError.createFromJSON({test: ['error']});
    expect(validationError.isEmpty()).not.toBeTruthy();
  });

  it('clearField', () => {
    const validationError = ValidationError.createFromJSON({test: ['error']});
    expect(validationError.clearField('test').toJSON()).toEqual({});
  });

  it('clear', () => {
    const validationError = ValidationError.createFromJSON({test: ['error']});
    expect(validationError.clear().toJSON()).toEqual({});
  });

  it('clone', () => {
    const validationError = ValidationError.createFromJSON({test: ['error']});
    expect(validationError.clone()).not.toBe(validationError);
    expect(validationError.clone().toJSON()).toEqual({test: [{message: 'error'}]});
  });

  it('merge', () => {
    const validationError = ValidationError.createFromJSON({test: ['error']});
    const errorToMerge = ValidationError.createFromJSON({test2: [{message: 'error2'}]});
    expect(validationError.merge(errorToMerge).toJSON())
      .toEqual({test: [{message: 'error'}], test2: [{message: 'error2'}]});
  });
});

describe('validators', () => {
  it('boolean', () => {
    const validator = boolean('err text');
    const validatorNotNull = boolean.notNull('err text');
    expect(validator(true)).toBeUndefined();
    expect(validator('rtrtr')).toBe('err text');
    expect(validatorNotNull(false)).toBeUndefined();
    expect(validatorNotNull(34)).toBe('err text');
    expect(validatorNotNull()).toBe('err text');
  });

  it('date', () => {
    const validator = date(0, 500000, 'err text');
    const validatorNotNull = date.notNull(0, 500000, 'err text');
    expect(validator(245545)).toBeUndefined();
    expect(validator('1979-12-31T23:10:00.000Z')).toBe('err text');
    expect(validatorNotNull('1970-01-01T01:00:00.000Z')).toBeUndefined();
    expect(validatorNotNull(600000)).toBe('err text');
    expect(validatorNotNull()).toBe('err text');
  });

  it('enum', () => {
    const validator = enumValidator(['a', 'b', 'c'], 'err text');
    const validatorNotNull = enumValidator.notNull(['a', 'b', 'c'], 'err text');
    expect(validator('a')).toBeUndefined();
    expect(validator('rtrtr')).toBe('err text');
    expect(validatorNotNull('b')).toBeUndefined();
    expect(validatorNotNull(34)).toBe('err text');
    expect(validatorNotNull()).toBe('err text');
  });

  it('float', () => {
    const validator = float(3, 10, 'err text');
    const validatorNotNull = float.notNull(3, 10, 'err text');
    expect(validator(4)).toBeUndefined();
    expect(validator('rtrtr')).toBe('err text');
    expect(validatorNotNull(7, 5)).toBeUndefined();
    expect(validatorNotNull(34)).toBe('err text');
    expect(validatorNotNull()).toBe('err text');
  });

  it('notNull', () => {
    const validator = notNull('err text');
    expect(validator(4)).toBeUndefined();
    expect(validator(null)).toBe('err text');
  });

  it('number', () => {
    const validator = number(3, 10, 'err text');
    const validatorNotNull = number.notNull(3, 10, 'err text');
    expect(validator(4)).toBeUndefined();
    expect(validator('rtrtr')).toBe('err text');
    expect(validatorNotNull(7)).toBeUndefined();
    expect(validatorNotNull(34, 5)).toBe('err text');
    expect(validatorNotNull()).toBe('err text');
  });

  it('regExp', () => {
    const validator = regExp(/abc/, 'err text');
    const validatorNotNull = regExp.notNull(/abc/, 'err text');
    expect(validator('abcd')).toBeUndefined();
    expect(validator('rtrtr')).toBe('err text');
    expect(validatorNotNull('abcd')).toBeUndefined();
    expect(validatorNotNull(34, 5)).toBe('err text');
    expect(validatorNotNull()).toBe('err text');
  });

  it('set', () => {
    const validator = set(['a', 'b', 'c'], 'err text');
    const validatorNotNull = set.notNull(['a', 'b', 'c'], 'err text');
    expect(validator(['a'])).toBeUndefined();
    expect(validator(['a', 'rtrtr'])).toBe('err text');
    expect(validatorNotNull(['b'])).toBeUndefined();
    expect(validatorNotNull(34)).toBe('err text');
    expect(validatorNotNull()).toBe('err text');
  });
});

describe('Validator', () => {
  const validatorBoolean = boolean('err text');
  let validator;
  beforeEach(() => {
    validator = new Validator();
  });

  it('field', async () => {
    validator.field('name', validatorBoolean);
    let result = await validator.isValidRecord({name: true});
    expect(result.toJSON()).toEqual({});
    result = await validator.isValidRecord({name: 6456});
    expect(result.toJSON()).toEqual({'name': [{message: 'err text'}]});
  });

  it('field', async () => {
    validator.field('name', validatorBoolean);
    let result = await validator.isValidRecord({name: true});
    expect(result.toJSON()).toEqual({});
    result = await validator.isValidRecord({name: 6456});
    expect(result.toJSON()).toEqual({'name': [{message: 'err text'}]});
  });
});
