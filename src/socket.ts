import { WebSocketReadyState } from "./enum";
import { WebSocketClientOptions } from "./types";

export class WebSocketClient<T = any> {
  static ReadyState: WebSocketReadyState;
  #showLog?: boolean;
  #reconnectTimes: number = 0;
  #reconnectInterval: number = 1000;
  #heartbeatInterval: number = 10000;
  #heartbeatMessage: string = "ping";
  #heartBeatTimer: ReturnType<typeof setTimeout> | null = null;
  #maxReconnectAttempts: number = 0;
  #url: string = "";
  #protocols: string | string[] = [];
  #sendQueue: T[] = [];
  #connectResend: boolean = false;
  #jsonAble: boolean;
  #_onOpen: WebSocketClientOptions<T>["onOpen"] = () => {
    if (this.#showLog) {
      console.log("websocket had opened");
    }
  };
  #_onClose: WebSocketClientOptions<T>["onClose"] = (e: unknown) => {
    if (this.#showLog) {
      console.error("websocket had closed:", e);
    }
  };
  #_onError: WebSocketClientOptions<T>["onError"] = (e: unknown) => {
    if (this.#showLog) {
      console.error("websocket error:", e);
    }
  };
  #_onMessage: WebSocketClientOptions<T>["onMessage"] = (e: any) => {
    if (this.#showLog) {
      console.log("received a message:", e);
    }
  };
  #instance: WebSocket | null = null;

  /**
   * Constructs a WebSocket instance with specified options.
   * 使用指定的选项构造一个 WebSocket 实例。
   *
   * @param {string} url - The WebSocket URL to connect to.
   * @param {string} url - 要连接的 WebSocket URL。
   *
   * @param {Object} [options] - Configuration options for the WebSocket.
   * @param {Object} [options] - WebSocket 的配置选项。
   *
   * @param {boolean} [options.showLog] - Whether to show logs.
   * @param {boolean} [options.showLog] - 是否显示日志。
   *
   * @param {number} [options.reconnectInterval] - Interval in milliseconds between reconnection attempts.
   * @param {number} [options.reconnectInterval] - 重连尝试之间的间隔时间（毫秒）。
   *
   * @param {number} [options.heartbeatInterval=10000] - Interval in milliseconds between heartbeat messages.
   * @param {number} [options.heartbeatInterval=10000] - 心跳消息之间的间隔时间（毫秒）。
   *
   * @param {string} [options.heartbeatMessage="ping"] - Message sent as a heartbeat to keep the connection alive.
   * @param {string} [options.heartbeatMessage="ping"] - 作为心跳发送的消息以保持连接。
   *
   * @param {number} [options.maxReconnectAttempts=0] - Maximum number of reconnection attempts. 0 means unlimited.
   * @param {number} [options.maxReconnectAttempts=0] - 最大重连尝试次数。0 表示无限次尝试。
   *
   * @param {number} [options.jsonAble=false] - Message should it be deserialized from json.
   * @param {number} [options.jsonAble=false] - message 是否做 json 反序列化处理。
   *
   * @param {function} [options.onClose] - Callback function to execute when the WebSocket connection is closed.
   * @param {function} [options.onClose] - WebSocket 连接关闭时执行的回调函数。
   *
   * @param {function} [options.onError] - Callback function to execute when an error occurs.
   * @param {function} [options.onError] - 发生错误时执行的回调函数。
   *
   * @param {function} [options.onMessage] - Callback function to execute when a message is received.
   * @param {function} [options.onMessage] - 接收到消息时执行的回调函数。
   *
   * @param {function} [options.onOpen] - Callback function to execute when the WebSocket connection is opened.
   * @param {function} [options.onOpen] - WebSocket 连接打开时执行的回调函数。
   *
   * @param {Array} [options.protocols=[]] - An array of protocols to use in the WebSocket connection.
   * @param {Array} [options.protocols=[]] - 用于 WebSocket 连接的协议数组。
   *
   * @param {boolean} [connectResend] - Whether to resend unsent content after connection.
   * @param {boolean} [connectResend] - 连接后是否重新发送未发送内容。
   */
  constructor(
    url: string,
    {
      showLog,
      reconnectInterval,
      heartbeatInterval = 10000,
      heartbeatMessage = "ping",
      maxReconnectAttempts = 0,
      onClose,
      onError,
      onMessage,
      onOpen,
      protocols = [],
      connectResend = false,
      jsonAble = false
    }: WebSocketClientOptions<T> = {}
  ) {
    this.#showLog = showLog;
    this.#url = url;
    reconnectInterval && (this.#reconnectInterval = reconnectInterval);
    this.#heartbeatInterval = heartbeatInterval;
    this.#heartbeatMessage = heartbeatMessage;
    this.#maxReconnectAttempts = maxReconnectAttempts;
    this.#protocols = protocols;
    onClose && (this.#_onClose = onClose);
    onOpen && (this.#_onOpen = onOpen);
    onError && (this.#_onError = onError);
    onMessage && (this.#_onMessage = onMessage);
    this.#connectResend = connectResend;
    this.#jsonAble = jsonAble;
  }

  /**
   * Returns the current WebSocket instance.
   * 返回当前 WebSocket 实例。
   */
  get instance() {
    return this.#instance;
  }

  /**
   * Establishes a WebSocket connection.
   * 建立 WebSocket 连接。
   */
  connect() {
    if (this.#instance) {
      this.#instance = null;
      this.#reconnectInterval++;
    }
    this.#instance = new WebSocket(this.#url, this.#protocols);
    this.#instance.onclose = e => {
      this.#onClose(e);
    };
    this.#instance.onopen = e => {
      this.#onOpen(e);
    };
    this.#instance.onerror = e => {
      this.#_onError?.(e);
    };
    this.#instance.onmessage = e => {
      this.#onMessage(e);
    };
  }

  #onOpen = (e: WebSocketEventMap['open']) => {
    this.#startHeartBeat();
    if (this.#connectResend) {
      while (this.#sendQueue.length) {
        const item = this.#sendQueue.shift();
        this.send(item);
      }
    }
    this.#_onOpen?.(e);
  };

  #onMessage(e: WebSocketEventMap["message"]) {
    if (!this.#jsonAble) {
      this.#_onMessage?.(e.data);
      return
    }
    try {
      const res = JSON.parse(e.data);
      this.#_onMessage?.(res);
    } catch (error) {
      this.#_onMessage?.(e.data);
    }
  }

  /**
   * Sends a message without converting it to a string.
   * 发送消息 不需要转成字符串。
   *
   * @param {T} e - The message to be sent.
   * @param {T} e - 要发送的消息。
   */
  send = <T = any>(e: T) => {
    if (this.state === WebSocketReadyState.OPEN) {
      let data = e;
      if (typeof e === "object") {
        data = JSON.stringify(e) as any;
      }
      this.#instance?.send(data as string);
      return
    }
    if (this.#connectResend) {
      this.#sendQueue.push(e as any);
    }
  };


  /**
   * Closes the WebSocket connection manually.
   * 主动关闭 WebSocket 连接。
   */
  close() {
    this.#instance?.close(1000, "Manually closing websocket connection");
  }

  #startHeartBeat() {
    if (this.#heartBeatTimer) return;
    this.#heartBeatTimer = setInterval(() => {
      this.send(this.#heartbeatMessage);
    }, this.#heartbeatInterval);
  }

  /**
   * Stops the heartbeat mechanism.
   * 关闭心跳检测。
   */
  stopHeartBeat() {
    if (this.#heartBeatTimer) {
      clearInterval(this.#heartBeatTimer as number);
      this.#heartBeatTimer = null;
    }
  }

  #onClose(e: WebSocketEventMap["close"]) {
    this.stopHeartBeat();
    if (e.code !== 1000 && this.#maxReconnectAttempts > 0 && this.#reconnectTimes < this.#maxReconnectAttempts) {
      const timeout = setTimeout(() => {
        if (this.#showLog) {
          console.log("reconnecting...");
        }
        this.#reconnectTimes++;
        this.connect();
        clearTimeout(timeout);
      }, this.#reconnectInterval);
      return;
    }
    this.#_onClose?.(e);
  }

  /**
   * Gets the current WebSocket connection state.
   * 获取 WebSocket 连接状态。
   */
  get state() {
    return this.#instance?.readyState
  }
}

export default WebSocketClient;
