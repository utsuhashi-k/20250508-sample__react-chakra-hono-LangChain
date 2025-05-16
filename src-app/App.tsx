import { Suspense, useEffect } from "react"
import { BrowserRouter, useRoutes } from "react-router-dom"
import { Provider } from "./components/ui/provider"
import ROUTES from "~react-pages"

function AppRoutes() {
  const routes = useRoutes(ROUTES)

  return (
    <Suspense fallback={<div>Loading...</div>}>
      {routes || <div>No routes matched. This is a fallback UI.</div>}
    </Suspense>
  )
}

export function App() {
  return (
    <Provider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </Provider>
  )
}
