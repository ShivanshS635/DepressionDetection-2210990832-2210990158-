const express = require('express');
const cors = require('cors');
const { resolveComments } = require('./services/inputResolver');
const { analyzeComments } = require('./services/analyzer');

const app = express();
app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
    res.json({ status: "healthy", model: "distilbert-base-uncased", backend: "node-express" });
});

app.post('/analyze_post', async (req, res) => {
    try {
        const { post_link, comments: fallbackComments } = req.body;
        let commentsToProcess;

        if (post_link) {
            commentsToProcess = await resolveComments(post_link);
        } else if (fallbackComments && fallbackComments.length > 0) {
            commentsToProcess = fallbackComments;
        } else {
            return res.status(422).json({ detail: "No input provided. Please supply post_link or comments." });
        }

        const result = await analyzeComments(commentsToProcess);
        
        return res.json({
            processed_comments: result.processed,
            user_risk_rankings: result.user_rankings,
            total_comments: result.processed.length,
            model_version: "1.0.0"
        });

    } catch (e) {
        console.error("Endpoint Error:", e.message);
        if (e.message.includes("No valid comments") || e.message.includes("supported")) {
             return res.status(404).json({ detail: e.message });
        }
        res.status(500).json({ detail: e.message });
    }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`Node.js Express Server running on port ${PORT}`);
});
