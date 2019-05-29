const EC = require('elliptic').ec;
const ec = new EC('secp256k1');
// Algorithm for generating key pairs - also happens to be the same one that Bitcoin uses

const key = ec.genKeyPair();
const publicKey = key.getPublic('hex');
const privateKey = key.getPrivate('hex');

console.log();
console.log('Private key: ' + privateKey);

console.log();
console.log('Public key: ' + publicKey);

