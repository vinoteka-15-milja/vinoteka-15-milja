const assert = require('assert');
const { productToRow } = require('./woo-export.js');

// Proizvod sa cenom i slikom
const p1 = { name: 'Aleksandrović Harizma', winery: 'Aleksandrović', price: 1770,
  type: 'red', country: 'rs', region: 'Šumadija',
  image: 'images/wines/aleksandrović-harizma.png', id: 'aleksandrovic-harizma-aleksandrovic' };
const r1 = productToRow(p1, { COUNTRIES: { rs: { name: 'Srbija' } } });
assert.strictEqual(r1['Name'], 'Aleksandrović Harizma');
assert.strictEqual(r1['Regular price'], '1770');
assert.strictEqual(r1['Categories'], 'Crveno vino');
assert.strictEqual(r1['SKU'], 'aleksandrovic-harizma-aleksandrovic');
assert.strictEqual(r1['Weight (kg)'], '1.3');
assert.strictEqual(r1['Attribute 1 name'], 'Vinarija');
assert.strictEqual(r1['Attribute 1 value(s)'], 'Aleksandrović');
assert.strictEqual(r1['Attribute 3 value(s)'], 'Srbija'); // Zemlja
assert.ok(r1['Images'].startsWith('https://15milja.com/images/wines/'), 'apsolutni URL slike');
assert.ok(r1['Images'].includes('%C4%87'), 'ć URL-enkodovano');

// "Na upit" proizvod (price 0)
const p2 = { name: 'Test Na Upit', winery: 'X', price: 0, type: 'red',
  country: 'rs', region: 'Srbija', id: 'test-na-upit-x' };
const r2 = productToRow(p2, { COUNTRIES: { rs: { name: 'Srbija' } } });
assert.strictEqual(r2['Regular price'], '');
assert.strictEqual(r2['Sold individually'], '1');
assert.strictEqual(r2['Catalog visibility'], 'visible');

console.log('SVE OK');
