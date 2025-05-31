/**
 * Feedback Loop System for NaturaCode Development
 * 
 * Automatically detects when LLMs try to use non-existent features,
 * identifies language extensions, and creates GitHub issues for
 * continuous improvement of the NaturaCode language.
 */

const { exec } = require('child_process');
const { promisify } = require('util');
const execAsync = promisify(exec);

class FeedbackLoop {
    constructor() {
        this.detectedFeatures = new Map();
        this.issueCategories = {
            NEW_FEATURE: 'enhancement',
            BUG: 'bug',
            EXTENSION: 'enhancement',
            SYNTAX_IMPROVEMENT: 'enhancement',
            DOCUMENTATION: 'documentation'
        };
    }

    /**
     * Analyze evaluation results and extract feedback
     */
    analyzeFeedback(evaluations) {
        const feedback = {
            newFeatures: [],
            syntaxErrors: [],
            bugs: [],
            extensions: [],
            improvements: [],
            timestamp: new Date().toISOString()
        };

        evaluations.forEach(evaluation => {
            this.extractNewFeatureRequests(evaluation, feedback);
            this.extractSyntaxIssues(evaluation, feedback);
            this.extractBugs(evaluation, feedback);
            this.extractExtensions(evaluation, feedback);
            this.extractImprovements(evaluation, feedback);
        });

        return feedback;
    }

    /**
     * Extract requests for new features from failed syntax
     */
    extractNewFeatureRequests(evaluation, feedback) {
        const syntaxIssues = evaluation.evaluation.results.syntax.issues;
        
        syntaxIssues.forEach(issue => {
            if (issue.includes('Unknown syntax:')) {
                const unknownCommand = issue.replace('Unknown syntax: "', '').replace('"', '');
                const feature = this.classifyUnknownCommand(unknownCommand);
                
                if (feature && !this.isDuplicate(feedback.newFeatures, feature)) {
                    feedback.newFeatures.push({
                        command: unknownCommand,
                        feature: feature,
                        model: evaluation.model,
                        priority: this.assessPriority(unknownCommand),
                        category: this.categorizeFeature(feature)
                    });
                }
            }
        });
    }

    /**
     * Classify unknown commands into feature categories
     */
    classifyUnknownCommand(command) {
        const lowerCommand = command.toLowerCase();
        
        // File operations
        if (lowerCommand.includes('read file') || lowerCommand.includes('write file') || 
            lowerCommand.includes('save to file') || lowerCommand.includes('load from file')) {
            return {
                type: 'file_operations',
                description: 'File reading and writing capabilities',
                examples: ['read file "data.txt"', 'write to file "output.txt"'],
                implementation: 'Add file I/O patterns to naturacode.js'
            };
        }

        // Array/list operations
        if (lowerCommand.includes('create a list') || lowerCommand.includes('add to list') ||
            lowerCommand.includes('remove from list') || lowerCommand.includes('sort list')) {
            return {
                type: 'list_operations',
                description: 'List/array manipulation capabilities',
                examples: ['create a list called items', 'add "apple" to items', 'sort items'],
                implementation: 'Add list data type and operations'
            };
        }

        // Function definitions
        if (lowerCommand.includes('define function') || lowerCommand.includes('call function') ||
            lowerCommand.includes('create function')) {
            return {
                type: 'functions',
                description: 'User-defined function capabilities',
                examples: ['define function "calculate_tax"', 'call function "calculate_tax" with value 100'],
                implementation: 'Add function definition and calling patterns'
            };
        }

        // Date/time operations
        if (lowerCommand.includes('current date') || lowerCommand.includes('current time') ||
            lowerCommand.includes('format date') || lowerCommand.includes('add days')) {
            return {
                type: 'datetime',
                description: 'Date and time manipulation',
                examples: ['get current date as "today"', 'add 7 days to today'],
                implementation: 'Add date/time utility patterns'
            };
        }

        // Math functions
        if (lowerCommand.includes('calculate') || lowerCommand.includes('square root') ||
            lowerCommand.includes('power') || lowerCommand.includes('random number')) {
            return {
                type: 'math_functions',
                description: 'Advanced mathematical operations',
                examples: ['calculate square root of x', 'raise x to power 2', 'generate random number'],
                implementation: 'Add advanced math operation patterns'
            };
        }

        // Input operations
        if (lowerCommand.includes('ask user') || lowerCommand.includes('get input') ||
            lowerCommand.includes('prompt for')) {
            return {
                type: 'user_input',
                description: 'User input capabilities',
                examples: ['ask user for "name"', 'prompt for password'],
                implementation: 'Add user input patterns for CLI and web'
            };
        }

        // Network operations
        if (lowerCommand.includes('send email') || lowerCommand.includes('make request') ||
            lowerCommand.includes('download') || lowerCommand.includes('upload')) {
            return {
                type: 'network_operations',
                description: 'Network and communication capabilities',
                examples: ['send email to "user@example.com"', 'download file from "url"'],
                implementation: 'Add network operation patterns'
            };
        }

        // Database operations
        if (lowerCommand.includes('connect to database') || lowerCommand.includes('query database') ||
            lowerCommand.includes('insert into') || lowerCommand.includes('select from')) {
            return {
                type: 'database',
                description: 'Database connectivity and operations',
                examples: ['connect to database "mydb"', 'select from table "users"'],
                implementation: 'Add database operation patterns'
            };
        }

        // Return null if we can't classify the command
        return null;
    }

    /**
     * Extract syntax-related issues
     */
    extractSyntaxIssues(evaluation, feedback) {
        const syntaxIssues = evaluation.evaluation.results.syntax.issues;
        
        syntaxIssues.forEach(issue => {
            if (!issue.includes('Unknown syntax:')) {
                feedback.syntaxErrors.push({
                    issue: issue,
                    model: evaluation.model,
                    code: evaluation.evaluation.code,
                    severity: this.assessSeverity(issue)
                });
            }
        });
    }

    /**
     * Extract potential bugs from execution failures
     */
    extractBugs(evaluation, feedback) {
        const executionIssues = evaluation.evaluation.results.execution.issues;
        
        executionIssues.forEach(issue => {
            if (issue.includes('Execution failed:') || issue.includes('runtime error')) {
                feedback.bugs.push({
                    issue: issue,
                    model: evaluation.model,
                    code: evaluation.evaluation.code,
                    severity: 'high'
                });
            }
        });
    }

    /**
     * Extract language extension suggestions
     */
    extractExtensions(evaluation, feedback) {
        const suggestions = evaluation.evaluation.overall.suggestions;
        
        suggestions.forEach(suggestion => {
            if (suggestion.includes('advanced features') || suggestion.includes('more features')) {
                feedback.extensions.push({
                    suggestion: suggestion,
                    model: evaluation.model,
                    context: evaluation.evaluation.results.completeness.details.features
                });
            }
        });
    }

    /**
     * Extract general improvements
     */
    extractImprovements(evaluation, feedback) {
        const allIssues = [
            ...evaluation.evaluation.results.readability.issues,
            ...evaluation.evaluation.results.logic.issues
        ];
        
        allIssues.forEach(issue => {
            if (this.isImprovementOpportunity(issue)) {
                feedback.improvements.push({
                    issue: issue,
                    model: evaluation.model,
                    category: this.categorizeImprovement(issue)
                });
            }
        });
    }

    /**
     * Check if an issue represents an improvement opportunity
     */
    isImprovementOpportunity(issue) {
        const improvementKeywords = [
            'Non-descriptive variable name',
            'No comments to explain',
            'Code doesn\'t read naturally',
            'Example is too simple'
        ];
        
        return improvementKeywords.some(keyword => issue.includes(keyword));
    }

    /**
     * Categorize improvement suggestions
     */
    categorizeImprovement(issue) {
        if (issue.includes('variable name')) return 'naming_conventions';
        if (issue.includes('comments')) return 'documentation';
        if (issue.includes('naturally')) return 'natural_language';
        if (issue.includes('simple')) return 'complexity';
        return 'general';
    }

    /**
     * Assess priority of new features
     */
    assessPriority(command) {
        const highPriorityPatterns = [
            'file', 'function', 'input', 'list'
        ];
        
        const mediumPriorityPatterns = [
            'math', 'date', 'time', 'calculate'
        ];
        
        const lowerCommand = command.toLowerCase();
        
        if (highPriorityPatterns.some(pattern => lowerCommand.includes(pattern))) {
            return 'high';
        } else if (mediumPriorityPatterns.some(pattern => lowerCommand.includes(pattern))) {
            return 'medium';
        } else {
            return 'low';
        }
    }

    /**
     * Assess severity of issues
     */
    assessSeverity(issue) {
        if (issue.includes('error') || issue.includes('failed')) return 'high';
        if (issue.includes('unmatched') || issue.includes('invalid')) return 'medium';
        return 'low';
    }

    /**
     * Categorize features for organization
     */
    categorizeFeature(feature) {
        const categories = {
            'file_operations': 'Core Language',
            'list_operations': 'Data Structures',
            'functions': 'Core Language',
            'datetime': 'Utilities',
            'math_functions': 'Utilities',
            'user_input': 'I/O Operations',
            'network_operations': 'External Integration',
            'database': 'External Integration'
        };
        
        return categories[feature.type] || 'General';
    }

    /**
     * Check for duplicate features
     */
    isDuplicate(existingFeatures, newFeature) {
        return existingFeatures.some(existing => existing.feature.type === newFeature.type);
    }

    /**
     * Create GitHub issues for detected improvements
     */
    async createGitHubIssues(feedback) {
        const createdIssues = [];
        
        // Create issues for new features
        for (const feature of feedback.newFeatures) {
            try {
                const issue = await this.createFeatureIssue(feature);
                createdIssues.push(issue);
            } catch (error) {
                console.error('Failed to create feature issue:', error.message);
            }
        }
        
        // Create issues for bugs
        for (const bug of feedback.bugs) {
            try {
                const issue = await this.createBugIssue(bug);
                createdIssues.push(issue);
            } catch (error) {
                console.error('Failed to create bug issue:', error.message);
            }
        }
        
        // Create issues for syntax improvements
        const groupedSyntaxIssues = this.groupSyntaxIssues(feedback.syntaxErrors);
        for (const group of groupedSyntaxIssues) {
            try {
                const issue = await this.createSyntaxIssue(group);
                createdIssues.push(issue);
            } catch (error) {
                console.error('Failed to create syntax issue:', error.message);
            }
        }
        
        return createdIssues;
    }

    /**
     * Create a GitHub issue for a new feature request
     */
    async createFeatureIssue(feature) {
        const title = `Add ${feature.feature.description}`;
        const body = `## Feature Request

**Triggered by:** LLM model \`${feature.model}\` attempted to use: \`${feature.command}\`

**Feature Type:** ${feature.feature.type}
**Priority:** ${feature.priority}
**Category:** ${feature.category}

## Description
${feature.feature.description}

## Examples
${feature.feature.examples.map(ex => `- \`${ex}\``).join('\n')}

## Implementation Notes
${feature.feature.implementation}

## Context
This feature was identified when an LLM model attempted to use syntax that doesn't exist in NaturaCode, suggesting it would be a natural addition to the language.

---
*Automatically generated by NaturaCode Demonstration System*`;

        const labels = [this.issueCategories.NEW_FEATURE, feature.priority, feature.category.toLowerCase().replace(' ', '-')];
        
        return await this.createGitHubIssue(title, body, labels);
    }

    /**
     * Create a GitHub issue for a bug
     */
    async createBugIssue(bug) {
        const title = `Bug: ${bug.issue}`;
        const body = `## Bug Report

**Triggered by:** LLM model \`${bug.model}\`
**Severity:** ${bug.severity}

## Description
${bug.issue}

## Code that caused the issue
\`\`\`naturacode
${bug.code}
\`\`\`

## Expected Behavior
The code should execute without errors according to NaturaCode syntax.

## Actual Behavior
Execution failed with the reported error.

---
*Automatically generated by NaturaCode Demonstration System*`;

        const labels = [this.issueCategories.BUG, bug.severity];
        
        return await this.createGitHubIssue(title, body, labels);
    }

    /**
     * Create a GitHub issue for syntax improvements
     */
    async createSyntaxIssue(syntaxGroup) {
        const title = `Improve syntax handling: ${syntaxGroup.category}`;
        const body = `## Syntax Improvement

**Category:** ${syntaxGroup.category}
**Affected Models:** ${syntaxGroup.models.join(', ')}
**Frequency:** ${syntaxGroup.issues.length} occurrences

## Issues Detected
${syntaxGroup.issues.map(issue => `- ${issue.issue}`).join('\n')}

## Suggested Improvements
${syntaxGroup.suggestions.join('\n')}

## Impact
These syntax issues prevent LLMs from generating valid NaturaCode examples and reduce the language's natural feel.

---
*Automatically generated by NaturaCode Demonstration System*`;

        const labels = [this.issueCategories.SYNTAX_IMPROVEMENT, 'syntax'];
        
        return await this.createGitHubIssue(title, body, labels);
    }

    /**
     * Group similar syntax issues together
     */
    groupSyntaxIssues(syntaxErrors) {
        const groups = new Map();
        
        syntaxErrors.forEach(error => {
            const category = this.categorizeSyntaxError(error.issue);
            
            if (!groups.has(category)) {
                groups.set(category, {
                    category: category,
                    issues: [],
                    models: new Set(),
                    suggestions: []
                });
            }
            
            const group = groups.get(category);
            group.issues.push(error);
            group.models.add(error.model);
        });
        
        // Convert to array and add suggestions
        return Array.from(groups.values()).map(group => {
            group.models = Array.from(group.models);
            group.suggestions = this.generateSyntaxSuggestions(group.category, group.issues);
            return group;
        });
    }

    /**
     * Categorize syntax errors
     */
    categorizeSyntaxError(issue) {
        if (issue.includes('Unmatched quotes')) return 'String Quoting';
        if (issue.includes('Invalid variable name')) return 'Variable Naming';
        if (issue.includes('not properly closed')) return 'Loop Structure';
        if (issue.includes('Could not parse')) return 'General Parsing';
        return 'Other';
    }

    /**
     * Generate suggestions for syntax improvements
     */
    generateSyntaxSuggestions(category, issues) {
        const suggestions = [];
        
        switch (category) {
            case 'String Quoting':
                suggestions.push('- Improve string parsing to handle edge cases');
                suggestions.push('- Add better error messages for unmatched quotes');
                break;
            case 'Variable Naming':
                suggestions.push('- Expand valid variable name patterns');
                suggestions.push('- Add clearer documentation about naming rules');
                break;
            case 'Loop Structure':
                suggestions.push('- Improve loop parsing to catch missing "end" statements');
                suggestions.push('- Add helpful error messages for unclosed loops');
                break;
            default:
                suggestions.push('- Review and improve general parsing logic');
                suggestions.push('- Add more descriptive error messages');
        }
        
        return suggestions;
    }

    /**
     * Create a GitHub issue using the GitHub CLI
     */
    async createGitHubIssue(title, body, labels = []) {
        try {
            // Check if this issue already exists
            const existingIssue = await this.checkExistingIssue(title);
            if (existingIssue) {
                console.log(`Issue already exists: ${title}`);
                return { exists: true, url: existingIssue };
            }

            const labelsArg = labels.length > 0 ? `--label "${labels.join(',')}"` : '';
            const command = `gh issue create --title "${title}" --body "${body}" ${labelsArg}`;
            
            const { stdout } = await execAsync(command);
            const issueUrl = stdout.trim();
            
            console.log(`Created GitHub issue: ${issueUrl}`);
            
            return {
                created: true,
                url: issueUrl,
                title: title,
                labels: labels
            };
            
        } catch (error) {
            console.error(`Failed to create GitHub issue: ${error.message}`);
            return {
                created: false,
                error: error.message,
                title: title
            };
        }
    }

    /**
     * Check if an issue with similar title already exists
     */
    async checkExistingIssue(title) {
        try {
            const { stdout } = await execAsync(`gh issue list --search "${title}" --json url,title`);
            const issues = JSON.parse(stdout);
            
            // Look for exact or very similar titles
            const existingIssue = issues.find(issue => 
                issue.title.toLowerCase().includes(title.toLowerCase().substring(0, 30))
            );
            
            return existingIssue ? existingIssue.url : null;
        } catch (error) {
            // If we can't check, assume it doesn't exist
            return null;
        }
    }

    /**
     * Generate summary report of feedback loop results
     */
    generateSummaryReport(feedback, createdIssues) {
        const report = {
            timestamp: new Date().toISOString(),
            summary: {
                newFeaturesDetected: feedback.newFeatures.length,
                bugsDetected: feedback.bugs.length,
                syntaxIssuesDetected: feedback.syntaxErrors.length,
                improvementsIdentified: feedback.improvements.length,
                issuesCreated: createdIssues.filter(issue => issue.created).length,
                issuesAlreadyExisted: createdIssues.filter(issue => issue.exists).length
            },
            details: {
                topRequestedFeatures: this.getTopFeatures(feedback.newFeatures),
                criticalBugs: feedback.bugs.filter(bug => bug.severity === 'high'),
                improvementAreas: this.getImprovementAreas(feedback.improvements)
            },
            recommendations: this.generateRecommendations(feedback, createdIssues)
        };
        
        return report;
    }

    /**
     * Get top requested features by frequency
     */
    getTopFeatures(newFeatures) {
        const featureCounts = new Map();
        
        newFeatures.forEach(feature => {
            const type = feature.feature.type;
            featureCounts.set(type, (featureCounts.get(type) || 0) + 1);
        });
        
        return Array.from(featureCounts.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([type, count]) => ({ type, count }));
    }

    /**
     * Get areas needing improvement
     */
    getImprovementAreas(improvements) {
        const areas = new Map();
        
        improvements.forEach(improvement => {
            const category = improvement.category;
            areas.set(category, (areas.get(category) || 0) + 1);
        });
        
        return Array.from(areas.entries())
            .sort((a, b) => b[1] - a[1])
            .map(([category, count]) => ({ category, count }));
    }

    /**
     * Generate recommendations based on feedback
     */
    generateRecommendations(feedback, createdIssues) {
        const recommendations = [];
        
        if (feedback.newFeatures.length > 5) {
            recommendations.push("High demand for new features suggests NaturaCode should be expanded rapidly");
        }
        
        if (feedback.bugs.length > 3) {
            recommendations.push("Focus on stability improvements before adding new features");
        }
        
        if (feedback.syntaxErrors.length > feedback.newFeatures.length) {
            recommendations.push("Improve existing syntax patterns before adding new ones");
        }
        
        const topFeature = this.getTopFeatures(feedback.newFeatures)[0];
        if (topFeature && topFeature.count > 2) {
            recommendations.push(`Prioritize implementing ${topFeature.type} - requested by multiple models`);
        }
        
        return recommendations;
    }
}

module.exports = { FeedbackLoop };