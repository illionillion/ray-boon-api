const express = require('express');
const router = express.Router();
const Joi = require('joi');
const ExpressError = require('./utils/ExpressErorr')
const generateExample = require("./generateExample");
const catchAsync = require("./utils/catchAsync")

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

router.post('/api', catchAsync(async (req, res) => {
  const { error } = generateExampleSchema.validate(req.body);
  if (error) {
    const msg = error.details.map(details => details.message).join(',');
    throw new ExpressError(msg, 400);
  }
  const { apiKey, wordLang, wordName, wordMean } = req.body;
  const result = await generateExample(apiKey, wordLang, wordName, wordMean);
  res.status(200).json(result);
}))

// 不正なパスがアクセスされた時の処理
router.all('*', (req, res, next) => {
  next(new ExpressError('ページが見つかりませんでした', 404));
});

// エラーハンドリング
router.use((err, req, res, next) => {
  let {statusCode = 500, message = 'タイムアウトしました'} = err;

  // APIキーが間違っている場合の処理
  if (err instanceof Error && err.message === 'Request failed with status code 401') {
    statusCode = 401;
    message = 'APIキーが間違っています';
  }

  res.status(statusCode).json({"status": statusCode, "message": message})
})

module.exports = router;
