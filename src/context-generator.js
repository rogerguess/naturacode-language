/**
 * Context Generator for NaturaCode LLM Demonstration
 * 
 * Generates comprehensive context to provide LLMs with NaturaCode knowledge
 * including grammar, examples, and documentation for generating examples.
 */

const fs = require('fs');
const path = require('path');

class ContextGenerator {
    constructor() {
        this.baseDir = path.join(__dirname, '..');
    }

    /**
     * Extract grammar patterns from the NaturaCode interpreter
     */
    extractGrammar() {
        const { NaturaCode } = require('./naturacode.js');
        const interpreter = new NaturaCode();
        
        const grammar = {
            variables: [
                "create a number called {name} with value {number}",
                "create a string called {name} with value \"{text}\""
            ],
            arithmetic: [
                "add {number} to {variable}",
                "subtract {number} from {variable}",
                "multiply {variable} by {number}",
                "divide {variable} by {number}",
                "add {variable1} to {variable2}",
                "subtract {variable1} from {variable2}",
                "multiply {variable1} by {variable2}",
                "divide {variable1} by {variable2}"
            ],
            conditionals: [
                "if {variable} is above {number}, {action}",
                "if {variable} is below {number}, {action}",
                "if {variable} is equal to {number}, {action}",
                "if {variable1} is above {variable2}, {action} otherwise {else_action}",
                "if {variable1} is below {variable2}, {action} otherwise {else_action}",
                "if {variable1} is equal to {variable2}, {action} otherwise {else_action}"
            ],
            loops: [
                "repeat {number} times",
                "while {variable} is above {number}",
                "while {variable} is below {number}",
                "while {variable} is equal to {number}",
                "end"
            ],
            tasks: [
                "create a task called \"{name}\" with status \"{status}\"",
                "mark task \"{name}\" as complete",
                "show all tasks",
                "show tasks where status is \"{status}\""
            ],
            api: [
                "connect to the API at \"{url}\"",
                "send a search for \"{query}\" using the key \"{key}\"",
                "get the response",
                "show the response"
            ],
            mcp: [
                "connect to MCP server at \"{url}\" with protocol \"{protocol}\"",
                "disconnect from MCP server \"{url}\"",
                "send message to model \"{model}\" with user message \"{message}\"",
                "send message to model \"{model}\" with system prompt {variable} and user message \"{message}\"",
                "wait for model response",
                "get the response as \"{variable}\""
            ],
            utilities: [
                "measure length of {variable} and store in {target_variable}"
            ],
            output: [
                "show {variable}",
                "show \"{text}\""
            ],
            comments: [
                "note: {comment_text}"
            ]
        };

        return grammar;
    }

    /**
     * Load all example files
     */
    loadExamples() {
        const examplesDir = path.join(this.baseDir, 'examples');
        const examples = {};
        
        try {
            const files = fs.readdirSync(examplesDir);
            files.forEach(file => {
                if (file.endsWith('.nat')) {
                    const filePath = path.join(examplesDir, file);
                    const content = fs.readFileSync(filePath, 'utf8');
                    examples[file.replace('.nat', '')] = content;
                }
            });
        } catch (error) {
            console.warn('Could not load examples:', error.message);
        }
        
        return examples;
    }

    /**
     * Extract key documentation sections
     */
    extractDocumentation() {
        try {
            const readmePath = path.join(this.baseDir, 'README.md');
            const readmeContent = fs.readFileSync(readmePath, 'utf8');
            
            // Extract key sections
            const sections = {
                overview: this.extractSection(readmeContent, '# 🌿 NaturaCode', '## ✨ Why NaturaCode?'),
                features: this.extractSection(readmeContent, '## ✨ Why NaturaCode?', '## 🎬 Quick Demo'),
                quickDemo: this.extractSection(readmeContent, '## 🎬 Quick Demo', '## 🚀 Getting Started'),
                languageReference: this.extractSection(readmeContent, '## 📖 Language Reference', '## 🎨 Web Interface'),
                useCases: this.extractSection(readmeContent, '## 🎯 Use Cases', '## 🛠️ API Reference')
            };
            
            return sections;
        } catch (error) {
            console.warn('Could not load documentation:', error.message);
            return {};
        }
    }

    /**
     * Extract a section from markdown content
     */
    extractSection(content, startPattern, endPattern) {
        const startIndex = content.indexOf(startPattern);
        if (startIndex === -1) return '';
        
        let endIndex = content.indexOf(endPattern, startIndex);
        if (endIndex === -1) endIndex = content.length;
        
        return content.substring(startIndex, endIndex).trim();
    }

    /**
     * Generate comprehensive context for LLM prompts
     */
    generateContext() {
        const grammar = this.extractGrammar();
        const examples = this.loadExamples();
        const documentation = this.extractDocumentation();
        
        const context = {
            language: "NaturaCode",
            description: "A programming language that uses natural English sentences instead of traditional syntax",
            timestamp: new Date().toISOString(),
            grammar: grammar,
            examples: examples,
            documentation: documentation,
            capabilities: [
                "Variable creation and manipulation (numbers and strings)",
                "Arithmetic operations (add, subtract, multiply, divide)",
                "Conditional logic (if-then-else with natural operators)",
                "Loops (repeat N times, while conditions)",
                "Task management (create, complete, filter tasks)",
                "API integration (connect, search, get responses)",
                "LLM/MCP integration (connect to models, send messages)",
                "String utilities (measure length)",
                "Output and display operations",
                "Comments and documentation"
            ],
            patterns: {
                naming: "Variables use lowercase with underscores or camelCase",
                values: "Numbers can be integers or decimals, strings are quoted",
                operators: "Use 'above'/'greater than', 'below'/'less than', 'equal to'",
                structure: "One command per line, loops use 'end' to close",
                readability: "Code should read like natural English instructions"
            }
        };
        
        return context;
    }

    /**
     * Generate a specific prompt for LLMs to create NaturaCode examples
     */
    generatePrompt(category = 'general', difficulty = 'beginner', taskDescription = null) {
        const context = this.generateContext();
        
        let prompt = `You are an expert in NaturaCode, a programming language that uses natural English sentences. 

**LANGUAGE OVERVIEW:**
${context.documentation.overview || 'NaturaCode allows programming in plain English with natural syntax.'}

**CORE CAPABILITIES:**
${context.capabilities.map(cap => `- ${cap}`).join('\n')}

**GRAMMAR PATTERNS:**

**Variables:**
${context.grammar.variables.map(pattern => `- ${pattern}`).join('\n')}

**Arithmetic:**
${context.grammar.arithmetic.map(pattern => `- ${pattern}`).join('\n')}

**Conditionals:**
${context.grammar.conditionals.map(pattern => `- ${pattern}`).join('\n')}

**Loops:**
${context.grammar.loops.map(pattern => `- ${pattern}`).join('\n')}

**Tasks:**
${context.grammar.tasks.map(pattern => `- ${pattern}`).join('\n')}

**Output:**
${context.grammar.output.map(pattern => `- ${pattern}`).join('\n')}

**Comments:**
${context.grammar.comments.map(pattern => `- ${pattern}`).join('\n')}

**EXAMPLE PROGRAMS:**

Here's a simple example:
\`\`\`naturacode
create a number called age with value 25
create a string called name with value "Alice"

if age is above 18, show "Adult" otherwise show "Minor"
show name
show "is"
show age
show "years old"
\`\`\`

Another example with loops:
\`\`\`naturacode
create a number called counter with value 0
repeat 5 times
    add 1 to counter
    show counter
end
show "Counting complete!"
\`\`\`

**TASK:**
Create a ${difficulty}-level NaturaCode program`;

        if (taskDescription) {
            prompt += ` that ${taskDescription}`;
        } else {
            switch (category) {
                case 'calculation':
                    prompt += ` that performs mathematical calculations`;
                    break;
                case 'data':
                    prompt += ` that manages and processes data`;
                    break;
                case 'logic':
                    prompt += ` that demonstrates conditional logic and decision making`;
                    break;
                case 'automation':
                    prompt += ` that automates a real-world task`;
                    break;
                case 'creative':
                    prompt += ` that demonstrates creative or artistic programming`;
                    break;
                default:
                    prompt += ` that showcases the natural language programming approach`;
            }
        }

        prompt += `.

**REQUIREMENTS:**
1. Use only valid NaturaCode syntax as shown in the examples
2. Include comments using "note:" to explain what the program does
3. Make the code readable and self-explanatory
4. Demonstrate key language features appropriately
5. Ensure the program is complete and executable
6. Use natural, conversational English phrases

**OUTPUT FORMAT:**
Return only the NaturaCode program, without additional explanation or markdown formatting.`;

        return prompt;
    }

    /**
     * Generate evaluation criteria for assessing LLM-generated examples
     */
    generateEvaluationCriteria() {
        return {
            syntax: {
                description: "Check if the code follows valid NaturaCode syntax",
                checks: [
                    "All commands match known patterns",
                    "Variable names are valid",
                    "String values are properly quoted",
                    "Loops are properly closed with 'end'",
                    "Numbers are valid format"
                ]
            },
            logic: {
                description: "Evaluate logical coherence and flow",
                checks: [
                    "Variables are created before use",
                    "Conditional logic makes sense",
                    "Loop conditions are meaningful",
                    "Program flow is logical",
                    "Operations are appropriate for data types"
                ]
            },
            execution: {
                description: "Test if the program can execute without errors",
                checks: [
                    "No syntax errors",
                    "No runtime errors",
                    "Produces expected output",
                    "Completes execution successfully",
                    "No infinite loops"
                ]
            },
            readability: {
                description: "Assess natural language quality",
                checks: [
                    "Reads like natural English",
                    "Variable names are descriptive",
                    "Comments explain purpose",
                    "Code structure is clear",
                    "Intent is easily understood"
                ]
            },
            completeness: {
                description: "Check if the program is complete and functional",
                checks: [
                    "Accomplishes stated goal",
                    "Demonstrates requested features",
                    "Has clear beginning and end",
                    "Includes appropriate examples",
                    "Shows practical application"
                ]
            }
        };
    }
}

module.exports = { ContextGenerator };