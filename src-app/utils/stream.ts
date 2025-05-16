import { useEffect, useRef, useState } from "react"

/**
 * ReadableStreamをAsyncIterableに変換する関数
 * @param it 変換するReadableStream
 * @returns AsyncIterableオブジェクト
 */
export async function* streamToAsyncIterable<T>(it: ReadableStream<T>): AsyncGenerator<T> {
  const reader = it.getReader()
  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      yield value
    }
  } finally {
    reader.releaseLock()
  }
}

type Option = {
  url: string
  fetchOption: Omit<RequestInit, "signal">
}

/**
 * ストリーミング処理用のカスタムフック
 * @param url ストリーミングデータを取得するURL
 * @returns テキスト、接続状態、接続開始・停止関数を含むオブジェクト
 */
export function useStream(option: Option) {
  const [text, setText] = useState("")
  const [isConnected, setIsConnected] = useState(false)
  const abortControllerRef = useRef<AbortController | null>(null)

  // ストリーミング接続を開始する関数
  const call = async () => {
    if (isConnected) return
    setText("")

    const controller = new AbortController()
    abortControllerRef.current = controller

    try {
      const response = await fetch(option.url, {
        signal: controller.signal,
        ...option.fetchOption,
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      if (!response.body) {
        throw new Error("ReadableStream not supported in this browser.")
      }

      setIsConnected(true)
      const stream = response.body.pipeThrough(new TextDecoderStream())

      for await (const line of streamToAsyncIterable(stream)) {
        const data = JSON.parse(line)

        if (data.type === "read-text") {
          setText((prev) => prev + data.text)
        }
      }

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

  return { text, isConnected, call, stop }
}
