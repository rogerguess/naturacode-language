# 🤖 NaturaCode LLM Demonstration System

## Overview

The NaturaCode Demonstration System is an automated framework that tests how well different AI models understand and generate NaturaCode examples. It implements a complete feedback loop to continuously improve the language based on real model behavior.

## Features

### 🎯 **Automated LLM Testing**
- Tests multiple AI models (GPT, Claude, local models) simultaneously
- Generates contextual prompts with NaturaCode grammar and examples
- Evaluates generated code across multiple criteria

### 📊 **Comprehensive Evaluation**
- **Syntax Analysis**: Validates generated code against NaturaCode patterns
- **Logic Assessment**: Checks for coherent variable usage and flow
- **Execution Testing**: Runs code to verify it works without errors
- **Readability Review**: Evaluates natural language quality
- **Completeness Check**: Ensures examples demonstrate intended features

### 🔄 **Intelligent Feedback Loop**
- Automatically detects when models try to use non-existent features
- Creates GitHub issues for new feature requests
- Identifies bugs and syntax improvements needed
- Tracks improvement suggestions across models

### 🌐 **Interactive Web Interface**
- Visual dashboard for running demonstrations
- Real-time evaluation results and comparisons
- Model performance analytics
- Quick testing capabilities

## System Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│  Context        │    │  LLM            │    │  Evaluator      │
│  Generator      │───▶│  Integrator     │───▶│  System         │
│                 │    │                 │    │                 │
│ • Grammar       │    │ • Multiple      │    │ • Syntax        │
│ • Examples      │    │   Models        │    │ • Logic         │
│ • Documentation │    │ • Async Calls   │    │ • Execution     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                                        │
┌─────────────────┐    ┌─────────────────┐             │
│  Web Interface  │    │  Feedback       │◀────────────┘
│                 │    │  Loop           │
│ • Dashboard     │    │                 │
│ • Real-time     │◀───│ • Issue         │
│ • Results       │    │   Creation      │
│ • Analytics     │    │ • Improvement   │
└─────────────────┘    └─────────────────┘
```

## Quick Start

### 1. Run a Demo Test

```bash
# Start the server
npm start

# Visit the demonstration interface
open http://localhost:3000/demo
```

### 2. Programmatic Usage

```javascript
const { DemonstrationController } = require('./src/demonstration-controller.js');

const controller = new DemonstrationController();

// Run a full demonstration
const result = await controller.runDemonstration({
    models: ['mock-gpt', 'mock-claude'],
    categories: ['general', 'calculation'],
    difficulty: 'beginner',
    createIssues: true
});

console.log(`Generated ${result.evaluations.length} examples`);
console.log(`Average score: ${result.comparison.summary.averageScore}`);
console.log(`Created ${result.createdIssues.length} GitHub issues`);
```

### 3. Quick Model Test

```javascript
// Test a single model with custom prompt
const result = await controller.runQuickTest(
    'mock-gpt', 
    'Create a budget calculator that tracks expenses'
);

console.log(`Score: ${result.evaluation.overall.score}/100`);
console.log(`Code:\n${result.result.response}`);
```

## API Endpoints

### GET `/api/demo/models`
Returns available AI models for testing.

### GET `/api/demo/categories`
Returns available example categories.

### POST `/api/demo/run`
Runs a full demonstration with specified options.

```json
{
  "models": ["mock-gpt", "mock-claude"],
  "categories": ["general", "calculation"],
  "difficulty": "beginner",
  "createIssues": true
}
```

### POST `/api/demo/quick-test`
Tests a single model with a custom prompt.

```json
{
  "model": "mock-gpt",
  "prompt": "Create a simple calculator"
}
```

### GET `/api/demo/stats`
Returns system statistics and usage metrics.

## Evaluation Criteria

### Syntax Score (25% weight)
- Valid NaturaCode patterns
- Proper variable names
- Correct string quoting
- Loop structure integrity

### Logic Score (20% weight)
- Variables defined before use
- Meaningful operations
- Consistent conditional logic
- Appropriate data flow

### Execution Score (25% weight)
- Code runs without errors
- Produces expected output
- No infinite loops
- Handles edge cases

### Readability Score (15% weight)
- Natural language flow
- Descriptive variable names
- Helpful comments
- Clear intent

### Completeness Score (15% weight)
- Demonstrates requested features
- Appropriate complexity
- Clear purpose
- Practical application

## Automatic Issue Creation

The system automatically creates GitHub issues when it detects:

### 🆕 **New Feature Requests**
When models attempt to use syntax that doesn't exist:
- `read file "data.txt"` → File operations feature request
- `create a list called items` → List/array operations
- `define function "calculate"` → User-defined functions

### 🐛 **Bug Reports**
When code fails execution despite valid syntax:
- Runtime errors in language interpreter
- Unexpected behavior in existing features
- Edge cases not handled properly

### 🔧 **Syntax Improvements**
When patterns could be more natural:
- Better error messages needed
- More intuitive command structures
- Grammar extensions for clarity

### 📚 **Documentation Updates**
When examples or documentation are insufficient:
- Missing usage examples
- Unclear feature descriptions
- Need for tutorials or guides

## Example Output

### Demonstration Results
```
📊 Demonstration Results for Session: demo-abc123

Models Tested: 4
Examples Generated: 16
Average Score: 78/100

Top Performing Model: mock-claude (85/100)
Most Requested Feature: file_operations (3 requests)

New Issues Created:
✅ #42: Add file reading and writing capabilities
✅ #43: Implement list/array data type
✅ #44: Bug: Division by variable fails in loops

Recommendations:
• Prioritize implementing file_operations - requested by multiple models
• Focus on stability improvements before adding new features
• Improve existing syntax patterns before adding new ones
```

### Model Comparison
```
Model Performance Comparison:

┌─────────────────┬─────────┬─────────┬─────────┬─────────┬─────────┐
│ Model           │ Overall │ Syntax  │ Logic   │ Execute │ Read    │
├─────────────────┼─────────┼─────────┼─────────┼─────────┼─────────┤
│ mock-claude     │   85    │   90    │   82    │   88    │   80    │
│ mock-gpt        │   77    │   82    │   75    │   80    │   72    │
│ gpt-3.5-turbo   │   72    │   78    │   70    │   75    │   68    │
│ claude-haiku    │   80    │   85    │   78    │   82    │   75    │
└─────────────────┴─────────┴─────────┴─────────┴─────────┴─────────┘
```

## Configuration

### Model Configuration
Add new models in `src/llm-integrator.js`:

```javascript
this.models = {
    // Add your API configurations
    openai: {
        'gpt-4': { provider: 'openai', model: 'gpt-4', maxTokens: 4000 }
    },
    // Local models
    local: {
        'llama-2': { provider: 'local', model: 'llama2', maxTokens: 2000 }
    }
};
```

### Evaluation Weights
Adjust scoring weights in `src/evaluator.js`:

```javascript
const weights = {
    syntax: 0.25,
    logic: 0.20,
    execution: 0.25,
    readability: 0.15,
    completeness: 0.15
};
```

## Best Practices

### For Running Demonstrations
1. **Start Small**: Begin with mock models to test the system
2. **Use Diverse Categories**: Test different types of examples
3. **Monitor Resource Usage**: API calls can be expensive
4. **Review Results**: Manually verify auto-generated issues

### For Adding Models
1. **Implement Provider Interface**: Follow existing patterns
2. **Handle Rate Limits**: Add appropriate delays
3. **Error Handling**: Gracefully handle API failures
4. **Cost Monitoring**: Track token usage and costs

### For Evaluation Criteria
1. **Domain Specific**: Adjust criteria for your use case
2. **Balanced Weights**: Don't over-emphasize any single metric
3. **Regular Updates**: Refine criteria based on results
4. **Human Validation**: Sample and verify automated scores

## Troubleshooting

### Common Issues

**GitHub API Rate Limits**
```bash
# Check rate limit status
gh api rate_limit

# Use personal access token
export GITHUB_TOKEN=your_token_here
```

**Model API Failures**
- Check API credentials and rate limits
- Verify model names and endpoints
- Monitor network connectivity
- Review error logs in console

**Evaluation Scores Too Low**
- Check if examples match current language features
- Verify evaluation criteria are appropriate
- Review model context and prompts
- Examine individual evaluation components

## Development

### Adding New Features
1. Update grammar patterns in `context-generator.js`
2. Add evaluation logic in `evaluator.js`
3. Update feedback classification in `feedback-loop.js`
4. Test with demonstration system

### Contributing
1. Run existing tests: `npm test`
2. Test demonstration system: `node test-demo.js`
3. Verify web interface works
4. Check GitHub issue creation (with test repo)

## Metrics and Analytics

The system tracks:
- **Model Performance**: Scores across evaluation criteria
- **Feature Requests**: Most commonly requested features
- **Issue Creation**: Success rate of GitHub integration
- **Usage Patterns**: Which categories are tested most
- **Improvement Trends**: How scores change over time

This data helps prioritize NaturaCode development and understand how well the language serves AI models and users.

---

**Ready to improve NaturaCode through AI collaboration!** 🤖✨

Visit the [demonstration interface](http://localhost:3000/demo) to start testing models and generating insights.