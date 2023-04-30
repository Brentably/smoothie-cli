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
import { getSmoothieFileCompletion } from './smoothieFileCompletion';
import { shouldRewrite } from './classifier';
import { getSelectedCompletionReadonly, getSelectedCompletionRewrite } from './selectedCompletion';


export const p = (obj: any, depth:number | undefined | null = 2) => console.log(util.inspect(obj, {depth}))


export const getSelectedRangeAndText = async ():Promise<[vscode.Selection | undefined, string | undefined]> => {
  return new Promise((res, rej) => {
    const socket = io("ws://localhost:6969")
    socket.on('selectedRangeAndText', (arg) => res(arg))
    socket.emit("getSelectedRangeAndText")
  })
}

export const getFocusedFile = async ():Promise<string | undefined>  => {
  return new Promise((res, rej) => {
    const socket = io("ws://localhost:6969")
    socket.on('focusedFile', (arg: string | undefined) => res(arg))
    socket.emit("getFocusedFile")
  })
}


export default async function smoothieChat(model = "gpt-3.5-turbo") {
  console.log('\x1b[1m%s\x1b[0m', `It's ${chalk.magenta('smoooothie')} time ;)\n`);
  // console.log(`Model: ${chalk.green(model)} \n`)
    while(true) {
    const userInput = await getUserInput(chalk.greenBright(">>> "))
    const [filepath, [selectedRange, selectedText]] = await Promise.all([getFocusedFile(), getSelectedRangeAndText()])
    if(!filepath) {
      console.log(chalk.yellow('warning:'), ' could not find filepath. Please CMD + P and Reload window, and if that doesnt work contact @BingBongBrent on Twitter')
      return
    }
    if((selectedRange && !selectedText) || (selectedText && !selectedRange)) throw new Error('range w/o text or vice versa')

    if(selectedRange && selectedText) {
      console.log('...processing highlighted / selected text...')
      const isRewrite = await shouldRewrite(userInput)
      if(isRewrite) await getSelectedCompletionRewrite(userInput, model, filepath, selectedRange, selectedText, 0.2)
      else await getSelectedCompletionReadonly(userInput, model, filepath, selectedText, 0.2)
    } else {
      await getSmoothieFileCompletion(userInput, model, filepath, 0.2)
    }
    // console.log("\n" + highlightCode(resp) + "\n")
    }
}



