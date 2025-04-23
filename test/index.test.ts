import { describe, test } from 'vitest';
import { singleton } from '../src/utils';

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
})
