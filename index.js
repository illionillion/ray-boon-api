const express = require('express')
const app = express()

// jsonを使えるようにする
app.use(express.json())
app.use(express.urlencoded({ extended: true }));

const { Configuration, OpenAIApi } = require("openai");

app.get('/PrivacyPolicy', (req, res) => {
  res.sendFile(__dirname + '/public/PrivacyPolicy.html');
})

app.post('/api', async (req, res) => {
  const apiKey = req.body.apiKey;
  const wordLang = req.body.wordLang;
  const wordName = req.body.wordName;
  const wordMean = req.body.wordMean;
  const configuration = new Configuration({
    apiKey: apiKey,
  });
  const openai = new OpenAIApi(configuration);  
  const completion = await openai.createChatCompletion({
    model: "gpt-3.5-turbo",
    messages: [{role: "user", content: `${wordLang}言語の${wordName}という${wordMean}という意味の単語を用いて簡単な例文を作成してください`}],
  });
  res.json({"content": completion.data.choices[0].message.content});
})

app.listen(process.env.PORT || 3000);