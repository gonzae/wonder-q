import express, { Response } from 'express'
import { Environment } from 'dos-config'
import morgan from 'morgan'
import bodyParser from 'body-parser'

import routes from './routes'

export default function app(env: Environment): express.Express {
  const app = express()

  if (env === 'dev') app.use(morgan('dev'))

  app.use(bodyParser.json())

  // Just a health-check
  app.get('/health', (_, res: Response) => {
    res.sendStatus(200)
  })

  app.use('/api/v0/messages', routes.messages())

  return app
}
