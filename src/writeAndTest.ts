import writeFileWithPrompt from "./writeToFileWithPrompt";
import child_process from 'child_process'
import util from 'util'


// all this is going to do is see if there are any errors with executing the code, and rewrite it if there are
export default async function writeAndTest(file: string, prompt: string, isCreate: Boolean = false) {
  await writeFileWithPrompt(file, prompt, isCreate)
  console.log('file written, executing')
  const res = await child_process.spawnSync(`ts-node ${file}`)
  console.dir(res)
  const error = res.error
  const output = res.output

  if(!error) return

  console.log(JSON.stringify(error))
  const errorContext = {
    name: error.name,
    message: error.message,
    stack: error.stack
  }
  // console.log(output, error, 'hubbahubab')
  // console.log('stdout')
  // console.log(stdout)
  // console.log('stderr')
  // console.log(stderr)

  console.log('hello')
}


writeAndTest('newfile.ts', process.argv.slice(2).join(' '))