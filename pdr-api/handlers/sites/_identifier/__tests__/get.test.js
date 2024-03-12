const { createDB } = require('../../../../__tests__/settings');
const { MockData } = require('../../../../__tests__/mock_data');

const data = new MockData;
let dbClient;

describe('Site GET', () => {
    const OLD_ENV = process.env;
    beforeEach(async () => {
        jest.resetModules();
        dbClient = await createDB(data.allData());
        process.env = { ...OLD_ENV }; // Make a copy of environment
    });

    afterAll(() => {
        process.env = OLD_ENV; // Restore old environment
    });

    test('Get site with identifier', async () => {
        const lambda = require('../GET/index');
        const event = {
            httpMethod: 'GET',
            pathParameters: {
                identifier: '1::Site::1',
            },
            requestContext: {
                authorizer: {
                    isAdmin: true
                }
            }
        }
        const res = await lambda.handler(event, null);
        const body = JSON.parse(res.body);
        expect(res.statusCode).toBe(200);
        expect(body.data.items.length).toBe(2);
    });

    test('Get current site via SK', async () => {
        const lambda = require('../GET/index');
        const event = {
            httpMethod: 'GET',
            pathParameters: {
                identifier: '1::Site::1',
            },
            queryStringParameters: {
                sk: 'Details'
            },
            requestContext: {
                authorizer: {
                    isAdmin: true
                }
            }
        }
        const res = await lambda.handler(event, null);
        const body = JSON.parse(res.body);
        expect(res.statusCode).toBe(200);
        expect(body.data.items.length).toBe(1);
        expect(body.data.items[0].status).toBe('established');
    });

    test('Get current site via status filter', async () => {
        const lambda = require('../GET/index');
        const event = {
            httpMethod: 'GET',
            pathParameters: {
                identifier: '1::Site::1',
            },
            queryStringParameters: {
                status: 'established'
            },
            requestContext: {
                authorizer: {
                    isAdmin: true
                }
            }
        }
        const res = await lambda.handler(event, null);
        const body = JSON.parse(res.body);
        expect(res.statusCode).toBe(200);
        expect(body.data.items.length).toBe(1);
        expect(body.data.items[0].status).toBe('established');
    });

    test('Get historical site via status filter', async () => {
        const lambda = require('../GET/index');
        const event = {
            httpMethod: 'GET',
            pathParameters: {
                identifier: '1::Site::1',
            },
            queryStringParameters: {
                status: 'historical'
            },
            requestContext: {
                authorizer: {
                    isAdmin: true
                }
            }
        }
        const res = await lambda.handler(event, null);
        const body = JSON.parse(res.body);
        expect(res.statusCode).toBe(200);
        expect(body.data.items.length).toBe(1);
        expect(body.data.items[0].status).toBe('historical');
    });

    test('Get 400 when public user gets site under pending park', async () => {
        const lambda = require('../GET/index');
        const event = {
            httpMethod: 'GET',
            pathParameters: {
                identifier: '3',
                siteIdentifier: '1'
            },
            requestContext: {
                authorizer: {
                    isAdmin: false
                }
            }
        }
        // public not allowed to see status = pending
        const res = await lambda.handler(event, null);
        expect(res.statusCode).toBe(400);
    });
});