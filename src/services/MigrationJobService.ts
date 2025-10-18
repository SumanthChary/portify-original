import { supabase } from "@/integrations/supabase/client";

export type AutomationMode = "api" | "browser" | "hybrid";

export interface CreateMigrationJobPayload {
  sessionId: string;
  plan: string;
  destinationPlatform: string;
  automationMode: AutomationMode;
  productIds: string[];
  totalAmount?: number | null;
  currency?: string;
  paymentId?: string | null;
  paymentStatus?: "pending" | "paid" | "failed" | "refunded" | "bypassed";
  workerEndpoint?: string | null;
  metadata?: Record<string, unknown>;
}

export async function createMigrationJob(payload: CreateMigrationJobPayload) {
  const {
    sessionId,
    plan,
    destinationPlatform,
    automationMode,
    productIds,
    totalAmount,
    currency = "USD",
    paymentId = null,
    paymentStatus = "pending",
    workerEndpoint = null,
    metadata = {},
  } = payload;

  if (!sessionId) {
    throw new Error("Session ID is required");
  }

  if (productIds.length === 0) {
    throw new Error("At least one product ID must be provided");
  }

  const { data, error } = await supabase.functions.invoke("create-migration-job", {
    body: {
      sessionId,
      plan,
      destinationPlatform,
      automationMode,
      productIds,
      totalAmount,
      currency,
      paymentId,
      paymentStatus,
      workerEndpoint,
      metadata,
    },
  });

  if (error) {
    throw new Error(error.message || "Failed to create migration job");
  }

  return data as { jobId: string };
}
