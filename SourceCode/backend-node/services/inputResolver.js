const axios = require('axios');

async function resolveComments(postLink) {
    if (!postLink.includes("reddit.com")) {
        throw new Error("Only Reddit URLs are currently natively supported for live scraping.");
    }
    
    let url = postLink.trim();
    if (url.endsWith("/")) url = url.slice(0, -1);
    if (!url.endsWith(".json")) url += ".json";
    
    try {
        const response = await axios.get(url, { headers: { 'User-Agent': 'DepressionDetectionNode/1.0' } });
        const commentsData = response.data[1].data.children;
        const res = [];
        
        for (const item of commentsData) {
            if (item.kind === 't1') {
                const text = item.data.body;
                if (!text || text === '[deleted]' || text === '[removed]' || text.length < 5) continue;
                
                res.push({
                    username: item.data.author || "Anonymous",
                    comment: text
                });
            }
        }
        
        if (res.length === 0) {
            throw new Error("No valid comments found in the provided Reddit thread.");
        }
        return res;
        
    } catch (e) {
        throw new Error(`Reddit API scraping failed: ${e.message}`);
    }
}

module.exports = { resolveComments };
