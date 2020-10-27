import { Server } from 'http'
import request, { Response } from 'supertest'

import queue from './lib/queue'
import app from './server'

let server: Server | undefined

beforeAll((done) => {
  server = app('test').listen(4000, () => {
    done()
  })
})

afterAll((done) => {
  return server && server.close(done)
})

describe('GET - error /api/v0/messages', () => {
  it('with no consumer should return Bad Request', async (done) => {
    request(server)
      .get(`/api/v0/messages`)
      .expect(400)
      .end((err: unknown, res: Response) => {
        if (err) return done(err)

        expect(res.body.error).toBe('MISSING_QUERY_PARAM')
        done()
      })
  })
})

describe('GET - success /api/v0/messages', () => {
  it('with consumer return 200 and response body data', async (done) => {
    request(server)
      .get(`/api/v0/messages?consId=some-consumer-id`)
      .expect(200)
      .end((err: unknown, res: Response) => {
        if (err) return done(err)

        expect(res.body).toHaveProperty('data')
        done()
      })
  })
})

describe('POST - errors /api/v0/messages/add', () => {
  it('with no producer should return Bad Request MISSING_QUERY_PARAM', async (done) => {
    request(server)
      .post(`/api/v0/messages/add`)
      .expect(400)
      .end((err: unknown, res: Response) => {
        if (err) return done(err)

        expect(res.body.error).toBe('MISSING_QUERY_PARAM')
        done()
      })
  })

  it('with producer but not message body should return Bad Request INVALID_MESSAGE', async (done) => {
    request(server)
      .post(`/api/v0/messages/add?prodId=some-producer-id`)
      .expect(400)
      .end((err: unknown, res: Response) => {
        if (err) return done(err)

        expect(res.body.error).toBe('INVALID_MESSAGE')
        done()
      })
  })
})

describe('POST - success /api/v0/messages/add', () => {
  it('with producer and message body should return 201 with message id', async (done) => {
    request(server)
      .post(`/api/v0/messages/add?prodId=some-producer-id`)
      .send({ message: 'adding a test message' })
      .expect(201)
      .end((err: unknown, res: Response) => {
        if (err) return done(err)

        expect(res.body).toHaveProperty('id')
        done()
      })
  })
})

describe('DELETE - errors /api/v0/messages/:id', () => {
  it('with no consumer should return Bad Request MISSING_QUERY_PARAM', async (done) => {
    const messageId = queue.add('some message')

    request(server)
      .delete(`/api/v0/messages/${messageId}`)
      .expect(400)
      .end((err: unknown, res: Response) => {
        if (err) return done(err)

        expect(res.body.error).toBe('MISSING_QUERY_PARAM')
        done()
      })
  })

  it('with consumer but no valid message id should return Not Found', async (done) => {
    request(server)
      .delete(`/api/v0/messages/invalid-uuid?consId=some-consumer-id`)
      .expect(404)
      .end((err: unknown) => {
        if (err) return done(err)

        done()
      })
  })

  it('with consumer but and valid message id but previously pulled by other consumer should return Not Found', async (done) => {
    const messageId = queue.add('some message')
    queue.pull('some-other-consumer-id')

    request(server)
      .delete(`/api/v0/messages/${messageId}?consId=some-consumer-id`)
      .expect(404)
      .end((err: unknown) => {
        if (err) return done(err)

        done()
      })
  })
})

describe('DELETE - success /api/v0/messages/:id', () => {
  it('with consumer but and valid message id and previously pulled by same consumer should return 200', async (done) => {
    const messageId = queue.add('some message')
    const consumerId = 'some-consumer-id'
    queue.pull(consumerId)

    request(server)
      .delete(`/api/v0/messages/${messageId}?consId=${consumerId}`)
      .expect(200)
      .end((err: unknown) => {
        if (err) return done(err)

        done()
      })
  })
})
