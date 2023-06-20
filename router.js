const express = require('express');
const router = express.Router();
const Joi = require('joi');
const ExpressError = require('./utils/ExpressErorr')
const generateExample = require("./generateExample");

// 例文を生成するための必須パラメータに対するバリデーション
const generateExampleSchema = Joi.object({
  apiKey: Joi.string().required(),
  wordLang: Joi.string().required(),
  wordName: Joi.string().required(),
  wordMean: Joi.string().required()
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
    } else {
      next(error);
    }
  }
})

// 不正なパスがアクセスされた時の処理
router.all('*', (req, res) => {
  res.status(404).sendFile(__dirname + '/public/BadPathError.html');
});

// エラーハンドリング
router.use((err, req, res, next) => {
  let {statusCode = 500, message = 'タイムアウトしました'} = err;
  res.status(statusCode).json({"status": statusCode, "message": message})
})

module.exports = router;
