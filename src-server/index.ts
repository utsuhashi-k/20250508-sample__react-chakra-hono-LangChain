import { fileURLToPath } from "node:url"
import { dirname } from "node:path"
import { readFile } from "node:fs/promises"

import { serve } from "@hono/node-server"
import { Hono } from "hono"
import { cors } from "hono/cors"

import { streamSSE, streamText } from "hono/streaming"

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const app = new Hono()
  .use("*", cors({ origin: "http://localhost:5173" }))
  .get("/", (c) => {
    return c.text("Hello Hono!")
  })
  .post("/hello", (c) => {
    return c.json({ hello: "world" })
  })
  // TODO: postにする
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

serve({ fetch: app.fetch, port: 3000 }, (info) => {
  console.log()
  console.log(`Server is running on http://localhost:${info.port}`)
})
