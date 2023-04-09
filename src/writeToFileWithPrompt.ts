import {print} from './state';
import { getChatCompletion, getChatCompletionStandalone } from './openai';
const fs = require('fs').promises;
import path from 'path';

function readFile(filePath: String) {
  try {
    const data = fs.readFileSync(`${filePath}`, 'utf-8');
    console.log(data);
    return data;
  } catch (err) {
    return `[FILE_EMPTY]`;
  }
}

export default async function writeFileWithPrompt(filePath: String, prompt: String, isCreate: Boolean = false) {
  print(`file path: ${filePath}\nprompt: ${prompt}`);

  let fileContent = '';
  if (isCreate) {
    fileContent = readFile(filePath);
  }
  const res = await getChatCompletionStandalone(
`
Your job is to ${isCreate ? 'create a file using' : 'take a file and'} a prompt, and spit out what the file should look like given the prompt. Just respond with what the whole file's new content should look like, in one blob denotated by backticks. Make sure you write runnable code.

file name: "${filePath}"

${isCreate ? 'current file content: "' + fileContent + '"' : ''}

prompt: "${prompt}"
`, 'gpt-4');
  
  print(`Openai res: ${res}`);

  const pattern = /```(?:[a-z]+)?\n([\s\S]*?)\n```/g;

  let contentToInsert = '';
  let match;
  while ((match = pattern.exec(res)) !== null) {
    const codeBlock = match[1];
    contentToInsert += codeBlock;
  }

  console.log(`contentToInsert: ${contentToInsert}`);

  const fileDir = path.dirname(`${filePath}`);
  try {
    await fs.mkdir(fileDir, { recursive: true }); // Create the necessary folders if they don't exist
    await fs.writeFile(filePath, contentToInsert); // Write the content to the file
    console.log(`File successfully written to: ${filePath}`);
  } catch (err) {
    console.error('Error writing to file:', err);
  }
}
