import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { ArrowRight, Package, ShoppingCart, Zap, Shield } from "lucide-react";
import Header from "@/components/Header";
import { supabase } from "@/integrations/supabase/client";

const DESTINATION_PLATFORMS = [
  { id: 'payhip', name: 'Payhip', type: 'browser', color: 'bg-blue-500' },
  { id: 'teachable', name: 'Teachable', type: 'browser', color: 'bg-purple-500' },
  { id: 'thinkific', name: 'Thinkific', type: 'browser', color: 'bg-indigo-500' },
  { id: 'kajabi', name: 'Kajabi', type: 'browser', color: 'bg-orange-500' },
  { id: 'shopify', name: 'Shopify', type: 'api', color: 'bg-green-500' },
  { id: 'woocommerce', name: 'WooCommerce', type: 'api', color: 'bg-purple-600' }
];

// Mock extracted products
const MOCK_PRODUCTS = [
  {
    id: '1',
    name: 'Digital Marketing Course',
    price: 99.99,
    image: '/lovable-uploads/071ce28d-6d53-431f-b381-0bb44bee394d.png',
    description: 'Complete digital marketing course with 50+ lessons',
    type: 'course'
  },
  {
    id: '2',
    name: 'SEO Masterclass',
    price: 149.99,
    image: '/lovable-uploads/094a81bc-7698-41d3-ae82-021dcb51413b.png',
    description: 'Advanced SEO techniques and strategies',
    type: 'course'
  },
  {
    id: '3',
    name: 'Social Media Templates Pack',
    price: 29.99,
    image: '/lovable-uploads/47de44e2-5e07-475f-a2a7-adc9fee9da7e.png',
    description: '100+ professional social media templates',
    type: 'digital_product'
  },
  {
    id: '4',
    name: 'Email Marketing Toolkit',
    price: 79.99,
    image: '/lovable-uploads/5ef5a80f-ba3a-4e6a-8bc8-1a86f5f99158.png',
    description: 'Complete email marketing automation toolkit',
    type: 'digital_product'
  },
  {
    id: '5',
    name: 'Business Plan Template',
    price: 19.99,
    image: '/lovable-uploads/6326653b-23d5-431a-a677-b7895e49945c.png',
    description: 'Professional business plan template',
    type: 'template'
  }
];

const SelectProducts = () => {
  const navigate = useNavigate();
  const [extractionData, setExtractionData] = useState<any>(null);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [destinationPlatform, setDestinationPlatform] = useState<string>('');
  const [selectAll, setSelectAll] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('extractionData');
    if (!stored) {
      toast.error("No extraction data found. Please start over.");
      navigate('/extract');
      return;
    }
    const data = JSON.parse(stored);
    setExtractionData(data);
    
    // Load real products from database if session exists
    if (data.sessionId) {
      loadProductsFromDatabase(data.sessionId);
    }
  }, [navigate]);

  const loadProductsFromDatabase = async (sessionId: string) => {
    try {
      const { data: products, error } = await supabase
        .from('universal_products')
        .select('*')
        .eq('session_id', sessionId);

      if (error) {
        console.error('Error loading products:', error);
        return;
      }

      if (products && products.length > 0) {
        const formattedProducts = products.map(product => ({
          id: product.source_product_id,
          name: product.title,
          price: Number(product.price) || 0,
          description: product.description || '',
          type: product.category || 'digital',
          images: typeof product.images === 'string' ? JSON.parse(product.images) : product.images || [],
          tags: product.tags || []
        }));
        
        setExtractionData(prev => prev ? { ...prev, products: formattedProducts } : null);
      }
    } catch (error) {
      console.error('Error loading products from database:', error);
    }
  };

  const handleProductToggle = (productId: string) => {
    setSelectedProducts(prev => {
      const newSelection = prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId];
      
      setSelectAll(newSelection.length === MOCK_PRODUCTS.length);
      return newSelection;
    });
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedProducts([]);
      setSelectAll(false);
    } else {
      setSelectedProducts(MOCK_PRODUCTS.map(p => p.id));
      setSelectAll(true);
    }
  };

  const handleProceed = async () => {
    // Check if user is exceptional (bypass payment)
    const { data: { user } } = await supabase.auth.getUser();
    const userEmail = user?.email;

    if (userEmail === 'enjoywithpandu@gmail.com') {
      toast.success('Exceptional user detected! Proceeding without payment...');
      
      if (!destinationPlatform) {
        toast.error("Please select a destination platform");
        return;
      }

      const products = extractionData?.products || MOCK_PRODUCTS;
      // For exceptional user, select all products if none selected
      const finalSelectedProducts = selectedProducts.length === 0 ? 
        products.map(p => p.id) : selectedProducts;
      
      const selectedProductsList = products.filter(p => finalSelectedProducts.includes(p.id));

      const migrationData = {
        ...extractionData,
        selectedProducts: selectedProductsList,
        destinationPlatform,
        totalCost: 0, // Free for exceptional user
        productCount: selectedProductsList.length,
        exceptional: true
      };
      
      localStorage.setItem('migrationData', JSON.stringify(migrationData));
      navigate('/live-automation?bypass=true');
      return;
    }

    if (selectedProducts.length === 0) {
      toast.error("Please select at least one product");
      return;
    }
    
    if (!destinationPlatform) {
      toast.error("Please select a destination platform");
      return;
    }

    const products = extractionData?.products || MOCK_PRODUCTS;
    const selectedProductsList = products.filter(p => selectedProducts.includes(p.id));
    const basePrice = 2.99;
    const platformMultiplier = destinationPlatform === 'payhip' ? 1 : 1.5;
    const totalCost = selectedProductsList.length * basePrice * platformMultiplier;

    const migrationData = {
      ...extractionData,
      selectedProducts: selectedProductsList,
      destinationPlatform,
      totalCost,
      productCount: selectedProductsList.length
    };
    
    localStorage.setItem('migrationData', JSON.stringify(migrationData));
    navigate('/payment');
  };

  const totalValue = MOCK_PRODUCTS
    .filter(p => selectedProducts.includes(p.id))
    .reduce((sum, p) => sum + p.price, 0);

  if (!extractionData) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
      <Header />
      
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent mb-4">
              Step 2: Pick What to Copy
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground">
              We found {(extractionData?.products || MOCK_PRODUCTS).length} products! Choose which ones to copy.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Products List */}
            <div className="lg:col-span-2 space-y-6">
              <Card className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl md:text-2xl font-semibold flex items-center gap-2">
                    <Package className="w-5 h-5 md:w-6 md:h-6 text-primary" />
                    Your Products ({(extractionData?.products || MOCK_PRODUCTS).length})
                  </h2>
                  <Button
                    variant="outline"
                    onClick={handleSelectAll}
                    className="flex items-center gap-2"
                  >
                    <Checkbox checked={selectAll} />
                    Select All
                  </Button>
                </div>

                <div className="space-y-4">
                  {(extractionData?.products || MOCK_PRODUCTS).map((product) => (
                    <Card 
                      key={product.id}
                      className={`p-4 cursor-pointer transition-all hover:shadow-md border-2 ${
                        selectedProducts.includes(product.id)
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50'
                      }`}
                      onClick={() => handleProductToggle(product.id)}
                    >
                      <div className="flex items-center gap-4">
                        <Checkbox 
                          checked={selectedProducts.includes(product.id)}
                          onChange={() => {}}
                        />
                        <img 
                          src={product.image || product.images?.[0] || '/lovable-uploads/071ce28d-6d53-431f-b381-0bb44bee394d.png'} 
                          alt={product.name}
                          className="w-16 h-16 object-cover rounded-lg"
                        />
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg">{product.name}</h3>
                          <p className="text-muted-foreground text-sm mb-2">{product.description}</p>
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary">{product.type}</Badge>
                            <span className="font-bold text-primary">${product.price}</span>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </Card>
            </div>

            {/* Selection Summary */}
            <div className="space-y-6">
              <Card className="p-6">
                <h3 className="text-lg md:text-xl font-semibold mb-4 flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5 text-primary" />
                  What You're Copying
                </h3>
                
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span>Products to copy:</span>
                    <span className="font-bold">{selectedProducts.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total worth:</span>
                    <span className="font-bold text-primary">${totalValue.toFixed(2)}</span>
                  </div>
                  <div className="border-t pt-4">
                    <span className="text-sm text-muted-foreground">
                      Copy cost: Just ${selectedProducts.length * 2.99} total
                    </span>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <h3 className="text-lg md:text-xl font-semibold mb-4">Copy To Where?</h3>
                
                <Select value={destinationPlatform} onValueChange={setDestinationPlatform}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pick where to copy them" />
                  </SelectTrigger>
                  <SelectContent>
                    {DESTINATION_PLATFORMS.map((platform) => (
                      <SelectItem key={platform.id} value={platform.id}>
                        <div className="flex items-center gap-3">
                          <div className={`w-3 h-3 rounded-full ${platform.color}`} />
                          {platform.name}
                          {platform.type === 'api' ? (
                            <Zap className="w-3 h-3 text-green-500" />
                          ) : (
                            <Shield className="w-3 h-3 text-blue-500" />
                          )}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Card>

              <Button 
                onClick={handleProceed}
                disabled={selectedProducts.length === 0 || !destinationPlatform}
                className="w-full text-base md:text-lg py-4 md:py-6"
                size="lg"
              >
                Let's Do This!
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SelectProducts;