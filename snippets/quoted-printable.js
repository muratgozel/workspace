function encode(text) {
    const MAX_LINE_LENGTH = 76

    if (typeof text === 'number') {
        const hex = text.toString(16)
        return '=' + hex.toUpperCase()
    }

    let lineCharCount = 0
    const arr = text.split('').map((c) => {
        const code = c.charCodeAt(0)

        if ((code >= 33 && code <= 60) || (code >= 62 && code <= 126) || (code === 10 || code === 13)) {
            if (lineCharCount + 1 === MAX_LINE_LENGTH) {
                lineCharCount = 1
                return "=\r\n" + c
            }
            else {
                lineCharCount++
                return c
            }
        }
        // space and tab
        else if (code === 9 || code === 32) {
            if (lineCharCount + 1 === MAX_LINE_LENGTH) {
                lineCharCount = 1
                return "=\r\n" + c
            }
            else {
                lineCharCount++
                return c
            }
        }
        else {
            const _encodedHex = byteArrayToHex(textToUtf8ByteArray(c)).toUpperCase()
            if (lineCharCount + _encodedHex.length >= MAX_LINE_LENGTH) {
                const needCharCount = MAX_LINE_LENGTH - lineCharCount
                lineCharCount = _encodedHex.slice(needCharCount).length
                return _encodedHex.slice(0, needCharCount) + "=\r\n" + _encodedHex.slice(needCharCount)
            }
            else {
                lineCharCount += _encodedHex.length
                return _encodedHex
            }
        }
    })

    return arr.join('')
}

function decode(text) {
    return text
    // remove any WSP that is possibly added by mail clients
    .replace(/(\x09|\x20)$/gm, '')
    // remove soft line breaks
    .replace(/=(\r\n|\n)/g, '')
    .replace(/(=[0-9A-F]{2})?(=[0-9A-F]{2})/g, function(token1) {
        return byteArrayToText(hexToByteArray(token1.replace(/=/g, '')))
    })
}

const text = 'Saint-Exupéry'
const encoded = encode(text)
const text2 = 'Möchten Sie ein paar Äpfel?'
const encoded2 = encode(text2)
const expected2 = 'M=C3=B6chten Sie ein paar =C3=84pfel?'
const text3 = 'J\'interdis aux marchands de vanter trop leurs marchandises. Car ils se font vite pédagogues et t\'enseignent comme but ce qui n\'est par essence qu\'un moyen, et te trompant ainsi sur la route à suivre les voilà bientôt qui te dégradent, car si leur musique est vulgaire ils te fabriquent pour te la vendre une âme vulgaire.'
const encoded3 = encode(text3)
const expected3 = `J'interdis aux marchands de vanter trop leurs marchandises. Car ils se font=\r\n vite p=C3=A9dagogues et t'enseignent comme but ce qui n'est par essence qu=\r\n'un moyen, et te trompant ainsi sur la route =C3=A0 suivre les voil=C3=A0 b=\r\nient=C3=B4t qui te d=C3=A9gradent, car si leur musique est vulgaire ils te =\r\nfabriquent pour te la vendre une =C3=A2me vulgaire.`
const text4 = `asd
def`
const encoded4 = encode(text4)
console.log( '1:', encoded, 'Saint-Exup=C3=A9ry', encoded === 'Saint-Exup=C3=A9ry' )
console.log( '2:', encoded2, expected2, encoded2 === expected2 )
console.log( '3:', encoded3 )
console.log( '3:', expected3 )
console.log( '3:', encoded3 === expected3 )
console.log( '4:', encoded4 )

const decoded3 = decode(encoded3)
console.log( decoded3, decoded3 === text3 )

console.log('gözel', textToUtf8ByteArray('gözel'), new TextEncoder().encode('gözel'))
console.log(byteArrayToText(textToUtf8ByteArray('gözel')))

// https://github.com/google/closure-library/blob/master/closure/goog/crypt/crypt.js

function textToUtf8ByteArray(str) {
    var out = [], p = 0;
    for (var i = 0; i < str.length; i++) {
        var c = str.charCodeAt(i);
        if (c < 128) {
            out[p++] = c;
        } else if (c < 2048) {
            out[p++] = (c >> 6) | 192;
            out[p++] = (c & 63) | 128;
        } else if (
            ((c & 0xFC00) == 0xD800) && (i + 1) < str.length &&
            ((str.charCodeAt(i + 1) & 0xFC00) == 0xDC00)) {
            // Surrogate Pair
            c = 0x10000 + ((c & 0x03FF) << 10) + (str.charCodeAt(++i) & 0x03FF);
            out[p++] = (c >> 18) | 240;
            out[p++] = ((c >> 12) & 63) | 128;
            out[p++] = ((c >> 6) & 63) | 128;
            out[p++] = (c & 63) | 128;
        } else {
            out[p++] = (c >> 12) | 224;
            out[p++] = ((c >> 6) & 63) | 128;
            out[p++] = (c & 63) | 128;
        }
    }
    return out;
}

function byteArrayToHex(array) {
    return array
    .map(
        function(numByte) {
            var hexByte = numByte.toString(16);
            return '=' + (hexByte.length > 1 ? hexByte : '0' + hexByte);
        })
    .join('');
};


function hexToByteArray(hexString) {
    return hexString.match(/[0-9A-F]{2}/g).map((h) => parseInt(h, 16))
};

function byteArrayToText(bytes) {
    var out = [], pos = 0, c = 0;
    while (pos < bytes.length) {
        var c1 = bytes[pos++];
        if (c1 < 128) {
            out[c++] = String.fromCharCode(c1);
        } else if (c1 > 191 && c1 < 224) {
            var c2 = bytes[pos++];
            out[c++] = String.fromCharCode((c1 & 31) << 6 | c2 & 63);
        } else if (c1 > 239 && c1 < 365) {
            // Surrogate Pair
            var c2 = bytes[pos++];
            var c3 = bytes[pos++];
            var c4 = bytes[pos++];
            var u = ((c1 & 7) << 18 | (c2 & 63) << 12 | (c3 & 63) << 6 | c4 & 63) -
                0x10000;
            out[c++] = String.fromCharCode(0xD800 + (u >> 10));
            out[c++] = String.fromCharCode(0xDC00 + (u & 1023));
        } else {
            var c2 = bytes[pos++];
            var c3 = bytes[pos++];
            out[c++] =
                String.fromCharCode((c1 & 15) << 12 | (c2 & 63) << 6 | c3 & 63);
        }
    }
    return out.join('');
}
