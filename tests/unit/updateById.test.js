const request = require('supertest');

const app = require('../../src/app');
const hash = require('../../src/hash');

describe('PUT /v1/fragments/:id', () => {
  test('unauthenticated requests are denied', async () => {
    const postRes = await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .set('content-type', 'text/plain')
      .send('hello');

    const putRes = await request(app)
      .put(`/v1/fragments/${postRes.body.fragment.id}`)
      .set('content-type', 'text/plain')
      .send('bye');

    expect(putRes.statusCode).toBe(401);
  });

  test('incorrect credentials are denied', async () => {
    const postRes = await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .set('content-type', 'text/plain')
      .send('hello');

    const putRes = await request(app)
      .put(`/v1/fragments/${postRes.body.fragment.id}`)
      .auth('invalid@email.com', 'incorrect_password')
      .set('content-type', 'text/plain')
      .send('bye');

    expect(putRes.statusCode).toBe(401);
  });

  test('invalid fragment id is denied ', async () => {
    const putRes = await request(app)
      .put('/v1/fragments/invalid-id')
      .auth('user1@email.com', 'password1')
      .set('content-type', 'text/plain')
      .send('bye');

    expect(putRes.statusCode).toBe(404);
    expect(putRes.body.status).toBe('error');
  });

  test('unsupported types are denied ', async () => {
    const user = ['user1@email.com', 'password1'];

    const postRes = await request(app)
      .post('/v1/fragments')
      .auth(...user)
      .set('content-type', 'text/plain')
      .send('hello');

    const putRes = await request(app)
      .put(`/v1/fragments/${postRes.body.fragment.id}`)
      .auth(...user)
      .set('content-type', 'application/msword')
      .send('bye');

    expect(putRes.statusCode).toBe(415);
    expect(putRes.body.status).toBe('error');
  });

  test('updating unmatched types are denied ', async () => {
    const user = ['user1@email.com', 'password1'];

    const postRes = await request(app)
      .post('/v1/fragments')
      .auth(...user)
      .set('content-type', 'text/plain')
      .send('hello');

    const putRes = await request(app)
      .put(`/v1/fragments/${postRes.body.fragment.id}`)
      .auth(...user)
      .set('content-type', 'text/markdown')
      .send('bye');

    expect(putRes.statusCode).toBe(400);
    expect(putRes.body.status).toBe('error');
  });

  test('authenticated user can update a fragment by its id', async () => {
    const user = ['user1@email.com', 'password1'];

    const postRes = await request(app)
      .post('/v1/fragments')
      .auth(...user)
      .set('content-type', 'text/plain')
      .send('hello');

    const putRes = await request(app)
      .put(`/v1/fragments/${postRes.body.fragment.id}`)
      .auth(...user)
      .set('content-type', 'text/plain')
      .send('bye');

    expect(putRes.status).toBe(200);
    expect(putRes.body.status).toBe('ok');
  });

  test('response includes necessary properties', async () => {
    const user = ['user1@email.com', 'password1'];

    const postRes = await request(app)
      .post('/v1/fragments')
      .auth(...user)
      .set('content-type', 'text/plain')
      .send('hello');

    const putRes = await request(app)
      .put(`/v1/fragments/${postRes.body.fragment.id}`)
      .auth(...user)
      .set('content-type', 'text/plain')
      .send('bye');

    expect(putRes.body.fragment).toHaveProperty('id');
    expect(putRes.body.fragment).toHaveProperty('ownerId');
    expect(putRes.body.fragment).toHaveProperty('created');
    expect(putRes.body.fragment).toHaveProperty('updated');
    expect(putRes.body.fragment).toHaveProperty('type');
    expect(putRes.body.fragment).toHaveProperty('size');
  });

  test('response includes correct values', async () => {
    const user = ['user1@email.com', 'password1'];

    const postRes = await request(app)
      .post('/v1/fragments')
      .auth(...user)
      .set('content-type', 'text/plain')
      .send('hello');

    const putRes = await request(app)
      .put(`/v1/fragments/${postRes.body.fragment.id}`)
      .auth(...user)
      .set('content-type', 'text/plain')
      .send('bye');

    expect(putRes.body.fragment).toHaveProperty('id', postRes.body.fragment.id);
    expect(putRes.body.fragment.created).toBe(postRes.body.fragment.created);
    expect(Date.parse(putRes.body.fragment.updated)).toBeGreaterThan(
      Date.parse(postRes.body.fragment.updated)
    );
    expect(putRes.body.fragment).toHaveProperty('ownerId', hash('user1@email.com'));
    expect(putRes.body.fragment).toHaveProperty('type', 'text/plain');
    expect(putRes.body.fragment).toHaveProperty('size', 3);
  });
});
