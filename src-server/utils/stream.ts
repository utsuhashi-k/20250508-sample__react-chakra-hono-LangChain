/**
 * ReadableStreamをAsyncIterableに変換する関数
 * @param it 変換するReadableStream
 * @returns AsyncIterableオブジェクト
 */
export async function* streamToAsyncIterable<T>(it: ReadableStream<T>): AsyncGenerator<T> {
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
