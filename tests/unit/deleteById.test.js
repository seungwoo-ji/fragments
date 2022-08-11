const request = require('supertest');

const app = require('../../src/app');

describe('DELETE /v1/fragments/:id', () => {
  test('unauthenticated requests are denied', async () => {
    const postRes = await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .set('content-type', 'text/plain')
      .send('hello');

    const deleteRes = await request(app).delete(`/v1/fragments/${postRes.body.fragment.id}`);

    expect(deleteRes.statusCode).toBe(401);
  });

  test('incorrect credentials are denied', async () => {
    const postRes = await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .set('content-type', 'text/plain')
      .send('hello');

    const deleteRes = await request(app)
      .delete(`/v1/fragments/${postRes.body.fragment.id}`)
      .auth('invalid@email.com', 'incorrect_password');

    expect(deleteRes.statusCode).toBe(401);
  });

  test('invalid fragment id is denied ', async () => {
    const deleteRes = await request(app)
      .delete('/v1/fragments/invalid-id')
      .auth('user1@email.com', 'password1');

    expect(deleteRes.statusCode).toBe(404);
    expect(deleteRes.body.status).toBe('error');
  });

  test('authenticated user can delete a fragment by its id', async () => {
    const user = ['user1@email.com', 'password1'];

    const postRes = await request(app)
      .post('/v1/fragments')
      .auth(...user)
      .set('content-type', 'text/plain')
      .send('hello');

    const deleteRes = await request(app)
      .delete(`/v1/fragments/${postRes.body.fragment.id}`)
      .auth(...user);

    expect(deleteRes.status).toBe(200);
    expect(deleteRes.body.status).toBe('ok');
  });
});
