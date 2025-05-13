import { Provider } from "./components/ui/provider"
import Page from "./pages/stream-markdown/page"

export function App() {
  return (
    <Provider>
      <Page />
    </Provider>
  )
}
