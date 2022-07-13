// tests/unit/get.test.js

const request = require('supertest');

const app = require('../../src/app');

describe('GET /v1/fragments', () => {
  // If the request is missing the Authorization header, it should be forbidden
  test('unauthenticated requests are denied', () => request(app).get('/v1/fragments').expect(401));

  // If the wrong username/password pair are used (no such user), it should be forbidden
  test('incorrect credentials are denied', () =>
    request(app).get('/v1/fragments').auth('invalid@email.com', 'incorrect_password').expect(401));

  // Using a valid username/password pair should give a success result with a .fragments array
  test('authenticated users get a fragments array', async () => {
    const res = await request(app).get('/v1/fragments').auth('user1@email.com', 'password1');
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(Array.isArray(res.body.fragments)).toBe(true);
  });

  test('authenticated user with no fragments get a empty fragments array', async () => {
    const res = await request(app).get('/v1/fragments').auth('user1@email.com', 'password1');
    expect(res.body.fragments).toEqual([]);
  });

  test('authenticated user gets a fragments array of ids', async () => {
    const user = ['user1@email.com', 'password1'];

    const postOne = await request(app)
      .post('/v1/fragments')
      .auth(...user)
      .set('content-type', 'text/plain')
      .send('hello');

    const postTwo = await request(app)
      .post('/v1/fragments')
      .auth(...user)
      .set('content-type', 'text/plain')
      .send('world');

    const res = await request(app)
      .get('/v1/fragments')
      .auth(...user);

    expect(res.body.fragments).toEqual([postOne.body.fragment.id, postTwo.body.fragment.id]);
  });

  test("authenticated user gets a fragments array with fragments' metadata", async () => {
    const user = ['user2@email.com', 'password2'];

    const postOne = await request(app)
      .post('/v1/fragments')
      .auth(...user)
      .set('content-type', 'text/plain')
      .send('hello');

    const res = await request(app)
      .get('/v1/fragments?expand=1')
      .auth(...user);

    expect(res.body.fragments).toEqual([postOne.body.fragment]);
  });
});
