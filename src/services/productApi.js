const API_URL = 'http://localhost:5000/api';
export async function searchProducts(query) {
  const params = new URLSearchParams({
    q: query,
    platform: 'BlinkIt',
  });

  const response = await fetch(
    `${API_URL}/products/search?${params}`
  );
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Products fetch failed');
  }

  const products = data?.data?.products ?? data?.products;
  if (!Array.isArray(products)) {
    throw new Error('Product API returned an invalid response');
  }

  return products
    .map((item, index) => {
      const rawPrice =
        item.offer_price ??
        item.price?.value ??
        item.price?.sellingPrice ??
        item.price?.amount ??
        item.price ??
        item.salePrice ??
        item.sellingPrice ??
        item.sp;
      const price = Number(String(rawPrice ?? '').replace(/[^\d.]/g, ''));
      const rawMrp = item.mrp ?? item.price?.mrp ?? item.originalPrice;
      const mrp = Number(String(rawMrp ?? '').replace(/[^\d.]/g, ''));
      const name = item.name || item.title || item.productName;
      const rawUnit = item.quantity || item.unit || item.weight;
      const rawDescription = item.description || item.details;
      const unit =
        typeof rawUnit === 'string'
          ? rawUnit
          : rawUnit?.name || rawUnit?.label || '';
      const image = item.image || item.imageUrl || item.images?.[0];
      const category =
        typeof item.category === 'string'
          ? item.category
          : item.category?.name || '';

      if (
        typeof name !== 'string' ||
        !name.trim() ||
        !Number.isFinite(price) ||
        price < 0
      ) {
        return null;
      }

      return {
        id: `quickcommerce-${item.id ?? item.productId ?? item._id ?? index}`,
        name: name.trim(),
        price,
        mrp: Number.isFinite(mrp) && mrp > price ? mrp : null,
        image: typeof image === 'string' ? image : image?.url || '',
        rating: Number(item.rating) || 4,
        category,
        brand: typeof item.brand === 'string' ? item.brand : '',
        available: item.available !== false,
        description:
          typeof rawDescription === 'string' ? rawDescription : '',
        unit: unit || 'unit',
      };
    })
    .filter((product) => product && product.available);
}