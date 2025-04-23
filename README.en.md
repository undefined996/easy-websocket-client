# Easy-Websocket-Client

**[中文文档](https://github.com/JsonLee12138/easy-websocket-client/blob/main/README.md)**

## Introduction

`Easy-Websocket-Client` is a library for managing WebSocket connections, providing features such as automatic reconnection, heartbeat messages, and event handling.

## Installation

````markdown
# Using npm
npm install easy-websocket-client

# Using yarn
yarn add easy-websocket-client

# Using pnpm
pnpm add easy-websocket-client
````

## Basic Usage

### Create a WebSocket Connection

````typescript
import WebSocketClient from 'easy-websocket-client';

const client = new WebSocketClient('wss://example.com/socket', {
  showLog: true,
  reconnectInterval: 2000,
  heartbeatInterval: 10000,
  heartbeatMessage: 'ping',
  maxReconnectAttempts: 5,
  onOpen: () => console.log('Connection opened'),
  onClose: (e) => console.log('Connection closed', e),
  onMessage: (message) => console.log('Received message', message),
  onError: (error) => console.error('Error occurred', error),
});

// Start the connection
client.connect();
````

## Singleton Pattern Usage

When doing a secondary encapsulation of `easy-websocket-client`, you can use the singleton pattern to ensure that the same WebSocket connection is used across different pages, avoiding duplicate connections.
Note: Using a singleton allows you to instantiate in all pages or lifecycle hooks, so you don’t need to handle too many reconnection or reconnection-after-refresh scenarios—these will be handled automatically.

### Singleton via Decorator

````typescript
import { singleton } from 'easy-websocket-client';

// Define the type of message you want to receive
interface Message{}

@singleton
class MyWebSocketClient extends WebSocketClient<Message> {
  // Custom functionality
  constructor() {
    // Handle url
    const protocol = window.location.protocol === "https:" ? "wss" : "ws";
    const host = window.location.host;
    // Process protocol and host for the url
    const baseURL = import.meta.env.DEV
      ? "ws://" + import.meta.env.VITE_WS_HOST + ":" + import.meta.env.VITE_PORT + "/ws"
      : import.meta.env.VITE_API_URL.includes("ws") || import.meta.env.VITE_API_URL.includes("http")
        ? import.meta.env.VITE_API_URL
        : `${protocol}://${host}${import.meta.env.VITE_API_URL.includes("/") ? "" : "/"}${import.meta.env.VITE_API_URL}`;
    const deviceId = localStorage.getItem("deviceId");
    super('your url result', {
      heartbeatMessage: { type: SocketEmitterEvent.HEARTBEAT, textMsg: "ping" },
      heartbeatInterval: 10000,
      maxReconnectAttempts: 3,
      connectResend: true,
      onMessage(_d) {
        // Handle received message here (recommend using pub/sub pattern)
      },
      onOpen(e) {
        // Handle successful connection here (recommend using pub/sub pattern)
      },
      onClose(e) {
        // Handle connection close here (recommend using pub/sub pattern)
      },
      onError(e) {
        // Handle connection error here (recommend using pub/sub pattern)
      }
    });
    this.connect();
  }
  public close = () => {
    super.close();
    MyWebSocketClient.reset();
  };
}

const clientInstance = new MyWebSocketClient();
````

### Singleton via Higher-Order Function (when decorators are not supported)

````typescript
import { singleton } from 'easy-websocket-client';

const SingletonWebSocketClient = singleton(WebSocketClient);

const clientInstance = new SingletonWebSocketClient();
````

## 📝 Contribution Guide

You are welcome to submit `issues` or `pull requests` to help improve `Hook-Fetch` together.

## 📄 License

MIT

## Contact Us

- [Discord](https://discord.gg/Ah55KD5d)
