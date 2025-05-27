#!/usr/bin/env node

/**
 * GitHub Repository Setup Utility for NaturaCode
 * 
 * This utility helps create a private GitHub repository and push NaturaCode to it.
 * It will guide you through the process securely.
 */

const readline = require('readline');
const { execSync } = require('child_process');
const fs = require('fs');
const https = require('https');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

console.log(`
╔═══════════════════════════════════════════╗
║                                           ║
║     🌿 NaturaCode GitHub Setup 🌿         ║
║     Repository Creation Utility           ║
║                                           ║
╚═══════════════════════════════════════════╝
`);

async function question(prompt) {
    return new Promise((resolve) => {
        rl.question(prompt, resolve);
    });
}

async function hiddenQuestion(prompt) {
    return new Promise((resolve) => {
        process.stdout.write(prompt);
        process.stdin.setRawMode(true);
        process.stdin.resume();
        process.stdin.setEncoding('utf8');
        
        let input = '';
        
        process.stdin.on('data', function(char) {
            char = char + '';
            
            switch(char) {
                case '\n':
                case '\r':
                case '\u0004':
                    process.stdin.setRawMode(false);
                    process.stdin.pause();
                    process.stdout.write('\n');
                    resolve(input);
                    break;
                case '\u0003':
                    process.exit();
                    break;
                case '\u007f': // backspace
                    if (input.length > 0) {
                        input = input.slice(0, -1);
                        process.stdout.write('\b \b');
                    }
                    break;
                default:
                    input += char;
                    process.stdout.write('*');
                    break;
            }
        });
    });
}

async function createGitHubRepo(username, token, repoName) {
    return new Promise((resolve, reject) => {
        const data = JSON.stringify({
            name: repoName,
            description: "NaturaCode - Programming in Plain English. A revolutionary language that bridges human thought and computer execution.",
            private: true,
            has_issues: true,
            has_projects: true,
            has_wiki: true
        });

        const options = {
            hostname: 'api.github.com',
            port: 443,
            path: '/user/repos',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': data.length,
                'Authorization': `token ${token}`,
                'User-Agent': 'NaturaCode-Setup-Utility'
            }
        };

        const req = https.request(options, (res) => {
            let responseData = '';
            
            res.on('data', (chunk) => {
                responseData += chunk;
            });
            
            res.on('end', () => {
                if (res.statusCode === 201) {
                    const repo = JSON.parse(responseData);
                    resolve(repo);
                } else {
                    reject(new Error(`GitHub API error: ${res.statusCode} - ${responseData}`));
                }
            });
        });

        req.on('error', (e) => {
            reject(e);
        });

        req.write(data);
        req.end();
    });
}

async function main() {
    try {
        console.log('🚀 Setting up your NaturaCode repository on GitHub...\n');
        
        // Get GitHub username
        const username = await question('📝 GitHub username (rogerguess): ');
        const actualUsername = username.trim() || 'rogerguess';
        
        console.log('\n🔑 You\'ll need a GitHub Personal Access Token with repo permissions.');
        console.log('   Create one at: https://github.com/settings/personal-access-tokens/new');
        console.log('   Required scopes: repo (all), delete_repo\n');
        
        // Get GitHub token securely
        const token = await hiddenQuestion('🔐 GitHub Personal Access Token: ');
        
        if (!token.trim()) {
            console.log('\n❌ Token is required. Please run the script again with a valid token.');
            process.exit(1);
        }
        
        // Repository name
        const repoName = await question('\n📦 Repository name (naturacode-language): ');
        const actualRepoName = repoName.trim() || 'naturacode-language';
        
        console.log('\n🏗️  Creating GitHub repository...');
        
        // Create the repository
        const repo = await createGitHubRepo(actualUsername, token.trim(), actualRepoName);
        
        console.log(`✅ Repository created successfully!`);
        console.log(`📍 URL: ${repo.html_url}`);
        console.log(`🔗 Clone URL: ${repo.clone_url}`);
        
        // Set up git remote
        console.log('\n🔗 Setting up git remote...');
        
        try {
            execSync('git remote remove origin', { cwd: process.cwd(), stdio: 'ignore' });
        } catch (e) {
            // Remote doesn't exist, that's fine
        }
        
        execSync(`git remote add origin ${repo.clone_url}`, { cwd: process.cwd() });
        console.log('✅ Git remote configured');
        
        // Add all files and commit
        console.log('\n📁 Adding files to git...');
        execSync('git add .', { cwd: process.cwd() });
        
        console.log('💾 Creating initial commit...');
        execSync('git commit -m "🌿 Initial commit: NaturaCode - Programming in Plain English\\n\\nA revolutionary programming language that bridges human thought and computer execution.\\nFeatures natural English syntax, AI integration, and perfect speech fidelity.\\n\\n🚀 Generated with Claude Code"', { cwd: process.cwd() });
        
        // Push to GitHub
        console.log('🚀 Pushing to GitHub...');
        execSync(`git push -u origin main`, { cwd: process.cwd() });
        
        console.log(`
╔═══════════════════════════════════════════╗
║                                           ║
║     🎉 SUCCESS! 🎉                        ║
║                                           ║
║     NaturaCode is now on GitHub!          ║
║                                           ║
║     Repository: ${actualUsername}/${actualRepoName.padEnd(25)}║
║     URL: ${repo.html_url.padEnd(33)}║
║                                           ║
║     🌿 Ready to revolutionize coding! 🌿  ║
║                                           ║
╚═══════════════════════════════════════════╝
        `);
        
        // Clean up
        console.log('\n🧹 Cleaning up...');
        // Note: We're not saving the token anywhere for security
        
    } catch (error) {
        console.error('\n❌ Error:', error.message);
        
        if (error.message.includes('422')) {
            console.log('\n💡 Tip: Repository might already exist. Try a different name or delete the existing repo first.');
        } else if (error.message.includes('401')) {
            console.log('\n💡 Tip: Check your Personal Access Token permissions and expiration.');
        }
        
        process.exit(1);
    } finally {
        rl.close();
    }
}

if (require.main === module) {
    main();
}

module.exports = { createGitHubRepo };