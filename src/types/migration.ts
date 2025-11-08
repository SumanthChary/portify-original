import type { StoredUniversalProduct } from "@/services/MigrationSessionService";
import type { ExtractionPreviewProduct } from "@/types/products";

export type MigrationAutomationMode = "api" | "browser" | "hybrid";

export interface MigrationRuntimeData {
  sessionId: string;
  products: Array<StoredUniversalProduct | ExtractionPreviewProduct>;
  productIds: string[];
  productCount: number;
  sourcePlatform: string;
  destinationPlatform: string;
  automationMode: MigrationAutomationMode;
  selectedProducts?: ExtractionPreviewProduct[];
  useZapier?: boolean;
  zapierWebhookUrl?: string;
  paymentInitiated?: boolean;
  plan?: "basic" | "standard" | "premium";
  paymentProvider?: "paypal" | "dodo";
  paymentId?: string | null;
  paymentStatus?: "pending" | "paid" | "bypassed";
  initiatedAt?: string;
  totalAmount?: number;
  jobId?: string;
}
