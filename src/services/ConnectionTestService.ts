
import { toast } from "sonner";

export class ConnectionTestService {
  private readonly webhookUrl = "https://portify-beta.app.n8n.cloud/webhook/migrate-gumroad";

  async testFullPipeline(): Promise<boolean> {
    try {
      console.log("🔄 Testing complete migration pipeline...");
      
      // Test 1: Basic webhook connectivity
      const connectivityTest = await this.testWebhookConnectivity();
      if (!connectivityTest) return false;
      
      // Test 2: Data validation and processing
      const dataTest = await this.testDataProcessing();
      if (!dataTest) return false;
      
      // Test 3: Database connectivity
      const dbTest = await this.testDatabaseConnection();
      if (!dbTest) return false;
      
      console.log("✅ All pipeline tests passed!");
      toast.success("🎉 Migration system is 100% ready!");
      return true;
      
    } catch (error) {
      console.error("❌ Pipeline test failed:", error);
      toast.error("⚠️ Pipeline test failed. Check console for details.");
      return false;
    }
  }

  private async testWebhookConnectivity(): Promise<boolean> {
    try {
      console.log("Testing webhook connectivity...");
      const response = await fetch(this.webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          test: true,
          connectivity_check: true,
          timestamp: new Date().toISOString()
        }),
      });

      if (response.ok) {
        console.log("✅ Webhook connectivity: PASSED");
        return true;
      } else {
        console.error("❌ Webhook connectivity: FAILED - HTTP", response.status);
        return false;
      }
    } catch (error) {
      console.error("❌ Webhook connectivity: FAILED -", error);
      return false;
    }
  }

  private async testDataProcessing(): Promise<boolean> {
    try {
      console.log("Testing data processing...");
      const testPayload = {
        user_email: "test@example.com",
        product_title: "Test Product - Pipeline Validation",
        description: "Test description for pipeline validation",
        price: "9.99",
        gumroad_product_id: `test_${Date.now()}`,
        test_mode: true
      };

      const response = await fetch(this.webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(testPayload),
      });

      if (response.ok) {
        console.log("✅ Data processing: PASSED");
        return true;
      } else {
        console.error("❌ Data processing: FAILED");
        return false;
      }
    } catch (error) {
      console.error("❌ Data processing: FAILED -", error);
      return false;
    }
  }

  private async testDatabaseConnection(): Promise<boolean> {
    try {
      console.log("Testing database connection...");
      // This will be tested through the Supabase integration
      const { supabase } = await import("@/integrations/supabase/client");
      
      const { data, error } = await supabase
        .from('migrations')
        .select('count')
        .limit(1);

      if (!error) {
        console.log("✅ Database connection: PASSED");
        return true;
      } else {
        console.error("❌ Database connection: FAILED -", error);
        return false;
      }
    } catch (error) {
      console.error("❌ Database connection: FAILED -", error);
      return false;
    }
  }

  async validateN8nConfiguration(): Promise<{
    isValid: boolean;
    issues: string[];
    recommendations: string[];
  }> {
    const issues: string[] = [];
    const recommendations: string[] = [];

    // Check environment variables
    try {
      const response = await fetch(this.webhookUrl + "/config", {
        method: "GET",
        headers: { "Content-Type": "application/json" }
      });
      
      if (!response.ok) {
        issues.push("N8n configuration endpoint not accessible");
        recommendations.push("Ensure n8n webhook is active and properly configured");
      }
    } catch (error) {
      issues.push("Cannot reach n8n configuration");
      recommendations.push("Check n8n instance status and network connectivity");
    }

    return {
      isValid: issues.length === 0,
      issues,
      recommendations
    };
  }
}

export const connectionTestService = new ConnectionTestService();
