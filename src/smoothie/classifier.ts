import { calcTokens, getOpenAI } from "../openai";
import chalk from 'chalk'

const systemPrompt = 
`You are Classifier AI. Your sole purpose is to classify things into \`rewrite\` OR \`readonly\`.
You will be given a user query and a code sample. Your job is to determine if the user wants you to rewrite the code sample or is just asking a question about the code sample.

  If the user says "change this", "modify this", "delete this", "fix this", or anything similar, they are obviously indicating that they want a \`rewrite\`.

Otherwise, if there is no clear indication that the user is requesting some change, edit, modification, insertion, deletion, or rewrite, they are asking you to \`readonly\`.

If the user asks for help, they are just asking for explanations, and so you shouldn't edit the code, and you should respond \`readonly\`.

If the user explicitly directs you to change the code, then it's \`rewrite\`. 

Examples:

User: why is this throwing an error? can you help me fix this?
Assistant: readonly


User: why is this throwing an error? can you fix it?
Assistant: rewrite

If you are uncertain, respond with \`readonly\`. 

You will respond with one word and one word only.`

export async function shouldRewrite(userQuery: string):Promise<boolean> {
  const openAi = await getOpenAI()
  const completion = await openAi.createChatCompletion({
    model: "gpt-3.5-turbo",
    messages: [
      {role: "system", content: systemPrompt},
      {role: "user", content: userQuery}
    ],
    temperature: 0,
    max_tokens: Math.max(calcTokens('rewrite'), calcTokens('readonly')) + 1
  });

  const resp = completion.data.choices[0].message?.content
  if(!resp) throw new Error("no response")
  console.log(chalk.blue(resp))
  if(resp.toLowerCase().trim() !== 'rewrite' && resp.toLowerCase().trim() !== 'readonly') {
    throw new Error(`classifier returned something other than \`rewrite\` or \`readonly\`:\n${resp}`)
  }

  return (resp.toLowerCase().trim() == 'rewrite')
}