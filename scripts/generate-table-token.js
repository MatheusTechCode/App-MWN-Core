import { randomBytes } from 'crypto';

const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789';
const size = Number(process.argv[2]) || 16;

function generateToken(length) {
  const bytes = randomBytes(length);
  let token = '';

  for (const byte of bytes) {
    token += alphabet[byte % alphabet.length];
  }

  return `mwn_qr_${token}`;
}

console.log(generateToken(size));
