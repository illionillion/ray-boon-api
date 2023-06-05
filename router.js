const express = require('express');
const router = express.Router();
const generateExample = require("./generateExample");

router.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
})

router.get('/PrivacyPolicy', (req, res) => {
  res.sendFile(__dirname + '/public/PrivacyPolicy.html');
})

router.get('/how-to-setting', (req, res) => {
  res.sendFile(__dirname + '/public/HowToSetting.html');
})

router.post('/api', async (req, res) => {
  const apiKey = req.body.apiKey;
  const wordLang = req.body.wordLang;
  const wordName = req.body.wordName;
  const wordMean = req.body.wordMean;
  const result = await generateExample(apiKey, wordLang, wordName, wordMean);
  res.json(result);
})

module.exports = router;