function currying(fn) {
  function curried(...args) {
    // 将柯里化后的函数接收的参数个数与函数本应该接收的参数个数进行比较
    if (args.length >= fn.length) { // 大于等于的情况，说明参数已准备妥当，直接调用函数
      return fn.apply(this, args)
    } else { // 小于，说明参数不够，需要return新函数，接收新的参数
      return function(...rest) {
        // [...args, ...rest] 不断合并参数
        // 递归调用curried来检查函数的参数个数是否满足要求
        return curried.apply(this, [...args, ...rest])
      }
    }
  }
  return curried
}

// 测试代码
function sum(a, b, c, d) {
  return a + b + c + d
}
const newSum = currying(sum)
console.log(`---newSum1: `, newSum(1, 2, 3, 4)); // 10
console.log(`---newSum2: `, newSum(1, 2)(3, 4)); // 10
console.log(`---newSum3: `, newSum(1, 2, 3)(4)); // 10
// 柯里化后的函数this绑定只与最后一次函数调用的this有关系
console.log(`---newSum4: `, newSum(1)(2).call({num: 3}, 3).call({num: 4}, 4)); // 10
