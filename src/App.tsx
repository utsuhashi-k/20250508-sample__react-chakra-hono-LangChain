import reactLogo from "./assets/react.svg"
import { Button, Center, HStack, VStack } from "@chakra-ui/react"
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
    <Center flexDir="column" gap="8" minH="dvh">
      <HStack>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </HStack>
      <HStack>
        <Button>Click me</Button>
        <Button>Click me</Button>
      </HStack>
      <VStack>
        <Button colorScheme="teal" size="lg">
          Large Button
        </Button>
        <Button colorScheme="pink" variant="outline">
          Outline Button
        </Button>
        <Button colorScheme="blue">Loading Button</Button>
        <Button colorScheme="red">Disabled Button</Button>
        <Button colorScheme="yellow" onClick={() => alert("Button clicked!")}>
          Alert Button
        </Button>
      </VStack>
    </Center>
  )
}
