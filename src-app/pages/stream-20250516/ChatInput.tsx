import { useState, type JSX, type DetailedHTMLProps } from "react"
import * as C from "@chakra-ui/react"

type Elements = JSX.IntrinsicElements

type HtmlTagProps = {
  [K in keyof Elements]: Elements[K] extends DetailedHTMLProps<infer T, any> ? T : never
}

type Props = {
  onSubmit?: (message: string) => void
}

export function ChatInput({ onSubmit }: Props) {
  const [message, setMessage] = useState("")

  const handleSubmit = ((e) => {
    e.preventDefault()
    if (!message.trim()) return

    onSubmit?.(message)
    setMessage("")
  }) satisfies HtmlTagProps["form"]["onSubmit"]

  return (
    <C.Grid
      as="form"
      onSubmit={handleSubmit as any}
      width="100%"
      templateColumns="1fr 100px"
      gap={2}
      alignItems="center"
    >
      <C.Textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="メッセージを入力してください..."
        resize="vertical"
        minH="1.2em"
        borderRadius="md"
        autoresize
      />
      <C.Button type="submit" colorScheme="blue" alignSelf="flex-end" disabled={!message.trim()}>
        送信
      </C.Button>
    </C.Grid>
  )
}
