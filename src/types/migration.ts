import type { StoredUniversalProduct } from "@/services/MigrationSessionService";

export type MigrationAutomationMode = "api" | "browser" | "hybrid";

export interface MigrationRuntimeData {
  sessionId: string;
  products: StoredUniversalProduct[];
  productIds: string[];
  productCount: number;
  sourcePlatform: string;
  destinationPlatform: string;
  automationMode: MigrationAutomationMode;
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
