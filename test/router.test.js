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
});
