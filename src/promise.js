
const PROMISE_STATUS_PENDING = 'pending'
const PROMISE_STATUS_FULFILLED = 'fulfilled'
const PROMISE_STATUS_REJECTED = 'rejected'

function isObject(obj) {
  return Object.prototype.toString.apply(obj) === '[object Object]'
}

function execFunctionWithCatchError(execFn, value, resolve, reject) {
  try {
    const result = execFn(value)
    if (result instanceof JFWPromise) {
      result.then(resolve, reject)
    } else if (isObject(result) && result.hasOwnProperty('then')) {
      result.then(resolve, reject)
    } else {
      resolve(result) 
    }
  } catch(err) {
    reject(err)
  }
}

class JFWPromise {
  constructor(executor) {
    this.value = undefined
    this.reason = undefined
    this.status = PROMISE_STATUS_PENDING
    this.onFulfilledFns = []
    this.onRejectedFns = []

    const resolve = value => {
      if (this.status === PROMISE_STATUS_PENDING) {
        queueMicrotask(() => {
          if (this.status !== PROMISE_STATUS_PENDING) return
          this.status = PROMISE_STATUS_FULFILLED
          this.value = value
          this.onFulfilledFns.forEach(fn => fn())
        })
      }
    }

    const reject = reason => {
      if (this.status === PROMISE_STATUS_PENDING) {
        queueMicrotask(() => {
          if (this.status !== PROMISE_STATUS_PENDING) return
          this.status = PROMISE_STATUS_REJECTED
          this.reason = reason
          this.onRejectedFns.forEach(fn => fn())
        })
      }
    }

    try {
      executor(resolve, reject)
    } catch(err) {
      reject(err)
    }
  }

  then(onFulfilled, onRejected) {
    return new JFWPromise((resolve, reject) => {
      const defaultOnFulfilled = value => { return value }
      onFulfilled = onFulfilled ?? defaultOnFulfilled

      const defaultOnRejected = err => { throw err }
      onRejected = onRejected ?? defaultOnRejected

      if (this.status === PROMISE_STATUS_FULFILLED) {
        execFunctionWithCatchError(onFulfilled, this.value, resolve, reject)
      }
      if (this.status === PROMISE_STATUS_REJECTED) {
        execFunctionWithCatchError(onRejected, this.reason, resolve, reject)
      }
      if (this.status === PROMISE_STATUS_PENDING) {
        this.onFulfilledFns.push(() => {
          execFunctionWithCatchError(onFulfilled, this.value, resolve, reject)
        })
        this.onRejectedFns.push(() => {
          execFunctionWithCatchError(onRejected, this.reason, resolve, reject)
        })
      }
    })
  }

  catch(onRejected) {
    return this.then(undefined, onRejected)
  }

  finally(onFinally) {
    this.then(() => {
      onFinally()
    }, () => {
      onFinally()
    })
  }

  static resolve(value) {
    return new JFWPromise((resolve, reject) => {
      resolve(value)
    })
  }

  static reject(reason) {
    return new JFWPromise((resolve, reject) => {
      reject(reason)
    })
  }

  static all(promises) {
    const results = []
    return new JFWPromise((resolve, reject) => {
      promises.forEach((promise, index) => {
        if (!(promise instanceof JFWPromise)) {
          promise = JFWPromise.resolve(promise)
        }
        promise.then(res => {
          results.push({
            index,
            value: res
          })
          if (results.length === promises.length) {
            const values = results.sort((item1, item2) => item1.index - item2.index).map(item => item.value)
            resolve(values)
          }
        }).catch(err => {
          reject(err)
        })
      })
    })
  }

  static allSettled(promises) {
    const results = []
    return new JFWPromise((resolve, reject) => {
      promises.forEach((promise, index) => {
        if (!(promise instanceof JFWPromise)) {
          promise = JFWPromise.resolve(promise)
        }
        promise.then(res => {
          results.push({
            index,
            status: 'fulfilled',
            value: res
          })
        }).catch(err => {
          results.push({
            index,
            status: 'rejected',
            reason: err
          })
        }).finally(() => {
          if (results.length === promises.length) {
            resolve(results.sort((item1, item2) => item1.index - item2.index).map(item => {
              delete 'index'
              return item
            }))
          }
        })
      })
    })
  }

  static race(promises) {
    return new JFWPromise((resolve, reject) => {
      promises.forEach(promise => {
        promise.then(resolve, reject)
      })
    })
  }

  static any(promises) {
    const results = []
    return new JFWPromise((resolve, reject) => {
      promises.forEach((promise, index) => {
        promise.then(resolve, err => {
          results.push({
            index,
            reason: err
          })
        }).finally(() => {
          if (results.length === promises.length) {
            reject(new AggregateError(results.sort((item1, item2) => item1.index - item2.index).map(item => item.reason)))
          }
        })
      })
    })
  }
}
 
// 测试代码
const p1 = new JFWPromise((resolve, reject) => {
  setTimeout(() => {
    reject(111)
  }, 1 * 1000)
})
const p2 = new JFWPromise((resolve, reject) => {
  setTimeout(() => {
    reject(222)
    resolve(222)
  }, 3 * 1000)
})
const p3 = new JFWPromise((resolve, reject) => {
  setTimeout(() => {
    reject(333)
  }, 2 * 1000)
})

Promise.race([p1, p2, p3]).then(res => {
  console.log(`race succ res: `, res);
}, err => {
  console.log(`race error err: `, err); // race error err:  111
})

JFWPromise.any([p1, p2, p3]).then(res => {
  console.log(`any succ res: `, res); // any succ res:  222
}, err => {
  console.log(`any error err: `, err, err.errors); // error err:  AggregateError: All promises were rejected (3) [111, 222, 333]
})

console.log(`主线程执行结束了`)
