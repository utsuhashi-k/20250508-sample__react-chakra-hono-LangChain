import * as C from "@chakra-ui/react"
import { useStream } from "../../utils/stream"

export default function Page() {
  const { text, isConnected, call, stop } = useStream({
    url: "http://localhost:3000/stream-sample/markdown",
  })

  return (
    <C.Center flexDir="column" gap="4" minH="dvh" p="4">
      <C.Heading size="lg">ファイル読み込みストリーミング</C.Heading>

      <C.HStack gap="4">
        <C.Button colorScheme="teal" onClick={call} disabled={isConnected}>
          ファイル読み込み開始
        </C.Button>

        <C.Button colorScheme="red" onClick={stop} disabled={!isConnected}>
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
