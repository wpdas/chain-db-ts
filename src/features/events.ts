import WebSocket from 'ws'
import { EventData } from './types'

type EventCallback = (data: any) => void

class Events {
  private socket: WebSocket
  private eventListeners: Map<string, EventCallback[]> = new Map()
  private connected: boolean = false

  constructor(url: string, auth: string) {
    this.socket = new WebSocket(url, {
      headers: {
        Authorization: `Basic ${auth}`,
      },
    })

    //
    this.socket.onopen = () => {
      this.connected = true
      console.log('ChainDB: WebSocket connection established')
    }

    this.socket.on('message', (data: WebSocket.Data) => {
      try {
        const parsedData = JSON.parse(data.toString()) as EventData

        if (parsedData.event_type && this.eventListeners.has(parsedData.event_type)) {
          const listeners = this.eventListeners.get(parsedData.event_type) || []
          listeners.forEach((callback) => callback(parsedData))
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error)
      }
    })

    this.socket.on('close', () => {
      this.connected = false
      console.log('ChainDB: WebSocket connection closed')
    })

    this.socket.on('error', (error) => {
      console.error('WebSocket error:', error)
    })
  }

  /**
   * Subscribe to an event
   * @param event Event name to subscribe to
   * @param callback Function to call when the event is received
   */
  subscribe(event: string, callback: EventCallback) {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, [])
    }

    const listeners = this.eventListeners.get(event) || []
    listeners.push(callback)
    this.eventListeners.set(event, listeners)
  }

  /**
   * Unsubscribe from an event
   * @param event Event name to unsubscribe from
   * @param callback Optional callback to remove. If not provided, all callbacks for the event will be removed.
   */
  unsubscribe(event: string, callback?: EventCallback) {
    if (!this.eventListeners.has(event)) {
      return
    }

    if (callback) {
      // Remove specific callback
      const listeners = this.eventListeners.get(event) || []
      const updatedListeners = listeners.filter((cb) => cb !== callback)
      this.eventListeners.set(event, updatedListeners)
    } else {
      // Remove all callbacks for this event
      this.eventListeners.delete(event)
    }
  }

  /**
   * Close the WebSocket connection
   */
  close() {
    this.socket.close()
  }

  /**
   * Check if the WebSocket connection is established
   */
  isConnected() {
    return this.connected
  }
}

export default Events
