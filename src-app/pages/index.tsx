import * as C from "@chakra-ui/react"
import { Link } from "react-router-dom"

export default function Page() {
  return (
    <C.Center flexDir="column" gap="8" minH="dvh" p="4">
      <C.Heading size="lg">vite-plugin-pages デモ</C.Heading>
      <C.Stack gap={4} direction="column">
        <C.Text>以下のページにアクセスできます：</C.Text>
        <C.Stack as="ul" gap={2}>
          <C.Box as="li">
            <Link to="/hello-chakra">
              <C.Button colorScheme="teal">Hello Chakra</C.Button>
            </Link>
          </C.Box>
          <C.Box as="li">
            <Link to="/stream-count">
              <C.Button colorScheme="blue">ストリーミングカウンター</C.Button>
            </Link>
          </C.Box>
          <C.Box as="li">
            <Link to="/stream-markdown">
              <C.Button colorScheme="purple">ファイル読み込みストリーミング</C.Button>
            </Link>
          </C.Box>
          <C.Box as="li">
            <Link to="/with-LangChain">
              <C.Button colorScheme="purple">LangChainを用いたAIチャットサンプル</C.Button>
            </Link>
          </C.Box>
          <C.Box as="li">
            <Link to="/stream-20250516">
              <C.Button colorScheme="green">ストリーミングタスク生成</C.Button>
            </Link>
          </C.Box>
        </C.Stack>
      </C.Stack>
    </C.Center>
  )
}
