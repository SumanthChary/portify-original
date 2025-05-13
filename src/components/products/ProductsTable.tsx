
import { toast } from "@/components/ui/use-toast";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";
import { type Product } from "@/hooks/useProductsData";

interface ProductsTableProps {
  products: Product[];
  onProductUpdated: () => void;
}

export const ProductsTable = ({ products, onProductUpdated }: ProductsTableProps) => {
  const handleCopyUrl = (productId: string) => {
    const previewUrl = `${window.location.origin}/preview/${productId}`;
    navigator.clipboard.writeText(previewUrl);
    toast({
      title: "Success",
      description: "Product URL copied to clipboard!",
    });
  };

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Image</TableHead>
            <TableHead>Product Title</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>Created At</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((product) => (
            <TableRow key={product.id}>
              <TableCell>
                {product.image_url ? (
                  <img 
                    src={product.image_url} 
                    alt={product.product_title} 
                    className="w-12 h-12 object-cover rounded"
                  />
                ) : (
                  <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center">
                    N/A
                  </div>
                )}
              </TableCell>
              <TableCell>{product.product_title}</TableCell>
              <TableCell className="capitalize">{product.status || "pending"}</TableCell>
              <TableCell>{product.product_type || "N/A"}</TableCell>
              <TableCell>{product.price || "N/A"}</TableCell>
              <TableCell>{new Date(product.created_at).toLocaleDateString()}</TableCell>
              <TableCell className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => handleCopyUrl(product.id)}>
                  Copy Link
                </Button>
                <Button size="sm" asChild>
                  <a href={`/preview/${product.id}`} target="_blank" rel="noopener noreferrer">
                    View <ExternalLink className="w-4 h-4 ml-1" />
                  </a>
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
