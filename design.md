
Apr 30. 2023
Ok, so a few design ideas.
1. Chat consistency: If some chat history is shown, it should 100% be referenceable and accurate to the actual dialogue. It doesn't have to represent some of the internal chaining, but it should make to the conversation, especially the recent messages -- to allow for follow up questions and stuff like that.


2. I think a good bit of calls don't need to be saved to history at all -- like the classifier one. I always open up new chats with chatgpt. I think most people do too. Some people say they like the chat history, but tbh I think that's only true to a minimal degree. You want the past few messages, or occasionally to pick up the thread you were on yesterday, but seldeom do I find this actually increases performance that much--often times what you want is just a solution or a fix. Persisting this massive state of what was tried and the entire space is more of an autopilot thing than a copilot thing.


RN Smoothie 
--> Highlighted
    --> Rewrite --> [1] See below
    --> Readonly --> Filestuff with add'l context pointing out the selected text
--> Not Highlighted --> Normal file stuff


[1] The tricky part is in the difference between a request like "fix this for me" 
and a request like "change the `rand_int` function to `rand_num`". The first is abstract, and chatgpt should come up with a plan, or "thought" (as in ReAct) before replacing the code.
But the 

-------------------------------------------------------------------------------------------------------
// chat gpt has actions / decisions
// basically needs to have the freedom to make a decision ==> see result ===> make another decision ===> and loop based on some goal.


`You are the internal Monologue of a Chat Assistant. 
You run in a loop of Thought, Action, Observation.
Use Thought to describe your thoughts about the question you have been asked.
Use Action to run one of the actions available to you - 
Observation will be the result of running those actions.

Choices:
{{tools}}

Rules:
- If you have received an Input from the user, you should reply with a Thought and an Action.
- If you have received an Observation from a tool, you should reply with a Thought and an Action.
- You should never reply with an Input.


Input: Hey do this htjrghs
Thought:
Action: 
Observation: 

`

langchain loc: 2015
babyagi: 2831
simple-agent: 633, 


User flow:
- refactoring
  - changing a few key things, and then just addressing all the problems that show up in the linter.