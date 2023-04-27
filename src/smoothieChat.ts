import readline from 'readline'
import { calcTokens, calculateExpense, contextLength, getChatCompletion, getOpenAI } from './openai';
import { highlightCode } from './utils/highlight';
import chalk from 'chalk'
import { getUserInput } from './user';
import { readEnv, readStore, trimMessages, writeStore } from './state';
import fs from 'fs'
import { gptStream } from './event-stream';
import type {AxiosResponse} from 'openai/node_modules/axios/index.d.ts'
import { CreateChatCompletionResponse } from 'openai';
import util from 'util'
import { printText } from './utils/printStream';

export const p = (obj: any, depth:number | undefined | null = 2) => console.log(util.inspect(obj, {depth}))

export default async function smoothieChat(model = "gpt-3.5-turbo") {
  console.log('\x1b[1m%s\x1b[0m', `It's ${chalk.magenta('smoooothie')} time ;)\n`);
  // console.log(`Model: ${chalk.green(model)} \n`)
    while(true) {
    const value = await getUserInput(chalk.greenBright(">>> "))
    const filepath = readEnv('FOCUSED_FILEPATH')
    const resp = await getSmoothieCompletion(value, model, 0.2, filepath)

    // console.log("\n" + highlightCode(resp) + "\n")
    }
}




export async function getSmoothieCompletion(message: string, model = "gpt-3.5-turbo", temperature?: number, filepath = process.cwd()) {
  const openai = await getOpenAI()
  const dialogue = filepath
  const fileContents = fs.readFileSync(filepath)
  const systemString = `
  You are a helpful code assistant. You help answer questions, explain concepts, and suggest revisions to code. You should always reference the file below:

  \`\`\`
  ${fileContents}
  \`\`\`
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