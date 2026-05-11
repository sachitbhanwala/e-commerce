const normalizeProduct = (product) => ({
  id: product?.id ?? null,
  productId: product?.productId ?? '',
  name: product?.name ?? '',
  image: product?.image ?? '',
  imageUrls: Array.isArray(product?.imageUrls) ? product.imageUrls : [],
  category: product?.category ?? '',
  shortDescription: product?.shortDescription ?? '',
  fullDescription: product?.fullDescription ?? '',
  price: Number(product?.price ?? 0),
  recommendedOnly: Boolean(product?.recommendedOnly)
});

const normalizeProducts = (products) =>
  Array.isArray(products) ? products.map(normalizeProduct) : [];

const buildProductPayload = (formData) => ({
  name: formData.name.trim(),
  price: Number(Number(formData.price).toFixed(2)),
  image: formData.image.trim(),
  imageUrls: formData.imageUrls ? formData.imageUrls.split(',').map(url => url.trim()).filter(Boolean) : [],
  category: formData.category.trim() || 'General',
  shortDescription: formData.shortDescription.trim(),
  fullDescription: formData.fullDescription.trim(),
  recommendedOnly: Boolean(formData.recommendedOnly)
});

export { normalizeProduct, normalizeProducts, buildProductPayload };
