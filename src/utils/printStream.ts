import {highlight} from './highlight'


let prevChunk = ''
let shouldHighlight = false
let highlightedText = ''
export async function printText(textChunk: string, currentText: string) {
  if(textChunk === '[DONE]') {
    process.stdout.write('\n\n');
    prevChunk = ''
    shouldHighlight = false
    highlightedText = ''
    return
  }
  if(textChunk.startsWith('`') && prevChunk == '``') {
    shouldHighlight = !shouldHighlight
    process.stdout.write(textChunk)
    return
  }
  prevChunk = textChunk
  
  // Print the highlighted text
  if(shouldHighlight) {
    if(highlightedText === undefined) throw new Error("you fucked up")
    highlightedText += textChunk
    process.stdout.clearLine(0)
    process.stdout.cursorTo(0)
    process.stdout.write(highlight(highlightedText))
  } else {
    process.stdout.write(textChunk);
  }
  if(textChunk.includes('\n')) highlightedText = ''
}


