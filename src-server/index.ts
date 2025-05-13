import { serve } from "@hono/node-server"
import { Hono } from "hono"
import { cors } from "hono/cors"
import { streamSSE } from "hono/streaming"

const app = new Hono()
  .use("*", cors({ origin: "http://localhost:5173" }))
  .get("/", c => {
    return c.text("Hello Hono!")
  })
  .post("/hello", c => {
    return c.json({ hello: "world" })
  })
  // TODO: postにする
  .get("/stream-sample/count", c =>
    streamSSE(c, async stream => {
      for (let i = 1; i <= 20; i++) {
        await stream.writeSSE({
          data: String(i),
          event: "count",
        })

        await new Promise(resolve => setTimeout(resolve, 100))
      }
      await stream.close()
    }),
  )

serve({ fetch: app.fetch, port: 3000 }, info => {
  console.log()
  console.log(`Server is running on http://localhost:${info.port}`)
})
