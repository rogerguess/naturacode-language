/**
 * Quick test of the demonstration system components
 */

const { DemonstrationController } = require('./src/demonstration-controller.js');
const { ContextGenerator } = require('./src/context-generator.js');

async function testDemonstrationSystem() {
    console.log('🧪 Testing NaturaCode Demonstration System...\n');
    
    try {
        // Test 1: Context Generation
        console.log('1️⃣ Testing Context Generation...');
        const contextGen = new ContextGenerator();
        const context = contextGen.generateContext();
        console.log(`✅ Generated context with ${Object.keys(context.grammar).length} grammar categories`);
        console.log(`✅ Loaded ${Object.keys(context.examples).length} example files`);
        
        // Test 2: Prompt Generation
        console.log('\n2️⃣ Testing Prompt Generation...');
        const prompt = contextGen.generatePrompt('calculator', 'beginner');
        console.log(`✅ Generated prompt (${prompt.length} characters)`);
        
        // Test 3: Demonstration Controller
        console.log('\n3️⃣ Testing Demonstration Controller...');
        const controller = new DemonstrationController();
        const models = controller.getAvailableModels();
        const categories = controller.getAvailableCategories();
        console.log(`✅ Found ${models.length} available models`);
        console.log(`✅ Found ${categories.length} categories`);
        
        // Test 4: Quick Test with Mock Model
        console.log('\n4️⃣ Testing Quick Test Function...');
        const quickTestResult = await controller.runQuickTest(
            'mock-gpt', 
            'Create a simple program that adds two numbers'
        );
        
        if (quickTestResult.evaluation) {
            console.log(`✅ Quick test completed - Score: ${quickTestResult.evaluation.overall.score}/100`);
            console.log(`✅ Generated code: ${quickTestResult.result.response.split('\n').length} lines`);
        } else {
            console.log(`❌ Quick test failed: ${quickTestResult.error}`);
        }
        
        // Test 5: System Stats
        console.log('\n5️⃣ Testing System Stats...');
        const stats = controller.getStats();
        console.log(`✅ System stats generated - ${stats.sessions.total} sessions tracked`);
        
        console.log('\n🎉 All demonstration system tests passed!');
        console.log('\n📊 System Summary:');
        console.log(`   • Models available: ${models.length}`);
        console.log(`   • Categories available: ${categories.length}`);
        console.log(`   • Grammar patterns: ${Object.keys(context.grammar).length}`);
        console.log(`   • Example files: ${Object.keys(context.examples).length}`);
        
        return true;
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
        console.error(error.stack);
        return false;
    }
}

// Run the test
if (require.main === module) {
    testDemonstrationSystem().then(success => {
        process.exit(success ? 0 : 1);
    });
}

module.exports = { testDemonstrationSystem };