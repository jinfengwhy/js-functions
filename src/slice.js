Array.prototype.jfslice = jfslice

function jfslice(start, end) {
  // 1.参数处理
  const length = this.length
  start = start ?? 0;
  end = end ?? length;
  start = start < 0 ? length + start : start
  end = end < 0 ? length + end : end

  // 2.进行赋值
  const newArr = []
  for (let i = start; i < end; i++) {
    newArr.push(this[i])
  }

  // 3.返回结果
  return newArr
}
