import readline from 'readline';
import inquirer from 'inquirer';

export async function getUserInput(prefix: string): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const answer: string = await new Promise((resolve) => {
    rl.question(prefix, (input) => {
      resolve(input);
      rl.close();
    });
  });

  return answer;
}

export async function getUserConfirmation(actionToConfirm: string):Promise<boolean> {
  const questions = [
    {
      type: 'confirm',
      name: 'confirmation',
      message: `Are you sure you want to ${actionToConfirm}?`,
    },
  ];

  const answers = await inquirer.prompt(questions);
  return answers.confirmation;
}


// will revisit one day
// export async function stepThrough() {
//   const rl = readline.createInterface({
//     input: process.stdin,
//     output: process.stdout,
//   });
//   // const cursorPos = rl.getCursorPos()
//   async function getCursorPos():Promise<{row: number, col: number}> {
//     return new Promise((resolve) => {
//       // Send the "Request Cursor Position" (CPR) ANSI escape code to the console
//       process.stdin.once('data', (data) => {
//         const match = data.toString().match(/\u001b\[(\d+);(\d+)R/);
//         if(match === null) throw new Error('no match')
//         const row = Number(match[1]);
//         const col = Number(match[2]);
//         resolve({ row, col });
//       });

//       process.stdout.write('\u001b[6n');
//       // Set up data listener to capture response
//     });
//   }

//   const {row, col} = await getCursorPos()
  
//   const answer = await new Promise((resolve) => {
//     rl.once('line', () => {
//       // process.stdout.moveCursor(process.stdout.columns, -1)
//       process.stdout.cursorTo(row, col)
//       process.stdout.clearScreenDown()
//       resolve(null);
//       rl.close()
//     })
//     // rl.addListener('line', (e) => )
//     // rl.question(`curr: ${currentState}`, (input) => {
//     //   console.log(input)
//     //   resolve(input.trim().toLowerCase());
//     //   rl.close();
//     // });
//   });

//   return answer
// }