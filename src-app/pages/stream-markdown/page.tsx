import * as C from "@chakra-ui/react"
import { useEffect, useRef, useState } from "react"

import { streamToAsyncIterable } from "../../streamToAsyncIterable"

export default function Page() {
  const [text, setText] = useState("")
  const [isConnected, setIsConnected] = useState(false)
  const abortControllerRef = useRef<AbortController | null>(null)

  const startConnection = async () => {
    if (isConnected) return
    try {
      setText("")

      const controller = new AbortController()
      abortControllerRef.current = controller

      const url = "http://localhost:3000/stream-markdown"
      const response = await fetch(url, {
        signal: controller.signal,
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
        try {
          const data = JSON.parse(line)

          if (data.type === "read-text") {
            setText((prev) => prev + data.text)
          }
        } catch (err) {
          console.error("JSON解析エラー:", err, line)
        }
      }

      setIsConnected(false)
    } catch (error) {
      console.error("接続エラー:", error)
      setIsConnected(false)
      abortControllerRef.current = null
    }
  }

  // ストリーミング接続を停止する関数
  const stopConnection = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
      abortControllerRef.current = null
      setIsConnected(false)
    }
  }

  // コンポーネントのアンマウント時に接続を閉じる
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [])

  return (
    <C.Center flexDir="column" gap="4" minH="dvh" p="4">
      <C.Heading size="lg">ファイル読み込みストリーミング</C.Heading>

      <C.HStack gap="4">
        <C.Button colorScheme="teal" onClick={startConnection} disabled={isConnected}>
          ファイル読み込み開始
        </C.Button>

        <C.Button colorScheme="red" onClick={stopConnection} disabled={!isConnected}>
          読み込み停止
        </C.Button>
      </C.HStack>

      <C.Box>
        <C.Text>接続状態: {isConnected ? "接続中" : "未接続"}</C.Text>
        {isConnected && (
          <C.HStack>
            <C.Spinner size="sm" />
            <C.Text>読み込み中</C.Text>
          </C.HStack>
        )}
      </C.Box>

      <C.Box
        w="100%"
        maxW="600px"
        maxH="400px"
        overflowY="auto"
        borderWidth="1px"
        borderRadius="md"
        p="4"
        whiteSpace="pre-wrap"
        fontFamily="monospace"
      >
        <C.Box whiteSpace="pre-wrap" lineHeight="1.4">
          {text || <C.Text color="gray.500">テキストはまだ読み込まれていません</C.Text>}
        </C.Box>
      </C.Box>
    </C.Center>
  )
}
