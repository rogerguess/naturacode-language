/**
 * Demonstration Controller
 * 
 * Main controller that orchestrates the demonstration system,
 * coordinating between context generation, LLM integration,
 * evaluation, and feedback loop components.
 */

const { ContextGenerator } = require('./context-generator.js');
const { LLMIntegrator } = require('./llm-integrator.js');
const { NaturaCodeEvaluator } = require('./evaluator.js');
const { FeedbackLoop } = require('./feedback-loop.js');

class DemonstrationController {
    constructor() {
        this.contextGenerator = new ContextGenerator();
        this.llmIntegrator = new LLMIntegrator();
        this.evaluator = new NaturaCodeEvaluator();
        this.feedbackLoop = new FeedbackLoop();
        
        this.sessions = new Map(); // Store demonstration sessions
    }

    /**
     * Create a new demonstration session
     */
    createSession(sessionId = null) {
        const id = sessionId || this.generateSessionId();
        const session = {
            id: id,
            createdAt: new Date().toISOString(),
            status: 'active',
            results: [],
            feedback: null,
            summary: null
        };
        
        this.sessions.set(id, session);
        return session;
    }

    /**
     * Run a complete demonstration cycle
     */
    async runDemonstration(options = {}) {
        const {
            sessionId = null,
            models = ['mock-gpt', 'mock-claude'],
            categories = ['general', 'calculation', 'logic'],
            difficulty = 'beginner',
            customPrompt = null,
            createIssues = true
        } = options;

        const session = this.createSession(sessionId);
        
        try {
            console.log(`Starting demonstration session: ${session.id}`);
            
            // Step 1: Generate context and prompts
            const prompts = this.generatePrompts(categories, difficulty, customPrompt);
            console.log(`Generated ${prompts.length} prompts for ${categories.length} categories`);
            
            // Step 2: Generate examples from multiple LLMs
            const allResults = [];
            for (const prompt of prompts) {
                console.log(`Generating examples for: ${prompt.category}`);
                const results = await this.llmIntegrator.generateMultipleExamples(
                    prompt.text, 
                    models
                );
                
                // Add category context to results
                results.forEach(result => {
                    result.category = prompt.category;
                    result.difficulty = difficulty;
                });
                
                allResults.push(...results);
            }
            
            console.log(`Generated ${allResults.length} examples from ${models.length} models`);
            
            // Step 3: Evaluate all examples
            console.log('Evaluating examples...');
            const evaluations = await this.evaluator.batchEvaluate(allResults);
            
            // Step 4: Analyze feedback and create issues
            console.log('Analyzing feedback...');
            const feedback = this.feedbackLoop.analyzeFeedback(evaluations);
            
            let createdIssues = [];
            if (createIssues && (feedback.newFeatures.length > 0 || feedback.bugs.length > 0)) {
                console.log('Creating GitHub issues...');
                createdIssues = await this.feedbackLoop.createGitHubIssues(feedback);
            }
            
            // Step 5: Generate summary and comparison
            const comparison = this.evaluator.compareEvaluations(evaluations);
            const summaryReport = this.feedbackLoop.generateSummaryReport(feedback, createdIssues);
            
            // Update session with results
            session.results = evaluations;
            session.feedback = feedback;
            session.createdIssues = createdIssues;
            session.comparison = comparison;
            session.summary = summaryReport;
            session.completedAt = new Date().toISOString();
            session.status = 'completed';
            
            console.log(`Demonstration session ${session.id} completed successfully`);
            
            return {
                sessionId: session.id,
                summary: summaryReport,
                comparison: comparison,
                evaluations: evaluations,
                feedback: feedback,
                createdIssues: createdIssues
            };
            
        } catch (error) {
            session.status = 'failed';
            session.error = error.message;
            session.completedAt = new Date().toISOString();
            
            console.error(`Demonstration session ${session.id} failed:`, error.message);
            throw error;
        }
    }

    /**
     * Generate prompts for different categories
     */
    generatePrompts(categories, difficulty, customPrompt) {
        const prompts = [];
        
        if (customPrompt) {
            prompts.push({
                category: 'custom',
                text: customPrompt
            });
        } else {
            categories.forEach(category => {
                const prompt = this.contextGenerator.generatePrompt(category, difficulty);
                prompts.push({
                    category: category,
                    text: prompt
                });
            });
        }
        
        return prompts;
    }

    /**
     * Get demonstration session by ID
     */
    getSession(sessionId) {
        return this.sessions.get(sessionId);
    }

    /**
     * List all demonstration sessions
     */
    listSessions() {
        return Array.from(this.sessions.values()).map(session => ({
            id: session.id,
            createdAt: session.createdAt,
            completedAt: session.completedAt,
            status: session.status,
            resultCount: session.results ? session.results.length : 0
        }));
    }

    /**
     * Get available models
     */
    getAvailableModels() {
        return this.llmIntegrator.getAvailableModels();
    }

    /**
     * Get available categories
     */
    getAvailableCategories() {
        return [
            { id: 'general', name: 'General Examples', description: 'Showcase overall language features' },
            { id: 'calculation', name: 'Mathematical Calculations', description: 'Arithmetic and numerical processing' },
            { id: 'data', name: 'Data Management', description: 'Variable manipulation and data processing' },
            { id: 'logic', name: 'Conditional Logic', description: 'Decision making and control flow' },
            { id: 'automation', name: 'Task Automation', description: 'Real-world automation scenarios' },
            { id: 'creative', name: 'Creative Programming', description: 'Artistic and creative applications' }
        ];
    }

    /**
     * Run a quick test with a single model and prompt
     */
    async runQuickTest(model, prompt) {
        try {
            console.log(`Running quick test with ${model}`);
            
            // Generate example
            const result = await this.llmIntegrator.generateExample(model, prompt);
            
            if (!result.response) {
                throw new Error(result.error || 'No response generated');
            }
            
            // Evaluate example
            const evaluation = await this.evaluator.evaluateExample(result.response, result.metadata);
            
            return {
                model: model,
                result: result,
                evaluation: evaluation,
                timestamp: new Date().toISOString()
            };
            
        } catch (error) {
            console.error(`Quick test failed:`, error.message);
            return {
                model: model,
                error: error.message,
                timestamp: new Date().toISOString()
            };
        }
    }

    /**
     * Analyze a custom NaturaCode example
     */
    async analyzeCustomExample(code, metadata = {}) {
        try {
            const evaluation = await this.evaluator.evaluateExample(code, metadata);
            return evaluation;
        } catch (error) {
            console.error('Failed to analyze custom example:', error.message);
            throw error;
        }
    }

    /**
     * Get system statistics
     */
    getStats() {
        const sessions = Array.from(this.sessions.values());
        const completedSessions = sessions.filter(s => s.status === 'completed');
        
        const stats = {
            sessions: {
                total: sessions.length,
                completed: completedSessions.length,
                failed: sessions.filter(s => s.status === 'failed').length,
                active: sessions.filter(s => s.status === 'active').length
            },
            models: this.llmIntegrator.getModelStats(),
            evaluations: {
                total: completedSessions.reduce((sum, s) => sum + (s.results ? s.results.length : 0), 0),
                averageScore: this.calculateAverageScore(completedSessions)
            },
            feedback: {
                issuesCreated: completedSessions.reduce((sum, s) => 
                    sum + (s.createdIssues ? s.createdIssues.filter(i => i.created).length : 0), 0),
                featuresRequested: completedSessions.reduce((sum, s) => 
                    sum + (s.feedback ? s.feedback.newFeatures.length : 0), 0)
            }
        };
        
        return stats;
    }

    /**
     * Calculate average score across all evaluations
     */
    calculateAverageScore(sessions) {
        let totalScore = 0;
        let totalEvaluations = 0;
        
        sessions.forEach(session => {
            if (session.results) {
                session.results.forEach(result => {
                    totalScore += result.evaluation.overall.score;
                    totalEvaluations++;
                });
            }
        });
        
        return totalEvaluations > 0 ? Math.round(totalScore / totalEvaluations) : 0;
    }

    /**
     * Generate a session ID
     */
    generateSessionId() {
        const timestamp = Date.now().toString(36);
        const random = Math.random().toString(36).substring(2, 8);
        return `demo-${timestamp}-${random}`;
    }

    /**
     * Clean up old sessions (keep last 50)
     */
    cleanupSessions() {
        const sessions = Array.from(this.sessions.entries())
            .sort((a, b) => new Date(b[1].createdAt) - new Date(a[1].createdAt));
        
        if (sessions.length > 50) {
            const toDelete = sessions.slice(50);
            toDelete.forEach(([id]) => {
                this.sessions.delete(id);
            });
            console.log(`Cleaned up ${toDelete.length} old sessions`);
        }
    }

    /**
     * Export session data
     */
    exportSession(sessionId) {
        const session = this.sessions.get(sessionId);
        if (!session) {
            throw new Error(`Session ${sessionId} not found`);
        }
        
        return {
            ...session,
            exportedAt: new Date().toISOString(),
            version: '1.0.0'
        };
    }

    /**
     * Import session data
     */
    importSession(sessionData) {
        if (!sessionData.id) {
            throw new Error('Session data must include an ID');
        }
        
        this.sessions.set(sessionData.id, {
            ...sessionData,
            importedAt: new Date().toISOString()
        });
        
        return sessionData.id;
    }
}

module.exports = { DemonstrationController };