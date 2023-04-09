import writeFileWithPrompt from "./writeToFileWithPrompt";
import child_process from 'child_process'

// all this is going to do is see if there are any errors with executing the code, and rewrite it if there are
export default async function writeAndTest(file: string, prompt: string, isCreate: Boolean = false) {
  await writeFileWithPrompt(file, prompt, isCreate)
  console.log('file written, executing')

  let error
  try {
    const res = child_process.execSync(`ts-node ${file}`)
  } catch(error) {
    error = error
  }
  

  console.log(error)
  // const output = res.output
  // console.log(res)
  // console.log(res.toString())
  console.log('done')

  

  // while(error) {
  //   console.log("STARTING NEW LOOP. ERROR:")
  //   console.log(error)

  // console.log(JSON.stringify(error))
  // const errorContext = {
  //   name: error.name,
  //   message: error.message,
  //   stack: error.stack
  // }
  // console.log(errorContext)
  // // console.log(output, error, 'hubbahubab')
  // // console.log('stdout')
  // // console.log(stdout)
  // // console.log('stderr')
  // // console.log(stderr)

  // console.log('hello')

  // await writeFileWithPrompt(file, `Previous error is: ${JSON.stringify(errorContext)} Please rewrite the file to fix the error`, isCreate)



  // const res = await child_process.spawnSync(`ts-node ${file}`)
  // error = res.error
  // }
}


writeAndTest(process.argv[2], process.argv.slice(3).join(' '))