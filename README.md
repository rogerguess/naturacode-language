# 🌿 NaturaCode

**Programming in Plain English**

> *Where code becomes conversation, and logic flows like language.*

NaturaCode is a revolutionary programming language that lets you write code using natural English sentences. No more cryptic syntax, no more semicolons, no more curly braces - just speak to your computer as you would to a colleague.

![NaturaCode Demo](https://img.shields.io/badge/Language-English-green) ![Tests](https://img.shields.io/badge/Tests-36%20Passing-brightgreen) ![Version](https://img.shields.io/badge/Version-1.0.0-blue)

## ✨ Why NaturaCode?

- **🗣️ Natural Syntax**: Write code that reads like spoken English
- **🎯 Accessible**: Perfect for beginners and non-programmers
- **🔄 Bidirectional**: Convert between code and speech seamlessly
- **🌐 Web Ready**: Interactive web interface for coding anywhere
- **🧪 Battle Tested**: Comprehensive test suite ensures reliability
- **🚀 Fast**: Built on JavaScript for speed and compatibility

## 🎬 Quick Demo

```naturacode
create a number called age with value 25
create a string called name with value "Alice"

show "Hello, my name is"
show name
show "and I am"
show age
show "years old"

if age is above 18, show "I can vote!" otherwise show "Not old enough yet"

create a task called "Learn NaturaCode" with status "pending"
mark task "Learn NaturaCode" as complete
show all tasks
```

**Output:**
```
Hello, my name is
Alice
and I am
25
years old
I can vote!
✅ Learn NaturaCode (complete)
```

## 🚀 Getting Started

### Installation

```bash
git clone https://github.com/your-username/naturacode-language
cd naturacode-language
npm install
```

### Run Your First Program

1. **Command Line Interface:**
```bash
# Run a NaturaCode file
npm run cli examples/first_conversation.nat

# Interactive mode
npm run cli -i
```

2. **Web Interface:**
```bash
# Start the web server
npm start

# Open your browser to http://localhost:3000
```

### Create Your First Program

Create a file called `hello.nat`:

```naturacode
create a string called greeting with value "Hello, World!"
show greeting

create a number called counter with value 0
repeat 3 times
    add 1 to counter
    show counter
end

show "Counting complete!"
```

Run it:
```bash
npm run cli hello.nat
```

## 📖 Language Reference

### 🔢 Variables

Create numbers and strings with natural syntax:

```naturacode
create a number called x with value 42
create a number called temperature with value -10.5
create a string called name with value "NaturaCode"
create a string called message with value "Programming is fun!"
```

### 🧮 Arithmetic

Perform math operations naturally:

```naturacode
add 5 to x
subtract 10 from temperature
multiply x by 2
divide temperature by 3
```

### 🎯 Conditionals

Express logic in plain English:

```naturacode
if x is above 50, show "High value"
if temperature is below 0, show "Freezing" otherwise show "Not freezing"
if x is equal to 42, show "The answer!"
```

Comparison operators:
- `above` / `greater than`
- `below` / `less than`
- `equal to`

### 🔄 Loops

Repeat actions naturally:

```naturacode
repeat 5 times
    show "Hello!"
end

while x is below 100
    add 10 to x
    show x
end
```

### 📋 Task Management

Manage tasks and to-dos:

```naturacode
create a task called "Write documentation" with status "pending"
create a task called "Run tests" with status "complete"

show all tasks
show tasks where status is "pending"
mark task "Write documentation" as complete
```

### 🌐 API Integration

Connect to external services:

```naturacode
connect to the API at "https://api.example.com/search"
send a search for "programming tips" using the key "query"
get the response
show the response
```

### 💬 Comments

Document your code:

```naturacode
note: This is a comment that will be ignored
create a number called x with value 10
note: Comments help explain your code
```

### 📺 Output

Display values and messages:

```naturacode
show x
show "Custom message"
show the response
```

## 🎨 Web Interface

The web interface provides a beautiful, interactive coding environment:

- **📝 Code Editor**: Write NaturaCode with syntax highlighting
- **▶️ Run Code**: Execute your programs with a single click
- **📺 Live Output**: See results in real-time
- **🗣️ Speech Mode**: Convert code to speech and back
- **📊 State Viewer**: Inspect variables and tasks
- **📖 Examples**: Load pre-built examples to learn

### Features:
- Responsive design works on all devices
- Real-time error feedback
- Code examples and templates
- Context preservation between runs

## 🧪 Testing

NaturaCode comes with a comprehensive test suite:

```bash
# Run all tests
npm test

# Test specific features
npm test -- --testNamePattern="Variables"
```

**Test Coverage:**
- ✅ 36 tests covering all language features
- ✅ Variable management and arithmetic
- ✅ Task management and filtering
- ✅ Conditional logic and loops
- ✅ API integration
- ✅ Speech-to-code fidelity
- ✅ Error handling and edge cases

## 🗣️ Speech-to-Code Fidelity

One of NaturaCode's unique features is perfect bidirectional conversion:

```javascript
// Convert your program state to speech
const speech = natura.toSpeech();
// "Create a number called x with value 10. Create a task called 'Demo' with status 'pending'."

// Convert speech back to code
const code = natura.fromSpeech(speech);
// create a number called x with value 10
// create a task called "Demo" with status "pending"
```

This enables:
- 🎤 Voice programming interfaces
- 📚 Code documentation generation
- 🔄 Perfect round-trip conversion
- 🗣️ Accessibility for visually impaired programmers

## 🎯 Use Cases

### Education
- Teaching programming concepts to beginners
- Computer science education without syntax barriers
- Computational thinking development

### Automation
- Quick task automation scripts
- API integration for non-programmers
- Data processing workflows

### Accessibility
- Programming for visually impaired developers
- Voice-controlled coding environments
- Barrier-free software development

### Prototyping
- Rapid idea validation
- Algorithm exploration
- Business logic modeling

## 🛠️ API Reference

### Core Classes

#### `NaturaCode`

The main interpreter class:

```javascript
const { NaturaCode } = require('./src/naturacode.js');

const natura = new NaturaCode();
await natura.run(code);                    // Execute NaturaCode
const context = natura.getContext();       // Get current state
const speech = natura.toSpeech();          // Convert to speech
const code = natura.fromSpeech(speech);    // Convert from speech
natura.reset();                            // Reset interpreter
```

### Web Server API

#### `POST /run`
Execute NaturaCode and return results:

```javascript
fetch('/run', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code: 'create a number called x with value 10' })
});
```

#### `POST /to-speech`
Convert program state to speech:

```javascript
fetch('/to-speech', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ context: programContext })
});
```

## 🔧 Advanced Examples

### Complex Workflow
```naturacode
note: Budget management system
create a number called budget with value 1000
create a number called spent with value 0

create a task called "Buy groceries" with status "pending"
create a task called "Pay bills" with status "pending"

add 200 to spent
subtract 200 from budget

if budget is above 500, show "Budget looks good" otherwise show "Watch spending!"

mark task "Buy groceries" as complete
show tasks where status is "complete"

connect to the API at "https://api.finance.com"
send a search for "budget tips" using the key "query"
get the response
show the response
```

### Loop with Logic
```naturacode
create a number called total with value 0
create a number called i with value 1

repeat 10 times
    if i is above 5, add 10 to total otherwise add 5 to total
    add 1 to i
end

show "Final total:"
show total
```

## 🔮 Future Roadmap

- 🗂️ **File Operations**: Read and write files naturally
- 🎨 **UI Components**: Create interfaces with natural commands
- 🔗 **Function Definitions**: Define reusable code blocks
- 🌍 **Multi-language**: Support for other natural languages
- 🧠 **AI Integration**: LLM-powered natural language parsing
- 📱 **Mobile Apps**: Native mobile development environment

## 🤝 Contributing

We welcome contributions! Here's how to get involved:

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b amazing-feature`
3. **Write tests**: Ensure your feature has comprehensive tests
4. **Update documentation**: Add examples and usage info
5. **Submit a pull request**: We'll review and merge

### Development Setup

```bash
git clone https://github.com/your-username/naturacode-language
cd naturacode-language
npm install
npm test                    # Run tests
npm start                   # Start web server
npm run cli -i             # Interactive CLI mode
```

## 📜 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Inspired by the vision of accessible programming
- Built with love for the developer community
- Thanks to all contributors and testers

---

**Ready to speak code?** 🌿

Visit our [web interface](http://localhost:3000) or run your first program:

```bash
npm run cli examples/first_conversation.nat
```

*Let's make programming as natural as conversation.* 💬✨