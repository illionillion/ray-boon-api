const express = require('express');
const router = express.Router();
const Joi = require('joi');
const ExpressError = require('./utils/ExpressErorr')
const generateExample = require("./generateExample");
const catchAsync = require("./utils/catchAsync")
router.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
})

router.get('/PrivacyPolicy', (req, res) => {
  res.sendFile(__dirname + '/public/PrivacyPolicy.html');
})

router.get('/how-to-setting', (req, res) => {
  res.sendFile(__dirname + '/public/HowToSetting.html');
})

router.post('/api', catchAsync(async (req, res) => {
  const generateExampleSchema = Joi.object({
    apiKey: Joi.string().required(),
    wordLang: Joi.string().required(),
    wordName: Joi.string().required(),
    wordMean: Joi.string().required()
  });
  const { error } = generateExampleSchema.validate(req.body);
  if (error) {
    const msg = error.details.map(details => details.message).join(',');
    throw new ExpressError(msg, 400);
  }
  const { apiKey, wordLang, wordName, wordMean } = req.body;
  const result = await generateExample(apiKey, wordLang, wordName, wordMean);
  res.json(result);
}))

// 不正なパスがアクセスされた時の処理
router.all('*', (req, res, next) => {
  next(new ExpressError('ページが見つかりませんでした', 404));
});

// エラーハンドリング
router.use((err, req, res, next) => {
  const {statusCode = 500, message = '問題が起きました'} = err;
  res.status(statusCode).json({"status": statusCode, "message": message})
})

module.exports = router;