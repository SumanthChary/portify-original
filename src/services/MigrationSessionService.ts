import { supabase } from "@/integrations/supabase/client";
import type { Json } from "@/integrations/supabase/types";

export type UniversalProductInput = {
  source_product_id: string;
  title: string;
  description?: string;
  price?: number | null;
  images?: string[];
  files?: string[];
  variants?: Record<string, unknown>[];
  tags?: string[];
  category?: string | null;
  status?: "active" | "draft" | "archived" | "pending" | "published";
};

export type StoredUniversalProduct = {
  id: string;
  source_product_id: string;
  title: string;
  description: string | null;
  price: number | null;
  images: string[];
  migration_status: string | null;
};

export async function createMigrationSessionWithProducts(
  userId: string,
  sourcePlatform: string,
  products: UniversalProductInput[],
  credentials: Record<string, unknown> = {}
): Promise<{ sessionId: string; products: StoredUniversalProduct[] }> {
  if (!userId) {
    throw new Error("User ID required to create migration session");
  }

  if (!sourcePlatform) {
    throw new Error("Source platform required");
  }

  if (!Array.isArray(products) || products.length === 0) {
    throw new Error("At least one product must be provided");
  }

  const sessionId = crypto.randomUUID();

  const { error: sessionError } = await supabase
    .from("migration_sessions")
    .insert({
      session_id: sessionId,
      user_id: userId,
      source_platform: sourcePlatform,
      destination_platform: "",
      credentials: Object.keys(credentials).length ? (credentials as Json) : null,
      status: "extracted",
    });

  if (sessionError) {
    throw new Error(`Failed to create migration session: ${sessionError.message}`);
  }

  const normalizedProducts = products.map((product) => ({
    session_id: sessionId,
    source_product_id: product.source_product_id,
    source_platform: sourcePlatform,
    title: product.title,
    description: product.description ?? "",
    price: product.price ?? null,
    images: (product.images ?? []) as Json,
    files: (product.files ?? []) as Json,
    variants: (product.variants ?? []) as Json,
    tags: product.tags ?? [],
    category: product.category ?? null,
    status: product.status ?? "active",
    migration_status: "ready",
  }));

  const { data: insertedProducts, error: productsError } = await supabase
    .from("universal_products")
    .insert(normalizedProducts)
    .select("id, source_product_id, title, price, images, description, migration_status");

  if (productsError) {
    throw new Error(`Failed to store products: ${productsError.message}`);
  }

  const safeProducts: StoredUniversalProduct[] = (insertedProducts ?? []).map((product) => {
    const imagesJson = product.images;
    const normalizedImages = Array.isArray(imagesJson)
      ? imagesJson.map((value) => String(value))
      : [];

    return {
      id: product.id,
      source_product_id: product.source_product_id,
      title: product.title,
      description: product.description,
      price: product.price,
      images: normalizedImages,
      migration_status: product.migration_status,
    };
  });

  return {
    sessionId,
    products: safeProducts,
  };
}