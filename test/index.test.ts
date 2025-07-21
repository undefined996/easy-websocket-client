import { describe, expect, test } from 'vitest';
import { singleton } from '../src/utils';
import WebSocketClient from '../src/socket';
import { WebSocket } from 'ws';

describe('test easy-ws-client', () => {
  test('singleton', async () => {
    class A {
      name: string;
      constructor(name: string) {
        this.name = name;
      }
      say() {
        console.log(this.name);
      }
    }
    const SA = singleton(A);
    const a = new SA('aaa');
    a.say();
    // SA.reset();
    const b = new SA('bbb');
    b.say();
  })
  test('singleton decorator', async () => {
    @singleton
    class A {
      name: string;
      constructor(name: string) {
        this.name = name;
      }
      say() {
        console.log(this.name);
      }
    }
    const a = new A('aaa');
    a.say();
    // SA.reset();
    const b = new A('bbb');
    b.say();
  })

  test('websocket client', async () => {
    const ws = new WebSocketClient('wss://echo.websocket.org', {}, WebSocket);
    let isOpened = false;
    let receivedMessage = null;

    // 监听连接打开事件
    ws.on('open', () => {
      isOpened = true;
      // 连接成功后发送测试消息
      ws.send('Hello WebSocket!');
    });

    // 监听消息接收事件
    ws.on('message', (data) => {
      console.log('received message:', data);
      receivedMessage = data;
    });

    // 监听错误事件
    ws.on('error', (error) => {
      console.error('websocket error:', error);
    });

    // 监听连接关闭事件
    ws.on('close', (event) => {
      console.log('websocket closed:', event);
    });

    // 建立连接
    ws.connect();

    // 等待连接建立和消息接收
    await new Promise((resolve) => {
      const checkInterval = setInterval(() => {
        if (isOpened && receivedMessage) {
          clearInterval(checkInterval);
          resolve(true);
        }
      }, 2_000);

      // 设置超时时间避免测试永远等待
      setTimeout(() => {
        clearInterval(checkInterval);
        resolve(false);
      }, 10000);
    });

    // 测试关闭连接
    ws.close();

    // 清理所有事件监听器
    ws.offAll();

    await new Promise((resolve) => {
      setTimeout(() => {
        resolve(true);
      }, 2_000);
    });

    expect(isOpened).toBe(true);
    expect(receivedMessage).toBe('Hello WebSocket!');
  })
})
