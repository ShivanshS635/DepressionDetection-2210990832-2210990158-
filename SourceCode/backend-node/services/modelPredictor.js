const { pipeline, env } = require('@xenova/transformers');
const path = require('path');
const fs = require('fs');

const MODEL_DIR = path.resolve(__dirname, '../../model-onnx');
const ONNX_FILE = path.join(MODEL_DIR, 'onnx', 'model_quantized.onnx');

function isLfsPointer(filePath) {
    try {
        const buf = fs.readFileSync(filePath, { encoding: 'utf8', flag: 'r' });
        return buf.startsWith('version https://git-lfs.github.com');
    } catch {
        return true;
    }
}

const localModelAvailable = fs.existsSync(ONNX_FILE) && !isLfsPointer(ONNX_FILE);

if (localModelAvailable) {
    env.allowRemoteModels = false;
    env.localModelPath = '/';
    console.log('Using local ONNX model from:', MODEL_DIR);
} else {
    env.allowRemoteModels = false;
    console.error('ERROR: Local ONNX model not available at:', ONNX_FILE);
    console.error('The file is either missing or is a Git LFS pointer.');
    console.error('Run: git lfs install && git lfs pull');
}

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
        console.log(`Loading Node.js ONNX DistilBERT Model from: ${MODEL_DIR}`);
        classifier = await pipeline('text-classification', MODEL_DIR, {
            model_file_name: 'model_quantized',
            quantized: false
        });
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
    
    // Inference
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
