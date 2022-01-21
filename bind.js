Function.prototype.jfbind = jfbind

function jfbind(thisArg, ...args) {
  // 1.拿到调用主体
  const fn = this

  // 2.参数处理
  thisArg = thisArg === null || thisArg === undefined ? window : Object(thisArg)

  // 3.返回函数
  return function(...rest) {
    // a.利用this的隐式绑定
    const key = Symbol()
    thisArg[key] = fn
    // b.参数合并
    const newArgs = [...args, ...rest]
    // c.函数调用
    const result = thisArg[key](...newArgs)
    // d.删除多余的属性
    delete thisArg[key]
    // e.返回结果
    return result
  }
}
