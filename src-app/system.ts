import { createSystem, defaultConfig, defineConfig } from "@chakra-ui/react"

/**
 * tokensについて参照リンク
 * - https://www.chakra-ui.com/docs/theming/overview
 * -
 */

const config = defineConfig({
  theme: {
    breakpoints: {},
    tokens: {
      colors: {
        primary: { value: "#0FEE0F" },
        secondary: { value: "#EE0F0F" },
      },
      fonts: {
        body: { value: "system-ui, sans-serif" },
      },
      spacing: {},
    },
  },
})

/**
 * NOTE: `defaultConfig.theme.tokens.spacing`には↓のような設定がされている、
 *       これを消すことで、1=1pxとなる
 * {
 *   "1": { value: "0.25rem" },
 *   "2": { value: "0.5rem" },
 *   "3": { value: "0.75rem" },
 *   "4": { value: "1rem" },
 *   // ... (他に50以上の項目)
 * }
 */
// defaultConfig.theme!.tokens!.spacing = undefined

export const system = createSystem(defaultConfig, config)

/*
// 丁寧にやる場合、↓のようにやる
export const system = createSystem(
  {
    ...defaultConfig,
    theme: {
      ...defaultConfig?.theme,
      tokens: {
        ...defaultConfig?.theme?.tokens,
        spacing: undefined,
      },
    },
  },
  config,
)
*/

if (typeof process !== "undefined" && process.versions?.node) {
  const fs = require("node:fs")
  fs.writeFileSync(`${__dirname}/xxx.config.json`, JSON.stringify(system, null, 2), {
    encoding: "utf-8",
  })
}
