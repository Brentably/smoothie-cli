import type vscode from 'vscode'
import {io} from 'socket.io-client'

export const getSelectedRangeAndText = async ():Promise<[vscode.Selection | undefined, string | undefined]> => {
  return new Promise((res, rej) => {
    const socket = io("ws://localhost:6969")
    socket.on('selectedRangeAndText', (arg:[vscode.Selection | undefined, string | undefined]) => res(arg))
    socket.emit("getSelectedRangeAndText")
  })
}


export const getFocusedFile = async ():Promise<string | undefined>  => {
  return new Promise((res, rej) => {
    const socket = io("ws://localhost:6969")
    socket.on('focusedFile', (arg: string | undefined) => res(arg))
    socket.emit("getFocusedFile")
  })
}

export const replaceSelection = async (code: string) => {
  return new Promise((res, rej) => {
    const socket = io("ws://localhost:6969")
    socket.on('replaceSelectionCallback', (arg: any) => {
    })
    socket.on('saved', (arg: any) => {
      res(arg)
    })
    socket.emit('replaceSelection', code)
  })
}