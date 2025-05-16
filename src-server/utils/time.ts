/**
 * 指定されたミリ秒だけ処理を一時停止します
 * @param ms 一時停止する時間（ミリ秒）
 * @returns Promiseオブジェクト
 */
export const sleep = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms))
