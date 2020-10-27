import { Request, Response } from 'express'
import queue from '../../lib/queue'

export default (req: Request, res: Response): void => {
  const consumerId: string = req.query.consId as string
  if (!consumerId) {
    res.status(400).send({ error: 'MISSING_QUERY_PARAM', message: `Missing query param 'consId'` })
    return
  }

  try {
    queue.deletePulled(req.params.id, consumerId)
    res.sendStatus(200)
  } catch (err) {
    if (err.toString() === 'Error: NOT_FOUND') {
      res.status(404).send()
    } else {
      res.status(500).send({ error: 'UNKNOWN_ERROR' })
    }
  }
}
