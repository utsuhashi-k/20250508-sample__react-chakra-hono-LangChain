import reactLogo from "./assets/react.svg"
import * as C from "@chakra-ui/react"
import viteLogo from "/vite.svg"
import { Provider } from "./components/ui/provider"

export function App() {
  return (
    <Provider>
      <Page />
    </Provider>
  )
}

function Page() {
  return (
    <C.Center flexDir="column" gap="8" minH="dvh">
      <C.HStack mt={10} gap={10}>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </C.HStack>
      <C.HStack mt={10} gap={10}>
        <C.Button>Click me</C.Button>
        <C.Button>Click me</C.Button>
      </C.HStack>
      <C.HStack mt={10} gap={10}>
        <C.Button colorScheme="teal" size="lg">
          Large Button
        </C.Button>
        <C.Button colorScheme="pink" variant="outline">
          Outline Button
        </C.Button>
        <C.Button colorScheme="blue">Loading Button</C.Button>
        <C.Button colorScheme="red">Disabled Button</C.Button>
        <C.Button colorScheme="yellow" onClick={() => alert("Button clicked!")}>
          Alert Button
        </C.Button>
      </C.HStack>
    </C.Center>
  )
}
