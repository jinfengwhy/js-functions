function isObject(value) {
  const valueType = typeof value
  return value !== null && (valueType === 'object' || valueType === 'function')
}

function deepClone(originValue, map = new WeakMap()) {
  // Set类型（注意：针对Set类型这里只做了浅层clone）
  if (originValue instanceof Set) {
    return new Set([...originValue])
  }

  // Map类型（注意：针对Map类型这里只做了浅层clone）
  if (originValue instanceof Map) {
    return new Map([...originValue])
  }

  // 如果是函数类型，直接返回
  if (typeof originValue === 'function') {
    return originValue
  }

  // 如果不是object，那么认为是基本数据类型，直接返回 
  if (!isObject(originValue)) {
    return originValue
  }

  // 如果进来的originValue与map中的key原始对象能匹配到，说明是循环引用
  if (map.has(originValue)) {
    return map.get(originValue)
  }

  // 处理数组类型
  const newObj = Array.isArray(originValue) ? [] : {}
  // 建立原始对象和clone后新对象的一个映射关系
  // 注意：map中其实是存了多个映射关系的
  map.set(originValue, newObj)

  // 遍历属性
  for (const key in originValue) {
    newObj[key] = deepClone(originValue[key], map)
  }

  // 对Symbol的key做特殊处理
  const symbolKeys = Object.getOwnPropertySymbols(originValue)
  for (const sKey of symbolKeys) {
    // 如果想要使用全新的Symbol，放开下面这行代码
    // const sNewKey = Symbol(sKey.description)
    newObj[sKey] = deepClone(originValue[sKey])
  }

  return newObj
}

// 测试代码
const s1 = Symbol('aaa')
const s2 = Symbol('bbb')
const obj = {
  name: 'jfw',
  age: 18,
  friend: {
    name: '罗辑',
    address: '地面',
    friend: {
      name: '大史'
    }
  },
  // 函数
  foo: function() {
    console.log(`${this.friend.name} foo function~`);
  },
  // 数组
  hobbies: ['abc', 'cba', 'nba', { name: 'xixi' }],
  // Symbol作为key和value
  [s1]: 'abc',
  s2: s2,
  // Set/Map
  set: new Set(['lilei', 'cury']),
  map: new Map([['aaa', 'abc'], ['bbb', 'cba']])
}
obj.info = obj
const objCopy = deepClone(obj)
obj.friend.name = '章北海'
obj.friend.friend.name = '东方'
console.log(``, objCopy);
objCopy.foo()
console.log(``, obj[s2] === objCopy[s2]);
console.log(``, objCopy.info.info.info.info === objCopy);
