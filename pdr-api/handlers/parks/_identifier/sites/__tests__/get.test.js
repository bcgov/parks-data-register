const { createDB } = require('../../../../../__tests__/settings');
const { MockData } = require('../../../../../__tests__/mock_data');

const data = new MockData;
let dbClient;

describe('Park Site GET', () => {
    const OLD_ENV = process.env;
    beforeEach(async () => {
        jest.resetModules();
        dbClient = await createDB(data.allData());
        process.env = { ...OLD_ENV }; // Make a copy of environment
    });

    afterAll(() => {
        process.env = OLD_ENV; // Restore old environment
    });

    test('Get all sites for park identifier', async () => {
        const lambda = require('../GET/index');
        const event = {
            httpMethod: 'GET',
            pathParameters: {
                identifier: '1'
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
    });


    test('Get all sites for park identifier as a public user', async () => {
        const lambda = require('../GET/index');
        const event = {
            httpMethod: 'GET',
            pathParameters: {
                identifier: '3'
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