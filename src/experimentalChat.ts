import readline from 'readline'
import { calcTokens, calculateExpense, contextLength, getOpenAI } from './openai';
import { highlightCode } from './utils/highlight';
import chalk from 'chalk'
import { readStore, trimMessages, writeStore } from './state';
import { makeSystemString, parseActionAndArg } from './agent/helpers';


const possibleChoices = ['Ask', 'Finish']


/* 
there are a many different ways you could set this up, and I'm not sure which would produce the most optimal results. 
Do you have a plan? Do you call them tools or actions or choices? What about the syntax of functions? 
Does observation return a response in natural language?
*/

const systemStringTemplate = 
`You are the internal Monologue of a Chat Assistant. 
You run in a loop of Thought, Action, Observation.
Use Thought to describe your thoughts about the question you have been asked.
Use Action to run one of the actions available to you - 
Observation will be the result of running those actions.

Choices:
{{possibleChoices}}

Rules:
- If you have received an Input from the user, you should reply with a Thought and an Action.
- If you have received an Observation from a tool, you should reply with a Thought and an Action.
- You should never reply with an Input.

Example: 

Input: What is my name?
Thought: I don't have access to the user's name. I need to ask for it.
Action: Ask("What is your name?")
Observation: Brent
Thought: The users name is Brent
Action: Finish("Brent")

Let me reiterate: Always prefix your outputs with Thought, or Action to signify what you're doing. Always end with an action.
`

const systemString = makeSystemString(systemStringTemplate, possibleChoices)


export default async function expirimentalChat(model = "gpt-3.5-turbo") {
  console.log('\x1b[1m%s\x1b[0m', `Experimental Chat >:D`);
  console.log(` Model: ${chalk.green(model)} \n`)
  const prevMessages = Boolean(readStore().dialogues.experimentalChat.messagesHistory.length)
    if(!prevMessages || true) { //initiate thing
      writeStore(ps => {
        ps.dialogues.experimentalChat.messagesHistory = [{role: "system", content: systemString}]
        ps.dialogues.experimentalChat.historyTokens = calcTokens(systemString).toString()
        return ps
      })
    }
    console.log(systemString)

    while(true) {
      const value = await getUserInput(chalk.red(">>> "))
      await agentCycle(value)
      
      
    }
}



async function agentCycle(inputString: string, model = "gpt-3.5-turbo", temperature: number = 0, dialogue = "experimentalChat") {
  const openai = await getOpenAI()
  if(parseInt(readStore().dialogues[dialogue].historyTokens) + calcTokens(inputString) > contextLength[model]) trimMessages({dialogue}) // keeps it within context length
  
  const {messagesHistory: messages, historyTokens} = readStore().dialogues[dialogue]
  messages.push({role: "user", content: `Input: ${inputString}`})

  console.log(`Input: ${inputString}`)

  const completion = await openai.createChatCompletion({
    model: model,
    messages: messages,
    temperature,
    // max_tokens: 200
  });
  if(!completion.data.choices[0].message) throw new Error("something fucked up")
  messages.push(completion.data.choices[0].message)

  const respMessage = completion.data.choices[0].message.content
  const [action, arg] = parseActionAndArg(respMessage)

  // calculate usage and update store
  const {prompt_tokens, completion_tokens} = completion.data.usage!
  const expense = calculateExpense(prompt_tokens, completion_tokens, model)
    writeStore((ps) => {
      ps.dialogues[dialogue].messagesHistory = messages
      ps.dialogues[dialogue].historyTokens = `${prompt_tokens+completion_tokens}`
      ps.totalExpense = `${(parseFloat(parseFloat(ps.totalExpense).toFixed(6)) + expense).toFixed(6)}`
      return ps
    });
  return completion.data.choices[0].message.content
}



export async function getUserInput(prefix: string):Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const answer:string = await new Promise((resolve) => {
    rl.question(prefix, (input) => {
      resolve(input);
      rl.close();
    });
  });

  return answer
}
