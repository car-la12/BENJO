const localProductImages = new Set([
  'IMG_0389.PNG',
  'IMG_0390.PNG',
  'IMG_0391.PNG',
  'IMG_0392.PNG',
]);

export function slugifyProductName(name) {
  const slug = name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 80);

  return slug || 'produit';
}

export function validateProductInput(input) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    return { error: 'Les données du produit sont invalides.' };
  }

  const name = typeof input.name === 'string' ? input.name.trim() : '';
  const type = typeof input.type === 'string' ? input.type.trim() : '';
  const description = typeof input.description === 'string' ? input.description.trim() : '';
  const image = typeof input.image === 'string' ? input.image.trim() : '';
  const steep = typeof input.steep === 'string' ? input.steep.trim() : '';
  const temperature = typeof input.temperature === 'string' ? input.temperature.trim() : '';
  const variantName = typeof input.variantName === 'string' ? input.variantName.trim() : 'Standard';
  const sku = typeof input.sku === 'string' ? input.sku.trim().toUpperCase() : '';
  const trackInventory = input.trackInventory === true;
  const stockQuantity = input.stockQuantity === '' || input.stockQuantity == null
    ? null
    : Number(input.stockQuantity);
  const shippingWeightGrams = input.shippingWeightGrams === '' || input.shippingWeightGrams == null
    ? null
    : Number(input.shippingWeightGrams);
  const packageLengthMm = input.packageLengthMm === '' || input.packageLengthMm == null
    ? null
    : Number(input.packageLengthMm);
  const packageWidthMm = input.packageWidthMm === '' || input.packageWidthMm == null
    ? null
    : Number(input.packageWidthMm);
  const packageHeightMm = input.packageHeightMm === '' || input.packageHeightMm == null
    ? null
    : Number(input.packageHeightMm);
  const fulfillmentNotes = typeof input.fulfillmentNotes === 'string' ? input.fulfillmentNotes.trim() : '';
  const price = Number(input.price);
  const compareAtPrice = input.compareAtPrice === '' || input.compareAtPrice == null
    ? null
    : Number(input.compareAtPrice);
  let validImageUrl = false;
  if (!localProductImages.has(image)) {
    try {
      const imageUrl = new URL(image);
      validImageUrl = imageUrl.protocol === 'https:' && Boolean(imageUrl.hostname);
    } catch {
      validImageUrl = false;
    }
  }

  if (!name || name.length > 120) return { error: 'Le nom est obligatoire et limité à 120 caractères.' };
  if (!type || type.length > 80) return { error: 'Le type est obligatoire et limité à 80 caractères.' };
  if (!description || description.length > 1000) return { error: 'La description est obligatoire et limitée à 1 000 caractères.' };
  if (!Number.isSafeInteger(price) || price < 0) return { error: 'Le prix doit être un montant entier positif ou nul.' };
  if (compareAtPrice !== null && (!Number.isSafeInteger(compareAtPrice) || compareAtPrice <= price)) {
    return { error: 'Le prix barré doit être un montant entier supérieur au prix actuel.' };
  }
  if (!variantName || variantName.length > 120) return { error: 'La déclinaison est obligatoire et limitée à 120 caractères.' };
  if (sku.length > 80 || (sku && !/^[A-Z0-9][A-Z0-9._-]*$/.test(sku))) {
    return { error: 'Le SKU doit contenir uniquement des lettres, chiffres, points, tirets ou underscores.' };
  }
  if (trackInventory && (!Number.isSafeInteger(stockQuantity) || stockQuantity < 0)) {
    return { error: 'Indiquez un stock entier positif ou nul, ou désactivez le suivi du stock.' };
  }
  if (![shippingWeightGrams, packageLengthMm, packageWidthMm, packageHeightMm].every(
    (value) => value === null || (Number.isSafeInteger(value) && value > 0),
  )) {
    return { error: 'Le poids et les dimensions doivent être des entiers positifs.' };
  }
  if (fulfillmentNotes.length > 1000) return { error: 'Les consignes de préparation sont limitées à 1 000 caractères.' };
  if (!localProductImages.has(image) && !validImageUrl) {
    return { error: 'Choisissez une image fournie ou une URL HTTPS valide.' };
  }
  if (steep.length > 40 || temperature.length > 30) {
    return { error: 'Les informations de préparation sont trop longues.' };
  }

  return {
    data: {
      name,
      type,
      description,
      price,
      compareAtPrice,
      variantName,
      sku,
      trackInventory,
      stockQuantity: trackInventory ? stockQuantity : null,
      shippingWeightGrams,
      packageLengthMm,
      packageWidthMm,
      packageHeightMm,
      fulfillmentNotes,
      image,
      steep,
      temperature,
    },
  };
}
