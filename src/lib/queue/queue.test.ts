import config from 'dos-config'
import Queue, { Message } from './queue'

jest.useFakeTimers()

let q: Queue<string> | undefined

beforeEach(() => {
  q = new Queue<string>()
})

it('When pulling empty queue, I get empty array of messages.', () => {
  expect(q.pull('consumer-one')).toStrictEqual([])
})

// Whenever a producer writes to WonderQ, a message ID is generated and returned as confirmation.
it('Writing a new message in queue returns the stored message id.', () => {
  const messageId = q.add('test msg')
  const messages = q.pull('consumer-one')

  expect(messages).toEqual(expect.arrayContaining([{ id: messageId, data: expect.any(String) }]))
})

// Whenever a consumer polls WonderQ for new messages, it can get those messages.
it('When pulling queue with previously stored messages, I get those same messages.', () => {
  q.add('test msg one')
  q.add('test msg two')

  const messages = q.pull('consumer-one')

  expect(messages).toHaveLength(2)
  const expectedContent: Message<string>[] = [
    { id: expect.any(String), data: 'test msg one' },
    { id: expect.any(String), data: 'test msg two' }
  ]

  expect(messages).toEqual(expect.arrayContaining(expectedContent))
})

// These messages should NOT be available for processing by any other consumer that may be concurrently accessing WonderQ.
it('When pulling queue from previously pulled queue messages, already pulled messages should not be available right after.', () => {
  q.add('test msg one')
  q.add('test msg two')
  const messagesForOne = q.pull('consumer-one')

  q.add('test msg three')
  const messagesForTwo = q.pull('consumer-two')

  expect(messagesForOne).toHaveLength(2)
  const expectedContentForOne: Message<string>[] = [
    { id: expect.any(String), data: 'test msg one' },
    { id: expect.any(String), data: 'test msg two' }
  ]
  expect(messagesForOne).toEqual(expect.arrayContaining(expectedContentForOne))

  expect(messagesForTwo).toHaveLength(1)
  const expectedContentForTwo: Message<string>[] = [
    { id: expect.any(String), data: 'test msg three' }
  ]
  expect(messagesForTwo).toEqual(expect.arrayContaining(expectedContentForTwo))
  expect(messagesForTwo).toEqual(expect.not.arrayContaining(expectedContentForOne))
})

// If a message is received by a consumer but NOT marked as processed within a configurable amount of time,
// the message then becomes available to any consumer requesting again.
it('When pulling queue from previously pulled queue messages, already pulled messages should be available after configurable time.', () => {
  const _restoreNonProcessedMessagesFn = jest.spyOn(q, '_restoreNonProcessedMessages')
  expect(_restoreNonProcessedMessagesFn).not.toBeCalled()

  q.add('test msg one')
  q.add('test msg two')
  q.pull('consumer-one')

  jest.advanceTimersByTime(config.delay)

  expect(_restoreNonProcessedMessagesFn).toBeCalled()
  expect(_restoreNonProcessedMessagesFn).toHaveBeenCalledTimes(1)

  q.add('test msg three')

  const messages = q.pull('consumer-two')

  expect(messages).toHaveLength(3)
  const expectedContent: Message<string>[] = [
    { id: expect.any(String), data: 'test msg one' },
    { id: expect.any(String), data: 'test msg two' },
    { id: expect.any(String), data: 'test msg three' }
  ]
  expect(messages).toEqual(expect.arrayContaining(expectedContent))
})

// NOTE that, when a consumer gets a set of messages, it must notify WonderQ that it has processed each message (individually).
// This deletes that message from the WonderQ database.
it('After pulling queue, deleted pulled messages by pulling consumer should be permanently deleted.', () => {
  const _restoreNonProcessedMessagesFn = jest.spyOn(q, '_restoreNonProcessedMessages')
  expect(_restoreNonProcessedMessagesFn).not.toBeCalled()

  q.add('test msg one')
  const messageIdToBeDeleted = q.add('test msg two')
  q.add('test msg three')
  q.pull('consumer-one')

  q.deletePulled(messageIdToBeDeleted, 'consumer-one')

  jest.advanceTimersByTime(config.delay)

  expect(_restoreNonProcessedMessagesFn).toBeCalled()
  expect(_restoreNonProcessedMessagesFn).toHaveBeenCalledTimes(1)

  const messages = q.pull('consumer-one')

  expect(messages).toHaveLength(2)
  const expectedContent: Message<string>[] = [
    { id: expect.any(String), data: 'test msg one' },
    { id: expect.any(String), data: 'test msg three' }
  ]
  const notExpectedContent: Message<string>[] = [{ id: expect.any(String), data: 'test msg two' }]
  expect(messages).toEqual(expect.arrayContaining(expectedContent))
  expect(messages).toEqual(expect.not.arrayContaining(notExpectedContent))
})

it('After pulling queue, attempted pulled messages to be deleted by not pulling consumer throws error and message is restored.', () => {
  const _restoreNonProcessedMessagesFn = jest.spyOn(q, '_restoreNonProcessedMessages')
  expect(_restoreNonProcessedMessagesFn).not.toBeCalled()

  const messageId = q.add('test msg')
  q.pull('consumer-one')

  try {
    q.deletePulled(messageId, 'another-consumer-id')
  } catch (err) {
    expect(err.toString()).toBe('Error: NOT_FOUND')
  }

  jest.advanceTimersByTime(config.delay)

  expect(_restoreNonProcessedMessagesFn).toBeCalled()
  expect(_restoreNonProcessedMessagesFn).toHaveBeenCalledTimes(1)

  const messages = q.pull('consumer-one')

  const expectedContent: Message<string>[] = [{ id: expect.any(String), data: 'test msg' }]
  expect(messages).toEqual(expect.arrayContaining(expectedContent))
})
