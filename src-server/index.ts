import { fileURLToPath } from "node:url"
import { dirname, resolve } from "node:path"
import { readFile } from "node:fs/promises"
import * as dotenv from "dotenv"

import { serve } from "@hono/node-server"
import { Hono } from "hono"
import { cors } from "hono/cors"
import { streamSSE, streamText } from "hono/streaming"
import { zValidator } from "@hono/zod-validator"
import { z } from "zod"
import { ChatOpenAI } from "@langchain/openai"
import { type StreamJSONSchema } from "../common-schema"

import { sleep } from "./utils/time"
import { chunkText } from "./utils/text"

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// .env.localファイルを読み込む
dotenv.config({ path: resolve(__dirname, "..", ".env.local") })

const app = new Hono()
  .use("*", cors({ origin: ["http://localhost:5173", "http://localhost:5174", "http://localhost:5175"] }))
  .get("/", c => {
    return c.text("Hello Hono!")
  })
  .post("/hello", c => {
    return c.json({ hello: "world" })
  })
  .get("/stream-sample/count", c =>
    streamSSE(c, async stream => {
      for (let i = 1; i <= 20; i++) {
        await stream.writeSSE({
          data: String(i),
          event: "count",
        })

        await sleep(100)
      }
      await stream.close()
    }),
  )
  .get("/stream-sample/markdown", c =>
    streamText(c, async stream => {
      type ___ =
        //
        | { type: "loading"; description: string }
        //
        | { type: "read-text"; text: string }

      async function sendJsonStream(it: ___) {
        await stream.writeln(JSON.stringify(it))
      }

      await sendJsonStream({ type: "loading", description: "読み込み中..." })
      await sleep(1000)

      const markdownText = await readFile(`${__dirname}/long-text.md`, { encoding: "utf8" })

      for (let i = 0; i < markdownText.length; i += 5) {
        const sliced = markdownText.slice(i, i + 5)
        await sendJsonStream({ type: "read-text", text: sliced })
        await sleep(10)
      }

      await stream.close()
    }),
  )
  .post("/stream-sample/markdown-sse", c =>
    streamSSE(c, async stream => {
      // 読み込み中メッセージを送信
      await stream.writeSSE({
        data: "読み込み中...",
        event: "loading",
      })
      await sleep(1000)

      const markdownText = await readFile(`${__dirname}/long-text.md`, { encoding: "utf8" })

      for (const chunk of chunkText(markdownText, 5)) {
        await stream.writeSSE({
          data: chunk,
          event: "message",
        })
        await sleep(10)
      }

      await stream.close()
    }),
  )
  .post("/stream-sample/20250516", c =>
    streamText(c, async stream => {
      async function sendJsonStream(it: StreamJSONSchema) {
        await stream.write(JSON.stringify(it) + "\n\n")
      }

      await sendJsonStream({ type: "loading-chat" })
      await sleep(3000)

      {
        const text = `指定されたテキストから、タスクを作成します。`
        for (const chunk of chunkText(text, 1)) {
          await sendJsonStream({ type: "streaming-chat", chunk })
          await sleep(50)
        }
      }

      for (let i = 1; i <= 3; i++) {
        await sendJsonStream({ type: "loading-task" })
        await sleep(1000)

        await sendJsonStream({ type: "add-task", task: { title: `タスク${i}` } })
      }

      {
        const text = `解析した結果、3件のタスクを作成しました。`
        for (const chunk of chunkText(text, 1)) {
          await sendJsonStream({ type: "streaming-chat", chunk })
          await sleep(50)
        }
      }

      await stream.close()
    }),
  )
  .post(
    "/stream/lang-chain",
    zValidator(
      "json",
      z.object({
        prompt: z.string(),
      }),
    ),
    c =>
      streamText(c, async stream => {
        const { prompt } = c.req.valid("json")

        type ___ =
          //
          | { type: "loading"; description: string }
          //
          | { type: "read-text"; text: string }

        async function sendJsonStream(it: ___) {
          await stream.writeln(JSON.stringify(it))
        }

        await sendJsonStream({ type: "loading", description: "読み込み中..." })
        await sleep(1000)

        const model = new ChatOpenAI({
          openAIApiKey: process.env.OPENAI_API_KEY,
          modelName: "gpt-3.5-turbo",
          streaming: true,
        })

        await model.invoke([{ role: "user", content: prompt }], {
          callbacks: [
            {
              handleLLMNewToken(token: string) {
                sendJsonStream({ type: "read-text", text: token })
              },
            },
          ],
        })

        await stream.close()
      }),
  )

serve({ fetch: app.fetch, port: 3000 }, info => {})
