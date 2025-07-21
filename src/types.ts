export interface WebSocketClientOptions {
  reconnectInterval?: number;
  heartbeatInterval?: number;
  heartbeatMessage?: any;
  maxReconnectAttempts?: number;
  shouldReconnect?: boolean;
  protocols?: string | string[];
  showLog?: boolean;
  connectResend?: boolean;
  jsonAble?: boolean;
}

export enum WebSocketClientEvent {
  OPEN = "open",
  MESSAGE = "message",
  CLOSE = "close",
  ERROR = "error",
}

export type WebSocketClientEventType = WebSocketClientEvent | `${WebSocketClientEvent}`;
