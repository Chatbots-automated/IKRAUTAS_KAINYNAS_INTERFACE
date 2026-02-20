import { supabaseServer } from '../supabase/server';
import { MOCK_CATEGORIES, MOCK_PRODUCTS } from '../mock-data';

/**
 * Seed the database with categories and products
 * Run this once to populate your Supabase database
 */
export async function seedDatabase() {
  console.log('Starting database seed...');

  try {
    // 1. Insert categories (if not already exist)
    console.log('Seeding categories...');
    const { data: existingCategories, error: catCheckError } = await supabaseServer
      .from('categories')
      .select('slug');

    if (catCheckError) throw catCheckError;

    if (!existingCategories || existingCategories.length === 0) {
      const categoriesToInsert = MOCK_CATEGORIES.map((cat) => ({
        name: cat.name,
        slug: cat.slug,
        sort_order: cat.sort_order,
      }));

      const { error: catError } = await supabaseServer
        .from('categories')
        .insert(categoriesToInsert);

      if (catError) throw catError;
      console.log(`✓ Inserted ${categoriesToInsert.length} categories`);
    } else {
      console.log('✓ Categories already exist, skipping');
    }

    // 2. Fetch category IDs to map products
    const { data: categories, error: catFetchError } = await supabaseServer
      .from('categories')
      .select('id, slug');

    if (catFetchError) throw catFetchError;

    const categoryMap = new Map(categories?.map((c) => [c.slug, c.id]));

    // 3. Insert products (if not already exist)
    console.log('Seeding products...');
    const { data: existingProducts, error: prodCheckError } = await supabaseServer
      .from('products')
      .select('name');

    if (prodCheckError) throw prodCheckError;

    if (!existingProducts || existingProducts.length === 0) {
      const productsToInsert = MOCK_PRODUCTS.map((prod) => {
        const categorySlug = prod.category?.slug || 'other';
        const categoryId = categoryMap.get(categorySlug);

        if (!categoryId) {
          throw new Error(`Category not found for slug: ${categorySlug}`);
        }

        return {
          sku: prod.sku,
          name: prod.name,
          unit_price: prod.unit_price,
          category_id: categoryId,
          vat_rate: prod.vat_rate,
          is_service: prod.is_service,
          is_internal_only: prod.is_internal_only,
          collapse_into_materials: prod.collapse_into_materials,
        };
      });

      const { error: prodError } = await supabaseServer
        .from('products')
        .insert(productsToInsert);

      if (prodError) throw prodError;
      console.log(`✓ Inserted ${productsToInsert.length} products`);
    } else {
      console.log('✓ Products already exist, skipping');
    }

    console.log('✓ Database seed completed successfully!');
    return { success: true };
  } catch (error) {
    console.error('✗ Error seeding database:', error);
    return { success: false, error };
  }
}
