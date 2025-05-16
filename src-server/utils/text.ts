/**
 * テキストを指定されたサイズのチャンクに分割するジェネレータ関数
 * @param text 分割するテキスト
 * @param chunkSize チャンクのサイズ
 * @returns 分割されたテキストのチャンクを順次生成するジェネレータ
 */
export function* chunkText(text: string, chunkSize: number): Generator<string> {
  for (let i = 0; i < text.length; i += chunkSize) {
    yield text.slice(i, i + chunkSize)
  }
}
