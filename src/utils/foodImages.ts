import { FoodItem } from '../types';

// Curated high-resolution food images for all staple items
export const FOOD_IMAGE_MAP: Record<string, string> = {
  // Grains & Breads
  'food-roti': 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=600&q=80', // Chapati / Roti
  'food-rice': 'https://images.unsplash.com/photo-1516684732162-798a0062be99?auto=format&fit=crop&w=600&q=80', // Steamed Basmati Rice
  'food-brown-rice': 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=600&q=80', // Brown Rice
  'food-oats': 'https://images.unsplash.com/photo-1584776296944-ab6fb57b0bdd?auto=format&fit=crop&w=600&q=80', // Oatmeal bowl
  'food-poha': 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=600&q=80', // Poha / Flattened rice
  'food-upma': 'https://images.unsplash.com/photo-1606491956689-2ea866880c84?auto=format&fit=crop&w=600&q=80', // Semolina Upma
  'food-idli': 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=600&q=80', // Idli with sambar
  'food-dosa': 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?auto=format&fit=crop&w=600&q=80', // Crispy Dosa
  'food-multigrain-bread': 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=600&q=80', // Multigrain bread
  'food-quinoa': 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=600&q=80', // Cooked quinoa

  // Lentils, Dal & Legumes
  'food-yellow-dal': 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=600&q=80', // Dal Tadka
  'food-rajma': 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=600&q=80', // Rajma Masala
  'food-chole': 'https://images.unsplash.com/photo-1546833998-877b37c2e5c4?auto=format&fit=crop&w=600&q=80', // Chana masala / Chole
  'food-sprouts-salad': 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=600&q=80', // Moong sprouts salad
  'food-sambar': 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=600&q=80', // Veg Sambar
  'food-soya-chunks': 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=600&q=80', // Soya curry

  // Dairy & Alternatives
  'food-paneer': 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=600&q=80', // Malai Paneer
  'food-curd': 'https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=600&q=80', // Fresh Curd / Dahi
  'food-greek-yogurt': 'https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=600&q=80', // Greek yogurt
  'food-cow-milk': 'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=600&q=80', // Cow Milk
  'food-buttermilk': 'https://images.unsplash.com/photo-1528750997573-59b89d56f4f7?auto=format&fit=crop&w=600&q=80', // Chaas / Spiced Buttermilk
  'food-tofu': 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80', // Organic Tofu

  // Vegetables & Salads
  'food-spinach': 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?auto=format&fit=crop&w=600&q=80', // Fresh Palak / Spinach
  'food-green-salad': 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=600&q=80', // Mixed Green Salad
  'food-broccoli': 'https://images.unsplash.com/photo-1459411621453-7b03977f4bfc?auto=format&fit=crop&w=600&q=80', // Steamed Broccoli
  'food-bhindi': 'https://images.unsplash.com/photo-1425543103986-22abb7d7e8d2?auto=format&fit=crop&w=600&q=80', // Okra / Bhindi Masala

  // Fruits
  'food-apple': 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?auto=format&fit=crop&w=600&q=80', // Red Crisp Apple
  'food-banana': 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?auto=format&fit=crop&w=600&q=80', // Fresh Banana
  'food-papaya': 'https://images.unsplash.com/photo-1517282009859-f000ec3b26fe?auto=format&fit=crop&w=600&q=80', // Sweet Papaya slices
  'food-orange': 'https://images.unsplash.com/photo-1611080626919-7cf5a9dbab5b?auto=format&fit=crop&w=600&q=80', // Juicy Orange

  // Proteins (Eggs / Meat / Fish)
  'food-boiled-eggs': 'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?auto=format&fit=crop&w=600&q=80', // Boiled Eggs
  'food-egg-whites': 'https://images.unsplash.com/photo-1506976785307-8732e854ad03?auto=format&fit=crop&w=600&q=80', // Egg whites omelet
  'food-chicken-breast': 'https://images.unsplash.com/photo-1604503468506-a8da13d82791?auto=format&fit=crop&w=600&q=80', // Grilled Chicken Breast
  'food-fish-tikka': 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=600&q=80', // Grilled Fish

  // Healthy Snacks & Nuts
  'food-makhana': 'https://images.unsplash.com/photo-1599490659213-e2b9527bd087?auto=format&fit=crop&w=600&q=80', // Roasted Foxnuts
  'food-almonds': 'https://images.unsplash.com/photo-1508061253366-f7da158b6d46?auto=format&fit=crop&w=600&q=80', // California Almonds
  'food-walnuts': 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?auto=format&fit=crop&w=600&q=80', // Raw Walnuts
  'food-roasted-chana': 'https://images.unsplash.com/photo-1515543237350-b3eea1ec8082?auto=format&fit=crop&w=600&q=80', // Roasted Chana
  'food-green-tea': 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=600&q=80', // Steaming Green Tea
};

// Fallback high-quality category banners
export const CATEGORY_FALLBACK_IMAGES: Record<string, string> = {
  Grains: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=600&q=80',
  Dairy: 'https://images.unsplash.com/photo-1628088062854-d1870b4553da?auto=format&fit=crop&w=600&q=80',
  Protein: 'https://images.unsplash.com/photo-1604503468506-a8da13d82791?auto=format&fit=crop&w=600&q=80',
  Legumes: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=600&q=80',
  Vegetables: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=600&q=80',
  Fruits: 'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?auto=format&fit=crop&w=600&q=80',
  Snacks: 'https://images.unsplash.com/photo-1599490659213-e2b9527bd087?auto=format&fit=crop&w=600&q=80',
  Beverages: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&w=600&q=80',
  'Nuts & Seeds': 'https://images.unsplash.com/photo-1508061253366-f7da158b6d46?auto=format&fit=crop&w=600&q=80',
  Default: 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=600&q=80',
};

/**
 * Returns a high-resolution, appetizing food photo URL for any food item
 */
export function getFoodImage(food?: FoodItem | null): string {
  if (!food) {
    return CATEGORY_FALLBACK_IMAGES.Default;
  }

  // 1. Direct food image_url if provided
  if (food.image_url && food.image_url.startsWith('http')) {
    return food.image_url;
  }

  // 2. Direct map match by food.id
  if (FOOD_IMAGE_MAP[food.id]) {
    return FOOD_IMAGE_MAP[food.id];
  }

  // 3. Name-based keyword heuristic
  const lowerName = food.name.toLowerCase();
  if (lowerName.includes('roti') || lowerName.includes('chapati') || lowerName.includes('paratha')) {
    return FOOD_IMAGE_MAP['food-roti'];
  }
  if (lowerName.includes('rice') || lowerName.includes('pulao') || lowerName.includes('biryani')) {
    return FOOD_IMAGE_MAP['food-rice'];
  }
  if (lowerName.includes('oat') || lowerName.includes('porridge') || lowerName.includes('muesli')) {
    return FOOD_IMAGE_MAP['food-oats'];
  }
  if (lowerName.includes('dal') || lowerName.includes('lentil') || lowerName.includes('curry')) {
    return FOOD_IMAGE_MAP['food-yellow-dal'];
  }
  if (lowerName.includes('paneer')) {
    return FOOD_IMAGE_MAP['food-paneer'];
  }
  if (lowerName.includes('curd') || lowerName.includes('yogurt') || lowerName.includes('dahi')) {
    return FOOD_IMAGE_MAP['food-curd'];
  }
  if (lowerName.includes('egg') || lowerName.includes('omelet')) {
    return FOOD_IMAGE_MAP['food-boiled-eggs'];
  }
  if (lowerName.includes('chicken') || lowerName.includes('poultry')) {
    return FOOD_IMAGE_MAP['food-chicken-breast'];
  }
  if (lowerName.includes('fish') || lowerName.includes('salmon') || lowerName.includes('seafood')) {
    return FOOD_IMAGE_MAP['food-fish-tikka'];
  }
  if (lowerName.includes('apple')) {
    return FOOD_IMAGE_MAP['food-apple'];
  }
  if (lowerName.includes('banana')) {
    return FOOD_IMAGE_MAP['food-banana'];
  }
  if (lowerName.includes('sprout') || lowerName.includes('salad')) {
    return FOOD_IMAGE_MAP['food-green-salad'];
  }
  if (lowerName.includes('makhana') || lowerName.includes('foxnut')) {
    return FOOD_IMAGE_MAP['food-makhana'];
  }
  if (lowerName.includes('almond') || lowerName.includes('nut') || lowerName.includes('walnut')) {
    return FOOD_IMAGE_MAP['food-almonds'];
  }
  if (lowerName.includes('tea') || lowerName.includes('coffee') || lowerName.includes('drink')) {
    return FOOD_IMAGE_MAP['food-green-tea'];
  }

  // 4. Fallback to category
  return CATEGORY_FALLBACK_IMAGES[food.category] || CATEGORY_FALLBACK_IMAGES.Default;
}
