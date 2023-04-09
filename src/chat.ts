import { ChatCompletionRequestMessage, ChatCompletionRequestMessageRoleEnum } from 'openai';
import readline from 'readline'
import { getChatCompletion } from './openai';
import {readApiKey, readStore, writeStore} from "./state"
import { exec } from 'child_process';

function runCommand(command: string) {
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error executing command: ${command}`);
        reject(error);
      } else {
        console.log(`Command executed successfully: ${command}`);
        console.log('Output:', stdout);
        resolve(stdout);
      }
    });
  });
}

export default async function chat(isPatcher: Boolean = false) {
    while (true) {
      const userMessage = await getUserInput(">>> ")
      let prompt = `You are a bot whose job it is to write programs.`;
      if (isPatcher) {
        prompt += ` You have the ability to create files and/or write to them.`
        + ` The way to create files is by calling \`\`\`sh\nwtfdid create -f 'path/to/new/file' -p 'your prompt'\`\`\``
        + ` and the way to write to files is by calling \`\`\`sh\nwtfdid write -f 'path/to/existing/file' -p 'your prompt'\`\`\`.`
        + ` Wtfdid takes your prompt and creates / modifies code automatically.`
        + ` So your job is to come up with the right series of wtfdid commands that ends up satisfying the main goal.`
        + ` Thw \`\`\`wtfdid write\`\`\` command actually reads the content of the file, and is able to change it, where as the create command simply pastes in new code into the file.`
        + ` You don't have to write node boilerplate code. For example, you can call \`\`\`npm\`\`\` or \`\`\`npx\`\`\` calls before your wtfdid commands.`
        + ` The only commands wtfdid takes is "write" and "create", and the only flags it takes are "-f" and "-p".`
        + ` Don't write code in the prompt parameter. The prompt is just a natural language input that wtfdid's AI uses to actually write code.`
        + ` For example, if you want to add a summing function to a file named index.js, you can call \`\`\`sh\nwtfdid write -f './index.js' -p 'Add a function that takes a list of numbers and returns the sum'\`\`\`.`
        + ` Remember, every time you run a shell command, the shell environment opens, runs, and closes, so there is no persitant state. This means, cd'ing into a directory and then writing to a file in that directory will not work. You need to include the full relative path each time you call a shell command.`;
      }
      prompt += ` Do you understand?`;
      const messages:ChatCompletionRequestMessage[] = readStore().messagesHistory;
      
      if (messages.length == 1) {
        messages.push({role: "user", content: prompt}, {role: "assistant", content: "Yes, I understand."});
      }

      const chatgptResponse = await getChatCompletion(userMessage, messages, 'gpt-4')
      console.log(chatgptResponse)

      messages.push({role: ChatCompletionRequestMessageRoleEnum.System, content: chatgptResponse})
      writeStore((ps) => ({...ps, messagesHistory: messages}));
      
      if (!isPatcher) {
        continue;
      }

      // Extract the shell commands from the response (starts with ```sh) using regex
      let shellCommands: string[] = [];
      const regex = /```sh\n(.*?)```/gs;
      let matches;

      while ((matches = regex.exec(chatgptResponse)) !== null) {
        const [_, shellCommand] = matches;
        shellCommands.push(shellCommand);
      }

      console.log(shellCommands);

      // Execute the shell commands with process
      for (const shellCommand of shellCommands) {
        console.log(`Executing shell command: ${shellCommand}`);
        try {
          await runCommand(shellCommand);
        } catch (error) {
          console.error('Error:', error);
          break;
        }
      }
    }
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
