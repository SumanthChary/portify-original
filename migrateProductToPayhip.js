// @ts-check
import { formatProductForPayhip } from "./src/lib/utils";

async function main() {
  // Example Gumroad product
  const gumroadProduct = {
    name: "Digital Marketing Guide",
    description: "Complete guide to digital marketing strategies",
    price: 19.99,
    image_url: "https://picsum.photos/seed/dm1/600/400"
  };

  try {
    const payhipProduct = await formatProductForPayhip(gumroadProduct);
    console.log("Payhip-ready product:", JSON.stringify(payhipProduct, null, 2));
  } catch (error) {
    console.error("Migration failed:", error);
  }
}

main();
