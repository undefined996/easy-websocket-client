type Constructor = new (...args: any[]) => any;

export const singleton = <T extends Constructor>(classInstance: T) => {
  let instance: T | null = null;
  const proxyClass = new Proxy(
    classInstance,
    {
      construct(target, args, newTarget) {
        if (!instance) {
          instance = Reflect.construct(target, args, newTarget);
        }
        return instance as T;
      },
      get(target, prop, receiver) {
        if (prop === 'reset') {
          return () => { instance = null };
        }
        return Reflect.get(target, prop, receiver);
      }
    }
  )
  return proxyClass as T & { reset: () => void };
}
