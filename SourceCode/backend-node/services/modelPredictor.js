const axios = require('axios');

const HF_MODEL_ID = process.env.HF_MODEL_ID || 'YOUR_USERNAME/depression-distilbert-onnx';
const HF_API_TOKEN = process.env.HF_API_TOKEN;
const HF_API_URL = `https://api-inference.huggingface.co/models/${HF_MODEL_ID}`;

const ID_TO_LABEL = { 0: "Normal", 1: "Mild", 2: "Severe" };
const LABEL_TO_RISK = { "Normal": 0.15, "Mild": 0.55, "Severe": 0.95 };

const DEPRESSION_KEYWORDS = new Set([
    "hopeless", "empty", "worthless", "alone", "tired", "sad", "depressed",
    "anxious", "suicidal", "exhausted", "overwhelmed", "give", "pointless",
    "pain", "hurts", "bed", "avoid", "down", "meh", "drowning", "dark",
    "nobody", "never", "nothing", "stress", "stressed", "hate", "useless",
    "burden", "lost", "fail", "failure", "broken", "numb", "quit"
]);

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

async function queryHuggingFace(text) {
    const response = await axios.post(
        HF_API_URL,
        { inputs: text },
        {
            headers: {
                'Authorization': `Bearer ${HF_API_TOKEN}`,
                'Content-Type': 'application/json'
            }
        }
    );
    return response.data;
}

async function predictComment(text) {
    const processed = cleanText(text);

    let attempts = 0;
    let output;

    while (attempts < 3) {
        try {
            output = await queryHuggingFace(processed);
            if (output.error && output.error.includes('loading')) {
                console.log('Model is loading on HuggingFace, retrying in 10s...');
                await new Promise(r => setTimeout(r, 10000));
                attempts++;
                continue;
            }
            break;
        } catch (e) {
            if (e.response && e.response.status === 503) {
                console.log('Model is loading on HuggingFace, retrying in 10s...');
                await new Promise(r => setTimeout(r, 10000));
                attempts++;
            } else {
                throw new Error(`HuggingFace API error: ${e.message}`);
            }
        }
    }

    if (!output || output.error) {
        throw new Error(`HuggingFace inference failed: ${JSON.stringify(output)}`);
    }

    const predictions = Array.isArray(output[0]) ? output[0] : output;
    const topPrediction = predictions.reduce((a, b) => a.score > b.score ? a : b);

    const label = topPrediction.label;
    const confidence = topPrediction.score;

    let finalLabel = label;
    if (label.startsWith("LABEL_")) {
        const id = parseInt(label.replace("LABEL_", ""));
        finalLabel = ID_TO_LABEL[id];
    }

    const riskScore = (LABEL_TO_RISK[finalLabel] || 0) * confidence;
    const topTokens = getKeywordImportance(processed);

    return {
        label: finalLabel,
        confidence: parseFloat(confidence.toFixed(4)),
        risk_score: parseFloat(riskScore.toFixed(4)),
        top_tokens: topTokens,
        comment: text
    };
}

module.exports = { predictComment };
