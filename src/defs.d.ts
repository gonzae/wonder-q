declare module 'dos-config' {
  export type Environment = 'dev' | 'test' | 'prod'

  const config: Config

  interface Config {
    delay: number
    environment: Environment
    port: number
  }

  export default config
}
