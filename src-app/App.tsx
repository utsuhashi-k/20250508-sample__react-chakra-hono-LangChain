import * as C from "@chakra-ui/react"
import { useCallback, useEffect, useRef, useState } from "react"
import { Provider } from "./components/ui/provider"

export function App() {
  return (
    <Provider>
      <Page />
    </Provider>
  )
}

// stream-read-file-sample/text を受信する結果を実装 // TODO: stream-read-file-sample/text用に実装する
function Page() {}
