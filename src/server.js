/**
 * NaturaCode Web Server
 * 
 * Serves the web interface and handles API requests for running NaturaCode
 */

const express = require('express');
const path = require('path');
const { NaturaCode } = require('./naturacode.js');
const { DemonstrationController } = require('./demonstration-controller.js');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, '../web')));

// In-memory interpreter instance for the web interface
const natura = new NaturaCode();

// Demonstration system controller
const demoController = new DemonstrationController();

// API Routes
app.post('/run', async (req, res) => {
    try {
        const { code } = req.body;
        
        if (!code) {
            return res.json({
                success: false,
                error: 'No code provided'
            });
        }

        // Reset the interpreter for a fresh run
        natura.reset();
        
        // Run the code
        const output = await natura.run(code);
        const context = natura.getContext();

        res.json({
            success: true,
            output: output,
            context: {
                variables: context.variables,
                tasks: context.tasks,
                apiResponse: context.apiResponse
            }
        });

    } catch (error) {
        res.json({
            success: false,
            error: error.message
        });
    }
});

app.post('/to-speech', async (req, res) => {
    try {
        const { context } = req.body;
        
        // Create a temporary interpreter with the given context
        const tempNatura = new NaturaCode();
        tempNatura.context = {
            ...tempNatura.context,
            ...context
        };
        
        const speech = tempNatura.toSpeech();
        
        res.json({
            success: true,
            speech: speech || 'No state to convert to speech yet.'
        });

    } catch (error) {
        res.json({
            success: false,
            error: error.message
        });
    }
});

app.post('/from-speech', async (req, res) => {
    try {
        const { speech } = req.body;
        
        if (!speech) {
            return res.json({
                success: false,
                error: 'No speech provided'
            });
        }

        const tempNatura = new NaturaCode();
        const code = tempNatura.fromSpeech(speech);
        
        res.json({
            success: true,
            code: code
        });

    } catch (error) {
        res.json({
            success: false,
            error: error.message
        });
    }
});

// Demonstration API Routes
app.get('/api/demo/models', (req, res) => {
    try {
        const models = demoController.getAvailableModels();
        res.json(models);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/demo/categories', (req, res) => {
    try {
        const categories = demoController.getAvailableCategories();
        res.json(categories);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/demo/stats', (req, res) => {
    try {
        const stats = demoController.getStats();
        res.json(stats);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/demo/run', async (req, res) => {
    try {
        const options = req.body;
        const result = await demoController.runDemonstration(options);
        res.json(result);
    } catch (error) {
        console.error('Demonstration failed:', error);
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/demo/quick-test', async (req, res) => {
    try {
        const { model, prompt } = req.body;
        
        if (!model || !prompt) {
            return res.status(400).json({ error: 'Model and prompt are required' });
        }
        
        const result = await demoController.runQuickTest(model, prompt);
        res.json(result);
    } catch (error) {
        console.error('Quick test failed:', error);
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/demo/sessions', (req, res) => {
    try {
        const sessions = demoController.listSessions();
        res.json(sessions);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/demo/sessions/:sessionId', (req, res) => {
    try {
        const session = demoController.getSession(req.params.sessionId);
        if (!session) {
            return res.status(404).json({ error: 'Session not found' });
        }
        res.json(session);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/demo/analyze', async (req, res) => {
    try {
        const { code, metadata } = req.body;
        
        if (!code) {
            return res.status(400).json({ error: 'Code is required' });
        }
        
        const evaluation = await demoController.analyzeCustomExample(code, metadata);
        res.json(evaluation);
    } catch (error) {
        console.error('Analysis failed:', error);
        res.status(500).json({ error: error.message });
    }
});

// Health check
app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        message: 'NaturaCode server is running',
        timestamp: new Date().toISOString()
    });
});

// Serve the main page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../web/index.html'));
});

// Serve the demonstration page
app.get('/demo', (req, res) => {
    res.sendFile(path.join(__dirname, '../web/demonstration.html'));
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        error: 'Not found',
        message: 'The requested resource was not found'
    });
});

// Error handler
app.use((error, req, res, next) => {
    console.error('Server error:', error);
    res.status(500).json({
        error: 'Internal server error',
        message: error.message
    });
});

// Start the server
app.listen(PORT, () => {
    console.log(`
╔═══════════════════════════════════════════╗
║                                           ║
║     🌿 NaturaCode Server 🌿               ║
║     Programming in Plain English          ║
║                                           ║
║     🌐 Server running on port ${PORT}        ║
║     📍 http://localhost:${PORT}              ║
║                                           ║
║     Ready to speak NaturaCode! 🚀         ║
║                                           ║
╚═══════════════════════════════════════════╝
    `);
});

module.exports = app;