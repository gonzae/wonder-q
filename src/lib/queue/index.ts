import Queue, { Message } from './queue'

export type { Message, Queue }

let queue: Queue<string> | undefined

if (!queue) queue = new Queue<string>()

export default queue
