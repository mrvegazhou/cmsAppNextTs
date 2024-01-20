import * as Y from 'yjs' // eslint-disable-line
import * as bc from 'lib0/broadcastchannel'
import * as time from 'lib0/time'
import * as encoding from 'lib0/encoding'
import * as decoding from 'lib0/decoding'
import * as syncProtocol from 'y-protocols/sync'
import * as authProtocol from 'y-protocols/auth'
import * as awarenessProtocol from 'y-protocols/awareness'
import { Observable } from 'lib0/observable'
import * as math from 'lib0/math'
import * as url from 'lib0/url'

export const messageSync = 0
export const messageQueryAwareness = 3
export const messageAwareness = 1
export const messageAuth = 2

/**
 *                       encoder,          decoder,          provider,          emitSynced, messageType
 * @type {Array<function(encoding.Encoder, decoding.Decoder, WebsocketProvider, boolean,    number):void>}
 */
const messageHandlers: Function[] = []

messageHandlers[messageSync] = (
    encoder: encoding.Encoder,
    decoder: decoding.Decoder,
    provider: WebsocketProvider,
    emitSynced: boolean,
    _messageType: number
  ) => {
    encoding.writeVarUint(encoder, messageSync)
    const syncMessageType = syncProtocol.readSyncMessage(
      decoder,
      encoder,
      provider.doc,
      provider
    )
    if (
      emitSynced && syncMessageType === syncProtocol.messageYjsSyncStep2 &&
      !provider.synced
    ) {
      provider.synced = true
    }
}

messageHandlers[messageQueryAwareness] = (
    encoder: encoding.Encoder,
    _decoder: decoding.Decoder,
    provider: WebsocketProvider,
    _emitSynced: boolean,
    _messageType: number
  ) => {
    encoding.writeVarUint(encoder, messageAwareness)
    encoding.writeVarUint8Array(
      encoder,
      awarenessProtocol.encodeAwarenessUpdate(
        provider.awareness,
        Array.from(provider.awareness.getStates().keys())
      )
    )
}

messageHandlers[messageAwareness] = (
    _encoder: encoding.Encoder,
    decoder: decoding.Decoder,
    provider: WebsocketProvider,
    _emitSynced: boolean,
    _messageType: number
  ) => {
    awarenessProtocol.applyAwarenessUpdate(
      provider.awareness,
      decoding.readVarUint8Array(decoder),
      provider
    )
}

messageHandlers[messageAuth] = (
    _encoder: encoding.Encoder,
    decoder: decoding.Decoder,
    provider: WebsocketProvider,
    _emitSynced: boolean,
    _messageType: number
  ) => {
    authProtocol.readAuthMessage(
      decoder,
      provider.doc,
      (_ydoc, reason) => permissionDeniedHandler(provider, reason)
    )
}

// @todo - this should depend on awareness.outdatedTime
const messageReconnectTimeout = 30000

/**
 * @param {WebsocketProvider} provider
 * @param {string} reason
 */
const permissionDeniedHandler = (provider: WebsocketProvider, reason: string) =>
  console.warn(`Permission denied to access ${provider.url}.\n${reason}`)


/**
 * @param {WebsocketProvider} provider
 * @param {Uint8Array} buf
 * @param {boolean} emitSynced
 * @return {encoding.Encoder}
 */
const readMessage = (provider: WebsocketProvider, buf: Uint8Array, emitSynced: boolean) => {
    const decoder = decoding.createDecoder(buf)
    const encoder = encoding.createEncoder()
    const messageType = decoding.readVarUint(decoder)
    const messageHandler = provider.messageHandlers[messageType]
    if (/** @type {any} */ (messageHandler)) {
      messageHandler(encoder, decoder, provider, emitSynced, messageType)
    } else {
      console.error('Unable to compute message')
    }
    return encoder
}


/**
 * @param {WebsocketProvider} provider
 */
const setupWS = (provider: WebsocketProvider) => {
    if (provider.shouldConnect && provider.ws === null) {
      const websocket = new provider._WS(provider.url)
      websocket.binaryType = 'arraybuffer'
      provider.ws = websocket
      provider.wsconnecting = true
      provider.wsconnected = false
      provider.synced = false
      provider.emit('status', [{
        status: 'connecting'
      }])
  
      websocket.onmessage = (event) => {
        provider.wsLastMessageReceived = time.getUnixTime()
        const encoder = readMessage(provider, new Uint8Array(event.data), true)
        if (encoding.length(encoder) > 1) {
          websocket.send(encoding.toUint8Array(encoder))
        }
      }
      websocket.onerror = (event) => {
        provider.emit('connection-error', [event, provider])
      }
      websocket.onclose = (event) => {
        provider.emit('connection-close', [event, provider])
        provider.ws = null
        provider.wsconnecting = false
        if (provider.wsconnected) {
          provider.wsconnected = false
          provider.synced = false
          // update awareness (all users except local left)
          awarenessProtocol.removeAwarenessStates(
            provider.awareness,
            Array.from(provider.awareness.getStates().keys()).filter((client) =>
              client !== provider.doc.clientID
            ),
            provider
          )
          provider.emit('status', [{
            status: 'disconnected'
          }])
        } else {
          provider.wsUnsuccessfulReconnects++
        }
        // Start with no reconnect timeout and increase timeout by
        // using exponential backoff starting with 100ms
        setTimeout(
          setupWS,
          math.min(
            math.pow(2, provider.wsUnsuccessfulReconnects) * 100,
            provider.maxBackoffTime
          ),
          provider
        )
      }
      websocket.onopen = () => {
        provider.wsLastMessageReceived = time.getUnixTime()
        provider.wsconnecting = false
        provider.wsconnected = true
        provider.wsUnsuccessfulReconnects = 0
        provider.emit('status', [{
          status: 'connected'
        }])
        // always send sync step 1 when connected
        const encoder = encoding.createEncoder()
        encoding.writeVarUint(encoder, messageSync)
        syncProtocol.writeSyncStep1(encoder, provider.doc)
        websocket.send(encoding.toUint8Array(encoder))
        // broadcast local awareness state
        if (provider.awareness.getLocalState() !== null) {
          const encoderAwarenessState = encoding.createEncoder()
          encoding.writeVarUint(encoderAwarenessState, messageAwareness)
          encoding.writeVarUint8Array(
            encoderAwarenessState,
            awarenessProtocol.encodeAwarenessUpdate(provider.awareness, [
              provider.doc.clientID
            ])
          )
          websocket.send(encoding.toUint8Array(encoderAwarenessState))
        }
      }
  
      provider.emit('status', [{
        status: 'connecting'
      }])
    }
}

/**
 * @param {WebsocketProvider} provider
 * @param {ArrayBuffer} buf
 */
const broadcastMessage = (provider: WebsocketProvider, buf: ArrayBuffer) => {
    if (provider.wsconnected) {
        // @ts-ignore
        /** @type {WebSocket} */ (provider.ws).send(buf)
    }
    if (provider.bcconnected) {
      bc.publish(provider.bcChannel, buf, provider)
    }
}

interface WebsocketProviderProps {
  auth: string;
  connect: boolean;
  doc: Y.Doc;
  params: Record<string,string>;
  awareness: awarenessProtocol.Awareness;
  WebSocketPolyfill: typeof WebSocket;
  resyncInterval: number;
  maxBackoffTime: number;
  disableBc: boolean;
};
/**
 * Websocket Provider for Yjs. Creates a websocket connection to sync the shared document.
 * The document name is attached to the provided url. I.e. the following example
 * creates a websocket connection to http://localhost:1234/my-document-name
 *
 * @example
 *   import * as Y from 'yjs'
 *   import { WebsocketProvider } from 'y-websocket'
 *   const doc = new Y.Doc()
 *   const provider = new WebsocketProvider('http://localhost:1234', 'my-document-name', doc)
 *
 * @extends {Observable<string>}
 */
export class WebsocketProvider extends Observable<string> {
  maxBackoffTime: number;
  auth: string;
  bcChannel: string;
  url: string;
  roomname: string;
  doc: Y.Doc;
  _WS: typeof WebSocket;
  awareness: awarenessProtocol.Awareness;
  wsconnected: boolean;
  wsconnecting: boolean;
  bcconnected: boolean;
  disableBc: boolean;
  wsUnsuccessfulReconnects: number;
  messageHandlers: Function[];
  _synced: boolean;
  ws: WebSocket | null;
  wsLastMessageReceived: number;
  shouldConnect: boolean;
  _resyncInterval: any;
  _bcSubscriber: any;
  _updateHandler: any;
  _awarenessUpdateHandler: any;
  _unloadHandler: any;
  _checkInterval: any;


  /**
   * @param {string} serverUrl
   * @param {string} roomname
   * @param {Y.Doc} doc
   * @param {object} [opts]
   * @param {boolean} [opts.connect]
   * @param {awarenessProtocol.Awareness} [opts.awareness]
   * @param {Object<string,string>} [opts.params]
   * @param {string} [opts.auth]
   * @param {typeof WebSocket} [opts.WebSocketPolyfill] Optionall provide a WebSocket polyfill
   * @param {number} [opts.resyncInterval] Request server state every `resyncInterval` milliseconds
   * @param {number} [opts.maxBackoffTime] Maximum amount of time to wait before trying to reconnect (we try to reconnect using exponential backoff)
   * @param {boolean} [opts.disableBc] Disable cross-tab BroadcastChannel communication
   */
  constructor (serverUrl: string, roomname: string, doc: Y.Doc, {
    connect = true,
    awareness = new awarenessProtocol.Awareness(doc),
    params = {},
    auth = "",
    WebSocketPolyfill = WebSocket,
    resyncInterval = -1,
    maxBackoffTime = 2500,
    disableBc = false
  }: Partial<WebsocketProviderProps>) {
    super()
    // ensure that url is always ends with /
    while (serverUrl[serverUrl.length - 1] === '/') {
      serverUrl = serverUrl.slice(0, serverUrl.length - 1)
    }
    const encodedParams = url.encodeQueryParams(params)
    this.maxBackoffTime = maxBackoffTime
    this.auth = auth
    this.bcChannel = serverUrl + '/' + roomname
    this.url = serverUrl + '/' + roomname +
      (encodedParams.length === 0 ? '' : '?' + encodedParams)
    this.roomname = roomname
    this.doc = doc
    this._WS = WebSocketPolyfill
    this.awareness = awareness
    this.wsconnected = false
    this.wsconnecting = false
    this.bcconnected = false
    this.disableBc = disableBc
    this.wsUnsuccessfulReconnects = 0
    this.messageHandlers = messageHandlers.slice()
    /**
     * @type {boolean}
     */
    this._synced = false
    /**
     * @type {WebSocket?}
     */
    this.ws = null
    this.wsLastMessageReceived = 0
    /**
     * Whether to connect to other peers or not
     * @type {boolean}
     */
    this.shouldConnect = connect

    /**
     * @type {number}
     */
    this._resyncInterval = 0
    if (resyncInterval > 0) {
      this._resyncInterval = /** @type {any} */ (setInterval(() => {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
          // resend sync step 1
          const encoder = encoding.createEncoder()
          encoding.writeVarUint(encoder, messageSync)
          syncProtocol.writeSyncStep1(encoder, doc)
          this.ws.send(encoding.toUint8Array(encoder))
        }
      }, resyncInterval))
    }

    /**
     * @param {ArrayBuffer} data
     * @param {any} origin
     */
    this._bcSubscriber = (data: ArrayBuffer, origin: any) => {
      if (origin !== this) {
        const encoder = readMessage(this, new Uint8Array(data), false)
        if (encoding.length(encoder) > 1) {
          bc.publish(this.bcChannel, encoding.toUint8Array(encoder), this)
        }
      }
    }
    /**
     * Listens to Yjs updates and sends them to remote peers (ws and broadcastchannel)
     * @param {Uint8Array} update
     * @param {any} origin
     */
    this._updateHandler = (update: Uint8Array, origin: any) => {
      if (origin !== this) {
        const encoder = encoding.createEncoder()
        encoding.writeVarUint(encoder, messageSync)
        syncProtocol.writeUpdate(encoder, update)
        broadcastMessage(this, encoding.toUint8Array(encoder))
      }
    }
    this.doc.on('update', this._updateHandler)
    /**
     * @param {any} changed
     * @param {any} _origin
     */
    this._awarenessUpdateHandler = ({ added, updated, removed }: any, _origin: any) => {
      const changedClients = added.concat(updated).concat(removed)
      const encoder = encoding.createEncoder()
      encoding.writeVarUint(encoder, messageAwareness)
      encoding.writeVarUint8Array(
        encoder,
        awarenessProtocol.encodeAwarenessUpdate(awareness, changedClients)
      )
      broadcastMessage(this, encoding.toUint8Array(encoder))
    }
    this._unloadHandler = () => {
      awarenessProtocol.removeAwarenessStates(
        this.awareness,
        [doc.clientID],
        'window unload'
      )
    }
    if (typeof window !== 'undefined') {
      window.addEventListener('unload', this._unloadHandler)
    } else if (typeof process !== 'undefined') {
      process.on('exit', this._unloadHandler)
    }
    awareness.on('update', this._awarenessUpdateHandler)
    this._checkInterval = /** @type {any} */ (setInterval(() => {
      if (
        this.wsconnected &&
        messageReconnectTimeout <
          time.getUnixTime() - this.wsLastMessageReceived
      ) {
        // no message received in a long time - not even your own awareness
        // updates (which are updated every 15 seconds)
        // @ts-ignore
        /** @type {WebSocket} */ (this.ws).close()
      }
    }, messageReconnectTimeout / 10))
    if (connect) {
      this.connect()
    }

    /** Authenticate with the websocket provider. */
    const onConnecting = () => {
      if (!this.ws) return
      const _onmessage = this.ws.onmessage
      const _onopen = this.ws.onopen

      this.ws.onmessage = event => {
        if (!this.ws) return

        const { data } = event

        if (typeof data === 'string') {
          switch (data) {
            case 'authenticated':
              if (_onopen) {
                _onopen.call(this.ws, event)
              }
              break
            case 'access-denied':
              console.error('access denied')
              this.disconnect()
              break
            default:
              console.error('unknown message', data)
              break
          }
        } else {
          if (!_onmessage) return
          _onmessage.call(this.ws, event)
        }
      }
      this.ws.onopen = event => {
        if (!this.ws) return
        // authenticate immediately when the connection is open
        this.ws.send(JSON.stringify({ type: 'auth', auth }))
      }
    }
    onConnecting()

    this.on('status', ({ status }: any) => {
      if (status === 'connecting') {
        onConnecting()
      }
    })
  }

  /**
   * @type {boolean}
   */
  get synced () {
    return this._synced
  }

  set synced (state) {
    if (this._synced !== state) {
      this._synced = state
      this.emit('synced', [state])
      this.emit('sync', [state])
    }
  }

  send ({ type, ...props }: any) {
    if (!this.ws) return
    if (props.auth) {
      console.error({ type, ...props })
      throw new Error('auth field is reserved')
    }
    // send message to server
    this.ws.send(JSON.stringify({ type, ...props, auth: this.auth }))
  }

  destroy () {
    if (this._resyncInterval !== 0) {
      clearInterval(this._resyncInterval)
    }
    clearInterval(this._checkInterval)
    this.disconnect()
    if (typeof window !== 'undefined') {
      window.removeEventListener('unload', this._unloadHandler)
    } else if (typeof process !== 'undefined') {
      process.off('exit', this._unloadHandler)
    }
    this.awareness.off('update', this._awarenessUpdateHandler)
    this.doc.off('update', this._updateHandler)
    super.destroy()
  }

  connectBc () {
    if (this.disableBc) {
      return
    }
    if (!this.bcconnected) {
      bc.subscribe(this.bcChannel, this._bcSubscriber)
      this.bcconnected = true
    }
    // send sync step1 to bc
    // write sync step 1
    const encoderSync = encoding.createEncoder()
    encoding.writeVarUint(encoderSync, messageSync)
    syncProtocol.writeSyncStep1(encoderSync, this.doc)
    bc.publish(this.bcChannel, encoding.toUint8Array(encoderSync), this)
    // broadcast local state
    const encoderState = encoding.createEncoder()
    encoding.writeVarUint(encoderState, messageSync)
    syncProtocol.writeSyncStep2(encoderState, this.doc)
    bc.publish(this.bcChannel, encoding.toUint8Array(encoderState), this)
    // write queryAwareness
    const encoderAwarenessQuery = encoding.createEncoder()
    encoding.writeVarUint(encoderAwarenessQuery, messageQueryAwareness)
    bc.publish(
      this.bcChannel,
      encoding.toUint8Array(encoderAwarenessQuery),
      this
    )
    // broadcast local awareness state
    const encoderAwarenessState = encoding.createEncoder()
    encoding.writeVarUint(encoderAwarenessState, messageAwareness)
    encoding.writeVarUint8Array(
      encoderAwarenessState,
      awarenessProtocol.encodeAwarenessUpdate(this.awareness, [
        this.doc.clientID
      ])
    )
    bc.publish(
      this.bcChannel,
      encoding.toUint8Array(encoderAwarenessState),
      this
    )
  }

  disconnectBc () {
    // broadcast message with local awareness state set to null (indicating disconnect)
    const encoder = encoding.createEncoder()
    encoding.writeVarUint(encoder, messageAwareness)
    encoding.writeVarUint8Array(
      encoder,
      awarenessProtocol.encodeAwarenessUpdate(this.awareness, [
        this.doc.clientID
      ], new Map())
    )
    broadcastMessage(this, encoding.toUint8Array(encoder))
    if (this.bcconnected) {
      bc.unsubscribe(this.bcChannel, this._bcSubscriber)
      this.bcconnected = false
    }
  }

  disconnect () {
    this.shouldConnect = false
    this.disconnectBc()
    if (this.ws !== null) {
      this.ws.close()
    }
  }

  connect () {
    this.shouldConnect = true
    if (!this.wsconnected && this.ws === null) {
      setupWS(this)
      this.connectBc()
    }
  }
}