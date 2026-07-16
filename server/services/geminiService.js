const keys = [
  "AQ.Ab8RN6LV_0oJWqSmfx2gUTngYWkK7KwBvH1FqBBs_BgHU-jXtA"
];

async function getActiveKeys() {
  try {
    const Setting = require('../models/Setting');
    const dbSetting = await Setting.findOne({ key: 'gemini_api_keys' });
    if (dbSetting && dbSetting.value && dbSetting.value.trim().length > 0) {
      const parsedKeys = dbSetting.value
        .split(/[\n,]+/)
        .map(k => k.trim())
        .filter(k => k.length > 0);
      if (parsedKeys.length > 0) {
        return parsedKeys;
      }
    }
  } catch (err) {
    console.error("Failed to fetch API keys from DB settings, falling back to hardcoded list.", err);
  }
  return keys;
}

// Rotating helper to query Gemini
async function queryGemini(payload) {
  const activeKeys = await getActiveKeys();
  const startIdx = Math.floor(Math.random() * activeKeys.length);
  let lastErrorText = 'No response';
  let lastStatus = 0;
  
  for (let i = 0; i < activeKeys.length; i++) {
    const idx = (startIdx + i) % activeKeys.length;
    const key = activeKeys[idx];
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${key}`;
    
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      
      const status = response.status;
      if (status === 200) {
        const data = await response.json();
        return data;
      }
      
      lastStatus = status;
      const responseText = await response.text();
      lastErrorText = responseText;
      try {
        const parsedErr = JSON.parse(responseText);
        if (parsedErr?.error?.message) {
          lastErrorText = parsedErr.error.message;
        }
      } catch (pe) {}
      
      console.warn(`Gemini API key at index ${idx} returned status ${status}: ${lastErrorText}. Retrying...`);
    } catch (err) {
      lastErrorText = err.message;
      console.error(`Gemini connection error at index ${idx}:`, err);
    }
  }
  
  throw new Error(`সকল Gemini API কী ব্যবহার সীমা শেষ (Status ${lastStatus}). Admin Panel থেকে নতুন API কী যোগ করুন।`);
}

async function queryOpenAiGateway(prompt) {
  const OpenAI = require('openai');
  const apiKey = process.env.AI_GATEWAY_API_KEY || "vck_3EOrYhxEMgdCHIaaIv8WKSmOnYBqIM0xgrbJOEBzXRLAgOtDLl3G07Nd";
  const openai = new OpenAI({
    apiKey: apiKey,
    baseURL: 'https://ai-gateway.vercel.sh/v1',
  });

  let model = 'openai/gpt-5.5';
  try {
    const response = await openai.chat.completions.create({
      model: model,
      messages: [{ role: 'user', content: prompt }],
    });
    return response.choices[0].message.content;
  } catch (err) {
    console.warn(`GPT-5.5 failed: ${err.message}. Trying GPT-4o fallback...`);
    const response = await openai.chat.completions.create({
      model: 'openai/gpt-4o',
      messages: [{ role: 'user', content: prompt }],
    });
    return response.choices[0].message.content;
  }
}

async function researchAndWriteArticle() {
  const prompt = `
You are a highly professional, independent investigative journalist reporting on the latest news in Bangladesh.
Your task is to search the web for the absolute latest, breaking, or highly significant news updates in Bangladesh for today.
Read the search results to understand the factual events (dates, locations, figures, key people, event details).

CRITICAL PLAGIARISM AND COPYING PREVENTION RULE:
- Do NOT copy sentences, phrases, or full text from any source found on the web.
- You must synthesize the information and rewrite the entire report completely in your own words.
- Present it in a highly professional, journalistic Bengali news portal tone.
- Ensure the article is completely original and would pass any editorial plagiarism checker.

Write the response in STRICT JSON format with the following keys:
- "title": A compelling, original headline in Bengali.
- "subtitle": A brief subheadline in Bengali.
- "summary": A short 2-sentence summary of the news in Bengali.
- "content": The main news article in Bengali, formatted in clean HTML paragraphs (e.g. <p>...</p>). The article should be at least 4 paragraphs long, detailed, factual, and written in standard journalistic Bengali.
- "category": The category name matching exactly one of these (choose the most relevant one): "Bangladesh", "Politics", "Economy", "Sports", "Entertainment", "Technology".
- "tags": An array of 3-5 relevant Bengali tags (e.g., ["ঢাকা", "খেলাধুলা", "আজকের সংবাদ"]).

Provide the response in raw JSON format. Do not wrap in markdown \`\`\`json blocks.
`;

  const payload = {
    contents: [{
      parts: [{
        text: prompt
      }]
    }],
    tools: [{
      googleSearch: {} // Search Grounding enabled
    }],
    generationConfig: {
      responseMimeType: "application/json"
    }
  };

  let jsonText = '';
  try {
    const responseData = await queryGemini(payload);
    jsonText = responseData.candidates[0].content.parts[0].text;
  } catch (geminiError) {
    console.warn('Gemini query failed, falling back to Vercel AI Gateway (OpenAI)... Error:', geminiError.message);
    try {
      jsonText = await queryOpenAiGateway(prompt);
      // Clean markdown code blocks if the model wrapped it in ```json ... ```
      jsonText = jsonText.replace(/^```json\s*/i, '').replace(/```\s*$/, '').trim();
    } catch (openaiError) {
      console.error('OpenAI Gateway fallback failed too:', openaiError.message);
      throw new Error(`AI Research failed: Gemini is exhausted (${geminiError.message}) and Vercel AI Gateway failed (${openaiError.message})`);
    }
  }
  
  try {
    return JSON.parse(jsonText);
  } catch (err) {
    console.error("Failed to parse AI JSON output:", jsonText);
    throw new Error("Invalid JSON returned from AI generation API");
  }
}

module.exports = {
  researchAndWriteArticle
};
