
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { type Product } from "@/hooks/useProductsData";

interface DatabaseViewProps {
  dbProducts: Product[];
}

export const DatabaseView = ({ dbProducts }: DatabaseViewProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Database Products</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3">
          {dbProducts.map((product) => (
            <div key={product.id} className="flex items-center justify-between p-3 border rounded">
              <div>
                <h3 className="font-medium">{product.product_title}</h3>
                <p className="text-sm text-coolGray">
                  ${product.price ? parseFloat(product.price).toFixed(2) : '0.00'}
                </p>
              </div>
              <Badge variant={product.status === 'completed' ? 'default' : 'secondary'}>
                {product.status}
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
