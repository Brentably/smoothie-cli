import readline from 'readline'
import { calcTokens, calculateExpense, contextLength, getChatCompletion, getOpenAI } from '../openai';
import { highlightCode } from '../utils/highlight';
import chalk from 'chalk'
import { getUserInput } from '../user';
import { readEnv, readStore, trimMessages, writeStore } from '../state';
import fs from 'fs'
import { gptStream } from '../event-stream';
import type {AxiosResponse} from 'openai/node_modules/axios/index.d.ts'
import { CreateChatCompletionResponse } from 'openai';
import util from 'util'
import { printText } from '../utils/printStream';
import {io} from 'socket.io-client'
import type vscode from 'vscode'
import { replaceSelection } from './stupid-socket';

// async function replaceCodeInRange(filePath: string, range: vscode.Range, newCode: string) {
//   // Read the contents of the file
//   const fileContents = await fs.promises.readFile(filePath, 'utf-8');

//   // Get the start and end positions of the range
//   const startPosition = range.start;
//   const endPosition = range.end;

//   // Function to manually calculate the character offset
//   function calculateOffset(position: vscode.Position, text: string) {
//     const lines = text.split('\n');
//     let offset = 0;

//     for (let i = 0; i < position.line; i++) {
//       offset += lines[i].length + 1; // Add 1 for the newline character
//     }

//     offset += position.character;
//     return offset;
//   }

//   // Convert the positions to character offsets
//   const startOffset = calculateOffset(startPosition, fileContents);
//   const endOffset = calculateOffset(endPosition, fileContents);

//   // Replace the code in the range with the new code
//   const newFileContents = fileContents.slice(0, startOffset) + newCode + fileContents.slice(endOffset);

//   // Write the new contents back to the file
//   await fs.promises.writeFile(filePath, newFileContents);
// }


const systemPromptCodeGen = `You are CodeGenerator AI. Your sole purpose is to generate code. Mostly rewriting code, adding stuff, and fixing stuff. 
You will be given a user query and a code sample. Your job is to rewrite the code sample as accurately as possible. Response with just the new code sample, and nothing else.

Do not remove comments unless they explicitly ask you to.

You will respond with the new and improved code and that code only.`

const userPromptCodeGen = (userMessage: string, codeSnippet: string) => `User Query: ${userMessage}\n\n Code: \`\`\`\n${codeSnippet}\n\`\`\``

export async function getSelectedCompletionRewrite(userMessage: string, model = "gpt-3.5-turbo",filepath: string, selectedRange: vscode.Selection, selectedText: string, temperature = 0.2) {
  const openai = await getOpenAI()
  const {start: {line: startLine, character: startCol}, end: {line: endLine, character: endCol} } = selectedRange

  const resp = await openai.createChatCompletion({
    model,
    messages: [
      {role: 'system', content: systemPromptCodeGen},
     {role: "user", content: userPromptCodeGen(userMessage, selectedText)}
    ],
    temperature
  })

  const asstRespCode = resp.data.choices[0].message?.content
  if(asstRespCode === undefined) throw new Error('resp from openai undefined')
  const codeMatches = asstRespCode.match(/```([\s\S]*?)```/g)
  const code = codeMatches ? codeMatches[0].slice(3, -3) : asstRespCode

  console.log('replacing highlighted text with:\n', highlightCode(code))
  // rewrite rewrit

  await replaceSelection(code)
  console.log('code replaced!')

  // await saveFile(selectedRange)
  // validate rewrite?

}

export async function getSelectedCompletionReadonly(userMessage: string, model = "gpt-3.5-turbo",filepath: string, selectedText: string, temperature?: number) {
  const openai = await getOpenAI()
  const dialogue = filepath
  const message = 
  `Look at: 
  \`\`\`\n${selectedText}\n\`\`\`
  
  Question:\n${userMessage}`
  const fileContents = filepath ? fs.readFileSync(filepath) : null
  const systemString = `
  You are Codebase AI. You are a superintelligent AI that answers questions about codebases.

  You are:
  - helpful & friendly
  - good at answering complex questions in simple language
  - an expert in all programming languages
  - able to infer the intent of the user's question

  The user will ask a question about their codebase, and you will answer it.

  When the user asks their question, you will answer it by searching the codebase for the answer.
  In the case that the user references "this file," this file(s) are the code file's shown below.

  Here is code file(s) and the user's question you found to answer the question:


  Code file(s):
  \`\`\`
  ${fileContents}
  \`\`\`
  
  [END OF CODE FILE(S)]

  `

  const fileName = filepath.split('/')[filepath.split('/').length-1]
  console.log(`${chalk.green(fileName)}\n`)
  
  writeStore(ps => {
    const prevHistory = Boolean(ps.dialogues[filepath]?.messagesHistory.length);
    if(!prevHistory) {
      ps.dialogues[filepath] = {
        messagesHistory: [{role: "system", content: systemString}],
        historyTokens: calcTokens(systemString).toString()
      }
      return ps
    } else if(prevHistory) {
      const removedTokens = calcTokens(ps.dialogues[filepath].messagesHistory[0].content)
      const addedTokens = calcTokens(systemString)
      const tokenDelta = addedTokens - removedTokens

      ps.dialogues[filepath].messagesHistory[0] = {role: "system", content: systemString}
      ps.dialogues[filepath].historyTokens = (parseInt(ps.dialogues[filepath].historyTokens) + tokenDelta).toFixed(6)
      return ps
    } else {
      throw new Error('write store error in smoothie chat')
      return ps
    }
  })


  // keeps it within context length
  if(parseInt(readStore().dialogues[filepath].historyTokens) + calcTokens(message) > contextLength[model]) trimMessages({dialogue}) 

  const {messagesHistory: messages, historyTokens} = readStore().dialogues[dialogue]
  messages.push({role: "user", content: message})
  const assistantMessage = await gptStream(model, messages, temperature, printText) as string



  messages.push({role: "assistant", content: assistantMessage})
  // const {prompt_tokens, completion_tokens} = completion.data.usage!
  // const expense = calculateExpense(prompt_tokens, completion_tokens, model)
  // // the weird syntax is just necessary for rounding to 6 decimal places lol
  writeStore((ps) => {
    ps.dialogues[dialogue].messagesHistory = messages
    ps.dialogues[dialogue].historyTokens = (parseInt(ps.dialogues[dialogue].historyTokens) + calcTokens(assistantMessage)).toString()
    // ps.totalExpense = `${(parseFloat(parseFloat(ps.totalExpense).toFixed(6)) + expense).toFixed(6)}`
    return ps
  });
  // return completion.data.choices[0].message.content
}