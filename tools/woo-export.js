const fs = require('fs');
const path = require('path');

const CATEGORY_LABELS = {
  red: 'Crveno vino', white: 'Belo vino', rose: 'Roze vino',
  sparkling: 'Penušavo vino', special: 'Specijalno', rakija: 'Rakija',
  spirits: 'Žestoko', delicacy: 'Delikatesi'
};

// Težina po zapremini (kg); default 0.75L flaša ≈ 1.3kg
function weightFor(size) {
  if (!size) return '1.3';
  var s = String(size).toLowerCase();
  if (s.includes('0.187') || s.includes('0.2')) return '0.5';
  if (s.includes('3l') || s.includes('3 l')) return '4.5';
  if (s.includes('4.5')) return '6.5';
  if (s.includes('1l') || s.includes('1 l') || s.includes('2l')) return '1.6';
  return '1.3';
}

function productToRow(p, ctx) {
  var COUNTRIES = (ctx && ctx.COUNTRIES) || {};
  var country = (COUNTRIES[p.country] && COUNTRIES[p.country].name) || p.country || '';
  var hasPrice = p.price && p.price > 0;
  var imgUrl = '';
  if (p.image) {
    // statika je javno dostupna na produkciji; URL-enkoduj naziv fajla
    var rel = p.image.replace(/^images\//, '');
    imgUrl = 'https://15milja.com/images/' + rel.split('/').map(encodeURIComponent).join('/');
  }
  return {
    'Type': 'simple',
    'SKU': p.id,
    'Name': p.name,
    'Published': '1',
    'Is featured?': '0',
    'Catalog visibility': 'visible',
    'In stock?': '1',
    'Regular price': hasPrice ? String(p.price) : '',
    'Sold individually': hasPrice ? '0' : '1',
    'Weight (kg)': weightFor(p.size),
    'Categories': CATEGORY_LABELS[p.type] || p.type,
    'Images': imgUrl,
    'Attribute 1 name': 'Vinarija', 'Attribute 1 value(s)': p.winery || '',
    'Attribute 1 visible': '1', 'Attribute 1 global': '1',
    'Attribute 2 name': 'Region', 'Attribute 2 value(s)': p.region || '',
    'Attribute 2 visible': '1', 'Attribute 2 global': '1',
    'Attribute 3 name': 'Zemlja', 'Attribute 3 value(s)': country,
    'Attribute 3 visible': '1', 'Attribute 3 global': '1',
    'Attribute 4 name': 'Zapremina', 'Attribute 4 value(s)': p.size || '0.75 L',
    'Attribute 4 visible': '1', 'Attribute 4 global': '1'
  };
}

function toCSV(rows) {
  var cols = Object.keys(rows[0]);
  var esc = function (v) {
    v = v == null ? '' : String(v);
    return /[",\n]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v;
  };
  var out = [cols.join(',')];
  rows.forEach(function (r) { out.push(cols.map(function (c) { return esc(r[c]); }).join(',')); });
  return out.join('\n');
}

function main() {
  var src = fs.readFileSync(path.join(__dirname, '..', 'js', 'wines-data.js'), 'utf8');
  var sandbox = {};
  (new Function('var PRODUCTS, COUNTRIES, TYPES;' + src +
    '\n;this.PRODUCTS=PRODUCTS;this.COUNTRIES=COUNTRIES;')).call(sandbox);
  var rows = sandbox.PRODUCTS.map(function (p) {
    return productToRow(p, { COUNTRIES: sandbox.COUNTRIES });
  });
  fs.writeFileSync(path.join(__dirname, '..', 'woocommerce-products.csv'), toCSV(rows));
  console.log('Upisano ' + rows.length + ' proizvoda u woocommerce-products.csv');
}

module.exports = { productToRow, toCSV, weightFor, CATEGORY_LABELS };
if (require.main === module) main();
