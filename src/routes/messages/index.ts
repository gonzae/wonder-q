import { Router } from 'express'

import getMessage from './get'
import addMessage from './add'
import deleteMessage from './delete'

export default function routes(): Router {
  const router = Router()

  /**
   * <host>/api/v0/messages/
   *
   * Pulls all available messages from queue by a consumer
   *
   * (query) @param string 'consId'
   *   The consumer ID
   *
   * @throws 404 - Bad Request if no consumer provided
   *
   * @return 'data' an array with available messages
   */
  router.get('/', getMessage)

  /**
   * <host>/api/v0/messages/add
   *
   * Adds a new message to the queue by a producer
   *
   * (query) @param string 'prodId'
   *   The producer ID
   * (body) @param string 'message'
   *   The message that wants to be sent to the queue
   *
   * @throws 404 - Bad Request if no producer provided
   * @throws 404 - Bad Request if no message provided
   *
   * @return 'id' an uuid for identifying the created message
   */
  router.post('/add', addMessage)

  /**
   * <host>/api/v0/messages/delete/:id
   *
   * Removes the message from queue after it's being process by a consumer
   *
   * (query) @param string 'consId'
   *   The producer ID
   * (url) @param string 'id'
   *   The uuid that identifies the message that is going to be flagged as processed
   *
   * @throws 404 - Bad Request if no consumer provided
   * @throws 400 - Not Found if message id doesn't match any message previously pulled by that consumer
   */
  router.delete('/:id', deleteMessage)

  return router
}
