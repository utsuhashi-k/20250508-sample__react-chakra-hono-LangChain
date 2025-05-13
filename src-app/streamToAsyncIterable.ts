export async function* streamToAsyncIterable<T>(it: ReadableStream<T>) {
  const reader = it.getReader()
  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      yield value
    }
  } finally {
    reader.releaseLock()
  }
}
