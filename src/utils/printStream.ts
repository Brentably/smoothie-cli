

export function printText(runningText: string, fullText: string) {
  // process.stdout.write('\x1Bc'); // Clear the console
  if(runningText === '[DONE]') {
    process.stdout.write('\n\n');
  }
   process.stdout.write(runningText);

}