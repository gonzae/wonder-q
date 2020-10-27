import config from 'dos-config'
import { v4 } from 'uuid'

export interface Message<T> {
  id: string
  data: T
}

export default class WonderQ<T> {
  _pulled: Record<string, string>
  _available: Message<T>[]

  constructor() {
    this._pulled = {}
    this._available = []
  }

  add(data: T): string {
    const id = v4()
    const message: Message<T> = {
      id,
      data
    }

    this._available.push(message)
    return id
  }

  pull(consumer: string): Message<T>[] {
    const res = [...this._available]
    this._available = []

    res.forEach((m: Message<T>) => {
      this._pulled[m.id] = consumer
    })

    setTimeout(() => {
      this._restoreNonProcessedMessages(res)
    }, config.delay)

    return res
  }

  deletePulled(id: string, consumer: string): void {
    if (!this._pulled[id] || this._pulled[id] != consumer) throw Error('NOT_FOUND')

    delete this._pulled[id]
  }

  _restoreNonProcessedMessages(msgs: Message<T>[]): void {
    msgs.forEach((m: Message<T>) => {
      if (!this._pulled[m.id]) return
      delete this._pulled[m.id]
      this._available.push(m)
    })
  }
}
