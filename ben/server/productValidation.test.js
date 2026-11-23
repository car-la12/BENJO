import test from 'node:test';
import assert from 'node:assert/strict';
import { slugifyProductName, validateProductInput } from './productValidation.js';

const validProduct = {
  name: 'Sencha du matin',
  type: 'THÉ VERT · JAPON',
  description: 'Thé vert japonais aux notes fraîches et végétales.',
  price: '2500',
  compareAtPrice: '',
  variantName: 'Pack de 6 infusions + pot de miel',
  sku: 'BENDJO-MOMENT-6-MIEL',
  trackInventory: false,
  stockQuantity: '',
  shippingWeightGrams: '',
  packageLengthMm: '',
  packageWidthMm: '',
  packageHeightMm: '',
  fulfillmentNotes: 'Préparer un pack de 6 infusions et inclure un pot de miel.',
  image: 'IMG_0390.PNG',
  steep: '2 min',
  temperature: '75 °C',
};

test('normalizes valid product form values', () => {
  const result = validateProductInput(validProduct);

  assert.equal(result.error, undefined);
  assert.deepEqual(result.data, {
    ...validProduct,
    price: 2500,
    compareAtPrice: null,
    sku: 'BENDJO-MOMENT-6-MIEL',
    stockQuantity: null,
    shippingWeightGrams: null,
    packageLengthMm: null,
    packageWidthMm: null,
    packageHeightMm: null,
  });
});

test('rejects invalid prices and unsafe image URLs', () => {
  assert.match(validateProductInput({ ...validProduct, price: '-1' }).error, /prix/);
  assert.match(validateProductInput({ ...validProduct, image: 'javascript:alert(1)' }).error, /image/);
  assert.match(validateProductInput({ ...validProduct, image: 'https://' }).error, /image/);
});

test('requires a comparison price to be higher than the sale price', () => {
  assert.match(validateProductInput({ ...validProduct, compareAtPrice: '2000' }).error, /prix barré/);
  assert.match(validateProductInput({ ...validProduct, compareAtPrice: '2500' }).error, /prix barré/);
});

test('creates stable slugs for French product names', () => {
  assert.equal(slugifyProductName('Thé vert Sencha'), 'the-vert-sencha');
});

test('requires a valid tracked stock and positive shipping measurements', () => {
  assert.match(validateProductInput({ ...validProduct, trackInventory: true }).error, /stock entier/);
  assert.equal(validateProductInput({ ...validProduct, trackInventory: true, stockQuantity: '8' }).error, undefined);
  assert.match(validateProductInput({ ...validProduct, shippingWeightGrams: '0' }).error, /dimensions/);
  assert.match(validateProductInput({ ...validProduct, packageLengthMm: '12.5' }).error, /dimensions/);
});

test('clears stock quantity when inventory tracking is disabled', () => {
  const result = validateProductInput({ ...validProduct, stockQuantity: '12', trackInventory: false });
  assert.equal(result.data.stockQuantity, null);
});
