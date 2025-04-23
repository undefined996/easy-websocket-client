# Easy-Websocket-Client

**[English document](https://github.com/JsonLee12138/easy-websocket-client/blob/main/README.en.md)**

## 介绍

`Easy-Websocket-Client` 是一个用于管理 WebSocket 连接的库，提供了自动重连、心跳消息和事件处理等功能。

## 安装

```bash
# 使用 npm
npm install easy-websocket-client

# 使用 yarn
yarn add easy-websocket-client

# 使用 pnpm
pnpm add easy-websocket-client
```

## 基础使用

### 创建 WebSocket 连接

```typescript
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

// 开始连接
client.connect();
```

## 单例模式的使用

在使用 `easy-websocket-client` 进行二次封装时，可以使用单例模式来确保每个页面使用相同的 WebSocket 连接，避免重复创建连接的问题。
注: 使用单例可以在所有页面或生命周期进行实例化, 可以不需要在监听中处理过多重连或刷新页面后重新连接问题, 会自动处理。

### 使用装饰器实现单例

```typescript
import { singleton } from 'easy-websocket-client';

// 你需要的获取消息的类型
interface Message{}

@singleton
class MyWebSocketClient extends WebSocketClient<Message> {
  // 自定义功能
  constructor() {
    // url 处理
    const protocol = window.location.protocol === "https:" ? "wss" : "ws";
    const host = window.location.host;
    // 处理 url 的 protocol 和 host
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
        // 你的接收到的消息处理(建议使用发布订阅模式)
      },
      onOpen(e) {
        // 你的连接成功处理(建议使用发布订阅模式)
      },
      onClose(e) {
        // 你的连接关闭处理(建议使用发布订阅模式)
      },
      onError(e) {
        // 你的连接错误处理(建议使用发布订阅模式)
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
```

### 使用高阶函数实现单例（不支持装饰器的情况下）

```typescript
import { singleton } from 'easy-websocket-client';

const SingletonWebSocketClient = singleton(WebSocketClient);

const clientInstance = new SingletonWebSocketClient('wss://example.com/socket');
```

## 📝 贡献指南
欢迎提交`issue`或`pull request`，共同完善`Hook-Fetch`。

## 📄 许可证

MIT

## 联系我们

- [Discord](https://discord.gg/Ah55KD5d)
