import { createHash, getHashes, randomBytes } from 'node:crypto'
import util from 'node:util'
import * as jose from 'jose'

console.log('generating public/private key pair...')

const alg = 'ECDH-ES+A256KW'
const enc = 'A256CBC-HS512'

const { publicKey, privateKey } = await jose.generateKeyPair(alg)
const spkiPem = await jose.exportSPKI(publicKey)
const spkiPemClean = simplifyKey(spkiPem)
const pkcs8Pem = (await jose.exportPKCS8(privateKey))
const pkcs8PemClean = simplifyKey(pkcs8Pem)
//console.log('public key:', spkiPem)
console.log('public key (simplified):', spkiPemClean)
//console.log('private key:', pkcs8Pem)
console.log('private key (simplified):', pkcs8PemClean)
const ecPublicKey = await jose.importSPKI(spkiPem, alg)
const ecPrivateKey = await jose.importPKCS8(formalizeKey(pkcs8PemClean), alg)

console.log('encrypting sample data with the public key...')
const sample = 'hey my secret is 123456'
const jwe = await new jose.CompactEncrypt(new TextEncoder().encode(sample))
.setProtectedHeader({ alg: alg, enc: enc })
.encrypt(publicKey)
console.log('encrypted data:', jwe)

console.log('decrypting data with the private key...')
const { plaintext, protectedHeader } = await jose.compactDecrypt(jwe, ecPrivateKey)

console.log('decrypted data:', new TextDecoder().decode(plaintext))
console.log('protected header:', protectedHeader)

console.assert(sample, plaintext)

console.log('creating hash of the sample data...')
const hash = createHash('sha512WithRSAEncryption') // or sha512
hash.update(sample)
console.log('hash', hash.digest('hex'))

function simplifyKey(data) {
    const re = data.includes('PRIVATE KEY')
        ? /(-----(BEGIN|END) PRIVATE KEY-----)(\r\n|\r|\n)/g
        : /(-----(BEGIN|END) PUBLIC KEY-----)(\r\n|\r|\n)/g
    return data
    .replace(re, '')
    .trim()
    .replace(/[\r\n]+/g, '')
}

function formalizeKey(simplifiedData) {
    return `-----BEGIN PRIVATE KEY-----\r\n${simplifiedData}\r\n-----END PRIVATE KEY-----`
}

const buf = randomBytes(64)
console.log(`${buf.length} bytes of random data: ${buf.toString('hex')}`)
const secretText = 'c7147559eebab9540ab1f36fc81a42cdc94d7bf234de8770003e00d6ee0ef87dd294621af201574fe40f60ecd92418beefb1e53b3adb33d964691e16043be478'
const secret = new TextEncoder().encode(secretText)
const _alg = 'HS512'
const jwt = await new jose.SignJWT({ 'urn:example:claim': true })
.setProtectedHeader({ alg: _alg })
.setIssuedAt()
.setIssuer('urn:example:issuerrr')
.setAudience('urn:example:audience')
.setExpirationTime('2h')
.sign(secret)

console.log('jwt:',jwt)

const result = await jose.jwtVerify(jwt, secret, {
    issuer: 'urn:example:issuer',
    audience: 'urn:example:audience',
})
console.log('payload:', result.payload)
console.log('protected header:', result.protectedHeader)
