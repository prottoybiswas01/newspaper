const keys = [
  "AQ.Ab8RN6I4gpEPPnEb7u3aVAeoKhIHt5JEEzvFgDuoYENiAppTAA",
  "AQ.Ab8RN6JP6wvHqeC37_4tXK_AVRCWzR24aP_dQ-KbRLaBCzcavA",
  "AQ.Ab8RN6IzEfpep7fOx2UWq3HQ7w0inm2-YVSd6rfVaUzqU2ldfQ",
  "AQ.Ab8RN6Jk_nvyoWTN9wj4BIsAlWL8HnCiUDPbj96RJvhgL_vBoQ",
  "AQ.Ab8RN6IBy0rtE2o8g464yvh6L74yVeBqpVXzwWwae58BfecZuw",
  "AQ.Ab8RN6LMe6DyvZjtouwlyBZyfbW3-s6Sx78mlK21gGgAqL3reA",
  "AQ.Ab8RN6JQzKlEGPGCasKoPrTTS00ru0kEd2sp1-eXTcMdVGxzsw",
  "AQ.Ab8RN6LwT7znPkhPsOyiEGNFbqjuqFhBYsOivH5C7m6pb5uMRw",
  "AQ.Ab8RN6Kg29L3yk-jwTXj9I9yjUih9tMKOGkV9-Qcu_65aHCb5Q",
  "AQ.Ab8RN6Ki-hK7GvOwUVQ0FA8BzhNWvkz05AoaLNVjgf3FwbeEng",
  "AQ.Ab8RN6J07YArRKyYZb0xFCGJigqvxlfsams7I5qTVEhk3wbFww",
  "AQ.Ab8RN6JV8qfZIrEAjJtFtNaCpFLVnMakjUu2FoEwrgWqKqfuKw",
  "AQ.Ab8RN6LpDhpQKWKy17htDj3JKIvy-dnd16aJTMBzAAXxTiq3Nw",
  "AQ.Ab8RN6L7zpWXuotj5aNjLUX6J25ywtwHvj9NKl-g-CHuaooJxA",
  "AQ.Ab8RN6JohLCOutH7oVrqGiGPLDZOI9edUnrlGdpcLYXIUkRgaw",
  "AQ.Ab8RN6LXcSyXAWejJIHomXoLSH2hzozwO1wsvApSH39SJjtjYA",
  "AQ.Ab8RN6LoiAd4Y_CUIMih4Od1IPkyKaLtJTo5fmKS50EVBPA9Hg",
  "AQ.Ab8RN6J1pMCEpkHfoW-U141KD3Ft29r42H0vkVcxY3XKfaiuGg",
  "AQ.Ab8RN6IsY2eWASvYllrdNOW0jCTuNaG3FCmLDA5wpe5YTS_lJA",
  "AQ.Ab8RN6K7gauJf_43sRaNF4PhhMbpu0QBSfRixiF3lxx89XfDbg",
  "AQ.Ab8RN6JixV3OQgFlkHeLF1J4qoVvquEKmu_Ope2RVA9Z0BW98Q",
  "AQ.Ab8RN6J_Em9YT60_i-jk0k0YTOpF8-MJk0cSzxUvSgdhbHHiYA",
  "AQ.Ab8RN6JbwU0d96Cbe0Z39gtkZVgXaYAQdyt4Oux6dbmHbphi9g",
  "AQ.Ab8RN6Jj7EQkwRBdZpiNAO1ucXljHH95QMU-dfe4cuQTKsyjiQ",
  "AQ.Ab8RN6JQh87DaKGdh0UtWBERjLFMrpZnyLDXdaxG0jgISQeGcA",
  "AQ.Ab8RN6KTmgbovpmh7d83-RIlgdqquH0N3w0CjAPs7JAFkmt8YA",
  "AQ.Ab8RN6LaZDWHfC1vFpO51e7bdc2q3rrGjOlg83CJ6kFWgK4M4g",
  "AQ.Ab8RN6I5UA6doaqcpREU7919PfDKKiBmialCvPa3ltlSF3PuTQ",
  "AQ.Ab8RN6K_z8L_UecinoMu61GCmTtj4n0cX8LVYb4LuiGv3uG5Lw",
  "AQ.Ab8RN6IzwbQ9fRIGj6leYIYMLyrC7MsUhlTcdcOtgH9zQLYMKw",
  "AQ.Ab8RN6IJ1L1Nkf__MRG7voF9TND5pZpsyOgQBC7BDftY7eOJQA",
  "AQ.Ab8RN6IeV6BM_CfrpUUt-4_LtMyiISC_u14RMSw4IeNarsS4UA",
  "AQ.Ab8RN6JhwD9Csh1ALc1wbU2gVjA13xNwvKE8_jDhKn9gNbPm1g",
  "AQ.Ab8RN6Ll8gTxHEqtBnhP_CXYsCWpc0BUd4ZxWZlgvMWoSZqplQ",
  "AQ.Ab8RN6JPc-vjYS8s4UZR-lprFIZEJeyBVXjVsNNg89Yuo5llwg",
  "AQ.Ab8RN6JIa4ccE_N5TXbtXasl5Wu4RSXYnBjb929vKCHIa-QklA",
  "AQ.Ab8RN6JdPA_qSXtHVRXI-OATTRyOjaaPQbqdrluyQn2qpSFsdQ",
  "AQ.Ab8RN6KMEVH4M1VbZ8c2zmCfo8JscCmjWU10fp-Scqg_9wGKqg",
  "AQ.Ab8RN6J2EzEls3wdwh9u0FqVPBq_MI9xIAijUrvFE9Z-E8IIKA",
  "AQ.Ab8RN6IOk0dome6iAQYSk1RK-BElI6hOPPGA6EAcUqwbvc_Qcg",
  "AQ.Ab8RN6Inct93iXjm1sX3udbGTjTRbJOI9k_YjGmcAY_KqoL_0w",
  "AQ.Ab8RN6L74kSnPGY-OkNMhaZmaphoqrjHFjl-bkx-DPklHnL3Hw",
  "AQ.Ab8RN6LgvPXoHStCx_P2WhPFm4TGOhTR1Ky3E2LMnR1IelE0Bg",
  "AQ.Ab8RN6JSGXHfXi8VWdaZyAduJpipjWtd6n3U72vtD1kkBcpnLA",
  "AQ.Ab8RN6LoBYI4UwpmVpcym8XJ9ovDJYLCXOBwcTPThOKFJTFNTA",
  "AQ.Ab8RN6IjhRi4S6m9H63d4TwRsBmXo0PGtCfoznu-4pATFZe7-Q",
  "AQ.Ab8RN6J5IF7VcG1Wd5fiKkaTvL5-pCd7jCbjMi56R2MDci0xIA",
  "AQ.Ab8RN6LyQOKHhrCaWpBuisYdbVa6yht5rnnW2MFmbY_k9c5ntg",
  "AQ.Ab8RN6KOtRzlOWs5ymwXi-tP7nS-mwOAkdyaKcHllvfI52T2uw",
  "AQ.Ab8RN6IXub2_UlxxBTBzb__g81vdgjDmNN3msBr4FFXQgiSznA",
  "AQ.Ab8RN6KSXlwcVK1RK0UT7BsUqGlP43cLLBQXt3Ngi8Vjd9R6bg",
  "AQ.Ab8RN6I0GXTOw5vuxLkWuisO6dh2s_s2L6mbgnJRJ9kw2yIVKA",
  "AQ.Ab8RN6L9B3mtxGYxZ6KuUrAz5uk2QSBHE0rvScDMgDwHc04iYg",
  "AQ.Ab8RN6K1cnNkWUxAIkSiWFpzEWO0YK6xiZqSyO4Z_1yYByNVkA",
  "AQ.Ab8RN6LKwQNIi7FZSnep4zl4fTuQzHPIdhebOqQhXSXtykY-FA",
  "AQ.Ab8RN6IxV31VsRK36DNf_iqzgxFFcACjNiurtr18Qk1eqN5cyg",
  "AQ.Ab8RN6LdLAIoMChom2myJ8G2wgeMuwVRH90juYJG6Or33GxbZQ",
  "AQ.Ab8RN6Jk-HREqpC9gTMf4syXCrM_OmsSoAjdwxEEIWlLQx9Vfg",
  "AQ.Ab8RN6Kr-JWaumvN3T3iAvKAT5qlEHotsOJQ7fSRRNwaS6RUAg",
  "AQ.Ab8RN6LtopQ0KG29RCPZhZsrpRBZNysQnxP5wJGx2MWpAAciuw",
  "AQ.Ab8RN6Kk1K2b1TbDjjw8vUFZZ5VTkwagjyzGubhR6H6_L20eHw",
  "AQ.Ab8RN6LdqZN2VcmlsfXvIJL799sOXafaxmvpY4bsASEMtol-0w",
  "AQ.Ab8RN6IYeK0uFhk8i99AzckDsgjn1WR4EoPcIf3abEjcyViS5Q",
  "AQ.Ab8RN6LjyIwKBSqneGlXnUneIso7mWz4RqbwNIcS0ngJbWQQIQ",
  "AQ.Ab8RN6KhecwxQDa5AVm16pz7z9aTuB2F_UmVbOX1lwcktx9_lg",
  "AQ.Ab8RN6JMHaLXsXfAf3vB3GWfsuzE8QNx_i9vWZIrIQqM6mtEYA",
  "AQ.Ab8RN6KEplM2c-Ltsj6nRNzwkQau28-N61Cl68WYY-HojXIWLw",
  "AQ.Ab8RN6JbML6pgNcf_ZYmafcFtQcLAO9njah8qe5-iX3Vl3btiA"
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

  const responseData = await queryGemini(payload);
  const jsonText = responseData.candidates[0].content.parts[0].text;
  
  try {
    return JSON.parse(jsonText);
  } catch (err) {
    console.error("Failed to parse Gemini JSON output:", jsonText);
    throw new Error("Invalid JSON returned from Gemini API");
  }
}

module.exports = {
  researchAndWriteArticle
};
