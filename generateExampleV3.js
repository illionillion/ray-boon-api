const { Configuration, OpenAIApi } = require("openai");

const generateExampleV3 = async (apiKey, wordLang, wordName, wordMean, sentenceDiff) => {
  const configuration = new Configuration({
    apiKey: apiKey,
  });
  const openai = new OpenAIApi(configuration);
  const completion = await openai.createChatCompletion({
    model: "gpt-3.5-turbo-0613",
    messages: [{ role: "user", content: `${wordLang}で${wordMean}という意味の${wordName}という単語があります。この単語を使った例文を${sentenceDiff}くらいの難易度で3つ作成し、そのそれぞれの例文を日本語訳した文を作成してください。また、${wordLang}の言語コードを出力してください。` }],
    functions: [
      {
        "name": "generate_example",
        "description": "generate example",
        "parameters": {
          "type": "object",
          "properties": {
            "example_sentence": {
              "type": "array",
              "description": "Array of generated exapmle sentense",
              "items": {
                "type": "string",
                "description": "item of generated exapmle sentense translated into Japanese"
              }
            },

            "example_sentence_translated": {
              "type": "array",
              "description": "Array of generated example sentence translated into Japanese",
              "items": {
                "type": "string",
                "description": "item of generated exapmle sentense translated into Japanese"
              }
            },

            "example_sentence_language_code": {
              "type": "string",
              "description": "language_code of generated example sentences"
            }
          }
        },
        required: ["example_sentence", "example_sentence_translated", "example_sentence_language_code"]
      }
    ],
    function_call: "auto"
  });

  const response = JSON.parse(completion.data.choices[0].message.function_call.arguments);
  return response;
};

module.exports = generateExampleV3;