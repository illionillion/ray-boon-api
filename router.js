const express = require('express');
const router = express.Router();
const Joi = require('joi');
const ExpressError = require('./utils/ExpressErorr')
const generateExample = require("./generateExample");

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
  wordMean: Joi.string().max(99).required().messages({
    'string.empty': '意味は必須です',
    'any.required': '意味は必須です',
    'string.max': '単語名は100文字以下にしてください'
  })
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
      next(new ExpressError(validationErrorMsg, 400));
    // ChatGPTのAPIキーが間違っている場合のエラー処理
    } else if (error.message === 'Request failed with status code 401') {
      next(new ExpressError('APIキーが間違っています', 401));
    } else if (error.message === 'Request failed with status code 400'){
      next(new ExpressError('タイムアウトしました', 500));
    } else {
      next(error);
    }
  }
});

// 不正なパスがアクセスされた時の処理
router.all('*', (req, res) => {
  res.status(404).sendFile(__dirname + '/public/BadPathError.html');
});

// エラーハンドリング
router.use((err, req, res, next) => {
  let {statusCode = 500, message = '問題が発生しました'} = err;
  res.status(statusCode).json({"status": statusCode, "message": message})
})

module.exports = router;