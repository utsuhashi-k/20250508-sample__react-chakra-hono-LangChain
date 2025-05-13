import * as C from "@chakra-ui/react"
import { useCallback, useEffect, useRef, useState } from "react"
import { Provider } from "./components/ui/provider"

export function App() {
  return (
    <Provider>
      <Page />
    </Provider>
  )
}

// /stream-sample/countを受信する結果を実装
function Page() {
  const [count, setCount] = useState<number | null>(null)
  const [counts, setCounts] = useState<number[]>([])
  const [isConnected, setIsConnected] = useState(false)
  const abortControllerRef = useRef<AbortController | null>(null)

  // ストリーミング接続を開始する関数
  const startConnection = useCallback(() => {
    if (isConnected) return
    ;(async () => {
      try {
        const controller = new AbortController()
        abortControllerRef.current = controller

        const url = "http://localhost:3000/stream-sample/count"
        const response = await fetch(url, {
          signal: controller.signal,
          headers: {
            Accept: "text/event-stream",
          },
        })

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        if (!response.body) {
          throw new Error("ReadableStream not supported in this browser.")
        }
        setIsConnected(true)

        const reader = response.body.getReader()
        const decoder = new TextDecoder()
        let buffer = ""

        const processStream = async () => {
          try {
            while (true) {
              const { done, value } = await reader.read()

              if (done) {
                setIsConnected(false)
                break
              }

              // デコードして既存のバッファに追加
              buffer += decoder.decode(value, { stream: true })

              // イベントの処理
              const lines = buffer.split("\n\n")
              buffer = lines.pop() || "" // 最後の不完全な部分を新しいバッファに

              for (const line of lines) {
                if (line.startsWith("event: count")) {
                  const dataLine = line.split("\n").find(l => l.startsWith("data: "))
                  if (dataLine) {
                    const newCount = parseInt(dataLine.substring(6), 10)
                    setCount(newCount)
                    setCounts(prev => [...prev, newCount])
                  }
                }
              }
            }
          } catch (err) {
            if (!(err instanceof DOMException && err.name === "AbortError")) {
              console.error("ストリーム処理エラー:", err)
            }
            setIsConnected(false)
          }
        }

        processStream()
      } catch (error) {
        console.error("接続エラー:", error)
        setIsConnected(false)
        abortControllerRef.current = null
      }
    })()
  }, [isConnected])

  // ストリーミング接続を停止する関数
  const stopConnection = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
      abortControllerRef.current = null
      setIsConnected(false)
    }
  }, [])

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
      <C.Heading size="lg">ストリーミングカウンター</C.Heading>

      <C.HStack gap="4">
        <C.Button colorScheme="teal" onClick={startConnection} disabled={isConnected}>
          接続開始
        </C.Button>

        <C.Button colorScheme="red" onClick={stopConnection} disabled={!isConnected}>
          接続停止
        </C.Button>
      </C.HStack>

      <C.Box>
        <C.Text fontSize="xl" fontWeight="bold">
          現在のカウント: {count !== null ? count : "未接続"}
        </C.Text>
        <C.Text>接続状態: {isConnected ? "接続中" : "未接続"}</C.Text>
      </C.Box>

      <C.Box w="100%" maxW="600px" maxH="300px" overflowY="auto" borderWidth="1px" borderRadius="md" p="4">
        <C.Text mb="2" fontWeight="bold">
          受信したカウント:
        </C.Text>
        <C.Wrap gap="2">
          {counts.map((num, index) => (
            <C.WrapItem key={index}>
              <C.Badge colorScheme="teal">{num}</C.Badge>
            </C.WrapItem>
          ))}
        </C.Wrap>
      </C.Box>
    </C.Center>
  )
}
