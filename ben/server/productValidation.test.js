import test from 'node:test';
import assert from 'node:assert/strict';
import { slugifyProductName, validateProductInput } from './productValidation.js';

const validProduct = {
  name: 'Sencha du matin',
  type: 'THÉ VERT · JAPON',
  description: 'Thé vert japonais aux notes fraîches et végétales.',
  price: '2500',
  compareAtPrice: '',
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
