import { serve } from "@hono/node-server"
import { Hono } from "hono"

const app = new Hono()
  .get("/", c => {
    return c.text("Hello Hono!")
  })
  .post("/hello", c => {
    return c.json({ hello: "world" })
  })

serve({ fetch: app.fetch, port: 3000 }, info => {
  console.log(`Server is running on http://localhost:${info.port}`)
})
