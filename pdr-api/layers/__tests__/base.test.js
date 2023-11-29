// For testing purposes, layers should be required from the /.aws-sam/build/ folder to have access to their own node modules.

describe('Base Layer Tests', () => {
  const OLD_ENV = process.env;
  beforeEach(async () => {
    jest.resetModules();
    process.env = { ...OLD_ENV }; // Make a copy of environment
  });

  afterAll(() => {
    process.env = OLD_ENV; // Restore old environment
  });

  test('Test sendResponse', async () => {
    // Success
    const layer = require('../../.aws-sam/build/BaseLayer/base');
    const response = layer.sendResponse(200, { items: [1, 2, 3] }, 'Success', null);
    expect(response.statusCode).toBe(200);
    expect(JSON.parse(response.body)).toEqual({
      code: 200,
      data: { items: [1, 2, 3] },
      msg: 'Success',
      error: null
    })

    //Error with extra items.
    const error = layer.sendResponse(400, [], 'Error', { error: 'error' }, null, { other1: 1, other2: 2 });
    expect(error.statusCode).toBe(400);
    expect(JSON.parse(error.body)).toEqual({
      code: 400,
      data: [],
      msg: 'Error',
      error: { error: 'error' },
      context: null,
      other1: 1,
      other2: 2
    })
  });

  test('Check warmup', async () => {
    const layer = require('../../.aws-sam/build/BaseLayer/base');
    expect(await layer.checkWarmup({})).toBeFalsy();
    expect(await layer.checkWarmup({ warmup: false })).toBeFalsy();
    expect(await layer.checkWarmup({ warmup: true })).toBeTruthy();
  })
});
