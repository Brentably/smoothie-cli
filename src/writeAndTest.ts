import inquirer from "inquirer";
import writeFileWithPrompt from "./writeToFileWithPrompt";
import child_process from 'child_process'
import { getUserInput } from "./chat";


// takes a shell command. returns error message for chatgpt OR null if the tests pass
const specTest = async (cmd: string): Promise<string | null> => {
  let error: Error | any
  
  try {
    const res = child_process.execSync(cmd)
    console.log("TEST CASES PASSED")
    // return
  } catch(error: any | unknown) {
    return error.message
  }
  
  return null
}


// all this is going to do is see if there are any errors with executing the code, and rewrite it if there are
export default async function writeAndTest(file: string, prompt: string, isCreate: Boolean = false) {
  await writeFileWithPrompt(file, prompt, isCreate)
  console.log('file written, executing');

  let errorMessage = await specTest(`ts-node ${file}`)

  if(errorMessage === null) return

  console.log('err:')
  console.log(errorMessage)


  while(errorMessage) {
    console.log("STARTING NEW LOOP. error: ", errorMessage)
    // await getUserInput("hit enter to continue")
    await writeFileWithPrompt(file, `Previous error is: ${errorMessage} Please rewrite the file to fix the error. Keep the file as similar as possible and don't cause any more bugs`)

    errorMessage = await specTest(`ts-node ${file}`)
  }
}


writeAndTest('newfile.ts', process.argv.slice(3).join(' '))