/**
 * Prompts the user for input and returns a Promise that resolves with the input value.
 * If the "pause" option is set to true, the function will pause and clear the current
 * line, then prompt the user for input again.
 * @param {string} prompt - The prompt to display.
 * @param {object} options - Additional options.
 * @param {boolean} options.pause - Whether to pause and clear the current line before prompting again.
 * @returns {Promise<string>} - A Promise that resolves with the user's input.
 */
function debuggerPrompt(prompt, options = {}) {
  return new Promise((resolve) => {
    let inputBuffer = '';
    let promptLength = 0;

    function promptUser() {
      // Calculate the length of the prompt to clear the correct number of characters later
      promptLength = prompt.length;

      // Display the prompt
      process.stdout.write(prompt);

      // Set up data listener to capture user input
      process.stdin.on('data', onData);
    }

    function onData(data) {
      // Append user input to buffer
      inputBuffer += data.toString();

      // Find the last newline character in the buffer
      const lastNewlineIndex = inputBuffer.lastIndexOf('\n');

      if (lastNewlineIndex === -1) {
        // If there's no newline character, re-display the prompt and wait for more input
        process.stdout.write(inputBuffer);
        clearCurrentLine();
        promptLength = 0;
        return;
      }

      // If there is a newline character, extract the input and resolve the Promise
      const input = inputBuffer.substring(0, lastNewlineIndex);
      resolve(input.trim());

      // Clear input buffer and remove data listener
      inputBuffer = '';
      process.stdin.removeListener('data', onData);

      if (options.pause) {
        // If pausing, clear the current line and re-display the prompt
        clearCurrentLine();
        promptUser();
      }
    }

    function clearCurrentLine() {
      // Calculate the position to move the cursor back to before clearing the line
      const cursorPos = promptLength + inputBuffer.length;
      process.stdout.cursorTo(0);
      process.stdout.clearLine(1);
      process.stdout.cursorTo(cursorPos);
    }

    promptUser();
  });
}

// Usage example
async function main() {
  while (true) {
    process.stdout.write('Starting iteration... ');
    const input = await debuggerPrompt('Enter a value: ', { pause: true });
    // process.stdout.write(`You entered: ${input}`);
    process.stdout.write('Continuing iteration...');
  }
}

main();