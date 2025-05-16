const sample = Array(100).fill(null).map((v, i) => i + 1)

function strategy(retryCount, maxLimit = 100) {
    const delay = Math.pow(1.25, retryCount)
    return delay > maxLimit ? false : delay
}

let totalMs = 0
sample.map((r) => {
    const delay = strategy(r)
    if (delay === false) return
    totalMs += delay
    console.log(`${r}. retry: Delay is ${delay} miliseconds. Total duration is ${totalMs}`)
})
