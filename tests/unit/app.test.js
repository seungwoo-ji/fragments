const request = require('supertest');

const app = require('../../src/app');

describe('Error Handling Middlewares', () => {
  test('requesting not-found resources should return HTTP 404 response', async () => {
    const res = await request(app).get('/invalid-url');
    expect(res.statusCode).toBe(404);
    expect(res.body.status).toBe('error');
    expect(res.body.error.message).toBe('not found');
    expect(res.body.error.code).toBe(404);
  });
});
