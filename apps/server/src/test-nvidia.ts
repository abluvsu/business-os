import OpenAI from "openai";
const client = new OpenAI({
  apiKey:
    "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",
  baseURL: "https://integrate.api.nvidia.com/v1",
});
client.chat.completions
  .create({
    model: "meta/llama-3.1-405b-instruct",
    messages: [{ role: "user", content: "hi" }],
  })
  .then((c) => console.log(c.choices[0].message.content))
  .catch(console.error);
