import { Request, Response } from 'express'
import queue from '../../lib/queue'

export default (req: Request, res: Response): void => {
  const producerId: string = req.query.prodId as string
  if (!producerId) {
    res.status(400).send({ error: 'MISSING_QUERY_PARAM', message: `Missing query param 'prodId'` })
    return
  }

  const message: string = req.body.message
  if (!message) {
    res.status(400).send({ error: 'INVALID_MESSAGE' })
    return
  }

  try {
    const id = queue.add(message)
    res.status(201).send({ id })
  } catch (_) {
    res.status(500).send({ error: 'UNKNOWN_ERROR' })
  }
}
