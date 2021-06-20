const wait = function(ms = 1000) {
  return new Promise(resolve => {
    setTimeout(resolve, ms)
  })
}

export const poll = async function(fn, fnCondition, ms) {
  let result = await fn()
  while (fnCondition(result)) {
    await wait(ms)
    result = await fn()
  }
  return result
}
