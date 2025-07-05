require('dotenv').config();
const { OpenAI } = require('openai');
const logger = require('../Utils/logger');

const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

exports.generateTitle = async (description) => {
  try {
    const completion = await client.chat.completions.create({
        model: "gpt-4.1-mini",
        messages: [
            {
                role: "system",
                content: [
                    "You are a title generator for bug reports.",
                    "Detect the input language from the description and generate the title in that same language.",
                    "Keep the title extremely short (only a few words), clear, and precise.",
                    "It must faithfully summarize the description in just those few words."
                ].join(" ")
            },
            {
                role: "user",
                content: `Bug description:\n\n${description}`
            }
        ],
        temperature: 0.2,
        max_tokens: 16
    });

    return completion.choices[0].message.content.trim();
  } catch (err) {
    logger.error("[TITLE] Generation failed:", err);
    throw new Error("Title generation failed");
  }
};
