#!/usr/bin/env node

/**
 * NaturaCode Video Creation Helper
 * 
 * This script helps automate the demonstration sequence for creating an instructional video.
 * It provides step-by-step guidance for recording the perfect NaturaCode tutorial.
 */

const readline = require('readline');
const { execSync } = require('child_process');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const NATURA_ASCII = `
╔═══════════════════════════════════════════╗
║                                           ║
║     🎬 NaturaCode Video Creator 🎬        ║
║     Step-by-Step Recording Guide          ║
║                                           ║
╚═══════════════════════════════════════════╝
`;

async function question(prompt) {
    return new Promise((resolve) => {
        rl.question(prompt, resolve);
    });
}

async function waitForEnter(message = "Press Enter to continue...") {
    await question(`\n${message}`);
}

async function main() {
    console.log(NATURA_ASCII);
    
    console.log('🎬 Welcome to the NaturaCode Video Recording Assistant!');
    console.log('This guide will help you create the perfect instructional video.');
    console.log('');
    
    await waitForEnter("Ready to start? Press Enter to begin...");
    
    // Video Section 1: Introduction
    console.log('\n🎬 SECTION 1: INTRODUCTION (0:00 - 0:30)');
    console.log('═'.repeat(50));
    console.log('');
    console.log('📋 Recording Checklist:');
    console.log('  ✅ Screen recording software ready');
    console.log('  ✅ Audio equipment tested');
    console.log('  ✅ NaturaCode repository open');
    console.log('  ✅ Web browser ready');
    console.log('');
    console.log('🎯 What to show:');
    console.log('  • Split screen: Traditional code vs NaturaCode');
    console.log('  • Highlight the readability difference');
    console.log('  • Show the NaturaCode logo/branding');
    console.log('');
    console.log('🎤 Narration points:');
    console.log('  • "Programming in plain English"');
    console.log('  • "No syntax to memorize"');
    console.log('  • "Revolutionary language"');
    
    await waitForEnter();
    
    // Video Section 2: Getting Started
    console.log('\n🎬 SECTION 2: GETTING STARTED (0:30 - 2:00)');
    console.log('═'.repeat(50));
    console.log('');
    console.log('🎯 Terminal Demonstrations:');
    console.log('  1. Show project structure');
    console.log('  2. Run: npm install');
    console.log('  3. Demonstrate CLI help: node src/cli.js --help');
    console.log('  4. Show examples: node src/cli.js --examples');
    console.log('');
    console.log('📋 Commands to demonstrate:');
    console.log('  npm install');
    console.log('  node src/cli.js --help');
    console.log('  node src/cli.js --examples');
    console.log('  npm start');
    
    await waitForEnter("Ready to record terminal section?");
    
    console.log('\n💡 TIP: Use large font in terminal for better visibility');
    console.log('Suggested terminal settings:');
    console.log('  • Font size: 18-20pt');
    console.log('  • High contrast theme');
    console.log('  • Clean, minimal prompt');
    
    await waitForEnter();
    
    // Video Section 3: Web Interface Tour
    console.log('\n🎬 SECTION 3: WEB INTERFACE TOUR (2:00 - 4:00)');
    console.log('═'.repeat(50));
    console.log('');
    console.log('🌐 Web Interface Demonstration:');
    console.log('  1. Start server: npm start');
    console.log('  2. Open http://localhost:3000');
    console.log('  3. Tour the interface layout');
    console.log('  4. Show example dropdown');
    console.log('  5. Load "Quick Start" example');
    console.log('  6. Click "Run Code" button');
    console.log('  7. Highlight real-time output');
    console.log('');
    console.log('🎯 Key points to highlight:');
    console.log('  • Clean, intuitive interface');
    console.log('  • Real-time output');
    console.log('  • Program state visualization');
    console.log('  • Example templates');
    
    await waitForEnter("Ready to start web server for recording?");
    
    console.log('\n🚀 Starting web server...');
    try {
        console.log('Running: npm start');
        console.log('Server will start at http://localhost:3000');
        console.log('');
        console.log('💡 For recording:');
        console.log('  • Use browser zoom for better visibility');
        console.log('  • Clear browser cache if needed');
        console.log('  • Close unnecessary browser tabs');
        
        await waitForEnter("Web server should be running. Press Enter when ready for next section...");
        
    } catch (error) {
        console.log('❌ Error starting server:', error.message);
        console.log('💡 Manually run: npm start');
    }
    
    // Video Section 4: Feature Walkthrough
    console.log('\n🎬 SECTION 4: FEATURE WALKTHROUGH (4:00 - 11:00)');
    console.log('═'.repeat(50));
    console.log('');
    console.log('📚 Suggested Example Sequence:');
    console.log('');
    console.log('  1. 🚀 Quick Start (1 minute)');
    console.log('     • Show basic syntax');
    console.log('     • Demonstrate variables');
    console.log('     • Show simple conditionals');
    console.log('');
    console.log('  2. 📊 Variables & Math (1.5 minutes)');
    console.log('     • Number and string creation');
    console.log('     • Arithmetic operations');
    console.log('     • Temperature example');
    console.log('');
    console.log('  3. 📋 Task Management (1.5 minutes)');
    console.log('     • Create tasks');
    console.log('     • Mark as complete');
    console.log('     • Filter by status');
    console.log('');
    console.log('  4. 🤔 Logic & Decisions (1.5 minutes)');
    console.log('     • Score grading example');
    console.log('     • Multiple conditions');
    console.log('     • Study habits logic');
    console.log('');
    console.log('  5. 🔄 Loops & Repetition (1.5 minutes)');
    console.log('     • Countdown example');
    console.log('     • While loops');
    console.log('     • Energy management');
    console.log('');
    console.log('  6. 🎯 Complete App (2 minutes)');
    console.log('     • Personal assistant');
    console.log('     • Full workflow');
    console.log('     • Real application');
    
    await waitForEnter("Ready to record feature demonstrations?");
    
    // Video Section 5: Advanced Features
    console.log('\n🎬 SECTION 5: ADVANCED FEATURES (11:00 - 13:30)');
    console.log('═'.repeat(50));
    console.log('');
    console.log('🎤 Speech-to-Code Demo:');
    console.log('  1. Run a program first');
    console.log('  2. Click "To Speech" button');
    console.log('  3. Show speech output');
    console.log('  4. Explain round-trip fidelity');
    console.log('');
    console.log('🤖 AI Integration Demo:');
    console.log('  • Load LLM example');
    console.log('  • Show AI conversation syntax');
    console.log('  • Demonstrate mock responses');
    console.log('  • Explain future possibilities');
    
    await waitForEnter();
    
    // Video Section 6: CLI Demonstration
    console.log('\n🎬 SECTION 6: CLI DEMONSTRATION (13:30 - 14:30)');
    console.log('═'.repeat(50));
    console.log('');
    console.log('💻 Terminal Commands to Show:');
    console.log('');
    console.log('  # Run the tutorial');
    console.log('  node src/cli.js examples/tutorial.nat');
    console.log('');
    console.log('  # Run interactive story');
    console.log('  node src/cli.js examples/interactive_story.nat');
    console.log('');
    console.log('  # Interactive mode');
    console.log('  node src/cli.js -i');
    console.log('');
    console.log('🎯 Key points:');
    console.log('  • Show beautiful terminal output');
    console.log('  • Highlight emoji and formatting');
    console.log('  • Demonstrate interactive mode');
    console.log('  • Show file execution');
    
    await waitForEnter("Ready to demonstrate CLI features?");
    
    // Production Tips
    console.log('\n🎬 PRODUCTION TIPS');
    console.log('═'.repeat(50));
    console.log('');
    console.log('📹 Video Quality:');
    console.log('  • Record at 1080p minimum');
    console.log('  • Use 30fps for smooth motion');
    console.log('  • Ensure good lighting for webcam');
    console.log('  • Test audio levels before recording');
    console.log('');
    console.log('🎞️ Editing Guidelines:');
    console.log('  • Add chapter markers for navigation');
    console.log('  • Include timestamps in description');
    console.log('  • Add captions for accessibility');
    console.log('  • Keep transitions smooth and quick');
    console.log('');
    console.log('🎯 Engagement:');
    console.log('  • Maintain enthusiastic but clear tone');
    console.log('  • Pause to let viewers read code');
    console.log('  • Highlight key concepts visually');
    console.log('  • End with clear call-to-action');
    console.log('');
    console.log('📋 Final Checklist:');
    console.log('  ✅ All examples work correctly');
    console.log('  ✅ Audio is clear and consistent');
    console.log('  ✅ Screen recording is high quality');
    console.log('  ✅ Repository links are ready');
    console.log('  ✅ Description and timestamps prepared');
    
    await waitForEnter();
    
    console.log('\n🎉 VIDEO RECORDING GUIDE COMPLETE!');
    console.log('══════════════════════════════════════');
    console.log('');
    console.log('🚀 You\'re ready to create an amazing NaturaCode tutorial!');
    console.log('');
    console.log('📋 Quick Reference:');
    console.log('  • Web interface: http://localhost:3000');
    console.log('  • Tutorial: node src/cli.js examples/tutorial.nat');
    console.log('  • Story: node src/cli.js examples/interactive_story.nat');
    console.log('  • Help: node src/cli.js --help');
    console.log('  • Examples: node src/cli.js --examples');
    console.log('');
    console.log('🎬 Good luck with your video creation!');
    console.log('🌿 Let\'s show the world the future of programming!');
    
    rl.close();
}

if (require.main === module) {
    main().catch(console.error);
}

module.exports = { main };