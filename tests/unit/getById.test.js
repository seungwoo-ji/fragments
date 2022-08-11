const request = require('supertest');
const path = require('path');
const fs = require('fs');

const app = require('../../src/app');

const pngImage = fs.readFileSync(path.resolve(__dirname, '../images/png-image.png'));
const jpegImage = fs.readFileSync(path.resolve(__dirname, '../images/jpeg-image.jpeg'));
const webpImage = fs.readFileSync(path.resolve(__dirname, '../images/webp-image.webp'));
const gifImage = fs.readFileSync(path.resolve(__dirname, '../images/gif-image.gif'));

describe('GET /v1/fragments/:id', () => {
  test('unauthenticated requests are denied', async () => {
    const postRes = await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .set('content-type', 'text/plain')
      .send('hello');

    const getRes = await request(app).get(`/v1/fragments/${postRes.body.fragment.id}`);

    expect(getRes.statusCode).toBe(401);
  });

  test('incorrect credentials are denied', async () => {
    const postRes = await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .set('content-type', 'text/plain')
      .send('hello');

    const getRes = await request(app)
      .get(`/v1/fragments/${postRes.body.fragment.id}`)
      .auth('invalid@email.com', 'incorrect_password');

    expect(getRes.statusCode).toBe(401);
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

  test('returns with the expected Content-Type header', async () => {
    const user = ['user1@email.com', 'password1'];

    const postRes = await request(app)
      .post('/v1/fragments')
      .auth(...user)
      .set('content-type', 'text/plain')
      .send('hello');

    const getRes = await request(app)
      .get(`/v1/fragments/${postRes.body.fragment.id}.txt`)
      .auth(...user);

    expect(getRes.header).toHaveProperty('content-type', 'text/plain; charset=utf-8');
  });

  test('returns with the expected Content-Length header', async () => {
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

    expect(getRes.status).toBe(200);
    expect(getRes.text).toBe('hello');
  });

  test('authenticated user can convert a plain text fragment into text', async () => {
    const user = ['user1@email.com', 'password1'];

    const postRes = await request(app)
      .post('/v1/fragments')
      .auth(...user)
      .set('content-type', 'text/plain')
      .send('hello');

    const getRes = await request(app)
      .get(`/v1/fragments/${postRes.body.fragment.id}.txt`)
      .auth(...user);

    expect(getRes.status).toBe(200);
    expect(getRes.text).toBe('hello');
  });

  test('authenticated user can get a markdown fragment without extension', async () => {
    const user = ['user1@email.com', 'password1'];

    const postRes = await request(app)
      .post('/v1/fragments')
      .auth(...user)
      .set('content-type', 'text/markdown')
      .send('# Hello');

    const getRes = await request(app)
      .get(`/v1/fragments/${postRes.body.fragment.id}`)
      .auth(...user);

    expect(getRes.status).toBe(200);
    expect(getRes.text).toBe('# Hello');
  });

  test('authenticated user can convert a markdown fragment into markdown', async () => {
    const user = ['user1@email.com', 'password1'];

    const postRes = await request(app)
      .post('/v1/fragments')
      .auth(...user)
      .set('content-type', 'text/markdown')
      .send('# Hello');

    const getRes = await request(app)
      .get(`/v1/fragments/${postRes.body.fragment.id}.md`)
      .auth(...user);

    expect(getRes.status).toBe(200);
    expect(getRes.text).toBe('# Hello');
  });

  test('authenticated user can convert a markdown fragment into html', async () => {
    const user = ['user1@email.com', 'password1'];

    const postRes = await request(app)
      .post('/v1/fragments')
      .auth(...user)
      .set('content-type', 'text/markdown')
      .send('# Hello');

    const getRes = await request(app)
      .get(`/v1/fragments/${postRes.body.fragment.id}.html`)
      .auth(...user);

    expect(getRes.status).toBe(200);
    expect(getRes.text).toBe('<h1>Hello</h1>\n');
  });

  test('authenticated user can convert a markdown fragment into text', async () => {
    const user = ['user1@email.com', 'password1'];

    const postRes = await request(app)
      .post('/v1/fragments')
      .auth(...user)
      .set('content-type', 'text/markdown')
      .send('# Hello');

    const getRes = await request(app)
      .get(`/v1/fragments/${postRes.body.fragment.id}.txt`)
      .auth(...user);

    expect(getRes.status).toBe(200);
    expect(getRes.text).toBe('# Hello');
  });

  test('authenticated user can get a png fragment without extension', async () => {
    const user = ['user1@email.com', 'password1'];

    const postRes = await request(app)
      .post('/v1/fragments')
      .auth(...user)
      .set('content-type', 'image/png')
      .send(pngImage);

    const getRes = await request(app)
      .get(`/v1/fragments/${postRes.body.fragment.id}`)
      .auth(...user);

    expect(getRes.status).toBe(200);
    expect(getRes.body).toEqual(pngImage);
  });

  test('authenticated user can convert a png fragment into png', async () => {
    const user = ['user1@email.com', 'password1'];

    const postRes = await request(app)
      .post('/v1/fragments')
      .auth(...user)
      .set('content-type', 'image/png')
      .send(pngImage);

    const getRes = await request(app)
      .get(`/v1/fragments/${postRes.body.fragment.id}.png`)
      .auth(...user);

    expect(getRes.status).toBe(200);
    expect(getRes.body).toEqual(pngImage);
  });

  test('authenticated user can convert a png fragment into jpeg', async () => {
    const user = ['user1@email.com', 'password1'];

    const postRes = await request(app)
      .post('/v1/fragments')
      .auth(...user)
      .set('content-type', 'image/png')
      .send(pngImage);

    const getRes = await request(app)
      .get(`/v1/fragments/${postRes.body.fragment.id}.jpg`)
      .auth(...user);

    expect(getRes.status).toBe(200);
    expect(getRes.body).not.toEqual(pngImage);
  });

  test('authenticated user can convert a png fragment into webp', async () => {
    const user = ['user1@email.com', 'password1'];

    const postRes = await request(app)
      .post('/v1/fragments')
      .auth(...user)
      .set('content-type', 'image/png')
      .send(pngImage);

    const getRes = await request(app)
      .get(`/v1/fragments/${postRes.body.fragment.id}.webp`)
      .auth(...user);

    expect(getRes.status).toBe(200);
    expect(getRes.body).not.toEqual(pngImage);
  });

  test('authenticated user can convert a png fragment into gif', async () => {
    const user = ['user1@email.com', 'password1'];

    const postRes = await request(app)
      .post('/v1/fragments')
      .auth(...user)
      .set('content-type', 'image/png')
      .send(pngImage);

    const getRes = await request(app)
      .get(`/v1/fragments/${postRes.body.fragment.id}.gif`)
      .auth(...user);

    expect(getRes.status).toBe(200);
    expect(getRes.body).not.toEqual(pngImage);
  });

  test('authenticated user can get a jpeg fragment without extension', async () => {
    const user = ['user1@email.com', 'password1'];

    const postRes = await request(app)
      .post('/v1/fragments')
      .auth(...user)
      .set('content-type', 'image/jpeg')
      .send(jpegImage);

    const getRes = await request(app)
      .get(`/v1/fragments/${postRes.body.fragment.id}`)
      .auth(...user);

    expect(getRes.status).toBe(200);
    expect(getRes.body).toEqual(jpegImage);
  });

  test('authenticated user can convert a jpeg fragment into jpeg', async () => {
    const user = ['user1@email.com', 'password1'];

    const postRes = await request(app)
      .post('/v1/fragments')
      .auth(...user)
      .set('content-type', 'image/jpeg')
      .send(jpegImage);

    const getRes = await request(app)
      .get(`/v1/fragments/${postRes.body.fragment.id}.jpeg`)
      .auth(...user);

    expect(getRes.status).toBe(200);
    expect(getRes.body).toEqual(jpegImage);
  });

  test('authenticated user can convert a jpeg fragment into png', async () => {
    const user = ['user1@email.com', 'password1'];

    const postRes = await request(app)
      .post('/v1/fragments')
      .auth(...user)
      .set('content-type', 'image/jpeg')
      .send(jpegImage);

    const getRes = await request(app)
      .get(`/v1/fragments/${postRes.body.fragment.id}.png`)
      .auth(...user);

    expect(getRes.status).toBe(200);
    expect(getRes.body).not.toEqual(jpegImage);
  });

  test('authenticated user can convert a jpeg fragment into webp', async () => {
    const user = ['user1@email.com', 'password1'];

    const postRes = await request(app)
      .post('/v1/fragments')
      .auth(...user)
      .set('content-type', 'image/jpeg')
      .send(jpegImage);

    const getRes = await request(app)
      .get(`/v1/fragments/${postRes.body.fragment.id}.webp`)
      .auth(...user);

    expect(getRes.status).toBe(200);
    expect(getRes.body).not.toEqual(jpegImage);
  });

  test('authenticated user can convert a jpeg fragment into gif', async () => {
    const user = ['user1@email.com', 'password1'];

    const postRes = await request(app)
      .post('/v1/fragments')
      .auth(...user)
      .set('content-type', 'image/jpeg')
      .send(jpegImage);

    const getRes = await request(app)
      .get(`/v1/fragments/${postRes.body.fragment.id}.gif`)
      .auth(...user);

    expect(getRes.status).toBe(200);
    expect(getRes.body).not.toEqual(jpegImage);
  });

  test('authenticated user can get a webp fragment without extension', async () => {
    const user = ['user1@email.com', 'password1'];

    const postRes = await request(app)
      .post('/v1/fragments')
      .auth(...user)
      .set('content-type', 'image/webp')
      .send(webpImage);

    const getRes = await request(app)
      .get(`/v1/fragments/${postRes.body.fragment.id}`)
      .auth(...user);

    expect(getRes.status).toBe(200);
    expect(getRes.body).toEqual(webpImage);
  });

  test('authenticated user can convert a webp fragment into webp', async () => {
    const user = ['user1@email.com', 'password1'];

    const postRes = await request(app)
      .post('/v1/fragments')
      .auth(...user)
      .set('content-type', 'image/webp')
      .send(webpImage);

    const getRes = await request(app)
      .get(`/v1/fragments/${postRes.body.fragment.id}.webp`)
      .auth(...user);

    expect(getRes.status).toBe(200);
    expect(getRes.body).toEqual(webpImage);
  });

  test('authenticated user can convert a webp fragment into png', async () => {
    const user = ['user1@email.com', 'password1'];

    const postRes = await request(app)
      .post('/v1/fragments')
      .auth(...user)
      .set('content-type', 'image/webp')
      .send(webpImage);

    const getRes = await request(app)
      .get(`/v1/fragments/${postRes.body.fragment.id}.png`)
      .auth(...user);

    expect(getRes.status).toBe(200);
    expect(getRes.body).not.toEqual(webpImage);
  });

  test('authenticated user can convert a webp fragment into jpeg', async () => {
    const user = ['user1@email.com', 'password1'];

    const postRes = await request(app)
      .post('/v1/fragments')
      .auth(...user)
      .set('content-type', 'image/webp')
      .send(webpImage);

    const getRes = await request(app)
      .get(`/v1/fragments/${postRes.body.fragment.id}.jpeg`)
      .auth(...user);

    expect(getRes.status).toBe(200);
    expect(getRes.body).not.toEqual(webpImage);
  });

  test('authenticated user can convert a webp fragment into gif', async () => {
    const user = ['user1@email.com', 'password1'];

    const postRes = await request(app)
      .post('/v1/fragments')
      .auth(...user)
      .set('content-type', 'image/webp')
      .send(webpImage);

    const getRes = await request(app)
      .get(`/v1/fragments/${postRes.body.fragment.id}.gif`)
      .auth(...user);

    expect(getRes.status).toBe(200);
    expect(getRes.body).not.toEqual(webpImage);
  });

  test('authenticated user can get a gif fragment without extension', async () => {
    const user = ['user1@email.com', 'password1'];

    const postRes = await request(app)
      .post('/v1/fragments')
      .auth(...user)
      .set('content-type', 'image/gif')
      .send(gifImage);

    const getRes = await request(app)
      .get(`/v1/fragments/${postRes.body.fragment.id}`)
      .auth(...user);

    expect(getRes.status).toBe(200);
    expect(getRes.body).toEqual(gifImage);
  });

  test('authenticated user can convert a gif fragment into gif', async () => {
    const user = ['user1@email.com', 'password1'];

    const postRes = await request(app)
      .post('/v1/fragments')
      .auth(...user)
      .set('content-type', 'image/gif')
      .send(gifImage);

    const getRes = await request(app)
      .get(`/v1/fragments/${postRes.body.fragment.id}`)
      .auth(...user);

    expect(getRes.status).toBe(200);
    expect(getRes.body).toEqual(gifImage);
  });

  test('authenticated user can convert a gif fragment into png', async () => {
    const user = ['user1@email.com', 'password1'];

    const postRes = await request(app)
      .post('/v1/fragments')
      .auth(...user)
      .set('content-type', 'image/gif')
      .send(gifImage);

    const getRes = await request(app)
      .get(`/v1/fragments/${postRes.body.fragment.id}.png`)
      .auth(...user);

    expect(getRes.status).toBe(200);
    expect(getRes.body).not.toEqual(gifImage);
  });

  test('authenticated user can convert a gif fragment into jpeg', async () => {
    const user = ['user1@email.com', 'password1'];

    const postRes = await request(app)
      .post('/v1/fragments')
      .auth(...user)
      .set('content-type', 'image/gif')
      .send(gifImage);

    const getRes = await request(app)
      .get(`/v1/fragments/${postRes.body.fragment.id}.jpeg`)
      .auth(...user);

    expect(getRes.status).toBe(200);
    expect(getRes.body).not.toEqual(gifImage);
  });

  test('authenticated user can convert a gif fragment into webp', async () => {
    const user = ['user1@email.com', 'password1'];

    const postRes = await request(app)
      .post('/v1/fragments')
      .auth(...user)
      .set('content-type', 'image/gif')
      .send(gifImage);

    const getRes = await request(app)
      .get(`/v1/fragments/${postRes.body.fragment.id}.webp`)
      .auth(...user);

    expect(getRes.status).toBe(200);
    expect(getRes.body).not.toEqual(gifImage);
  });
});
