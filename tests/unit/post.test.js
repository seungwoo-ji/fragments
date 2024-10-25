const request = require('supertest');

const app = require('../../src/app');
const hash = require('../../src/hash');

describe('POST /v1/fragments', () => {
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

  test('unsupported types are denied ', async () => {
    const res = await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .set('content-type', 'application/msword')
      .send('hello');

    expect(res.statusCode).toBe(415);
    expect(res.body.status).toBe('error');
  });

  test('authenticated user can create a plain text fragment', async () => {
    const res = await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .set('content-type', 'text/plain')
      .send('hello');

    expect(res.statusCode).toBe(201);
    expect(res.body.status).toBe('ok');
  });

  test('authenticated user can create a markdown text fragment', async () => {
    const res = await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .set('content-type', 'text/markdown')
      .send('#Hello');

    expect(res.statusCode).toBe(201);
    expect(res.body.status).toBe('ok');
  });

  test('authenticated user can create a html text fragment', async () => {
    const res = await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .set('content-type', 'text/html')
      .send('<h1>Hello</h1>');

    expect(res.statusCode).toBe(201);
    expect(res.body.status).toBe('ok');
  });

  test('authenticated user can create a json fragment', async () => {
    const res = await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .set('content-type', 'application/json')
      .send({ content: 'hello' });

    expect(res.statusCode).toBe(201);
    expect(res.body.status).toBe('ok');
  });

  test('authenticated user can create a png fragment', async () => {
    const res = await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .set('content-type', 'image/png')
      .send(Buffer.from('Image'));

    expect(res.statusCode).toBe(201);
    expect(res.body.status).toBe('ok');
  });

  test('authenticated user can create a jpeg fragment', async () => {
    const res = await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .set('content-type', 'image/jpeg')
      .send(Buffer.from('Image'));

    expect(res.statusCode).toBe(201);
    expect(res.body.status).toBe('ok');
  });

  test('authenticated user can create a webp fragment', async () => {
    const res = await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .set('content-type', 'image/webp')
      .send(Buffer.from('Image'));

    expect(res.statusCode).toBe(201);
    expect(res.body.status).toBe('ok');
  });

  test('authenticated user can create a gif fragment', async () => {
    const res = await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .set('content-type', 'image/gif')
      .send(Buffer.from('Image'));

    expect(res.statusCode).toBe(201);
    expect(res.body.status).toBe('ok');
  });

  test('response includes necessary properties', async () => {
    const res = await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .set('content-type', 'text/plain')
      .send('hello');

    expect(res.body.fragment).toHaveProperty('id');
    expect(res.body.fragment).toHaveProperty('ownerId');
    expect(res.body.fragment).toHaveProperty('created');
    expect(res.body.fragment).toHaveProperty('updated');
    expect(res.body.fragment).toHaveProperty('type');
    expect(res.body.fragment).toHaveProperty('size');
  });

  test('response includes correct values', async () => {
    const res = await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .set('content-type', 'text/plain')
      .send('hello');

    expect(res.body.fragment).toHaveProperty('ownerId', hash('user1@email.com'));
    expect(res.body.fragment).toHaveProperty('type', 'text/plain');
    expect(res.body.fragment).toHaveProperty('size', 5);
  });

  test('response includes a Location header with a URL to GET the fragment', async () => {
    const res = await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .set('content-type', 'text/plain')
      .send('hello');

    expect(res.header.location).toBe(`${process.env.API_URL}/v1/fragments/${res.body.fragment.id}`);
  });
});
