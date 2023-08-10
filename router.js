const express = require('express');
const router = express.Router();
const swaggerJSDoc = require('swagger-jsdoc');
const Joi = require('joi');
const ExpressError = require('./utils/ExpressError');
const generateExample = require("./generateExample");

const options = {
  swaggerDefinition: {
    openapi : '3.0.3',
    info: {
      title: 'RAYBOON API',
      version: '1.0.0',
      description: 'RAYBOONのAPIリファレンスです。'
    },
    servers: [
      {
        url: 'https://ray-boon-api.vercel.app',
        description: '本番環境サーバー',
      },
      {
        url: 'http://localhost:3000',
        description: '開発環境サーバー',
      },
    ],
  },
  apis: ['./router.js'],
}

const swaggerSpec = swaggerJSDoc(options);

router.get('/api-docs.json', (req, res) => {
  res.setHeader('Content-Type','application/json');
  res.send(swaggerSpec);
});

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

router.post('/timeout', async (req, res) => {
  await new Promise((resolve) => setTimeout(resolve, 6000));
});

/**
 * @swagger
 * /api:
 *   post:
 *     tags:
 *       -  例文生成
 *     summary: 単語から例文を生成する
 *     description: 単語学習のための例文を生成する
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *                 apiKey:
 *                   type: string
 *                   description: OpenAIのAPIキー
 *                   example: OpenAIのAPIキー
 *                 wordLang:
 *                    type: string
 *                    description: 言語名
 *                    example: 中国語
 *                 wordName:
 *                     type: string
 *                     description: 単語名
 *                     example: 你好
 *                 wordMean:
 *                      type: string
 *                      description: 意味
 *                      example: こんにちは
 *     responses:
 *       200:
 *         description: 成功時のレスポンス
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 content:
 *                   example: 你好，我喜欢吃日本料理。こんにちは、私は日本料理が好きです。
 *       400:
 *         description: パラメータが不足している場合のレスポンス
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   example: 400
 *                 message:
 *                   example: パラメータは必須です
 *       401:
 *         description: OpenAIのAPIキーが間違っているか、期限切れの場合のレスポンス
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   example: 401
 *                 message:
 *                   example: APIキーが間違っています
 *       500:
 *         description: サーバーで問題が発生した場合のレスポンス
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   example: 500
 *                 message:
 *                   example: 問題が発生しました
 *       503:
 *         description: タイムアウトした場合のレスポンス
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   example: 503
 *                 message:
 *                   example: タイムアウトしました
 */
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
    } else if (error.message = 'Request failed with status code 429'){
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