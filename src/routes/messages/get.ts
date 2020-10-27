import { Request, Response } from 'express'
import queue from '../../lib/queue'

export default (req: Request, res: Response): void => {
  const consumerId = req.query.consId as string
  if (!consumerId) {
    res.status(400).send({ error: 'MISSING_QUERY_PARAM', message: `Missing query param 'consId'` })
    return
  }

  try {
    res.status(200).send({ data: queue.pull(consumerId) })
  } catch (e) {
    res.status(500).send({ error: 'UNKNOWN_ERROR' })
  }
}
