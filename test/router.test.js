const request = require('supertest');
const express = require('express');
const router = require('../router');
require('dotenv').config();
const apiKey = process.env.OPENAI_API_KEY;
const apiKeyExpired = process.env.OPENAI_API_KEY_EXPIRED;

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

  test('GET bad path request should return not found error ', async () => {
    const response = await request(app).get('/badpath');
    expect(response.statusCode).toBe(404);
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
    expect(response.body).toHaveProperty('example_sentence');
    expect(response.body).toHaveProperty('example_sentence_translated');
    expect(response.body).toHaveProperty('example_sentence_language_code');
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

  test('POST /api with API key free quota has expired should return unauthorized error', async () => {
    const requestBody = {
      apiKey: apiKeyExpired,
      wordLang: 'English',
      wordName: 'example',
      wordMean: 'an instance serving to illustrate a rule or method'
    };

    const response = await request(app)
      .post('/api')
      .send(requestBody)
      .set('Accept', 'application/json');

    expect(response.statusCode).toBe(401);
    expect(response.body).toEqual({ "status": 401, "message": "APIキーの無料枠が期限切れです" });
    expect(response.headers['content-type']).toMatch('application/json');
  });

  test('POST /api with apiKey exceeding maximum length should return validation error', async () => {
    const requestBody = {
      apiKey: 'a'.repeat(101),
      wordLang: 'English',
      wordName: 'example',
      wordMean: 'an instance serving to illustrate a rule or method'
    };
  
    const response = await request(app)
      .post('/api')
      .send(requestBody)
      .set('Accept', 'application/json');
  
    expect(response.statusCode).toBe(400);
    expect(response.body).toEqual({ "status": 400, "message": "APIキーは100文字以下にしてください" });
    expect(response.headers['content-type']).toMatch('application/json');
  });


  test('POST /api with wordLang exceeding maximum length should return validation error', async () => {
    const requestBody = {
      apiKey: apiKey,
      wordLang: 'a'.repeat(16),
      wordName: 'example',
      wordMean: 'an instance serving to illustrate a rule or method'
    };
  
    const response = await request(app)
      .post('/api')
      .send(requestBody)
      .set('Accept', 'application/json');
  
    expect(response.statusCode).toBe(400);
    expect(response.body).toEqual({ "status": 400, "message": "言語は15文字以下にしてください" });
    expect(response.headers['content-type']).toMatch('application/json');
  });

  test('POST /api with wordName exceeding maximum length should return validation error', async () => {
    const requestBody = {
      apiKey: apiKey,
      wordLang: 'English',
      wordName: 'a'.repeat(196),
      wordMean: 'an instance serving to illustrate a rule or method'
    };
  
    const response = await request(app)
      .post('/api')
      .send(requestBody)
      .set('Accept', 'application/json');
  
    expect(response.statusCode).toBe(400);
    expect(response.body).toEqual({ "status": 400, "message": "単語名は195文字以下にしてください" });
    expect(response.headers['content-type']).toMatch('application/json');
  });

  test('POST /api with wordMean exceeding maximum length should return validation error', async () => {
    const requestBody = {
      apiKey: apiKey,
      wordLang: 'English',
      wordName: 'example',
      wordMean: 'a'.repeat(101)
    };
  
    const response = await request(app)
      .post('/api')
      .send(requestBody)
      .set('Accept', 'application/json');
  
    expect(response.statusCode).toBe(400);
    expect(response.body).toEqual({ "status": 400, "message": "意味は100文字以下にしてください" });
    expect(response.headers['content-type']).toMatch('application/json');
  });

  test('POST /api with missing apiKey should return validation error', async () => {
    const requestBody = {
      apiKey: '',
      wordLang: 'English',
      wordName: 'example',
      wordMean: 'an instance serving to illustrate a rule or method'
    };

    const response = await request(app)
      .post('/api')
      .send(requestBody)
      .set('Accept', 'application/json');

    expect(response.statusCode).toBe(400);
    expect(response.body).toEqual({ "status": 400, "message": "APIキーは必須です" });
    expect(response.headers['content-type']).toMatch('application/json');
  });

  test('POST /api with missing wordLanng should return validation error', async () => {
    const requestBody = {
      apiKey: apiKey,
      wordLang: '',
      wordName: 'example',
      wordMean: 'an instance serving to illustrate a rule or method'
    };

    const response = await request(app)
      .post('/api')
      .send(requestBody)
      .set('Accept', 'application/json');

    expect(response.statusCode).toBe(400);
    expect(response.body).toEqual({ "status": 400, "message": "言語は必須です" });
    expect(response.headers['content-type']).toMatch('application/json');
  });

  test('POST /api with missing wordName should return validation error', async () => {
    const requestBody = {
      apiKey: apiKey,
      wordLang: 'English',
      wordName: '',
      wordMean: 'an instance serving to illustrate a rule or method'
    };

    const response = await request(app)
      .post('/api')
      .send(requestBody)
      .set('Accept', 'application/json');

    expect(response.statusCode).toBe(400);
    expect(response.body).toEqual({ "status": 400, "message": "単語名は必須です" });
    expect(response.headers['content-type']).toMatch('application/json');
  });

  test('POST /api with missing wordMean should return validation error', async () => {
    const requestBody = {
      apiKey: apiKey,
      wordLang: 'English',
      wordName: 'example',
      wordMean: ''
    };

    const response = await request(app)
      .post('/api')
      .send(requestBody)
      .set('Accept', 'application/json');

    expect(response.statusCode).toBe(400);
    expect(response.body).toEqual({ "status": 400, "message": "意味は必須です" });
    expect(response.headers['content-type']).toMatch('application/json');
  });

  test('POST /api with missing apiKey and wordLang should return validation error', async () => {
    const requestBody = {
      apiKey: '',
      wordLang: '',
      wordName: 'example',
      wordMean: 'an instance serving to illustrate a rule or method'
    };

    const response = await request(app)
      .post('/api')
      .send(requestBody)
      .set('Accept', 'application/json');

    expect(response.statusCode).toBe(400);
    expect(response.body).toEqual({ "status": 400, "message": "APIキーは必須です,言語は必須です" });
    expect(response.headers['content-type']).toMatch('application/json');
  });

  test('POST /api with missing apiKey and wordName should return validation error', async () => {
    const requestBody = {
      apiKey: '',
      wordLang: 'English',
      wordName: '',
      wordMean: 'an instance serving to illustrate a rule or method'
    };

    const response = await request(app)
      .post('/api')
      .send(requestBody)
      .set('Accept', 'application/json');

    expect(response.statusCode).toBe(400);
    expect(response.body).toEqual({ "status": 400, "message": "APIキーは必須です,単語名は必須です" });
    expect(response.headers['content-type']).toMatch('application/json');
  });

  test('POST /api with missing apiKey and wordMean should return validation error', async () => {
    const requestBody = {
      apiKey: '',
      wordLang: 'English',
      wordName: 'example',
      wordMean: ''
    };

    const response = await request(app)
      .post('/api')
      .send(requestBody)
      .set('Accept', 'application/json');

    expect(response.statusCode).toBe(400);
    expect(response.body).toEqual({ "status": 400, "message": "APIキーは必須です,意味は必須です" });
    expect(response.headers['content-type']).toMatch('application/json');
  });

  test('POST /api with missing wordLang and wordName should return validation error', async () => {
    const requestBody = {
      apiKey: apiKey,
      wordLang: '',
      wordName: '',
      wordMean: 'an instance serving to illustrate a rule or method'
    };

    const response = await request(app)
      .post('/api')
      .send(requestBody)
      .set('Accept', 'application/json');

    expect(response.statusCode).toBe(400);
    expect(response.body).toEqual({ "status": 400, "message": "言語は必須です,単語名は必須です" });
    expect(response.headers['content-type']).toMatch('application/json');
  });

  test('POST /api with missing wordName and wordMean should return validation error', async () => {
    const requestBody = {
      apiKey: apiKey,
      wordLang: 'English',
      wordName: '',
      wordMean: ''
    };

    const response = await request(app)
      .post('/api')
      .send(requestBody)
      .set('Accept', 'application/json');

    expect(response.statusCode).toBe(400);
    expect(response.body).toEqual({ "status": 400, "message": "単語名は必須です,意味は必須です" });
    expect(response.headers['content-type']).toMatch('application/json');
  });

  test('POST /api with missing apiKey and wordLang and wordName should return validation error', async () => {
    const requestBody = {
      apiKey: '',
      wordLang: '',
      wordName: '',
      wordMean: 'an instance serving to illustrate a rule or method'
    };

    const response = await request(app)
      .post('/api')
      .send(requestBody)
      .set('Accept', 'application/json');

    expect(response.statusCode).toBe(400);
    expect(response.body).toEqual({ "status": 400, "message": "APIキーは必須です,言語は必須です,単語名は必須です" });
    expect(response.headers['content-type']).toMatch('application/json');
  });

  test('POST /api with missing apiKey and wordLang and wordMean should return validation error', async () => {
    const requestBody = {
      apiKey: '',
      wordLang: '',
      wordName: 'example',
      wordMean: ''
    };

    const response = await request(app)
      .post('/api')
      .send(requestBody)
      .set('Accept', 'application/json');

    expect(response.statusCode).toBe(400);
    expect(response.body).toEqual({ "status": 400, "message": "APIキーは必須です,言語は必須です,意味は必須です" });
    expect(response.headers['content-type']).toMatch('application/json');
  });

  test('POST /api with missing apiKey and wordLang and wordMean should return validation error', async () => {
    const requestBody = {
      apiKey: '',
      wordLang: 'English',
      wordName: '',
      wordMean: ''
    };

    const response = await request(app)
      .post('/api')
      .send(requestBody)
      .set('Accept', 'application/json');

    expect(response.statusCode).toBe(400);
    expect(response.body).toEqual({ "status": 400, "message": "APIキーは必須です,単語名は必須です,意味は必須です" });
    expect(response.headers['content-type']).toMatch('application/json');
  });

  test('POST /api with missing wordLang and wordName and wordMean should return validation error', async () => {
    const requestBody = {
      apiKey: apiKey,
      wordLang: '',
      wordName: '',
      wordMean: ''
    };

    const response = await request(app)
      .post('/api')
      .send(requestBody)
      .set('Accept', 'application/json');

    expect(response.statusCode).toBe(400);
    expect(response.body).toEqual({ "status": 400, "message": "言語は必須です,単語名は必須です,意味は必須です" });
    expect(response.headers['content-type']).toMatch('application/json');
  });

  test('POST /api with missing apiKey wordLang and wordName and wordMean should return validation error', async () => {
    const requestBody = {
      apiKey: '',
      wordLang: '',
      wordName: '',
      wordMean: ''
    };

    const response = await request(app)
      .post('/api')
      .send(requestBody)
      .set('Accept', 'application/json');

    expect(response.statusCode).toBe(400);
    expect(response.body).toEqual({ "status": 400, "message": "APIキーは必須です,言語は必須です,単語名は必須です,意味は必須です" });
    expect(response.headers['content-type']).toMatch('application/json');
  });
});