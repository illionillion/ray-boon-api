const express = require('express');
const router = express.Router();
const Joi = require('joi');
const ExpressError = require('./utils/ExpressError')
const generateExample = require("./generateExample");

const timeout = require('connect-timeout');

// タイムアウトを処理するミドルウェア
const timeoutHandler = (req, res, next) => {
  if (!req.timedout) {
    next();
  }
};

// タイムアウトを処理するミドルウェアを使えるようにする
router.use(timeout('5s'));
router.use(timeoutHandler);

// 例文を生成するための必須パラメータに対するバリデーション
const generateExampleSchema = Joi.object({
  apiKey: Joi.string().max(100).required().messages({
    'string.empty': 'APIキーは必須です',
    'any.required': 'APIキーは必須です',
    'string.max': 'APIキーは100文字以下にしてください'
  }),
  wordLang: Joi.string().max(15).required().messages({
    'string.empty': '言語は必須です',
    'any.required': '言語は必須です',
    'string.max': '言語は15文字以下にしてください'
  }),
  wordName: Joi.string().max(195).required().messages({
    'string.empty': '単語名は必須です',
    'any.required': '単語名は必須です',
    'string.max': '単語名は195文字以下にしてください'
  }),
  wordMean: Joi.string().max(100).required().messages({
    'string.empty': '意味は必須です',
    'any.required': '意味は必須です',
    'string.max': '意味は100文字以下にしてください'
  }),
});

// 例文を生成するための必須パラメータに対するバリデーション(V1)
const generateExampleSchemaV1 = Joi.object({
  apiKey: Joi.string().max(100).required().messages({
    'string.empty': 'APIキーは必須です',
    'any.required': 'APIキーは必須です',
    'string.max': 'APIキーは100文字以下にしてください'
  }),
  wordLang: Joi.string().max(15).required().messages({
    'string.empty': '言語は必須です',
    'any.required': '言語は必須です',
    'string.max': '言語は15文字以下にしてください'
  }),
  wordName: Joi.string().max(195).required().messages({
    'string.empty': '単語名は必須です',
    'any.required': '単語名は必須です',
    'string.max': '単語名は195文字以下にしてください'
  }),
  wordMean: Joi.string().max(100).required().messages({
    'string.empty': '意味は必須です',
    'any.required': '意味は必須です',
    'string.max': '意味は100文字以下にしてください'
  }),
  sentenceDiff: Joi.string().valid('easy', 'normal', 'hard').required().messages({
    'string.empty': '難易度は必須です',
    'any.required': '難易度は必須です',
    'any.only': '難易度はeasy, normal, hardのいずれかにしてください'
  }),
});

router.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
})

router.get('/privacy-policy', (req, res) => {
  res.sendFile(__dirname + '/public/PrivacyPolicy.html');
})

router.get('/how-to-setting', (req, res) => {
  res.sendFile(__dirname + '/public/HowToSetting.html');
})

router.post('/timeout', async (req, res) => {
  await new Promise((resolve) => setTimeout(resolve, 6000));
});

router.post('/api', async (req, res, next) => {
  try {
    await generateExampleSchema.validateAsync(req.body, { abortEarly: false });
    const { apiKey, wordLang, wordName, wordMean } = req.body;
    const result = await generateExample(apiKey, wordLang, wordName, wordMean);
    res.status(200).json(result);
  } catch (error) {
    // パラメータが不足している場合のエラー処理
    if (error.isJoi) {
      const validationErrorMsg = error.details.map(details => details.message).join(',');
      return next(new ExpressError(validationErrorMsg, 400));
      // ChatGPTのAPIキーが間違っている場合のエラー処理
    } else if (error.message === 'Request failed with status code 401') {
      return next(new ExpressError('APIキーが間違っています', 401));
      // ChatGPTのAPIキー無料枠が期限切れの場合のエラー処理
    } else if (error.message = 'Request failed with status code 429') {
      return next(new ExpressError('APIキーの無料枠が期限切れです', 401));
    } else {
      return next(error);
    }
  }
});

router.post('/api/v1', async (req, res, next) => {
  try {
    await generateExampleSchemaV1.validateAsync(req.body, { abortEarly: false });
    const { apiKey, wordLang, wordName, wordMean, sentenceDiff } = req.body;
    const result = await generateExample(apiKey, wordLang, wordName, wordMean, sentenceDiff);
    res.status(200).json(result);
  } catch (error) {
    // パラメータが不足している場合のエラー処理
    if (error.isJoi) {
      const validationErrorMsg = error.details.map(details => details.message).join(',');
      return next(new ExpressError(validationErrorMsg, 400));
      // ChatGPTのAPIキーが間違っている場合のエラー処理
    } else if (error.message === 'Request failed with status code 401') {
      return next(new ExpressError('APIキーが間違っています', 401));
      // ChatGPTのAPIキー無料枠が期限切れの場合のエラー処理
    } else if (error.message = 'Request failed with status code 429') {
      return next(new ExpressError('APIキーの無料枠が期限切れです', 401));
    } else {
      return next(error);
    }
  }
});

// エラーハンドリングのミドルウェア
const errorHandler = (err, req, res, next) => {
  let { statusCode = 500, message = '問題が発生しました' } = err;

  // タイムアウトエラーの処理を設定
  if (req.timedout) {
    statusCode = 503;
    message = 'タイムアウトしました';
  }

  res.status(statusCode).json({ "status": statusCode, "message": message });
};

// エラーハンドリングのミドルウェアを使えるようにする
router.use(errorHandler);

module.exports = router;