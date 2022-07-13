const request = require('supertest');

const app = require('../../src/app');

describe('GET /v1/fragments/:id/info', () => {
  test('unauthenticated requests are denied', async () => {
    const postRes = await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .set('content-type', 'text/plain')
      .send('hello');

    const getRes = await request(app).get(`/v1/fragments/${postRes.body.fragment.id}/info`);

    expect(getRes.statusCode).toBe(401);
  });

  test('incorrect credentials are denied', async () => {
    const postRes = await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .set('content-type', 'text/plain')
      .send('hello');

    const getRes = await request(app)
      .get(`/v1/fragments/${postRes.body.fragment.id}/info`)
      .auth('invalid@email.com', 'incorrect_password');

    expect(getRes.statusCode).toBe(401);
  });

  test('invalid fragment id is denied ', async () => {
    const getRes = await request(app)
      .get('/v1/fragments/invalid-id/info')
      .auth('user1@email.com', 'password1');

    expect(getRes.statusCode).toBe(404);
    expect(getRes.body.status).toBe('error');
  });

  test('authenticated user can get a fragment metadata', async () => {
    const user = ['user1@email.com', 'password1'];

    const postRes = await request(app)
      .post('/v1/fragments')
      .auth(...user)
      .set('content-type', 'text/plain')
      .send('hello');

    const getRes = await request(app)
      .get(`/v1/fragments/${postRes.body.fragment.id}/info`)
      .auth(...user);

    expect(getRes.status).toBe(200);
    expect(getRes.body).toEqual(postRes.body);
  });

  test('response includes necessary properties', async () => {
    const user = ['user1@email.com', 'password1'];

    const postRes = await request(app)
      .post('/v1/fragments')
      .auth(...user)
      .set('content-type', 'text/plain')
      .send('hello');

    const getRes = await request(app)
      .get(`/v1/fragments/${postRes.body.fragment.id}/info`)
      .auth(...user);

    expect(getRes.body.fragment).toHaveProperty('id');
    expect(getRes.body.fragment).toHaveProperty('ownerId');
    expect(getRes.body.fragment).toHaveProperty('created');
    expect(getRes.body.fragment).toHaveProperty('updated');
    expect(getRes.body.fragment).toHaveProperty('type');
    expect(getRes.body.fragment).toHaveProperty('size');
  });
});
