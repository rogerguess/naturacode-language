/**
 * NaturaCode Example Evaluator
 * 
 * Evaluates LLM-generated NaturaCode examples across multiple criteria:
 * - Syntax correctness
 * - Logical coherence  
 * - Execution success
 * - Readability and natural language quality
 * - Completeness and functionality
 */

const { NaturaCode } = require('./naturacode.js');
const { ContextGenerator } = require('./context-generator.js');

class NaturaCodeEvaluator {
    constructor() {
        this.contextGenerator = new ContextGenerator();
        this.evaluationCriteria = this.contextGenerator.generateEvaluationCriteria();
    }

    /**
     * Comprehensive evaluation of a NaturaCode example
     */
    async evaluateExample(code, metadata = {}) {
        const evaluation = {
            code: code,
            metadata: metadata,
            timestamp: new Date().toISOString(),
            results: {
                syntax: await this.evaluateSyntax(code),
                logic: await this.evaluateLogic(code),
                execution: await this.evaluateExecution(code),
                readability: await this.evaluateReadability(code),
                completeness: await this.evaluateCompleteness(code)
            },
            overall: {
                score: 0,
                grade: 'F',
                issues: [],
                strengths: [],
                suggestions: []
            }
        };

        // Calculate overall score and grade
        this.calculateOverallScore(evaluation);
        
        return evaluation;
    }

    /**
     * Evaluate syntax correctness
     */
    async evaluateSyntax(code) {
        const result = {
            score: 0,
            maxScore: 100,
            issues: [],
            validPatterns: 0,
            totalLines: 0,
            details: {}
        };

        try {
            const interpreter = new NaturaCode();
            const lines = code.split('\n').map(line => line.trim()).filter(line => line);
            result.totalLines = lines.length;

            for (const line of lines) {
                const node = interpreter.parseLine(line);
                
                if (node && node.type !== 'unknown') {
                    result.validPatterns++;
                } else if (node && node.type === 'unknown') {
                    result.issues.push(`Unknown syntax: "${line}"`);
                } else if (line && !line.startsWith('note:')) {
                    result.issues.push(`Could not parse: "${line}"`);
                }
            }

            // Check for common syntax issues
            this.checkCommonSyntaxIssues(code, result);

            // Calculate score
            if (result.totalLines > 0) {
                const validPercentage = (result.validPatterns / result.totalLines) * 100;
                result.score = Math.max(0, validPercentage - (result.issues.length * 10));
            }

        } catch (error) {
            result.issues.push(`Syntax evaluation error: ${error.message}`);
            result.score = 0;
        }

        return result;
    }

    /**
     * Check for common syntax issues
     */
    checkCommonSyntaxIssues(code, result) {
        // Check for unmatched loops
        const repeatCount = (code.match(/repeat \d+ times/gi) || []).length;
        const whileCount = (code.match(/while \w+ is (above|below|equal to) \d+/gi) || []).length;
        const endCount = (code.match(/^end$/gmi) || []).length;
        
        if (repeatCount + whileCount > endCount) {
            result.issues.push("Loops not properly closed with 'end'");
        }

        // Check for proper string quoting
        const lines = code.split('\n');
        lines.forEach((line, index) => {
            if (line.includes('"') && !line.match(/"[^"]*"/)) {
                result.issues.push(`Line ${index + 1}: Unmatched quotes`);
            }
        });

        // Check for invalid variable names
        const varMatches = code.match(/called (\w+)/g);
        if (varMatches) {
            varMatches.forEach(match => {
                const varName = match.replace('called ', '');
                if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(varName)) {
                    result.issues.push(`Invalid variable name: ${varName}`);
                }
            });
        }
    }

    /**
     * Evaluate logical coherence
     */
    async evaluateLogic(code) {
        const result = {
            score: 0,
            maxScore: 100,
            issues: [],
            strengths: [],
            details: {
                variableUsage: {},
                flowAnalysis: {}
            }
        };

        try {
            const variables = new Map();
            const tasks = [];
            const lines = code.split('\n').map(line => line.trim()).filter(line => line);
            
            // Track variable creation and usage
            for (let i = 0; i < lines.length; i++) {
                const line = lines[i];
                
                // Variable creation
                const createMatch = line.match(/create (?:a )?(number|string) called (\w+) with value (.+)/i);
                if (createMatch) {
                    const [, type, name, value] = createMatch;
                    variables.set(name, { type, defined: true, line: i + 1 });
                    continue;
                }

                // Variable usage
                const usageMatches = line.match(/\b(\w+)\b/g);
                if (usageMatches) {
                    usageMatches.forEach(word => {
                        if (variables.has(word)) {
                            if (!variables.get(word).used) {
                                variables.get(word).used = true;
                                variables.get(word).firstUse = i + 1;
                            }
                        } else if (word.match(/^[a-z_][a-z0-9_]*$/i) && 
                                  !['above', 'below', 'equal', 'with', 'called', 'value', 'status'].includes(word.toLowerCase())) {
                            result.issues.push(`Line ${i + 1}: Variable '${word}' used before definition`);
                        }
                    });
                }

                // Task creation
                const taskMatch = line.match(/create (?:a )?task called "([^"]*)" with status "([^"]*)"/i);
                if (taskMatch) {
                    tasks.push({ name: taskMatch[1], status: taskMatch[2] });
                }
            }

            // Check for unused variables
            variables.forEach((info, name) => {
                if (!info.used) {
                    result.issues.push(`Variable '${name}' created but never used`);
                }
            });

            // Check for logical consistency in conditionals
            this.checkConditionalLogic(code, result);

            // Check for meaningful operations
            this.checkMeaningfulOperations(code, result);

            // Calculate score
            const baseScore = 100;
            const issueDeduction = result.issues.length * 15;
            const strengthBonus = result.strengths.length * 5;
            result.score = Math.max(0, Math.min(100, baseScore - issueDeduction + strengthBonus));

        } catch (error) {
            result.issues.push(`Logic evaluation error: ${error.message}`);
            result.score = 0;
        }

        return result;
    }

    /**
     * Check conditional logic consistency
     */
    checkConditionalLogic(code, result) {
        const ifMatches = code.match(/if (\w+) is (above|below|equal to) (-?\d+(?:\.\d+)?|\w+), (.+?)(?:\s+otherwise\s+(.+))?/gi);
        
        if (ifMatches) {
            ifMatches.forEach(match => {
                const parts = match.match(/if (\w+) is (above|below|equal to) (-?\d+(?:\.\d+)?|\w+), (.+?)(?:\s+otherwise\s+(.+))?/i);
                if (parts) {
                    const [, variable, operator, value, thenAction, elseAction] = parts;
                    
                    // Check if comparison makes sense
                    if (operator === 'equal to' && isNaN(parseFloat(value))) {
                        result.strengths.push(`Good use of variable comparison in conditional`);
                    }
                    
                    if (thenAction && elseAction) {
                        result.strengths.push(`Complete if-else logic with both branches`);
                    }
                }
            });
        }
    }

    /**
     * Check for meaningful operations
     */
    checkMeaningfulOperations(code, result) {
        // Check for arithmetic sequences
        if (code.includes('add') || code.includes('subtract') || code.includes('multiply') || code.includes('divide')) {
            result.strengths.push(`Uses arithmetic operations meaningfully`);
        }

        // Check for loop usage
        if (code.includes('repeat') || code.includes('while')) {
            result.strengths.push(`Implements repetitive logic with loops`);
        }

        // Check for task management
        if (code.includes('create a task') && code.includes('mark task')) {
            result.strengths.push(`Demonstrates task lifecycle management`);
        }
    }

    /**
     * Evaluate execution success
     */
    async evaluateExecution(code) {
        const result = {
            score: 0,
            maxScore: 100,
            issues: [],
            output: [],
            executionTime: 0,
            details: {
                linesExecuted: 0,
                errors: []
            }
        };

        try {
            const startTime = Date.now();
            const interpreter = new NaturaCode();
            
            const output = await interpreter.run(code);
            
            result.executionTime = Date.now() - startTime;
            result.output = output;
            result.details.linesExecuted = code.split('\n').filter(line => line.trim()).length;
            
            // Successful execution
            result.score = 100;
            
            // Check output quality
            if (output.length === 0) {
                result.issues.push("Program produces no output");
                result.score -= 20;
            } else if (output.length > 0) {
                result.score += Math.min(10, output.length); // Bonus for meaningful output
            }

            // Check for error messages in output
            const errorMessages = output.filter(line => line.includes('Error:'));
            if (errorMessages.length > 0) {
                result.issues.push(`Execution errors: ${errorMessages.length}`);
                result.score -= errorMessages.length * 20;
                result.details.errors = errorMessages;
            }

        } catch (error) {
            result.issues.push(`Execution failed: ${error.message}`);
            result.details.errors.push(error.message);
            result.score = 0;
        }

        return result;
    }

    /**
     * Evaluate readability and natural language quality
     */
    async evaluateReadability(code) {
        const result = {
            score: 0,
            maxScore: 100,
            issues: [],
            strengths: [],
            details: {
                naturalness: 0,
                clarity: 0,
                documentation: 0
            }
        };

        const lines = code.split('\n').map(line => line.trim()).filter(line => line);
        
        // Check for comments
        const commentLines = lines.filter(line => line.startsWith('note:'));
        if (commentLines.length > 0) {
            result.strengths.push(`Good documentation with ${commentLines.length} comments`);
            result.details.documentation = (commentLines.length / lines.length) * 100;
        } else {
            result.issues.push("No comments to explain the program");
        }

        // Check variable naming
        const varNames = this.extractVariableNames(code);
        varNames.forEach(name => {
            if (this.isDescriptiveName(name)) {
                result.strengths.push(`Descriptive variable name: '${name}'`);
            } else {
                result.issues.push(`Non-descriptive variable name: '${name}'`);
            }
        });

        // Check for natural language flow
        const naturalness = this.assessNaturalness(code);
        result.details.naturalness = naturalness;
        
        if (naturalness > 80) {
            result.strengths.push("Code reads very naturally");
        } else if (naturalness < 50) {
            result.issues.push("Code doesn't read naturally");
        }

        // Calculate score
        const baseScore = 60;
        const strengthBonus = result.strengths.length * 8;
        const issueDeduction = result.issues.length * 12;
        const documentationBonus = result.details.documentation * 0.3;
        
        result.score = Math.max(0, Math.min(100, baseScore + strengthBonus - issueDeduction + documentationBonus));

        return result;
    }

    /**
     * Extract variable names from code
     */
    extractVariableNames(code) {
        const matches = code.match(/called (\w+)/g);
        if (!matches) return [];
        return matches.map(match => match.replace('called ', ''));
    }

    /**
     * Check if a variable name is descriptive
     */
    isDescriptiveName(name) {
        // Single letters or very short names are not descriptive
        if (name.length <= 2) return false;
        
        // Common good patterns
        const goodPatterns = [
            /^(counter|count|total|sum|result|temp|temperature|score|age|name|message|status)$/i,
            /^(first|second|third|last)$/i,
            /\w{4,}/ // At least 4 characters
        ];
        
        return goodPatterns.some(pattern => pattern.test(name));
    }

    /**
     * Assess how natural the language flows
     */
    assessNaturalness(code) {
        const lines = code.split('\n').map(line => line.trim()).filter(line => line);
        let naturalScore = 0;
        let totalLines = lines.length;

        lines.forEach(line => {
            // Skip comments
            if (line.startsWith('note:')) {
                naturalScore += 100;
                return;
            }

            // Check for natural patterns
            const naturalPatterns = [
                /^create (a|an) (number|string) called \w+ with value/i,
                /^(add|subtract|multiply|divide) .+ (to|from|by) \w+$/i,
                /^if \w+ is (above|below|equal to) .+, .+$/i,
                /^show ("|').+('|")$/i,
                /^show \w+$/i,
                /^repeat \d+ times$/i,
                /^while \w+ is (above|below|equal to)/i,
                /^mark task .+ as (complete|done|finished)$/i
            ];

            const matchesNatural = naturalPatterns.some(pattern => pattern.test(line));
            if (matchesNatural) {
                naturalScore += 100;
            } else {
                naturalScore += 30; // Partial credit for valid but less natural syntax
            }
        });

        return totalLines > 0 ? naturalScore / totalLines : 0;
    }

    /**
     * Evaluate completeness and functionality
     */
    async evaluateCompleteness(code) {
        const result = {
            score: 0,
            maxScore: 100,
            issues: [],
            strengths: [],
            details: {
                features: [],
                complexity: 0,
                purpose: 'unknown'
            }
        };

        // Identify features used
        const features = this.identifyFeatures(code);
        result.details.features = features;

        // Check for program structure
        if (features.length > 0) {
            result.strengths.push(`Uses ${features.length} NaturaCode features`);
        }

        // Check for meaningful examples
        if (features.includes('variables') && features.includes('output')) {
            result.strengths.push("Demonstrates basic programming concepts");
        }

        if (features.includes('conditionals') || features.includes('loops')) {
            result.strengths.push("Shows control flow logic");
        }

        if (features.includes('tasks') || features.includes('api')) {
            result.strengths.push("Demonstrates practical applications");
        }

        // Assess complexity
        const complexity = this.assessComplexity(code);
        result.details.complexity = complexity;

        if (complexity > 60) {
            result.strengths.push("Good complexity level for demonstration");
        } else if (complexity < 20) {
            result.issues.push("Example is too simple");
        }

        // Check for clear purpose
        const purpose = this.identifyPurpose(code);
        result.details.purpose = purpose;

        if (purpose !== 'unknown') {
            result.strengths.push(`Clear purpose: ${purpose}`);
        }

        // Calculate score
        const featureScore = Math.min(40, features.length * 8);
        const complexityScore = Math.min(30, complexity * 0.5);
        const strengthBonus = result.strengths.length * 5;
        const issueDeduction = result.issues.length * 10;

        result.score = Math.max(0, featureScore + complexityScore + strengthBonus - issueDeduction);

        return result;
    }

    /**
     * Identify features used in the code
     */
    identifyFeatures(code) {
        const features = [];
        
        if (/create (?:a )?(number|string) called/i.test(code)) features.push('variables');
        if (/(add|subtract|multiply|divide) .+ (to|from|by)/i.test(code)) features.push('arithmetic');
        if (/if .+ is (above|below|equal to)/i.test(code)) features.push('conditionals');
        if (/(repeat \d+ times|while .+ is)/i.test(code)) features.push('loops');
        if (/create (?:a )?task called/i.test(code)) features.push('tasks');
        if (/connect to (?:the )?API/i.test(code)) features.push('api');
        if (/connect to MCP server/i.test(code)) features.push('mcp');
        if (/show /i.test(code)) features.push('output');
        if (/note:/i.test(code)) features.push('comments');
        if (/measure length of/i.test(code)) features.push('utilities');

        return features;
    }

    /**
     * Assess code complexity
     */
    assessComplexity(code) {
        let complexity = 0;
        
        // Basic complexity from line count
        const lines = code.split('\n').filter(line => line.trim()).length;
        complexity += Math.min(30, lines * 2);

        // Additional complexity from features
        const conditionals = (code.match(/if .+ is .+,/gi) || []).length;
        const loops = (code.match(/(repeat|while)/gi) || []).length;
        const variables = (code.match(/create (?:a )?(number|string) called/gi) || []).length;
        
        complexity += conditionals * 10;
        complexity += loops * 15;
        complexity += variables * 5;

        return Math.min(100, complexity);
    }

    /**
     * Identify the purpose of the code
     */
    identifyPurpose(code) {
        const comments = code.match(/note:\s*(.+)/gi);
        if (comments) {
            const firstComment = comments[0].replace(/note:\s*/i, '').toLowerCase();
            
            if (firstComment.includes('calculator')) return 'calculator';
            if (firstComment.includes('task') || firstComment.includes('todo')) return 'task_management';
            if (firstComment.includes('game') || firstComment.includes('story')) return 'interactive_program';
            if (firstComment.includes('budget') || firstComment.includes('finance')) return 'financial_tool';
            if (firstComment.includes('temperature') || firstComment.includes('weather')) return 'data_processing';
            if (firstComment.includes('counter') || firstComment.includes('countdown')) return 'counting_program';
        }

        // Infer from code patterns
        if (code.includes('add') && code.includes('subtract') && code.includes('multiply')) return 'calculator';
        if (code.includes('task') && code.includes('complete')) return 'task_management';
        if (code.includes('repeat') && code.includes('countdown')) return 'timer_program';

        return 'general_example';
    }

    /**
     * Calculate overall score and grade
     */
    calculateOverallScore(evaluation) {
        const results = evaluation.results;
        const weights = {
            syntax: 0.25,
            logic: 0.20,
            execution: 0.25,
            readability: 0.15,
            completeness: 0.15
        };

        let totalScore = 0;
        Object.entries(weights).forEach(([category, weight]) => {
            totalScore += results[category].score * weight;
        });

        evaluation.overall.score = Math.round(totalScore);

        // Assign grade
        if (totalScore >= 90) evaluation.overall.grade = 'A';
        else if (totalScore >= 80) evaluation.overall.grade = 'B';
        else if (totalScore >= 70) evaluation.overall.grade = 'C';
        else if (totalScore >= 60) evaluation.overall.grade = 'D';
        else evaluation.overall.grade = 'F';

        // Collect all issues and strengths
        Object.values(results).forEach(result => {
            if (result.issues) evaluation.overall.issues.push(...result.issues);
            if (result.strengths) evaluation.overall.strengths.push(...result.strengths);
        });

        // Generate suggestions
        this.generateSuggestions(evaluation);
    }

    /**
     * Generate improvement suggestions
     */
    generateSuggestions(evaluation) {
        const results = evaluation.results;
        
        if (results.syntax.score < 70) {
            evaluation.overall.suggestions.push("Review NaturaCode syntax patterns and ensure all commands follow valid formats");
        }
        
        if (results.logic.score < 70) {
            evaluation.overall.suggestions.push("Ensure variables are defined before use and logical flow makes sense");
        }
        
        if (results.execution.score < 70) {
            evaluation.overall.suggestions.push("Test the program for runtime errors and ensure it executes successfully");
        }
        
        if (results.readability.score < 70) {
            evaluation.overall.suggestions.push("Add comments and use more descriptive variable names");
        }
        
        if (results.completeness.score < 70) {
            evaluation.overall.suggestions.push("Make the example more comprehensive and demonstrate more language features");
        }

        // Positive suggestions
        if (evaluation.overall.score > 80) {
            evaluation.overall.suggestions.push("Excellent work! Consider adding more advanced features like MCP integration or complex loops");
        }
    }

    /**
     * Batch evaluate multiple examples
     */
    async batchEvaluate(examples) {
        const results = [];
        
        for (const example of examples) {
            const evaluation = await this.evaluateExample(example.response, example.metadata);
            results.push({
                model: example.model,
                provider: example.provider,
                evaluation: evaluation
            });
        }
        
        return results;
    }

    /**
     * Compare evaluations across models
     */
    compareEvaluations(evaluations) {
        const comparison = {
            summary: {
                totalEvaluations: evaluations.length,
                averageScore: 0,
                bestModel: null,
                worstModel: null,
                gradeDistribution: {}
            },
            categories: {
                syntax: { best: null, worst: null, average: 0 },
                logic: { best: null, worst: null, average: 0 },
                execution: { best: null, worst: null, average: 0 },
                readability: { best: null, worst: null, average: 0 },
                completeness: { best: null, worst: null, average: 0 }
            },
            insights: []
        };

        if (evaluations.length === 0) return comparison;

        // Calculate averages and find best/worst
        let totalScore = 0;
        let bestScore = -1;
        let worstScore = 101;

        evaluations.forEach(evaluation => {
            const score = evaluation.evaluation.overall.score;
            totalScore += score;

            if (score > bestScore) {
                bestScore = score;
                comparison.summary.bestModel = evaluation.model;
            }

            if (score < worstScore) {
                worstScore = score;
                comparison.summary.worstModel = evaluation.model;
            }

            // Grade distribution
            const grade = evaluation.evaluation.overall.grade;
            comparison.summary.gradeDistribution[grade] = (comparison.summary.gradeDistribution[grade] || 0) + 1;

            // Category analysis
            Object.keys(comparison.categories).forEach(category => {
                const categoryScore = evaluation.evaluation.results[category].score;
                comparison.categories[category].average += categoryScore;

                if (!comparison.categories[category].best || categoryScore > evaluation.evaluation.results[category].score) {
                    comparison.categories[category].best = evaluation.model;
                }

                if (!comparison.categories[category].worst || categoryScore < evaluation.evaluation.results[category].score) {
                    comparison.categories[category].worst = evaluation.model;
                }
            });
        });

        comparison.summary.averageScore = Math.round(totalScore / evaluations.length);

        // Calculate category averages
        Object.keys(comparison.categories).forEach(category => {
            comparison.categories[category].average = Math.round(
                comparison.categories[category].average / evaluations.length
            );
        });

        // Generate insights
        this.generateComparisonInsights(comparison, evaluations);

        return comparison;
    }

    /**
     * Generate insights from comparison
     */
    generateComparisonInsights(comparison, evaluations) {
        const insights = comparison.insights;

        // Overall performance insights
        if (comparison.summary.averageScore > 80) {
            insights.push("Models generally produce high-quality NaturaCode examples");
        } else if (comparison.summary.averageScore < 60) {
            insights.push("Models struggle with NaturaCode syntax - may need better training context");
        }

        // Grade distribution insights
        const grades = comparison.summary.gradeDistribution;
        const excellentCount = (grades.A || 0) + (grades.B || 0);
        const poorCount = (grades.D || 0) + (grades.F || 0);

        if (excellentCount > poorCount) {
            insights.push("Most models successfully understand NaturaCode patterns");
        } else {
            insights.push("Models need more examples and context to generate quality NaturaCode");
        }

        // Category-specific insights
        const categoryScores = comparison.categories;
        const lowestCategory = Object.entries(categoryScores)
            .reduce((min, [cat, data]) => data.average < min.score ? {category: cat, score: data.average} : min, 
                   {category: '', score: 100});

        if (lowestCategory.score < 70) {
            insights.push(`Models particularly struggle with ${lowestCategory.category} - consider improving training context for this area`);
        }

        // Model performance insights
        if (comparison.summary.bestModel && comparison.summary.worstModel) {
            insights.push(`${comparison.summary.bestModel} performs best while ${comparison.summary.worstModel} needs improvement`);
        }
    }
}

module.exports = { NaturaCodeEvaluator };