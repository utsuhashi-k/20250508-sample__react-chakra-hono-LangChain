import * as C from "@chakra-ui/react"
import { useCallback, useEffect, useState } from "react"
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
  const [eventSource, setEventSource] = useState<EventSource | null>(null)

  // SSE接続を開始する関数
  const startConnection = useCallback(() => {
    if (isConnected) return

    const url = "http://localhost:3000/stream-sample/count"

    // POSTリクエストを送信してSSEストリームを開始
    // fetch(url, {
    //   method: "POST",
    //   headers: {
    //     "Content-Type": "application/json",
    //   },
    // })
    //   .then(() => {
    // EventSourceを作成して接続
    const es = new EventSource(url)

    // countイベントを受信したときの処理
    es.addEventListener("count", event => {
      const newCount = parseInt(event.data, 10)
      setCount(newCount)
      setCounts(prev => [...prev, newCount])
    })

    // エラー発生時の処理
    es.onerror = () => {
      es.close()
      setIsConnected(false)
      setEventSource(null)
    }

    setEventSource(es)
    setIsConnected(true)
    // })
    // .catch(error => {
    //   console.error("接続エラー:", error)
    // })
  }, [isConnected])

  // SSE接続を停止する関数
  const stopConnection = useCallback(() => {
    if (eventSource) {
      eventSource.close()
      setEventSource(null)
      setIsConnected(false)
    }
  }, [eventSource])

  // コンポーネントのアンマウント時に接続を閉じる
  useEffect(() => {
    return () => {
      if (eventSource) {
        eventSource.close()
      }
    }
  }, [eventSource])

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
