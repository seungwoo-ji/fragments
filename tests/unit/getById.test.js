const request = require('supertest');

const app = require('../../src/app');

describe('GET /v1/fragments/:id', () => {
  test('unauthenticated requests are denied', async () => {
    const res = await request(app)
      .post('/v1/fragments')
      .set('content-type', 'text/plain')
      .send('hello');

    expect(res.statusCode).toBe(401);
  });

  test('incorrect credentials are denied', async () => {
    const res = await request(app)
      .post('/v1/fragments')
      .auth('invalid@email.com', 'incorrect_password')
      .set('content-type', 'text/plain')
      .send('hello');

    expect(res.statusCode).toBe(401);
  });

  test('unknown type conversion is denied ', async () => {
    const user = ['user1@email.com', 'password1'];

    const postRes = await request(app)
      .post('/v1/fragments')
      .auth(...user)
      .set('content-type', 'text/plain')
      .send('hello');

    const getRes = await request(app)
      .get(`/v1/fragments/${postRes.body.fragment.id}.pdf`)
      .auth(...user);

    expect(getRes.statusCode).toBe(415);
    expect(getRes.body.status).toBe('error');
  });

  test('unsupported type conversion is denied ', async () => {
    const user = ['user1@email.com', 'password1'];

    const postRes = await request(app)
      .post('/v1/fragments')
      .auth(...user)
      .set('content-type', 'text/plain')
      .send('hello');

    const getRes = await request(app)
      .get(`/v1/fragments/${postRes.body.fragment.id}.md`)
      .auth(...user);

    expect(getRes.statusCode).toBe(415);
    expect(getRes.body.status).toBe('error');
  });

  test('invalid fragment id is denied ', async () => {
    const user = ['user1@email.com', 'password1'];

    const getRes = await request(app)
      .get('/v1/fragments/invalid-id')
      .auth(...user);

    expect(getRes.statusCode).toBe(404);
    expect(getRes.body.status).toBe('error');
  });

  test('authenticated user can get a plain text fragment with extension', async () => {
    const user = ['user1@email.com', 'password1'];

    const postRes = await request(app)
      .post('/v1/fragments')
      .auth(...user)
      .set('content-type', 'text/plain')
      .send('hello');

    const getRes = await request(app)
      .get(`/v1/fragments/${postRes.body.fragment.id}.txt`)
      .auth(...user);

    expect(getRes.text).toBe('hello');
  });

  test('authenticated user can get a plain text fragment without extension', async () => {
    const user = ['user1@email.com', 'password1'];

    const postRes = await request(app)
      .post('/v1/fragments')
      .auth(...user)
      .set('content-type', 'text/plain')
      .send('hello');

    const getRes = await request(app)
      .get(`/v1/fragments/${postRes.body.fragment.id}`)
      .auth(...user);

    expect(getRes.text).toBe('hello');
  });

  test('authenticated user can get a plain text fragment', async () => {
    const user = ['user1@email.com', 'password1'];

    const postRes = await request(app)
      .post('/v1/fragments')
      .auth(...user)
      .set('content-type', 'text/plain')
      .send('hello');

    const getRes = await request(app)
      .get(`/v1/fragments/${postRes.body.fragment.id}.txt`)
      .auth(...user);

    expect(getRes.header).toHaveProperty('content-length', '5');
    expect(getRes.header).toHaveProperty('content-type', 'text/plain; charset=utf-8');
  });
});
