const express = require('express');
const router = express.Router();

const { Configuration, OpenAIApi } = require("openai");

router.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
})

router.get('/PrivacyPolicy', (req, res) => {
  res.sendFile(__dirname + '/public/PrivacyPolicy.html');
})

router.get('/how-to-setting', (req, res) => {
  res.sendFile(__dirname + '/public/HowToSetting.html');
})

const generateExample = async (apiKey, wordLang, wordName, wordMean) => {
  const configuration = new Configuration({
    apiKey: apiKey,
  });
  const openai = new OpenAIApi(configuration);
  const completion = await openai.createChatCompletion({
    model: "gpt-3.5-turbo",
    messages: [{ role: "user", content: `Create one simple short example sentence in the ${wordLang} language, always using the word ${wordName}, which means ${wordMean}. Include a Japanese translation at the end, and use only words of the same difficulty level as ${wordName}.` }],
  });
  const response = { "content": completion.data.choices[0].message.content };
  return response;
}

router.post('/api', async (req, res) => {
  const apiKey = req.body.apiKey;
  const wordLang = req.body.wordLang;
  const wordName = req.body.wordName;
  const wordMean = req.body.wordMean;
  const result = await generateExample(apiKey, wordLang, wordName, wordMean);
  res.json(result);
})

module.exports = router;