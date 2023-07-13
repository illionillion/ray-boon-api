const { Configuration, OpenAIApi } = require("openai");

const generateExample = async (apiKey, wordLang, wordName, wordMean, sentenceDiff) => {
  const configuration = new Configuration({
    apiKey: apiKey,
  });
  const openai = new OpenAIApi(configuration);
  const completion = await openai.createChatCompletion({
    model: "gpt-3.5-turbo",
    messages: [{ role: "user", content: `Create one simple short example sentence in the ${wordLang} language, always using the word ${wordName}, which means ${wordMean}. Include a Japanese translation at the end, and use only words of the same difficulty level as ${wordName} (${sentenceDiff} difficulty).` }],
  });
  const response = { "content": completion.data.choices[0].message.content };
  return response;
};

module.exports = generateExample;