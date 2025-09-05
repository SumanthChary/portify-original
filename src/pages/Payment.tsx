import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { CreditCard, Package, Zap, Shield, Check, ArrowRight } from "lucide-react";
import Header from "@/components/Header";
import { supabase } from "@/integrations/supabase/client";

const Payment = () => {
  const navigate = useNavigate();
  const [migrationData, setMigrationData] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState('standard');

  useEffect(() => {
    const stored = localStorage.getItem('migrationData');
    if (!stored) {
      toast.error("No migration data found. Please start over.");
      navigate('/extract');
      return;
    }
    setMigrationData(JSON.parse(stored));
  }, [navigate]);

  const plans = [
    {
      id: 'basic',
      name: 'Basic Copy',
      pricePerProduct: 2.99,
      features: [
        'Copies your products safely',
        'Done in 1-2 hours',
        'Email when finished',
        'Works for most products'
      ],
      badge: null
    },
    {
      id: 'standard',
      name: 'Smart Copy',
      pricePerProduct: 4.99,
      features: [
        'AI copies everything perfectly',
        'Watch it happen live',
        'Done in 30 minutes',
        'Fixes problems automatically',
        '99.5% success rate'
      ],
      badge: 'Most Popular'
    },
    {
      id: 'premium',
      name: 'Super Fast Copy',
      pricePerProduct: 7.99,
      features: [
        'Ultra-fast AI robot',
        'Watch live like a movie',
        'Done in 10 minutes',
        'Perfect copy every time',
        '99.9% success rate',
        'VIP support'
      ],
      badge: 'Best Value'
    }
  ];

  const handlePayment = async () => {
    if (!migrationData?.sessionId) {
      toast.error('Invalid session. Please start over.');
      return;
    }

    // Check if user is exceptional (bypass payment)
    const { data: { user } } = await supabase.auth.getUser();
    const userEmail = user?.email;

    if (userEmail === 'enjoywithpandu@gmail.com') {
      toast.success('Exceptional user detected! Bypassing payment...');
      navigate('/live-automation?session=' + migrationData.sessionId + '&payment_success=true&bypass=true');
      return;
    }

    // Check for zero products
    const productCount = migrationData.productCount || migrationData.selectedProducts?.length || 0;
    if (productCount <= 0) {
      toast.error('Cannot proceed with 0 products. Please go back and select products.');
      return;
    }

    setIsProcessing(true);
    
    try {
      // Create PayPal payment session
      const { data, error } = await supabase.functions.invoke('create-payment', {
        body: {
          sessionId: migrationData.sessionId,
          productCount: productCount,
          destinationPlatform: migrationData.destinationPlatform,
          userEmail: userEmail
        }
      });

      if (error) {
        throw new Error(error.message);
      }

      // Redirect to PayPal Checkout
      if (data.url) {
        window.open(data.url, '_blank');
        
        // Update local storage with payment info
        const processedData = {
          ...migrationData,
          paymentInitiated: true,
          plan: selectedPlan,
          initiatedAt: new Date().toISOString()
        };
        
        localStorage.setItem('migrationData', JSON.stringify(processedData));
        
        toast.success('Redirecting to PayPal payment...');
      } else {
        throw new Error('Failed to create payment session');
      }
    } catch (error) {
      console.error('Payment error:', error);
      toast.error(error instanceof Error ? error.message : 'Payment failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (!migrationData) {
    return <div>Loading...</div>;
  }

  const selectedPlanData = plans.find(p => p.id === selectedPlan);
  const totalAmount = migrationData.productCount * (selectedPlanData?.pricePerProduct || 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
      <Header />
      
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent mb-4">
              Step 3: Pay & Start
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground">
              Pick your plan and we'll copy your products automatically
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Pricing Plans */}
            <div className="lg:col-span-2">
              <h2 className="text-xl md:text-2xl font-semibold mb-6 flex items-center gap-2">
                <CreditCard className="w-5 h-5 md:w-6 md:h-6 text-primary" />
                How Fast Do You Want It?
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {plans.map((plan) => (
                  <Card 
                    key={plan.id}
                    className={`p-6 cursor-pointer transition-all hover:shadow-lg border-2 relative ${
                      selectedPlan === plan.id
                        ? 'border-primary bg-primary/5 shadow-lg'
                        : 'border-border hover:border-primary/50'
                    }`}
                    onClick={() => setSelectedPlan(plan.id)}
                  >
                    {plan.badge && (
                      <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                        {plan.badge}
                      </Badge>
                    )}
                    
                    <div className="text-center mb-4">
                      <h3 className="font-bold text-lg mb-2">{plan.name}</h3>
                      <div className="text-3xl font-bold text-primary">
                        ${plan.pricePerProduct}
                        <span className="text-sm text-muted-foreground">/product</span>
                      </div>
                    </div>

                    <ul className="space-y-2 mb-6">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-start gap-2 text-sm">
                          <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>

                    <div className="text-center">
                      <div className="text-lg font-semibold">
                        Total: ${(migrationData.productCount * plan.pricePerProduct).toFixed(2)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        for {migrationData.productCount} products
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            {/* Order Summary */}
            <div className="space-y-6">
              <Card className="p-6">
                <h3 className="text-lg md:text-xl font-semibold mb-4 flex items-center gap-2">
                  <Package className="w-5 h-5 text-primary" />
                  What You're Getting
                </h3>
                
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span>From:</span>
                    <span className="font-bold capitalize">{migrationData.platform}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>To:</span>
                    <span className="font-bold capitalize">{migrationData.destinationPlatform}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Products:</span>
                    <span className="font-bold">{migrationData.productCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Speed:</span>
                    <span className="font-bold">{selectedPlanData?.name}</span>
                  </div>
                  <div className="border-t pt-4">
                    <div className="flex justify-between text-lg font-bold">
                      <span>Total:</span>
                      <span className="text-primary">${totalAmount.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">What happens next?</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                    You pay safely with Stripe
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full" />
                    Watch the robot work live
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-purple-500 rounded-full" />
                    See your products get copied
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-orange-500 rounded-full" />
                    Get email when it's done
                  </div>
                </div>
              </Card>

              <Button 
                onClick={handlePayment}
                disabled={isProcessing}
                className="w-full text-base md:text-lg py-4 md:py-6"
                size="lg"
              >
                {isProcessing ? (
                  "Opening payment..."
                ) : (
                  <>
                    Pay ${totalAmount.toFixed(2)} & Start
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </>
                )}
              </Button>

                 <div className="text-center text-xs text-muted-foreground">
                <Shield className="w-4 h-4 inline mr-1" />
                100% safe payment with PayPal. Your info is super secure.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Payment;