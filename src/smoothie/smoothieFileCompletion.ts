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
import vscode from 'vscode'

export async function getSmoothieFileCompletion(userMessage: string, model = "gpt-3.5-turbo",filepath: string, temperature?: number) {
  const openai = await getOpenAI()
  const dialogue = filepath
  const message = `Question:\n${userMessage}`
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