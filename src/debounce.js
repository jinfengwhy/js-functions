function debounce(fn, delay, immediate = false, successCallback) {
  // 用以保存定时器
  let timer = null 
  // 事件首次触发时，处理函数是否被调用过
  let isInvoked = false 
  const _debounce = function(...args) {
    return new Promise(resolve => {
      // 事件首次触发，未执行过，则进行执行
      // 执行完后，置isInvokd为true
      if (immediate && !isInvoked) { 
        const result = fn.apply(this, args)
        isInvoked = true
        // 把结果传递出去
        resolve(result)
        successCallback && successCallback(result)
      } else {
        // 事件非首次触发，走原有逻辑
        // 事件执行完后，置外层的自由变量值为初始值
        if (timer) clearTimeout(timer)
        timer = setTimeout(() => {
          const result = fn.apply(this, args)
          isInvoked = false
          timer = null
          // 把结果传递出去
          resolve(result)
          successCallback && successCallback(result)
        }, delay)
      }
    })
  }
  // 取消功能
  _debounce.oncancel = function() {
    if (timer) {
      clearTimeout(timer)
      timer = null
      isInvoked = false
    }
  }
  // 返回
  return _debounce
}
