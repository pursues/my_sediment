// 轻量 polyfill：Promise.withResolvers（兼容老浏览器）
// 需尽早加载（在应用入口处 import），以便第三方库可用

declare global {
  interface PromiseConstructor {
    withResolvers<T>(): {
      promise: Promise<T>
      resolve: (value: T | PromiseLike<T>) => void
      reject: (reason?: unknown) => void
    }
  }
}

if (!(Promise as any).withResolvers) {
  ;(Promise as any).withResolvers = function <T>() {
    let resolveFn: (value: T | PromiseLike<T>) => void
    let rejectFn: (reason?: unknown) => void
    const promise = new Promise<T>((resolve, reject) => {
      resolveFn = resolve
      rejectFn = reject
    })
    // 断言已被赋值（运行时一定会赋值）
    return {
      promise,
      resolve: resolveFn!,
      reject: rejectFn!
    }
  }
}

export {}


