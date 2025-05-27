#!/usr/bin/env node

/**
 * NaturaCode CLI - Where Programming Becomes Conversation
 * 
 * Run NaturaCode files directly from the command line
 */

const fs = require('fs');
const path = require('path');
const { NaturaCode } = require('./naturacode.js');

const NATURA_ASCII = `
╔═══════════════════════════════════════════╗
║                                           ║
║     🌿 NaturaCode 🌿                      ║
║     Programming in Plain English          ║
║                                           ║
║     Where Code Becomes Conversation       ║
║                                           ║
╚═══════════════════════════════════════════╝
`;

async function runFile(filePath) {
    try {
        // Check if file exists
        if (!fs.existsSync(filePath)) {
            console.error(`❌ File not found: ${filePath}`);
            console.log(`💡 Tip: Make sure the file path is correct and the file exists.`);
            process.exit(1);
        }

        // Read the file
        const code = fs.readFileSync(filePath, 'utf8');
        
        console.log(NATURA_ASCII);
        console.log(`🚀 Running: ${path.basename(filePath)}`);
        console.log(`📍 Location: ${path.resolve(filePath)}`);
        console.log('─'.repeat(50));

        // Create interpreter and run
        const natura = new NaturaCode();
        await natura.run(code);

        console.log('─'.repeat(50));
        console.log('✨ Program completed successfully!');
        
        // Show final state
        const context = natura.getContext();
        if (Object.keys(context.variables).length > 0) {
            console.log('\n📊 Final Variables:');
            for (const [name, value] of Object.entries(context.variables)) {
                console.log(`   ${name}: ${value}`);
            }
        }
        
        if (context.tasks.length > 0) {
            console.log('\n📋 Final Tasks:');
            context.tasks.forEach(task => {
                const status = task.status === 'complete' ? '✅' : '⏳';
                console.log(`   ${status} ${task.name} (${task.status})`);
            });
        }

    } catch (error) {
        console.error(`\n❌ Error: ${error.message}`);
        process.exit(1);
    }
}

async function interactive() {
    const readline = require('readline');
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    console.log(NATURA_ASCII);
    console.log('🎯 Interactive NaturaCode Shell');
    console.log('Type your commands in plain English, or "exit" to quit');
    console.log('─'.repeat(50));

    const natura = new NaturaCode();

    const askQuestion = () => {
        rl.question('🌿 > ', async (input) => {
            if (input.toLowerCase().trim() === 'exit') {
                console.log('👋 Goodbye! Thanks for speaking NaturaCode!');
                rl.close();
                return;
            }

            if (input.trim() === '') {
                askQuestion();
                return;
            }

            try {
                await natura.run(input);
            } catch (error) {
                console.log(`💔 ${error.message}`);
                console.log('💡 Try rephrasing or check the syntax guide');
            }
            
            askQuestion();
        });
    };

    askQuestion();
}

function showExamples() {
    console.log(NATURA_ASCII);
    console.log('📚 Available NaturaCode Examples');
    console.log('─'.repeat(50));
    console.log('');
    console.log('🚀 Getting Started:');
    console.log('  first_conversation.nat    - Complete intro to NaturaCode features');
    console.log('  calculator.nat           - Basic arithmetic operations');
    console.log('');
    console.log('🎮 Interactive:');
    console.log('  interactive_story.nat    - Text adventure game with variables');
    console.log('  todo_manager.nat         - Task management application');
    console.log('');
    console.log('🤖 Advanced:');
    console.log('  llm_mcp_example.nat      - AI/LLM integration demo');
    console.log('');
    console.log('💡 Run any example:');
    console.log('  node cli.js examples/<filename>');
    console.log('');
    console.log('Example:');
    console.log('  node cli.js examples/first_conversation.nat');
    console.log('  node cli.js examples/interactive_story.nat');
}

function showHelp() {
    console.log(NATURA_ASCII);
    console.log('📖 NaturaCode CLI Help');
    console.log('─'.repeat(50));
    console.log('');
    console.log('🚀 Usage:');
    console.log('  node cli.js <file.nat>     Run a NaturaCode file');
    console.log('  node cli.js -i             Start interactive mode');
    console.log('  node cli.js --help          Show this help');
    console.log('  node cli.js --examples      List available examples');
    console.log('');
    console.log('📝 Basic Commands:');
    console.log('  Variables:');
    console.log('    create a number called x with value 10');
    console.log('    create a string called name with value "Alice"');
    console.log('');
    console.log('  Math:');
    console.log('    add 5 to x');
    console.log('    subtract 3 from x');
    console.log('    multiply x by 2');
    console.log('');
    console.log('  Logic:');
    console.log('    if x is above 12, show "High" otherwise show "Low"');
    console.log('');
    console.log('  Tasks:');
    console.log('    create a task called "Learn NaturaCode" with status "pending"');
    console.log('    mark task "Learn NaturaCode" as complete');
    console.log('    show all tasks');
    console.log('');
    console.log('  Loops:');
    console.log('    repeat 5 times, show "Hello"');
    console.log('    while x is below 10, add 1 to x');
    console.log('');
    console.log('🎯 Quick Start:');
    console.log('  node cli.js examples/first_conversation.nat');
    console.log('  node cli.js examples/interactive_story.nat');
    console.log('');
    console.log('🌐 Web Interface:');
    console.log('  npm start   # Launch web interface at localhost:3000');
    console.log('');
    console.log('💡 Tips:');
    console.log('  • Use descriptive variable names');
    console.log('  • Add comments with "note: your comment"');
    console.log('  • Check examples/ directory for more inspiration');
    console.log('  • Visit localhost:3000 for interactive coding');
}

// Parse command line arguments
const args = process.argv.slice(2);

if (args.length === 0 || args[0] === '--help' || args[0] === '-h') {
    showHelp();
} else if (args[0] === '--examples' || args[0] === '-e') {
    showExamples();
} else if (args[0] === '-i' || args[0] === '--interactive') {
    interactive();
} else {
    const filePath = args[0];
    runFile(filePath);
}