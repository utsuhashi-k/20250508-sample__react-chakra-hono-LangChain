import * as v from "valibot"

export const StreamJSONSchema = v.variant("type", [
  v.object({
    type: v.literal("loading-chat"),
  }),
  v.object({
    type: v.literal("streaming-chat"),
    chunk: v.string(),
  }),
  v.object({
    type: v.literal("loading-task"),
  }),
  v.object({
    type: v.literal("read-task"),
    task: v.object({
      title: v.string(),
    }),
  }),
])

export type StreamJSONSchema = v.InferOutput<typeof StreamJSONSchema>
