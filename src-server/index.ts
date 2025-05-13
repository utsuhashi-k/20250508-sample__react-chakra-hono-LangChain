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
import { StringOutputParser } from "@langchain/core/output_parsers"

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// .env.localファイルを読み込む
dotenv.config({ path: resolve(__dirname, "..", ".env.local") })

const app = new Hono()
  .use(
    "*",
    cors({ origin: ["http://localhost:5173", "http://localhost:5174", "http://localhost:5175"] })
  )
  .get("/", (c) => {
    return c.text("Hello Hono!")
  })
  .post("/hello", (c) => {
    return c.json({ hello: "world" })
  })
  .get("/stream-sample/count", (c) =>
    streamSSE(c, async (stream) => {
      for (let i = 1; i <= 20; i++) {
        await stream.writeSSE({
          data: String(i),
          event: "count",
        })

        await sleep(100)
      }
      await stream.close()
    })
  )
  .get("/stream-markdown", (c) =>
    streamText(c, async (stream) => {
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
    })
  )
  .post(
    "/stream/lang-chain",
    zValidator(
      "json",
      z.object({
        prompt: z.string(),
      })
    ),
    (c) =>
      streamText(c, async (stream) => {
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

        {
          /* TODO: #dev 消す */ console.log(prompt)
          // LangChainjs+OpenAIを使用してストリーミングレスポンスを実装
          const model = new ChatOpenAI({
            openAIApiKey: process.env.OPENAI_API_KEY,
            modelName: "gpt-3.5-turbo",
            streaming: true,
          })
          /* TODO: #dev 消す */ console.log(model)
          // ストリーミングコールバックを設定
          await model.invoke([{ role: "user", content: prompt }], {
            callbacks: [
              {
                handleLLMNewToken(token: string) {
                  sendJsonStream({ type: "read-text", text: token })
                },
              },
            ],
          })
        }
        await stream.close()
      })
  )

serve({ fetch: app.fetch, port: 3000 }, (info) => {
  console.log()
  console.log(`Server is running on http://localhost:${info.port}`)
})
