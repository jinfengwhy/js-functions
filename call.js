Function.prototype.jfcall = jfcall

function jfcall(thisArg, ...args) {
  // 1.拿到调用主体
  const fn = this

  // 2.参数转化
  thisArg = thisArg === null || thisArg === undefined ? window : Object(thisArg)

  // 3.利用this的隐式绑定，进行函数调用
  const key = Symbol()
  thisArg[key] = fn
  const result = thisArg[key](...args)

  // 4.删除多余的属性
  delete thisArg[key]

  // 5.返回结果
  return result
}
