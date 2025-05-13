import * as C from "@chakra-ui/react"
import { useEffect, useRef, useState } from "react"

import { streamToAsyncIterable } from "../../streamToAsyncIterable"

export default function Page() {
  const [text, setText] = useState("")
  const [prompt, setPrompt] = useState("")
  const [isConnected, setIsConnected] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const abortControllerRef = useRef<AbortController | null>(null)

  const startConnection = async () => {
    if (isConnected || !prompt.trim()) return
    try {
      setText("")
      setIsLoading(true)

      const controller = new AbortController()
      abortControllerRef.current = controller

      const url = "http://localhost:3000/stream/lang-chain"
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt }),
        signal: controller.signal,
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      if (!response.body) {
        throw new Error("ReadableStream not supported in this browser.")
      }

      setIsConnected(true)
      const stream = response.body.pipeThrough(new TextDecoderStream()).pipeThrough(
        new TransformStream< string , string >({
          transform(chunk, controller) {
            for (const jsonText of chunk.split("\n")) {
              controller.enqueue(jsonText)
            }
            controller.terminate()
          },
        })
      )

      try {
        for await (const line of streamToAsyncIterable(stream)) {
          try {
            if (line.trim() === "") continue

            console.log("受信データ:", line)
            const data = JSON.parse(line)
            console.log("パース後データ:", data)

            if (data.type === "loading") {
              setIsLoading(true)
            } else if (data.type === "read-text") {
              setIsLoading(false)
              console.log("テキスト追加:", data.text)
              setText((prev) => {
                const newText = prev + data.text
                console.log("更新後テキスト:", newText)
                return newText
              })
            }
          } catch (err) {
            console.error("JSON解析エラー:", err, line)
          }
        }
      } catch (streamError) {
        console.error("ストリーム処理エラー:", streamError)
        setText((prev) => prev + "\n\n[接続が終了しました]")
      }

      setIsConnected(false)
      setIsLoading(false)
    } catch (error) {
      console.error("接続エラー:", error)
      setIsConnected(false)
      setIsLoading(false)
      abortControllerRef.current = null
    }
  }

  // ストリーミング接続を停止する関数
  const stopConnection = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
      abortControllerRef.current = null
      setIsConnected(false)
      setIsLoading(false)
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
      <C.Heading size="lg">LangChain + OpenAI ストリーミング</C.Heading>

      <C.VStack w="100%" maxW="600px" gap={4}>
        <C.Box w="100%">
          <C.Text mb={2} fontWeight="bold">
            プロンプト
          </C.Text>
          <C.Textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="質問や指示を入力してください..."
            size="md"
            disabled={isConnected}
          />
        </C.Box>

        <C.HStack gap="4">
          <C.Button
            colorScheme="teal"
            onClick={startConnection}
            disabled={isConnected || !prompt.trim() || isLoading}
          >
            {isLoading ? "送信中..." : "送信"}
          </C.Button>

          <C.Button colorScheme="red" onClick={stopConnection} disabled={!isConnected}>
            停止
          </C.Button>
        </C.HStack>
      </C.VStack>

      <C.Box>
        <C.Text>接続状態: {isConnected ? "接続中" : "未接続"}</C.Text>
        {isLoading && (
          <C.HStack>
            <C.Spinner size="sm" />
            <C.Text>読み込み中</C.Text>
          </C.HStack>
        )}
      </C.Box>

      <C.Box
        w="100%"
        maxW="600px"
        minH="200px"
        maxH="400px"
        overflowY="auto"
        borderWidth="1px"
        borderRadius="md"
        p="4"
        whiteSpace="pre-wrap"
        fontFamily="monospace"
      >
        <C.Box whiteSpace="pre-wrap" lineHeight="1.4">
          {text || <C.Text color="gray.500">AIの回答がここに表示されます</C.Text>}
        </C.Box>
      </C.Box>
    </C.Center>
  )
}
