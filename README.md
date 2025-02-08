# DeepSeek Assistant VSCode Extension

A Visual Studio Code extension that integrates DeepSeek AI into your development workflow. Chat with DeepSeek directly in VSCode, get help with your code, and analyze files in your workspace.

## Features

- 💬 Chat with DeepSeek AI directly within VSCode
- 📁 Analyze files from your workspace
- 💡 Get code explanations and suggestions
- 📋 Easy code copying with built-in copy buttons
- 🎨 Beautiful VS Code-themed interface

## Prerequisites

1. Install [Ollama](https://ollama.ai)
2. Pull the DeepSeek model:
```bash
ollama pull deepseek-r1:70b // 70b is the model size
```
3. Node.js (v14 or higher)
4. VS Code (v1.60.0 or higher)

## Development Setup

This extension is currently in development and can only be run locally. Follow these steps to set it up:

1. Clone the repository:
```bash
git clone https://github.com/RidwanHamid501/deepseek-assistant.git
cd deepseek-assistant
```

2. Install dependencies:
```bash
npm install
```

3. Open the project in VS Code:
```bash
code .
```

4. Press F5 to start debugging, which will:
   - Open a new VS Code window with the extension loaded
   - Start the extension in development mode

Note: The extension is not yet available on the VS Code marketplace. You can only run it in development mode following the steps above.

## Usage

### Starting a Chat

1. Click on the DeepSeek icon in the sidebar to open the chat panel
2. Type your question or prompt in the input box at the bottom
3. Press Enter to send your message

### Working with Files

1. Use the file selector dropdown above the chat input to choose a file from your workspace
2. Click the "Refresh Files" button to update the file list if you've added new files
3. With a file selected, any question you ask will include the file's content in the context
4. DeepSeek will provide responses based on both your question and the selected file's content

### Code Blocks

- Code blocks in responses include copy buttons (📋) for easy copying
- Click the copy button to copy the code to your clipboard
- Code is formatted and syntax-highlighted for better readability

### Best Practices

- Be specific in your questions
- When asking about code, select the relevant file first
- Use the file selector when you want DeepSeek to analyze or explain specific files
- Clear the file selection when asking general questions

## Troubleshooting

If you encounter issues:

1. Ensure Ollama is running (`ollama serve`)
2. Check that you have pulled the DeepSeek model (`ollama pull deepseek-r1:70b`)
3. If you see "Failed to connect to DeepSeek" error, restart Ollama and try again
4. Make sure you have an active workspace open in VS Code
5. For development issues:
   - Check the Debug Console in VS Code for errors
   - Try running `npm run compile` to check for compilation errors
   - Make sure all dependencies are installed correctly

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

