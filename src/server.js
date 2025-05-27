/**
 * NaturaCode Web Server
 * 
 * Serves the web interface and handles API requests for running NaturaCode
 */

const express = require('express');
const path = require('path');
const { NaturaCode } = require('./naturacode.js');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, '../web')));

// In-memory interpreter instance for the web interface
const natura = new NaturaCode();

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