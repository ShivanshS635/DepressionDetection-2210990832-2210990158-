const { pipeline, env } = require('@xenova/transformers');

env.allowRemoteModels = true;
env.allowLocalModels = false;

const HF_MODEL_ID = process.env.HF_MODEL_ID || 'snortdapot/depression-distilbert-onnx';

const ID_TO_LABEL = { 0: "Normal", 1: "Mild", 2: "Severe" };
const LABEL_TO_RISK = { "Normal": 0.15, "Mild": 0.55, "Severe": 0.95 };

const DEPRESSION_KEYWORDS = new Set([
    "hopeless", "empty", "worthless", "alone", "tired", "sad", "depressed",
    "anxious", "suicidal", "exhausted", "overwhelmed", "give", "pointless",
    "pain", "hurts", "bed", "avoid", "down", "meh", "drowning", "dark",
    "nobody", "never", "nothing", "stress", "stressed", "hate", "useless",
    "burden", "lost", "fail", "failure", "broken", "numb", "quit"
]);

let classifier = null;

async function getClassifier() {
    if (classifier === null) {
        console.log(`[model] Downloading model from HuggingFace: ${HF_MODEL_ID}`);
        console.log(`[model] Memory before load: ${Math.round(process.memoryUsage().rss / 1024 / 1024)}MB RSS`);
        const loadStart = Date.now();
        try {
            classifier = await pipeline('text-classification', HF_MODEL_ID, {
                model_file_name: 'model_quantized',
                quantized: false
            });
            console.log(`[model] Loaded in ${Date.now() - loadStart}ms`);
            console.log(`[model] Memory after load: ${Math.round(process.memoryUsage().rss / 1024 / 1024)}MB RSS`);
        } catch (e) {
            console.error(`[model] FAILED to load: ${e.message}`);
            console.error(`[model] Stack: ${e.stack}`);
            throw e;
        }
    }
    return classifier;
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
    const pipe = await getClassifier();
    const processed = cleanText(text);

    const output = await pipe(processed);

    const label = output[0].label;
    const confidence = output[0].score;

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
