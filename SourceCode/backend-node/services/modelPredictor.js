const axios = require('axios');

const HF_SPACE_URL = process.env.HF_SPACE_URL || 'https://snortdapot-depression-classifier.hf.space';

const LABEL_TO_RISK = { "Normal": 0.15, "Mild": 0.55, "Severe": 0.95 };

const DEPRESSION_KEYWORDS = new Set([
    "hopeless", "empty", "worthless", "alone", "tired", "sad", "depressed",
    "anxious", "suicidal", "exhausted", "overwhelmed", "give", "pointless",
    "pain", "hurts", "bed", "avoid", "down", "meh", "drowning", "dark",
    "nobody", "never", "nothing", "stress", "stressed", "hate", "useless",
    "burden", "lost", "fail", "failure", "broken", "numb", "quit"
]);

async function querySpace(text, retries = 3) {
    for (let attempt = 0; attempt < retries; attempt++) {
        try {
            // Step 1: Submit the prediction request
            const submitRes = await axios.post(
                `${HF_SPACE_URL}/gradio_api/call/classify`,
                { data: [text] },
                { timeout: 30000 }
            );
            const eventId = submitRes.data.event_id;

            // Step 2: Fetch the result (SSE stream)
            const resultRes = await axios.get(
                `${HF_SPACE_URL}/gradio_api/call/classify/${eventId}`,
                { timeout: 120000 }
            );

            // Parse SSE response: find the "data:" line after "event: complete"
            const lines = resultRes.data.split('\n');
            for (let i = 0; i < lines.length; i++) {
                if (lines[i].startsWith('event: complete') && i + 1 < lines.length) {
                    const dataLine = lines[i + 1].replace(/^data: /, '');
                    return JSON.parse(dataLine);
                }
            }
            throw new Error('No complete event in Space response');
        } catch (err) {
            if (err.response && err.response.status === 503) {
                console.log(`[model] Space is sleeping, waiting 15s (attempt ${attempt + 1}/${retries})...`);
                await new Promise(r => setTimeout(r, 15000));
                continue;
            }
            if (attempt === retries - 1) throw err;
            await new Promise(r => setTimeout(r, 3000));
        }
    }
}

function getKeywordImportance(text, topK = 5) {
    const tokens = text.toLowerCase().split(/[\s.,!?;:]+/).filter(t => t.length > 0);
    const scores = [];
    for (const token of tokens) {
        if (DEPRESSION_KEYWORDS.has(token)) {
            scores.push({ token, importance: 1.0 });
        }
    }
    return scores.slice(0, topK);
}

function cleanText(text) {
    return text.toLowerCase().trim();
}

async function predictComment(text) {
    const processed = cleanText(text);
    const result = await querySpace(processed);

    // result is [{label, confidences: [{label, confidence}, ...]}]
    const prediction = result[0];
    const bestLabel = prediction.label;
    const bestConfidence = prediction.confidences.find(c => c.label === bestLabel)?.confidence || 0;

    const riskScore = (LABEL_TO_RISK[bestLabel] || 0) * bestConfidence;
    const topTokens = getKeywordImportance(processed);

    return {
        label: bestLabel,
        confidence: parseFloat(bestConfidence.toFixed(4)),
        risk_score: parseFloat(riskScore.toFixed(4)),
        top_tokens: topTokens,
        comment: text
    };
}

module.exports = { predictComment };
