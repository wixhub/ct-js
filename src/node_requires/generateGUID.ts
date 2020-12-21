const generate = require('nanoid/generate');
const alphabet = '6789BCDFGHJKLMNPQRTWbcdfghjkmnpqrtwz'; // Should be safe from generating NSFW words accidentally

// ~1 thousand years needed in order to have a 1% probability
// of at least one collision with 1000 IDs per hour.
// Guess I will die before this happens ¯\_(ツ)_/¯
const getUid = (): string => generate(alphabet, 14);

export = getUid;
