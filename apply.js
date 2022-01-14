Function.prototype.jfapply = jfapply

function jfapply(thisArg, argArr) {
  // 1.拿到调用主体
  const fn = this

  // 2.处理入参
  // 使用Object包裹有两种情况：a:基本类型（经过Object后转化为包装类型） b:引用类型（经过Object后还是引用类型）
  thisArg = thisArg !== null && thisArg !== undefined ? Object(thisArg) : window
  argArr = argArr || []

  // 3.函数调用
  // 利用了this的隐式绑定
  const key = Symbol()
  thisArg[key] = fn
  const result = thisArg[key](...argArr)
  delete thisArg[key]

  // 4.返回结果
  return result
}
