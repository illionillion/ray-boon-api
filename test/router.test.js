const request = require('supertest');
const express = require('express');
const router = require('../router');
require('dotenv').config();
const apiKey = process.env.OPENAI_API_KEY;

const app = express();
app.use(express.json());
app.use('/', router);

describe('API Tests', () => {
  test('GET / should return index.html', async () => {
    const response = await request(app).get('/');
    expect(response.statusCode).toBe(200);
    expect(response.headers['content-type']).toMatch('text/html');
  });

  test('GET /privacy-policy should return PrivacyPolicy.html', async () => {
    const response = await request(app).get('/privacy-policy');
    expect(response.statusCode).toBe(200);
    expect(response.headers['content-type']).toMatch('text/html');
  });

  test('GET /how-to-setting should return HowToSetting.html', async () => {
    const response = await request(app).get('/how-to-setting');
    expect(response.statusCode).toBe(200);
    expect(response.headers['content-type']).toMatch('text/html');
  });

  test('POST /timeout should return timeout error', async () => {
    const response = await request(app).post('/timeout')
    expect(response.statusCode).toBe(503);
    expect(response.body).toEqual({ "status": 503, "message": "タイムアウトしました" });
  }, 10000);

  test('POST /api with valid data should return result', async () => {
    const requestBody = {
      apiKey: apiKey,
      wordLang: 'English',
      wordName: 'example',
      wordMean: 'an instance serving to illustrate a rule or method'
    };

    const response = await request(app)
      .post('/api')
      .send(requestBody)
      .set('Accept', 'application/json');

    expect(response.statusCode).toBe(200);
    expect(response.headers['content-type']).toMatch('application/json');
    expect(response.body).toHaveProperty('content');
  });

  test('POST /api with invalid API key should return unauthorized error', async () => {
    const requestBody = {
      apiKey: 'invalid-api-key',
      wordLang: 'English',
      wordName: 'example',
      wordMean: 'an instance serving to illustrate a rule or method'
    };

    const response = await request(app)
      .post('/api')
      .send(requestBody)
      .set('Accept', 'application/json');

    expect(response.statusCode).toBe(401);
    expect(response.body).toEqual({ "status": 401, "message": "APIキーが間違っています" });
    expect(response.headers['content-type']).toMatch('application/json');
  });
  
  test('POST /api with missing required parameter should return validation error', async () => {
    const requestBody = {
      apiKey: apiKey,
      wordLang: 'English',
    };

    const response = await request(app)
      .post('/api')
      .send(requestBody)
      .set('Accept', 'application/json');

    expect(response.statusCode).toBe(400);
    expect(response.body).toEqual({ "status": 400, "message": "単語名は必須です,意味は必須です" });
    expect(response.headers['content-type']).toMatch('application/json');
  });
});