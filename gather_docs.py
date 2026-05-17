import os

project_root = "/Users/ShivanshSharma/Desktop/DepressionDetectionEngine(2210990832,2210990158)"
output_md = os.path.join(project_root, "ProjectDocumentation.md")

files_to_include = [
    ("Main README", "README.md"),
    ("SourceCode README", "SourceCode/README.md"),
    ("Backend Entry Point", "SourceCode/backend-node/server.js"),
    ("Analyzer Service", "SourceCode/backend-node/services/analyzer.js"),
    ("Input Resolver Service", "SourceCode/backend-node/services/inputResolver.js"),
    ("Model Predictor Service", "SourceCode/backend-node/services/modelPredictor.js"),
    ("Backend Package Info", "SourceCode/backend-node/package.json"),
    ("Frontend Package Info", "SourceCode/frontend/package.json"),
    ("Frontend Vite Config", "SourceCode/frontend/vite.config.ts"),
    ("Frontend TS Config", "SourceCode/frontend/tsconfig.json"),
    ("Frontend HTML", "SourceCode/frontend/index.html"),
    ("Frontend Main Entry", "SourceCode/frontend/src/main.tsx"),
    ("Frontend App Component", "SourceCode/frontend/src/App.tsx"),
    ("Frontend CSS", "SourceCode/frontend/src/index.css"),
    ("Frontend CommentTable Component", "SourceCode/frontend/src/components/CommentTable.tsx"),
    ("Frontend UserRiskPanel Component", "SourceCode/frontend/src/components/UserRiskPanel.tsx"),
    ("Frontend API Service", "SourceCode/frontend/src/services/api.ts"),
    ("Frontend Types", "SourceCode/frontend/src/types/index.ts")
]

def get_extension(filepath):
    ext = os.path.splitext(filepath)[1].lower()
    if ext == '.js': return 'javascript'
    if ext == '.ts': return 'typescript'
    if ext == '.tsx': return 'tsx'
    if ext == '.json': return 'json'
    if ext == '.html': return 'html'
    if ext == '.css': return 'css'
    if ext == '.md': return 'markdown'
    return ''

with open(output_md, "w", encoding="utf-8") as out:
    out.write("# Depression Detection Engine - Comprehensive Project Documentation\n\n")
    out.write("This document provides a complete overview of the Depression Detection Engine project, along with its full source code.\n\n")
    out.write("---\n\n")
    
    for title, filepath in files_to_include:
        full_path = os.path.join(project_root, filepath)
        out.write(f"## {title}\n\n")
        out.write(f"**File:** `{filepath}`\n\n")
        
        if os.path.exists(full_path):
            with open(full_path, "r", encoding="utf-8") as f:
                content = f.read()
            ext = get_extension(filepath)
            
            # If it's a markdown file like README, we don't necessarily want to wrap it in a code block, 
            # but wrapping it in a code block prevents it from breaking the overall markdown structure 
            # and makes it clearly delineated as "source text". We'll wrap all source files.
            if ext == 'markdown':
                # Actually, for READMEs, it might be better to just include them directly, 
                # but to avoid heading clashes, maybe code block is better. Let's do code block.
                out.write(f"```{ext}\n{content}\n```\n\n")
            else:
                out.write(f"```{ext}\n{content}\n```\n\n")
        else:
            out.write(f"*File not found: {filepath}*\n\n")
        
        out.write("---\n\n")

print(f"Generated markdown at {output_md}")
