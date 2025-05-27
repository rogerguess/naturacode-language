/**
 * NaturaCode - A Programming Language That Speaks Human
 * 
 * Where code becomes conversation, and logic flows like language.
 * This is not just a parser - it's a bridge between human thought and machine execution.
 */

class NaturaCode {
    constructor() {
        this.context = {
            variables: {},
            tasks: [],
            apiResponse: null,
            apiEndpoint: null,
            output: [],
            loopState: {
                inLoop: false,
                loopCommands: [],
                loopType: null,
                loopCount: 0,
                loopCondition: null
            },
            mcpServers: {},
            llmResponse: null,
            pendingLLMRequest: null
        };
        
        // Command patterns - the poetry of programming
        this.patterns = {
            // Variables: "create a number called x with value 10"
            createNumber: /^create (?:a )?number called (\w+) with value (-?\d+(?:\.\d+)?)$/i,
            createString: /^create (?:a )?(?:string|text) called (\w+) with value "([^"]*)"$/i,
            
            // Arithmetic: "add 5 to x"
            add: /^add (-?\d+(?:\.\d+)?) to (\w+)$/i,
            subtract: /^subtract (-?\d+(?:\.\d+)?) from (\w+)$/i,
            multiply: /^multiply (\w+) by (-?\d+(?:\.\d+)?)$/i,
            divide: /^divide (\w+) by (-?\d+(?:\.\d+)?)$/i,
            
            // Tasks: "create a task called 'Write report' with status 'pending'"
            createTask: /^create (?:a )?task called "([^"]*)" with status "([^"]*)"$/i,
            markTaskComplete: /^mark task "([^"]*)" as (?:complete|done|finished)$/i,
            showTasks: /^show (?:all )?tasks$/i,
            showTasksWhere: /^show tasks where status is "([^"]*)"$/i,
            
            // Conditionals: "if x is above 10, show 'High' otherwise show 'Low'"
            ifThen: /^if (\w+) is (above|below|equal to|greater than|less than) (-?\d+(?:\.\d+)?), (.+?)(?:\s+otherwise\s+(.+))?$/i,
            ifThenVar: /^if (\w+) is (above|below|equal to|greater than|less than) (\w+), (.+?)(?:\s+otherwise\s+(.+))?$/i,
            
            // Loops: "repeat 5 times" or "while x is below 10"
            repeat: /^repeat (\d+) times?$/i,
            while: /^while (\w+) is (above|below|equal to|greater than|less than) (-?\d+(?:\.\d+)?)$/i,
            endLoop: /^(?:end|done)$/i,
            
            // API: "connect to the API at 'url'"
            connectAPI: /^connect to (?:the )?API at "([^"]*)"$/i,
            sendSearch: /^send (?:a )?search for "([^"]*)" using (?:the )?key "([^"]*)"$/i,
            getResponse: /^get (?:the )?response$/i,
            
            // MCP: Model Context Protocol integration
            connectMCP: /^connect to MCP server at "([^"]*)" with protocol "([^"]*)"$/i,
            disconnectMCP: /^disconnect from MCP server "([^"]*)"$/i,
            
            // LLM: Large Language Model interactions
            sendMessage: /^send message to model "([^"]*)" with (?:system prompt (\w+) and )?user message (\w+)$/i,
            sendMessageDirect: /^send message to model "([^"]*)" with (?:system prompt (\w+) and )?user message "([^"]*)"$/i,
            waitForResponse: /^wait for model response$/i,
            getResponseAs: /^get (?:the )?response as "([^"]*)"$/i,
            
            // String utilities
            measureLength: /^measure length of (\w+) and store in (\w+)$/i,
            
            // Output: "show x" or "show 'Hello'"
            showVariable: /^show (\w+)$/i,
            showString: /^show "([^"]*)"$/i,
            showResponse: /^show (?:the )?response$/i,
            
            // Comments: "note: this is a comment"
            comment: /^note:\s*(.*)$/i
        };
    }

    /**
     * Parse a single line of NaturaCode into an Abstract Syntax Tree node
     */
    parseLine(line) {
        line = line.trim();
        if (!line) return null;

        // Check each pattern
        for (const [command, pattern] of Object.entries(this.patterns)) {
            const match = line.match(pattern);
            if (match) {
                return {
                    type: command,
                    line: line,
                    matches: match.slice(1) // Remove the full match, keep groups
                };
            }
        }

        // If no pattern matches, it's an unknown command
        return {
            type: 'unknown',
            line: line,
            matches: []
        };
    }

    /**
     * Execute a parsed AST node
     */
    async executeNode(node) {
        if (!node) return;

        try {
            switch (node.type) {
                case 'createNumber':
                    this.context.variables[node.matches[0]] = parseFloat(node.matches[1]);
                    this.output(`Created number ${node.matches[0]} with value ${node.matches[1]}`);
                    break;

                case 'createString':
                    this.context.variables[node.matches[0]] = node.matches[1];
                    this.output(`Created string ${node.matches[0]} with value "${node.matches[1]}"`);
                    break;

                case 'add':
                    const addValue = parseFloat(node.matches[0]);
                    const addVar = node.matches[1];
                    if (!(addVar in this.context.variables)) {
                        throw new Error(`Variable ${addVar} doesn't exist yet. Create it first!`);
                    }
                    this.context.variables[addVar] += addValue;
                    this.output(`Added ${addValue} to ${addVar}. New value: ${this.context.variables[addVar]}`);
                    break;

                case 'subtract':
                    const subValue = parseFloat(node.matches[0]);
                    const subVar = node.matches[1];
                    if (!(subVar in this.context.variables)) {
                        throw new Error(`Variable ${subVar} doesn't exist yet. Create it first!`);
                    }
                    this.context.variables[subVar] -= subValue;
                    this.output(`Subtracted ${subValue} from ${subVar}. New value: ${this.context.variables[subVar]}`);
                    break;

                case 'multiply':
                    const multVar = node.matches[0];
                    const multValue = parseFloat(node.matches[1]);
                    if (!(multVar in this.context.variables)) {
                        throw new Error(`Variable ${multVar} doesn't exist yet. Create it first!`);
                    }
                    this.context.variables[multVar] *= multValue;
                    this.output(`Multiplied ${multVar} by ${multValue}. New value: ${this.context.variables[multVar]}`);
                    break;

                case 'divide':
                    const divVar = node.matches[0];
                    const divValue = parseFloat(node.matches[1]);
                    if (divValue === 0) {
                        throw new Error("Cannot divide by zero! That would break the universe.");
                    }
                    if (!(divVar in this.context.variables)) {
                        throw new Error(`Variable ${divVar} doesn't exist yet. Create it first!`);
                    }
                    this.context.variables[divVar] /= divValue;
                    this.output(`Divided ${divVar} by ${divValue}. New value: ${this.context.variables[divVar]}`);
                    break;

                case 'createTask':
                    const taskName = node.matches[0];
                    const taskStatus = node.matches[1];
                    this.context.tasks.push({ name: taskName, status: taskStatus });
                    this.output(`Created task: "${taskName}" with status "${taskStatus}"`);
                    break;

                case 'markTaskComplete':
                    const completedTaskName = node.matches[0];
                    const task = this.context.tasks.find(t => t.name === completedTaskName);
                    if (task) {
                        task.status = 'complete';
                        this.output(`Marked task "${completedTaskName}" as complete`);
                    } else {
                        throw new Error(`Task "${completedTaskName}" not found. Check the name and try again.`);
                    }
                    break;

                case 'showTasks':
                    if (this.context.tasks.length === 0) {
                        this.output("No tasks yet. Create some tasks to get started!");
                    } else {
                        this.output("All tasks:");
                        this.context.tasks.forEach(task => {
                            this.output(`  • ${task.name} (${task.status})`);
                        });
                    }
                    break;

                case 'showTasksWhere':
                    const filterStatus = node.matches[0];
                    const filteredTasks = this.context.tasks.filter(t => t.status === filterStatus);
                    if (filteredTasks.length === 0) {
                        this.output(`No tasks with status "${filterStatus}"`);
                    } else {
                        this.output(`Tasks with status "${filterStatus}":`);
                        filteredTasks.forEach(task => {
                            this.output(`  • ${task.name}`);
                        });
                    }
                    break;

                case 'ifThen':
                    const ifVar = node.matches[0];
                    const operator = node.matches[1];
                    const compareValue = parseFloat(node.matches[2]);
                    const thenAction = node.matches[3];
                    const elseAction = node.matches[4];

                    if (!(ifVar in this.context.variables)) {
                        throw new Error(`Variable ${ifVar} doesn't exist yet. Create it first!`);
                    }

                    const varValue = this.context.variables[ifVar];
                    let condition = false;

                    switch (operator.toLowerCase()) {
                        case 'above':
                        case 'greater than':
                            condition = varValue > compareValue;
                            break;
                        case 'below':
                        case 'less than':
                            condition = varValue < compareValue;
                            break;
                        case 'equal to':
                            condition = varValue === compareValue;
                            break;
                    }

                    if (condition && thenAction) {
                        await this.executeNode(this.parseLine(thenAction));
                    } else if (!condition && elseAction) {
                        await this.executeNode(this.parseLine(elseAction));
                    }
                    break;

                case 'ifThenVar':
                    const ifVar2 = node.matches[0];
                    const operator2 = node.matches[1];
                    const compareVar = node.matches[2];
                    const thenAction2 = node.matches[3];
                    const elseAction2 = node.matches[4];

                    if (!(ifVar2 in this.context.variables)) {
                        throw new Error(`Variable ${ifVar2} doesn't exist yet. Create it first!`);
                    }
                    if (!(compareVar in this.context.variables)) {
                        throw new Error(`Variable ${compareVar} doesn't exist yet. Create it first!`);
                    }

                    const varValue2 = this.context.variables[ifVar2];
                    const compareValue2 = this.context.variables[compareVar];
                    let condition2 = false;

                    switch (operator2.toLowerCase()) {
                        case 'above':
                        case 'greater than':
                            condition2 = varValue2 > compareValue2;
                            break;
                        case 'below':
                        case 'less than':
                            condition2 = varValue2 < compareValue2;
                            break;
                        case 'equal to':
                            condition2 = varValue2 === compareValue2;
                            break;
                    }

                    if (condition2 && thenAction2) {
                        await this.executeNode(this.parseLine(thenAction2));
                    } else if (!condition2 && elseAction2) {
                        await this.executeNode(this.parseLine(elseAction2));
                    }
                    break;

                case 'repeat':
                    const repeatCount = parseInt(node.matches[0]);
                    this.context.loopState = {
                        inLoop: true,
                        loopCommands: [],
                        loopType: 'repeat',
                        loopCount: repeatCount,
                        currentIteration: 0
                    };
                    this.output(`Starting to repeat ${repeatCount} times...`);
                    break;

                case 'while':
                    const whileVar = node.matches[0];
                    const whileOp = node.matches[1];
                    const whileValue = parseFloat(node.matches[2]);
                    
                    this.context.loopState = {
                        inLoop: true,
                        loopCommands: [],
                        loopType: 'while',
                        variable: whileVar,
                        operator: whileOp,
                        value: whileValue
                    };
                    this.output(`Starting while loop: while ${whileVar} is ${whileOp} ${whileValue}...`);
                    break;

                case 'endLoop':
                    if (!this.context.loopState.inLoop) {
                        throw new Error("Not in a loop! Use 'repeat' or 'while' first.");
                    }
                    await this.executeLoop();
                    break;

                case 'connectAPI':
                    this.context.apiEndpoint = node.matches[0];
                    this.output(`Connected to API at ${this.context.apiEndpoint}`);
                    break;

                case 'sendSearch':
                    const query = node.matches[0];
                    const queryKey = node.matches[1];
                    
                    if (!this.context.apiEndpoint) {
                        throw new Error("Connect to an API first before sending searches!");
                    }

                    // Mock API response for demonstration
                    this.context.apiResponse = {
                        query: query,
                        results: [
                            { id: 1, title: `Result for "${query}"`, description: "This is a sample result" },
                            { id: 2, title: `Another result about "${query}"`, description: "More relevant information" }
                        ]
                    };
                    
                    this.output(`Sent search for "${query}" using key "${queryKey}"`);
                    break;

                case 'getResponse':
                    if (!this.context.apiResponse) {
                        throw new Error("No API response available. Send a search first!");
                    }
                    this.output("Got the API response successfully");
                    break;

                case 'showVariable':
                    const varName = node.matches[0];
                    if (varName in this.context.variables) {
                        this.output(`${varName}: ${this.context.variables[varName]}`);
                    } else {
                        throw new Error(`Variable ${varName} doesn't exist yet. Create it first!`);
                    }
                    break;

                case 'showString':
                    this.output(node.matches[0]);
                    break;

                case 'showResponse':
                    if (!this.context.apiResponse) {
                        throw new Error("No API response to show. Send a search first!");
                    }
                    this.output("API Response:");
                    this.output(JSON.stringify(this.context.apiResponse, null, 2));
                    break;

                case 'connectMCP':
                    const mcpUrl = node.matches[0];
                    const mcpProtocol = node.matches[1];
                    this.context.mcpServers[mcpUrl] = {
                        url: mcpUrl,
                        protocol: mcpProtocol,
                        connected: true,
                        connectedAt: new Date().toISOString()
                    };
                    this.output(`Connected to MCP server at ${mcpUrl} using ${mcpProtocol} protocol`);
                    break;

                case 'disconnectMCP':
                    const disconnectUrl = node.matches[0];
                    if (this.context.mcpServers[disconnectUrl]) {
                        delete this.context.mcpServers[disconnectUrl];
                        this.output(`Disconnected from MCP server at ${disconnectUrl}`);
                    } else {
                        throw new Error(`No active connection to MCP server at ${disconnectUrl}`);
                    }
                    break;

                case 'sendMessage':
                    const modelName = node.matches[0];
                    const systemPromptVar = node.matches[1]; // may be undefined
                    const userMessageVar = node.matches[2];

                    if (!(userMessageVar in this.context.variables)) {
                        throw new Error(`Variable ${userMessageVar} doesn't exist yet. Create it first!`);
                    }

                    let systemPrompt = null;
                    if (systemPromptVar && !(systemPromptVar in this.context.variables)) {
                        throw new Error(`Variable ${systemPromptVar} doesn't exist yet. Create it first!`);
                    } else if (systemPromptVar) {
                        systemPrompt = this.context.variables[systemPromptVar];
                    }

                    const userMessage = this.context.variables[userMessageVar];
                    
                    // Store the pending request
                    this.context.pendingLLMRequest = {
                        model: modelName,
                        systemPrompt: systemPrompt,
                        userMessage: userMessage,
                        timestamp: new Date().toISOString()
                    };

                    this.output(`Sending message to ${modelName}...`);
                    if (systemPrompt) {
                        this.output(`System: ${systemPrompt.substring(0, 100)}${systemPrompt.length > 100 ? '...' : ''}`);
                    }
                    this.output(`User: ${userMessage.substring(0, 100)}${userMessage.length > 100 ? '...' : ''}`);
                    break;

                case 'sendMessageDirect':
                    const modelName2 = node.matches[0];
                    const systemPromptVar2 = node.matches[1]; // may be undefined
                    const userMessageDirect = node.matches[2];

                    let systemPrompt2 = null;
                    if (systemPromptVar2 && !(systemPromptVar2 in this.context.variables)) {
                        throw new Error(`Variable ${systemPromptVar2} doesn't exist yet. Create it first!`);
                    } else if (systemPromptVar2) {
                        systemPrompt2 = this.context.variables[systemPromptVar2];
                    }
                    
                    // Store the pending request
                    this.context.pendingLLMRequest = {
                        model: modelName2,
                        systemPrompt: systemPrompt2,
                        userMessage: userMessageDirect,
                        timestamp: new Date().toISOString()
                    };

                    this.output(`Sending message to ${modelName2}...`);
                    if (systemPrompt2) {
                        this.output(`System: ${systemPrompt2.substring(0, 100)}${systemPrompt2.length > 100 ? '...' : ''}`);
                    }
                    this.output(`User: ${userMessageDirect.substring(0, 100)}${userMessageDirect.length > 100 ? '...' : ''}`);
                    break;

                case 'waitForResponse':
                    if (!this.context.pendingLLMRequest) {
                        throw new Error("No pending LLM request. Send a message first!");
                    }
                    
                    // Simulate LLM response (in a real implementation, this would call the actual MCP server)
                    const request = this.context.pendingLLMRequest;
                    let mockResponse = "";
                    
                    if (request.userMessage.toLowerCase().includes("natural language programming")) {
                        mockResponse = `Natural language programming offers several key benefits:

1. **Accessibility**: Makes coding approachable for non-programmers by using familiar English syntax
2. **Reduced Learning Curve**: Eliminates the need to memorize complex syntax rules and symbols
3. **Intuitive Logic**: Mirrors how humans naturally think about problem-solving
4. **Better Readability**: Code becomes self-documenting and easier to understand
5. **Lower Barriers**: Democratizes programming by making it more inclusive

For example, instead of writing 'for(int i=0; i<10; i++)' you can simply say 'repeat 10 times'. This makes the intent immediately clear to anyone reading the code.`;
                    } else if (request.userMessage.toLowerCase().includes("accessibility")) {
                        mockResponse = `Here's a specific example of how natural language programming improves accessibility:

**Traditional Code:**
\`\`\`javascript
if (user.age >= 18 && user.hasValidID) {
    console.log("Access granted");
} else {
    console.log("Access denied");
}
\`\`\`

**Natural Language Code:**
\`\`\`
if age is above 17 and has_valid_id is equal to true, show "Access granted" otherwise show "Access denied"
\`\`\`

The natural language version immediately communicates the logic to anyone, regardless of their programming background. A business analyst, teacher, or domain expert can read, understand, and even suggest improvements without knowing programming syntax.`;
                    } else if (request.userMessage.toLowerCase().includes("compare")) {
                        mockResponse = `**Natural Language Programming vs Traditional Syntax:**

**Traditional Programming:**
- Dense, symbol-heavy syntax ({}; [] && ||)
- Requires memorization of language-specific rules
- High cognitive load for beginners
- Often cryptic variable names and operations
- Steep learning curve

**Natural Language Programming:**
- Readable, conversational syntax
- Uses familiar English words and phrases
- Intuitive logical flow
- Self-documenting code
- Immediate accessibility

**Example Comparison:**

Traditional: \`while(x < 100) { x += 10; console.log(x); }\`
Natural: \`while x is below 100, add 10 to x, show x\`

The natural language version reads like instructions you'd give to a colleague, making programming more human-centered and inclusive.`;
                    } else {
                        mockResponse = `I understand you're asking about "${request.userMessage}". This is a mock response from the ${request.model} model via MCP. 

In a real implementation, this would connect to an actual LLM through the Model Context Protocol, enabling seamless integration between NaturaCode and various AI models for intelligent code assistance, natural language processing, and automated reasoning.

The beauty of integrating LLMs with natural language programming is that both humans and AI can understand and work with the same readable code format.`;
                    }

                    this.context.llmResponse = {
                        model: request.model,
                        response: mockResponse,
                        timestamp: new Date().toISOString(),
                        request: request
                    };

                    this.output("✅ Received response from LLM");
                    break;

                case 'getResponseAs':
                    if (!this.context.llmResponse) {
                        throw new Error("No LLM response available. Send a message and wait for response first!");
                    }
                    
                    const responseVarName = node.matches[0];
                    this.context.variables[responseVarName] = this.context.llmResponse.response;
                    this.output(`Stored LLM response in variable "${responseVarName}"`);
                    break;

                case 'measureLength':
                    const sourceVar = node.matches[0];
                    const targetVar = node.matches[1];
                    
                    if (!(sourceVar in this.context.variables)) {
                        throw new Error(`Variable ${sourceVar} doesn't exist yet. Create it first!`);
                    }
                    
                    const sourceValue = this.context.variables[sourceVar];
                    const length = typeof sourceValue === 'string' ? sourceValue.length : sourceValue.toString().length;
                    this.context.variables[targetVar] = length;
                    this.output(`Measured length of ${sourceVar}: ${length} characters`);
                    break;

                case 'comment':
                    // Comments are ignored during execution
                    break;

                case 'unknown':
                    throw new Error(`I don't understand "${node.line}". Could you rephrase that?`);

                default:
                    throw new Error(`Command type "${node.type}" not implemented yet.`);
            }
        } catch (error) {
            this.output(`Error: ${error.message}`);
            throw error;
        }
    }

    /**
     * Execute a loop based on current loop state
     */
    async executeLoop() {
        const loop = this.context.loopState;
        
        if (loop.loopType === 'repeat') {
            for (let i = 0; i < loop.loopCount; i++) {
                this.output(`  Iteration ${i + 1}:`);
                for (const command of loop.loopCommands) {
                    const node = this.parseLine(command);
                    await this.executeNode(node);
                }
            }
        } else if (loop.loopType === 'while') {
            let iterations = 0;
            const maxIterations = 1000; // Prevent infinite loops
            
            while (iterations < maxIterations) {
                const varValue = this.context.variables[loop.variable];
                if (!varValue && varValue !== 0) {
                    throw new Error(`Variable ${loop.variable} doesn't exist in while loop!`);
                }
                
                let condition = false;
                switch (loop.operator.toLowerCase()) {
                    case 'above':
                    case 'greater than':
                        condition = varValue > loop.value;
                        break;
                    case 'below':
                    case 'less than':
                        condition = varValue < loop.value;
                        break;
                    case 'equal to':
                        condition = varValue === loop.value;
                        break;
                }
                
                if (!condition) break;
                
                this.output(`  Iteration ${iterations + 1}: ${loop.variable} = ${varValue}`);
                for (const command of loop.loopCommands) {
                    const node = this.parseLine(command);
                    await this.executeNode(node);
                }
                
                iterations++;
            }
            
            if (iterations >= maxIterations) {
                throw new Error("While loop ran too many times! Check your condition.");
            }
        }
        
        // Reset loop state
        this.context.loopState = {
            inLoop: false,
            loopCommands: [],
            loopType: null,
            loopCount: 0,
            loopCondition: null
        };
        
        this.output("Loop finished!");
    }

    /**
     * Add output to the context
     */
    output(message) {
        this.context.output.push(message);
        console.log(message);
    }

    /**
     * Run NaturaCode program
     */
    async run(code) {
        this.context.output = []; // Clear previous output
        const lines = code.split('\n').map(line => line.trim()).filter(line => line);
        
        for (const line of lines) {
            // If we're in a loop, collect commands until 'end'
            if (this.context.loopState.inLoop && !line.match(/^(?:end|done)$/i)) {
                this.context.loopState.loopCommands.push(line);
                continue;
            }
            
            const node = this.parseLine(line);
            await this.executeNode(node);
        }
        
        return this.context.output;
    }

    /**
     * Convert current state to human-readable speech
     */
    toSpeech() {
        let speech = [];
        
        // Variables
        for (const [name, value] of Object.entries(this.context.variables)) {
            if (typeof value === 'number') {
                speech.push(`Create a number called ${name} with value ${value}.`);
            } else {
                speech.push(`Create a string called ${name} with value "${value}".`);
            }
        }
        
        // Tasks
        for (const task of this.context.tasks) {
            speech.push(`Create a task called "${task.name}" with status "${task.status}".`);
        }
        
        // API state
        if (this.context.apiEndpoint) {
            speech.push(`Connect to the API at "${this.context.apiEndpoint}".`);
        }
        
        return speech.join(' ');
    }

    /**
     * Reconstruct code from speech description
     */
    fromSpeech(speech) {
        const sentences = speech.split(/\.\s+/).filter(s => s.trim());
        const code = [];
        
        for (const sentence of sentences) {
            const trimmed = sentence.replace(/\.$/, '').trim();
            if (trimmed) {
                // Preserve case inside quoted strings
                const processed = trimmed.replace(/"([^"]*)"/g, (match, content) => {
                    return `"${content}"`;
                }).toLowerCase().replace(/"([^"]*)"/g, (match, content) => {
                    // Find the original case version
                    const originalMatch = trimmed.match(new RegExp(`"([^"]*)"`, 'g'));
                    if (originalMatch) {
                        for (const orig of originalMatch) {
                            if (orig.toLowerCase() === match.toLowerCase()) {
                                return orig;
                            }
                        }
                    }
                    return match;
                });
                code.push(processed);
            }
        }
        
        return code.join('\n');
    }

    /**
     * Get current context state
     */
    getContext() {
        return JSON.parse(JSON.stringify(this.context));
    }

    /**
     * Reset the interpreter state
     */
    reset() {
        this.context = {
            variables: {},
            tasks: [],
            apiResponse: null,
            apiEndpoint: null,
            output: [],
            loopState: {
                inLoop: false,
                loopCommands: [],
                loopType: null,
                loopCount: 0,
                loopCondition: null
            },
            mcpServers: {},
            llmResponse: null,
            pendingLLMRequest: null
        };
    }
}

module.exports = { NaturaCode };