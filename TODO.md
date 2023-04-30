# Project To-Do List

## Tasks

- [ ] Chat to decision: Make a simple chat interface that takes your input and does a single command based on the input. This is extensible and will work with future commands
- [ ] Minor Bug -- Syntax highlighting: Fix syntax highlighting for nested / multiple sets of backticks. Syntax highlighting also broken on line wrapping in terminal. Causes a bunch of repeated code because readline.clearLine() doesn't clear the whole line. 
- [ ] Minor Bug -- Token trimming does not work when above 3.5 context length, and switching from 4 to 3.5

## Completed

- [X] VSCode Extension: Make a vscode extension to see the currently focused tab and pipe the data to the cli that way the cli can see what tab is focused and you don't have to type the path. The trickiest part of this is actually just figuring out how to share state between vscode and the cli runtime. 
- [X] Make it so People are reminded / updated about upgrades to the system, or it's done automatically.
- [X] Create streaming for output: have the text output streamed from the chatgpt endpoint. must continue to support code syntax highlighting
- [x] Task 5: Description of task 5