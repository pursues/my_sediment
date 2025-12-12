/* eslint-disable n/prefer-global/buffer */
type Bytes = string | ArrayBuffer | Uint8Array | null | undefined | Buffer

class StreamError extends Error {}

interface ServerSentEvent {
  event: string | null
  data: string
  raw: string[]
}

class Stream<Item> implements AsyncIterable<Item> {
  controller: AbortController

  constructor(
    private iterator: () => AsyncIterator<Item>,
    controller: AbortController,
  ) {
    this.controller = controller
  }

  static fromSSEResponse<Item>(
    readableStream: ReadableStream,
    controller: AbortController,
  ) {
    let consumed = false
    const decoder = new SSEDecoder()

    async function* iterMessages(): AsyncGenerator<
      ServerSentEvent,
      void,
      unknown
    > {
      if (!readableStream) {
        controller.abort()
        throw new StreamError(
          'Attempted to iterate over a response with no body',
        )
      }

      const lineDecoder = new LineDecoder()

      const iter = readableStreamAsyncIterable<Bytes>(readableStream)
      const iter_ = iterSSEChunks(iter)
      for await (const chunk of iter_) {
        for (const line of lineDecoder.decode(chunk)) {
          const sse = decoder.decode(line)
          if (sse)
            yield sse
        }
      }

      for (const line of lineDecoder.flush()) {
        const sse = decoder.decode(line)
        if (sse)
          yield sse
      }
    }

    async function* iterator(): AsyncIterator<Item, any, undefined> {
      if (consumed) {
        throw new Error(
          'Cannot iterate over a consumed stream, use `.tee()` to split the stream.',
        )
      }
      consumed = true
      let done = false
      try {
        for await (const sse of iterMessages()) {
          if (done)
            continue

          if (sse.data.startsWith('[DONE]')) {
            done = true
            continue
          }

          if (sse.event === null) {
            let data

            try {
              sse.data.replace(/\uFFFD/g, '')
              data = JSON.parse(sse.data)
            }
            catch (e) {
              console.error('Could not parse message into JSON:', sse.data)
              console.error('From chunk:', sse.raw)
              throw e
            }

            if (data && data.error)
              throw new StreamError(`${data.error}`)

            yield data
          }
        }
        done = true
      }
      catch (e) {
        // If the user calls `stream.controller.abort()`, we should exit without throwing.
        if (e instanceof Error && e.name === 'AbortError')
          return
        throw e
      }
      finally {
        // If the user `break`s, abort the ongoing request.
        if (!done)
          controller.abort()
      }
    }

    return new Stream(iterator, controller)
  }

  [Symbol.asyncIterator](): AsyncIterator<Item> {
    return this.iterator()
  }
}

/**
 * Given an async iterable iterator, iterates over it and yields full
 * SSE chunks, i.e. yields when a double new-line is encountered.
 */
async function* iterSSEChunks(iterator: AsyncIterableIterator<Bytes>): AsyncGenerator<Uint8Array> {
  let data = new Uint8Array()

  for await (const chunk of iterator) {
    if (chunk == null)
      continue

    const binaryChunk
      = chunk instanceof ArrayBuffer
        ? new Uint8Array(chunk)
        : typeof chunk === 'string'
          ? new TextEncoder().encode(chunk)
          : chunk

    const newData = new Uint8Array(data.length + binaryChunk.length)
    newData.set(data)
    newData.set(binaryChunk, data.length)
    data = newData

    let patternIndex
    // eslint-disable-next-line no-cond-assign
    while ((patternIndex = findDoubleNewlineIndex(data)) !== -1) {
      yield data.slice(0, patternIndex)
      data = data.slice(patternIndex)
    }
  }
  if (data.length > 0)
    yield data
}

function findDoubleNewlineIndex(buffer: Uint8Array): number {
  // This function searches the buffer for the end patterns (\r\r, \n\n, \r\n\r\n)
  // and returns the index right after the first occurrence of any pattern,
  // or -1 if none of the patterns are found.
  // eslint-disable-next-line unicorn/number-literal-case
  const newline = 0x0a // \n
  // eslint-disable-next-line unicorn/number-literal-case
  const carriage = 0x0d // \r

  for (let i = 0; i < buffer.length - 1; i++) {
    if (buffer[i] === newline && buffer[i + 1] === newline) {
      // \n\n
      return i + 2
    }

    if (buffer[i] === carriage && buffer[i + 1] === carriage) {
      // \r\r
      return i + 2
    }
    if (
      buffer[i] === carriage
      && buffer[i + 1] === newline
      && i + 3 < buffer.length
      && buffer[i + 2] === carriage
      && buffer[i + 3] === newline
    ) {
      // \r\n\r\n
      return i + 4
    }
  }

  return -1
}

function readableStreamAsyncIterable<T>(stream: any): AsyncIterableIterator<T> {
  if (stream[Symbol.asyncIterator])
    return stream

  const reader = stream.getReader()
  return {
    async next() {
      try {
        const result = await reader.read()
        if (result?.done)
          reader.releaseLock() // release lock when stream becomes closed
        return result
      }
      catch (e) {
        reader.releaseLock() // release lock when stream becomes errored
        throw e
      }
    },
    async return() {
      const cancelPromise = reader.cancel()
      reader.releaseLock()
      await cancelPromise
      return { done: true, value: undefined }
    },
    [Symbol.asyncIterator]() {
      return this
    },
  }
}

class LineDecoder {
  // prettier-ignore
  static NEWLINE_CHARS = new Set(['\n', '\r', '\x0B', '\x0C', '\x1C', '\x1D', '\x1E', '\x85', '\u2028', '\u2029'])
  // eslint-disable-next-line no-control-regex
  static NEWLINE_REGEXP = /\r\n|[\n\r\v\f\x1C\x1D\x1E\x85\u2028\u2029]/g

  buffer: string[]
  trailingCR: boolean
  textDecoder: any // TextDecoder found in browsers; not typed to avoid pulling in either "dom" or "node" types.

  constructor() {
    this.buffer = []
    this.trailingCR = false
  }

  decode(chunk: Bytes): string[] {
    let text = this.decodeText(chunk)

    if (this.trailingCR) {
      text = `\r${text}`
      this.trailingCR = false
    }
    if (text.endsWith('\r')) {
      this.trailingCR = true
      text = text.slice(0, -1)
    }

    if (!text)
      return []

    const trailingNewline = LineDecoder.NEWLINE_CHARS.has(
      text[text.length - 1] || '',
    )
    let lines = text.split(LineDecoder.NEWLINE_REGEXP)

    if (lines.length === 1 && !trailingNewline) {
      this.buffer.push(lines[0]!)
      return []
    }

    if (this.buffer.length > 0) {
      lines = [this.buffer.join('') + lines[0], ...lines.slice(1)]
      this.buffer = []
    }

    if (!trailingNewline)
      this.buffer = [lines.pop() || '']

    return lines
  }

  decodeText(bytes: Bytes): string {
    if (bytes == null)
      return ''
    if (typeof bytes === 'string')
      return bytes

    // Node:
    if (typeof Buffer !== 'undefined') {
      if (bytes instanceof Buffer)
        return bytes.toString()

      if (bytes instanceof Uint8Array)
        return Buffer.from(bytes).toString()

      throw new StreamError(
        `Unexpected: received non-Uint8Array (${bytes.constructor.name}) stream chunk in an environment with a global "Buffer" defined, which this library assumes to be Node. Please report this error.`,
      )
    }

    // Browser
    if (typeof TextDecoder !== 'undefined') {
      if (bytes instanceof Uint8Array || bytes instanceof ArrayBuffer) {
        this.textDecoder ??= new TextDecoder('utf8')
        return this.textDecoder.decode(bytes)
      }

      throw new StreamError(
        `Unexpected: received non-Uint8Array/ArrayBuffer (${
          (bytes as any).constructor.name
        }) in a web platform. Please report this error.`,
      )
    }

    throw new StreamError(
      'Unexpected: neither Buffer nor TextDecoder are available as globals. Please report this error.',
    )
  }

  flush(): string[] {
    if (!this.buffer.length && !this.trailingCR)
      return []

    const lines = [this.buffer.join('')]
    this.buffer = []
    this.trailingCR = false
    return lines
  }
}

class SSEDecoder {
  private data: string[]
  private event: string | null
  private chunks: string[]

  constructor() {
    this.event = null
    this.data = []
    this.chunks = []
  }

  decode(line: string) {
    if (line.endsWith('\r'))
      line = line.substring(0, line.length - 1)

    if (!line) {
      // empty line and we didn't previously encounter any messages
      if (!this.event && !this.data.length)
        return null

      const sse: ServerSentEvent = {
        event: this.event,
        data: this.data.join('\n'),
        raw: this.chunks,
      }

      this.event = null
      this.data = []
      this.chunks = []

      return sse
    }

    this.chunks.push(line)

    if (line.startsWith(':'))
      return null

    let [fieldname, _, value] = partition(line, ':')

    if (value.startsWith(' '))
      value = value.substring(1)

    if (fieldname === 'event')
      this.event = value
    else if (fieldname === 'data')
      this.data.push(value)

    return null
  }
}

function partition(str: string, delimiter: string): [string, string, string] {
  const index = str.indexOf(delimiter)
  if (index !== -1) {
    return [
      str.substring(0, index),
      delimiter,
      str.substring(index + delimiter.length),
    ]
  }

  return [str, '', '']
}

export {
  Stream,
}
