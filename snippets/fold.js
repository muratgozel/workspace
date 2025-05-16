const text1 = 'some-header: abcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyz'
const text2 = 'some-header: asd'
const text3 = 'some-header: abcdefghijklmnopqrstuvwxyz abcdefghijklmnopqrstuvwxyz abcdefghijklmnopqrstuvwxyz abcdefghijklmnopqrstuvwxyz'
const text4 = 'some-header: abcdefghijklmnopqrstuvwxyz abcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyz'
const text5 = 'some-header: i=1; a=rsa-sha256; t=1735829933; cv=none; d=google.com; s=arc-20240605; b=ZU0SWGTvl1XxSMgLZ/+4/o2JrbSKLPfpo4eFP9Oj/0rRyjIVjfeQiSupKomHiwbwMClEkSgDTv71ujNtHdPB6peCGo6aK1v/kXqzbIL64cUVdy62gxDsIxdqfq8NW23yNjgu6/8iFwPQ8hrK6MPh6JSnQG4j9CBbB/doU32CARD5H7dPnlIAnvPKQ4DanTsuTlVO62NofIi2vXUwvocVOemdfXi+RFSIMQiMGkZXNMydjDdZqda56L0cyGMLyIToh9CjBHuECDx0/RAf+WSCzwpybhDNELrZuy6wAZ+8yNYHSr86MBmKmQz0K4XsdpwOhhUlkel3AbUObBh9v0NM8A=='

function foldByCustomCharacter(text, sep) {
    const arr = text.split(sep)
    const chunks = arr.reduce((memo, _chunk, i) => {
        const chunk = sep !== ' '
            ? (i !== arr.length - 1 ? _chunk + sep : _chunk)
            : (i !== 0 ? sep + _chunk : _chunk)

        if (chunk.length > 98) {
            const arr2 = sep !== ' ' ? foldByCustomCharacter(chunk, ' ') : foldByNothing(chunk)
            return memo.concat(arr2)
        }
        else {
            return memo.concat([chunk])
        }
    }, [])

    return organize(chunks)
}

function foldBySpace(text) {
    const arr = text.split(' ')
    const chunks = arr.reduce((memo, _chunk, i) => {
        const chunk = i !== 0 ? ' ' + _chunk : _chunk
        if (chunk.length > 98) {
            const arr2 = foldByNothing(chunk)
            return memo.concat(arr2)
        }
        else {
            return memo.concat([chunk])
        }
    }, [])
    return organize(chunks)
}

function foldByNothing(text) {
    return text.match(/.{1,98}/g)
}

function organize(chunks) {
    const indexesToSkip = []
    const result = chunks.reduce((memo, chunk, index) => {
        if (indexesToSkip.includes(index)) {
            return memo
        }

        if (chunk.length === 98) {
            memo = memo.concat([chunk])
            return memo
        }

        let organizedChunk = chunk
        let nextIndex = index + 1
        while (chunks.length - 1 >= nextIndex) {
            const nextChunk = chunks[nextIndex]

            if (organizedChunk.length + nextChunk.length > 98) {
                memo = memo.concat([organizedChunk])
                return memo
            }

            organizedChunk += nextChunk
            indexesToSkip.push(nextIndex)
            nextIndex += 1
        }

        memo = memo.concat([organizedChunk])
        return memo
    }, [])
    return indexesToSkip.length > 0 ? organize(result) : result
}

function unfold(multilineText) {
    return multilineText.replace(/(\r\n)/g, '')
}

console.log(foldByCustomCharacter(text1, ' '))
console.log(foldByCustomCharacter(text2, ' '))
console.log(foldByCustomCharacter(text3, ' '))
console.log(foldByCustomCharacter(text4, ' '))
console.log(foldByCustomCharacter(text5, ';'))

const mt = foldByCustomCharacter(text5, ';').join("\r\n")
console.log(mt)
console.log(unfold(mt))