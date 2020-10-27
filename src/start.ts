import config from 'dos-config'
import app from './server'

app(config.environment).listen(config.port, () => {
  if (config.environment === 'dev') {
    /* eslint-disable-next-line no-console */
    console.log(`Server started at http://localhost:${config.port}`)
  }
})
