function throttle(fn, interval, options = { leading: true, trailing: false }) {
  let lastTime = 0
  let timer = null

  const { leading, trailing } = options

  const _throttle = function(...args) {
    return new Promise(resolve => {
      const nowTime = new Date().getTime()

      if (!leading && !lastTime) {
        lastTime = nowTime
      }

      const remainTime = interval - (nowTime - lastTime)

      if (remainTime <= 0) {

        if (timer) {
          clearTimeout(timer)
          timer = null
        }
        const result = fn.apply(this, args)
        lastTime = nowTime
        resolve(result)
      } else {

        if (trailing && !timer) {
          timer = setTimeout(() => {
            const result = fn.apply(this, args)
            timer = null
            // 特别注意这行逻辑
            lastTime = !leading ? 0 : new Date().getTime()
            resolve(result)
          }, remainTime)
        }

      }
    })
  }

  _throttle.oncancel = function() {
    if (timer) {
      clearTimeout(timer)
    }
    timer = null
    lastTime = 0
  }

  return _throttle
}
