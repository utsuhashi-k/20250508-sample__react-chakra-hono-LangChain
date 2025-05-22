import { Fragment } from "react"
import * as C from "@chakra-ui/react"
import { useCustomStream } from "./useCustomStream"
import { ChatInput } from "./ChatInput"
import { useRef } from "react"

export default function Page() {
  const it = useCustomStream({
    url: "http://localhost:3000/stream-sample/20250516",
  })

  const scrollRef = useRef<HTMLDivElement>(null)

  // 接続開始ボタンのクリックハンドラー
  const handleStartClick = (message: string) => {
    it.call({ message })
  }

  // 接続停止ボタンのクリックハンドラー
  const handleStopClick = () => {
    it.stop()
  }

  return (
    <C.Center flexDir="column" gap="6" minH="dvh" p="6">
      <C.Heading size="lg">ストリーミングタスク生成</C.Heading>

      <C.VStack
        ref={scrollRef}
        align="stretch"
        gap="4"
        h="60vh"
        w="100%"
        maxW="600px"
        overflowY="auto"
        p="4"
        flexDir="column-reverse"
      >
        {it.list.map((item, index) => (
          <Fragment key={index}>
            {item.type === "message-user" && (
              <C.Flex justify="flex-end">
                <C.Box
                  bg="blue.500"
                  color="white"
                  py={2}
                  px={4}
                  borderRadius="lg"
                  maxW="70%"
                  boxShadow="md"
                  whiteSpace="pre-wrap"
                >
                  {item.message}
                </C.Box>
              </C.Flex>
            )}
            {item.type === "message-ai" && (
              <C.Flex justify="flex-start">
                {item.isLoading && <C.SkeletonText noOfLines={1} />}

                {!item.isLoading && (
                  // <C.Box w="70%" whiteSpace="pre-wrap">
                  <C.Box
                    // bg="blue.500"
                    // color="white"
                    py={2}
                    px={4}
                    borderRadius="lg"
                    maxW="70%"
                    boxShadow="md"
                    whiteSpace="pre-wrap"
                  >
                    {item.message}
                  </C.Box>
                )}
              </C.Flex>
            )}
            {item.type === "task" && (
              <C.Flex justify="flex-start">
                <C.Box w="70%">
                  {item.isLoading && (
                    <C.HStack gap="5">
                      <C.SkeletonCircle size="8" />
                      <C.Stack flex="1">
                        <C.Skeleton height="5" />
                        <C.Skeleton height="5" width="80%" />
                      </C.Stack>
                    </C.HStack>
                  )}
                  {!item.isLoading && (
                    <C.HStack gap="5">
                      <C.Avatar.Icon boxSize={8} />
                      <C.Stack flex="1">
                        <C.Text>{item.task?.title}</C.Text>
                      </C.Stack>
                    </C.HStack>
                  )}
                </C.Box>
              </C.Flex>
            )}
          </Fragment>
        ))}
      </C.VStack>

      <C.Center mt={8} position="fixed" bottom={0} left={0} width="100vw" bg="white" p={4} boxShadow="md">
        <C.Box w="80%">
          <ChatInput onSubmit={handleStartClick} />
        </C.Box>
      </C.Center>
    </C.Center>
  )
}
