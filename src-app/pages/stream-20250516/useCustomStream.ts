import { useState, useRef, useEffect } from "react"
import { streamToAsyncIterable } from "../../streamToAsyncIterable"
import * as v from "valibot"
import { StreamJSONSchema } from "../../../common-schema"
import { useChatList } from "./useChatList"
import ky from "ky"

type Option = {
  url: string
  // fetchOption: Omit<RequestInit, "signal">
}

/**
 * ストリーミング処理用のカスタムフック
 * @param url ストリーミングデータを取得するURL
 * @returns テキスト、接続状態、接続開始・停止関数を含むオブジェクト
 */
export function useCustomStream(option: Option) {
  const [isConnected, setIsConnected] = useState(false)
  const abortControllerRef = useRef<AbortController | null>(null)

  const { list, update } = useChatList()

  type CallOption = {
    message: string
  }

  // ストリーミング接続を開始する関数
  const call = async ({ message }: CallOption) => {
    if (isConnected) return
    setIsConnected(true)

    update("message-user", {
      type: "message-user",
      message,
    })

    const controller = new AbortController()
    abortControllerRef.current = controller

    try {
      const response = await ky.post(option.url, {
        signal: controller.signal,
      })

      if (!response.body) {
        throw new Error("ReadableStream not supported in this browser.")
      }

      const stream = response.body
        //
        .pipeThrough(new TextDecoderStream())
        .pipeThrough(
          new TransformStream<string, StreamJSONSchema>({
            transform(chunk, controller) {
              Iterator.from(chunk.split("\n"))
                .filter(jsonText => jsonText.trim())
                .map(jsonText => JSON.parse(jsonText))
                .map(obj => v.parse(StreamJSONSchema, obj))
                .forEach(obj => {
                  controller.enqueue(obj)
                })
            },
          }),
        )

      for await (const json of streamToAsyncIterable(stream)) {
        switch (json.type) {
          case "loading-chat": {
            update("message-ai", { type: "message-ai", isLoading: true })
            break
          }
          case "streaming-chat": {
            update("message-ai", before => ({
              type: "message-ai",
              isLoading: false,
              message: (before?.message ?? "") + json.chunk,
            }))
            break
          }
          case "loading-task": {
            update("empty", { type: "empty" }) // TODO: 汚いのでどうにかする (別のタスクが入った場合、正しくupdateできるようにしたい)
            update("task", { type: "task", isLoading: true })
            break
          }
          case "add-task": {
            update("task", {
              type: "task",
              isLoading: false,
              task: {
                title: json.task.title,
              },
            })
            break
          }
        }
      }

      update("empty", { type: "empty" })
      setIsConnected(false)
    } catch (error) {
      setIsConnected(false)
      abortControllerRef.current = null
      throw new Error("stream error", { cause: error })
    }
  }

  // ストリーミング接続を停止する関数
  const stop = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
      abortControllerRef.current = null
      setIsConnected(false)
    }
  }

  // unmount時に接続を閉じる
  useEffect(() => {
    return () => abortControllerRef.current?.abort()
  }, [])

  return { isConnected, call, stop, list }
}
