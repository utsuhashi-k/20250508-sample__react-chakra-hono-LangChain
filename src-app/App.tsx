import { Suspense, useEffect } from "react"
import { BrowserRouter, useRoutes } from "react-router-dom"
import { Provider } from "./components/ui/provider"
import routes from "~react-pages"

function AppRoutes() {
  useEffect(() => {
    console.log("Generated routes:", routes)
    console.log("Routes length:", routes.length)
    routes.forEach((route, index) => {
      console.log(`Route ${index}:`, {
        path: route.path,
        element: route.element ? "Element exists" : "No element",
        children: route.children ? `Has ${route.children.length} children` : "No children",
      })
    })
  }, [])

  const routeElements = useRoutes(routes)

  useEffect(() => {
    console.log("Route elements rendered:", routeElements ? "Yes" : "No")
  }, [routeElements])

  return (
    <Suspense fallback={<div>Loading...</div>}>
      {routeElements || <div>No routes matched. This is a fallback UI.</div>}
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
