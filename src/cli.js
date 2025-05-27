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

function showHelp() {
    console.log(NATURA_ASCII);
    console.log('📖 NaturaCode CLI Help');
    console.log('─'.repeat(50));
    console.log('');
    console.log('Usage:');
    console.log('  node cli.js <file.nat>     Run a NaturaCode file');
    console.log('  node cli.js -i             Start interactive mode');
    console.log('  node cli.js --help          Show this help');
    console.log('');
    console.log('Example Commands:');
    console.log('  create a number called x with value 10');
    console.log('  add 5 to x');
    console.log('  if x is above 12, show "High"');
    console.log('  create a task called "Learn NaturaCode" with status "pending"');
    console.log('  show all tasks');
    console.log('');
    console.log('For more examples, check the examples/ directory');
}

// Parse command line arguments
const args = process.argv.slice(2);

if (args.length === 0 || args[0] === '--help' || args[0] === '-h') {
    showHelp();
} else if (args[0] === '-i' || args[0] === '--interactive') {
    interactive();
} else {
    const filePath = args[0];
    runFile(filePath);
}