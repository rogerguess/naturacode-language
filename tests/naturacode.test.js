/**
 * Comprehensive Test Suite for NaturaCode
 * 
 * Tests every aspect of our human-friendly programming language
 */

const { NaturaCode } = require('../src/naturacode.js');

describe('NaturaCode - Programming in Plain English', () => {
    let natura;

    beforeEach(() => {
        natura = new NaturaCode();
    });

    describe('🔢 Variables and Basic Operations', () => {
        test('should create numbers with natural syntax', async () => {
            await natura.run('create a number called x with value 42');
            expect(natura.context.variables.x).toBe(42);
        });

        test('should create strings with natural syntax', async () => {
            await natura.run('create a string called greeting with value "Hello World"');
            expect(natura.context.variables.greeting).toBe("Hello World");
        });

        test('should handle negative numbers', async () => {
            await natura.run('create a number called temp with value -10');
            expect(natura.context.variables.temp).toBe(-10);
        });

        test('should handle decimal numbers', async () => {
            await natura.run('create a number called pi with value 3.14159');
            expect(natura.context.variables.pi).toBe(3.14159);
        });
    });

    describe('🧮 Arithmetic Operations', () => {
        beforeEach(async () => {
            await natura.run('create a number called x with value 10');
        });

        test('should add numbers naturally', async () => {
            await natura.run('add 5 to x');
            expect(natura.context.variables.x).toBe(15);
        });

        test('should subtract numbers naturally', async () => {
            await natura.run('subtract 3 from x');
            expect(natura.context.variables.x).toBe(7);
        });

        test('should multiply numbers naturally', async () => {
            await natura.run('multiply x by 3');
            expect(natura.context.variables.x).toBe(30);
        });

        test('should divide numbers naturally', async () => {
            await natura.run('divide x by 2');
            expect(natura.context.variables.x).toBe(5);
        });

        test('should handle division by zero gracefully', async () => {
            await expect(natura.run('divide x by 0')).rejects.toThrow('Cannot divide by zero');
        });

        test('should chain arithmetic operations', async () => {
            await natura.run(`add 5 to x
multiply x by 2
subtract 10 from x`);
            expect(natura.context.variables.x).toBe(20); // (10+5)*2-10 = 20
        });
    });

    describe('📋 Task Management', () => {
        test('should create tasks with natural syntax', async () => {
            await natura.run('create a task called "Learn NaturaCode" with status "pending"');
            expect(natura.context.tasks).toHaveLength(1);
            expect(natura.context.tasks[0].name).toBe("Learn NaturaCode");
            expect(natura.context.tasks[0].status).toBe("pending");
        });

        test('should mark tasks as complete', async () => {
            await natura.run(`create a task called "Write tests" with status "pending"
mark task "Write tests" as complete`);
            expect(natura.context.tasks[0].status).toBe("complete");
        });

        test('should handle marking non-existent tasks', async () => {
            await expect(natura.run('mark task "Nonexistent" as complete')).rejects.toThrow('Task "Nonexistent" not found');
        });

        test('should filter tasks by status', async () => {
            await natura.run(`create a task called "Task 1" with status "pending"
create a task called "Task 2" with status "complete"
create a task called "Task 3" with status "pending"`);
            
            // Test the filtering (we'll check the output)
            const output = await natura.run('show tasks where status is "pending"');
            const pendingTasksOutput = output.some(line => line.includes('Task 1') || line.includes('Task 3'));
            expect(pendingTasksOutput).toBe(true);
        });
    });

    describe('🤔 Conditional Logic', () => {
        test('should handle if-then conditions', async () => {
            await natura.run(`create a number called age with value 25
if age is above 18, show "Adult"`);
            
            const output = natura.context.output;
            expect(output.some(line => line.includes('Adult'))).toBe(true);
        });

        test('should handle if-then-else conditions', async () => {
            await natura.run(`create a number called age with value 15
if age is above 18, show "Adult" otherwise show "Minor"`);
            
            const output = natura.context.output;
            expect(output.some(line => line.includes('Minor'))).toBe(true);
        });

        test('should handle different comparison operators', async () => {
            await natura.run('create a number called score with value 85');
            
            // Test "above"
            await natura.run('if score is above 80, show "High score"');
            expect(natura.context.output.some(line => line.includes('High score'))).toBe(true);
            
            // Reset output and test "below"
            natura.context.output = [];
            await natura.run('if score is below 90, show "Not perfect"');
            expect(natura.context.output.some(line => line.includes('Not perfect'))).toBe(true);
            
            // Reset output and test "equal to"
            natura.context.output = [];
            await natura.run('if score is equal to 85, show "Exact match"');
            expect(natura.context.output.some(line => line.includes('Exact match'))).toBe(true);
        });
    });

    describe('🔄 Loops and Repetition', () => {
        test('should handle repeat loops', async () => {
            await natura.run(`create a number called counter with value 0
repeat 3 times
    add 1 to counter
end`);
            expect(natura.context.variables.counter).toBe(3);
        });

        test('should handle while loops', async () => {
            await natura.run(`create a number called x with value 0
while x is below 5
    add 1 to x
end`);
            expect(natura.context.variables.x).toBe(5);
        });

        test('should prevent infinite while loops', async () => {
            await expect(natura.run(`create a number called x with value 0
while x is below 5
end`)).rejects.toThrow('While loop ran too many times');
        });
    });

    describe('🌐 API Integration', () => {
        test('should connect to APIs', async () => {
            await natura.run('connect to the API at "https://api.example.com"');
            expect(natura.context.apiEndpoint).toBe("https://api.example.com");
        });

        test('should send search queries', async () => {
            await natura.run(`connect to the API at "https://api.example.com"
send a search for "test query" using the key "q"`);
            expect(natura.context.apiResponse).toBeDefined();
            expect(natura.context.apiResponse.query).toBe("test query");
        });

        test('should handle API responses', async () => {
            await natura.run(`connect to the API at "https://api.example.com"
send a search for "test" using the key "query"
get the response`);
            expect(natura.context.apiResponse).toBeDefined();
            expect(natura.context.apiResponse.results).toHaveLength(2);
        });

        test('should require API connection before searching', async () => {
            await expect(natura.run('send a search for "test" using the key "q"')).rejects.toThrow('Connect to an API first');
        });
    });

    describe('🗣️ Speech Fidelity', () => {
        test('should convert code to speech', () => {
            natura.context.variables.x = 10;
            natura.context.variables.name = "Alice";
            
            const speech = natura.toSpeech();
            expect(speech).toContain('Create a number called x with value 10');
            expect(speech).toContain('Create a string called name with value "Alice"');
        });

        test('should convert speech back to code', () => {
            const speech = 'Create a number called x with value 10. Create a string called greeting with value "hello".';
            const code = natura.fromSpeech(speech);
            
            expect(code).toContain('create a number called x with value 10');
            expect(code).toContain('create a string called greeting with value "hello"');
        });

        test('should maintain fidelity in round-trip conversion', async () => {
            const originalCode = `create a number called x with value 42
create a string called name with value "Test"
create a task called "Demo" with status "pending"`;

            // Run the original code
            await natura.run(originalCode);
            
            // Convert to speech
            const speech = natura.toSpeech();
            
            // Convert back to code
            const reconstructedCode = natura.fromSpeech(speech);
            
            // Run the reconstructed code in a new interpreter
            const newNatura = new NaturaCode();
            await newNatura.run(reconstructedCode);
            
            // Verify the contexts match
            expect(newNatura.context.variables.x).toBe(42);
            expect(newNatura.context.variables.name).toBe("Test");
            expect(newNatura.context.tasks[0].name).toBe("Demo");
            expect(newNatura.context.tasks[0].status).toBe("pending");
        });
    });

    describe('💬 Comments and Documentation', () => {
        test('should ignore comments gracefully', async () => {
            await natura.run(`note: this is a comment
create a number called x with value 5
note: another comment
add 3 to x`);
            
            expect(natura.context.variables.x).toBe(8);
        });
    });

    describe('❌ Error Handling', () => {
        test('should handle unknown commands gracefully', async () => {
            await expect(natura.run('blah blah nonsense')).rejects.toThrow('I don\'t understand "blah blah nonsense"');
        });

        test('should handle operations on non-existent variables', async () => {
            await expect(natura.run('add 5 to nonexistent')).rejects.toThrow('Variable nonexistent doesn\'t exist yet');
        });

        test('should handle showing non-existent variables', async () => {
            await expect(natura.run('show nonexistent')).rejects.toThrow('Variable nonexistent doesn\'t exist yet');
        });

        test('should handle API operations without connection', async () => {
            await expect(natura.run('get the response')).rejects.toThrow('No API response available');
        });
    });

    describe('🎭 Complex Scenarios', () => {
        test('should handle a complete program workflow', async () => {
            const program = `note: A complete NaturaCode program
create a number called budget with value 1000
create a number called spent with value 0

create a task called "Buy groceries" with status "pending"
create a task called "Pay bills" with status "complete"
create a task called "Save money" with status "pending"

add 200 to spent
subtract 200 from budget

if budget is above 500, show "Budget looks good" otherwise show "Watch spending"

mark task "Buy groceries" as complete
show tasks where status is "complete"

connect to the API at "https://api.finance.com"
send a search for "budget tips" using the key "query"
get the response`;

            await natura.run(program);

            // Verify final state
            expect(natura.context.variables.budget).toBe(800);
            expect(natura.context.variables.spent).toBe(200);
            expect(natura.context.tasks).toHaveLength(3);
            expect(natura.context.tasks.filter(t => t.status === 'complete')).toHaveLength(2);
            expect(natura.context.apiResponse).toBeDefined();
            expect(natura.context.output.some(line => line.includes('Budget looks good'))).toBe(true);
        });

        test('should handle nested logic with loops', async () => {
            const program = `create a number called total with value 0
create a number called i with value 1

repeat 5 times
    if i is above 3, add 10 to total otherwise add 5 to total
    add 1 to i
end`;

            await natura.run(program);

            // First 3 iterations: add 5 each (total = 15)
            // Last 2 iterations: add 10 each (total = 35)
            expect(natura.context.variables.total).toBe(35);
        });
    });

    describe('🔄 Interpreter State Management', () => {
        test('should reset properly', async () => {
            await natura.run('create a number called x with value 10');
            natura.reset();
            
            expect(natura.context.variables).toEqual({});
            expect(natura.context.tasks).toEqual([]);
            expect(natura.context.output).toEqual([]);
        });

        test('should provide context snapshots', async () => {
            await natura.run('create a number called test with value 123');
            const context = natura.getContext();
            
            expect(context.variables.test).toBe(123);
            expect(context).not.toBe(natura.context); // Should be a copy
        });
    });
});