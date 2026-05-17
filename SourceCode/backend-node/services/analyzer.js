const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });
const { predictComment } = require('./modelPredictor');

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

function generateLocalExplanation(label, topTokens) {
    if (label === "Normal") {
        return "Local Analysis: Comment appears standard with no significant emotional distress indicators detected.";
    }
    
    const keywords = topTokens.map(t => t.token).join(", ");
    if (keywords) {
        return `Local Analysis: ${label} risk detected. Keywords triggering this classification: [${keywords}].`;
    }
    
    return `Local Analysis: Classified as ${label} based on linguistic patterns and emotional tone.`;
}

async function analyzeComments(comments) {
    try {
        console.log(`Analyzing ${comments.length} comments locally via Transformers.js...`);
        const processed = [];
        
        for (const row of comments) {
            const pred = await predictComment(row.comment);
            processed.push({
                username: row.username,
                comment: row.comment,
                label: pred.label,
                confidence: pred.confidence,
                risk_score: pred.risk_score,
                top_tokens: pred.top_tokens,
                explanation: generateLocalExplanation(pred.label, pred.top_tokens)
            });
        }
        
        const userRiskMap = {};
        for (const row of processed) {
            if (!userRiskMap[row.username]) {
                userRiskMap[row.username] = { risk_sum: 0, count: 0, depressive_count: 0 };
            }
            userRiskMap[row.username].risk_sum += row.risk_score;
            userRiskMap[row.username].count += 1;
            if (row.label !== "Normal") {
                userRiskMap[row.username].depressive_count += 1;
            }
        }
        
        const userRankings = [];
        for (const [username, data] of Object.entries(userRiskMap)) {
            const avgRisk = data.risk_sum / data.count;
            let riskLevel = "Low Risk";
            if (avgRisk > 0.70) riskLevel = "High Risk";
            else if (avgRisk > 0.35) riskLevel = "Medium Risk";
            
            userRankings.push({ 
                username, 
                average_risk_score: avgRisk, 
                risk_level: riskLevel,
                depressive_comment_count: data.depressive_count,
                total_comments: data.count
            });
        }
        userRankings.sort((a, b) => b.average_risk_score - a.average_risk_score);
        
        return { processed, user_rankings: userRankings };

    } catch (e) {
        console.error("Local Node.js Inference failed:", e.message);
        throw e;
    }
}

module.exports = { analyzeComments };
