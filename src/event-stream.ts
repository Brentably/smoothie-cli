
import {Writable} from 'stream'
import { getOpenAI } from './openai';
import { ChatCompletionRequestMessage, CreateChatCompletionResponse } from 'openai';
import type {AxiosResponse} from 'openai/node_modules/axios/index.d.ts'
import { p } from './smoothie/smoothieChat';
import chalk from 'chalk'


export async function gptStream(
  model: string,
  messages:ChatCompletionRequestMessage[], 
  temperature: number = 0.2, 
  streamCallback: ((currentResponse: string, fullResponse: string, shouldHighlight?: boolean, highlightedText?: string) => Promise<void>) | ((currentResponse: string, fullResponse: string, shouldHighlight?: boolean, highlightedText?: string) => void)) {
  return new Promise(async (resolve, reject) => {
    const openai = await getOpenAI()
    const completion:any = await openai.createChatCompletion(
      {
        model,
        messages,
        temperature,
        stop: '',
        stream: true,
      },
      { responseType: 'stream' }
    )

    let runningText = '';

    completion.data.pipe(
      new Writable({
        async write(chunk: Buffer, encoding, callback) {


          const eventsWithPrefix:string[] = chunk.toString().split('\n').filter(el => el.length);

          for(let stringWithPrefix of eventsWithPrefix) {

            if(stringWithPrefix.startsWith("data: ")) {
              const string = stringWithPrefix.slice(6)

              if (string === '[DONE]') {
                await streamCallback('[DONE]', runningText)
                resolve(runningText);
                break
              }
              let data
              try {
                data = JSON.parse(string)
              } catch(err) {
                console.log(chalk.red('err converting string to JSON:\n'), string)
              }

              const textChunk = data.choices?.[0].delta.content;
              if (textChunk) {
                runningText += textChunk;

                await streamCallback(textChunk, runningText);
              }
              
            }
          }
          callback();
        },
      })
    );
  });
}