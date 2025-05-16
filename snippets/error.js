const e = new Error('yo!', { cause: new Error('internal errrr') })

function objectifyError(e) {
    return Object.getOwnPropertyNames(e).reduce((memo, name) => {
        if (name === 'cause' && e[name] instanceof Error) {
            const obj = objectifyError(e[name])
            Object.keys(obj).map((k) => memo[`cause.${k}`] = obj[k])
        }
        else {
            memo[name] = name === 'stack'
                ? serializeStack(e[name])
                : typeof e[name] === 'string'
                    ? e[name]
                    : '*** redacted because of an unrecognized type'
        }

        return memo
    }, {})

    function serializeStack(multilineText) {
        return multilineText
        .split(/[\n]/g)
        .map((line) => line.trim())
        .join('\n')
    }
}

console.log(objectifyError(e))
