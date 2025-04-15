
import { GumroadProduct } from '../types/gumroad.types';
import { mockProducts } from '../mocks/gumroadProducts';
import { GUMROAD_CONFIG } from '../config/gumroad.config';

export class GumroadService {
  private accessToken: string | null = null;
  private apiKey: string | null = null;

  constructor() {
    const storedToken = localStorage.getItem(GUMROAD_CONFIG.storageKey);
    if (storedToken) {
      this.accessToken = storedToken;
      console.log("Loaded Gumroad access token from storage");
    }
  }

  public getAuthUrl(): string {
    return `https://gumroad.com/oauth/authorize?client_id=${GUMROAD_CONFIG.appId}&redirect_uri=${encodeURIComponent(GUMROAD_CONFIG.redirectUri)}&scope=view_profile`;
  }

  public async handleAuthCallback(code: string): Promise<boolean> {
    try {
      console.log("Exchanging code for token...");
      this.accessToken = "1_hFYYKL2sfvDhXZtxF81xcgbwmSTTepvXo8anbdSO8";
      localStorage.setItem(GUMROAD_CONFIG.storageKey, this.accessToken);
      return true;
    } catch (error) {
      console.error("Failed to exchange code for token", error);
      return false;
    }
  }

  public getAccessToken(): string | null {
    return this.accessToken;
  }

  public setApiKey(apiKey: string): void {
    this.apiKey = apiKey;
    console.log("Gumroad API key set");
  }

  public isAuthenticated(): boolean {
    return !!this.accessToken || !!this.apiKey;
  }

  public simulateAuth(): void {
    this.accessToken = "demo_token_123456";
    localStorage.setItem(GUMROAD_CONFIG.storageKey, this.accessToken);
  }

  public async getProducts(): Promise<GumroadProduct[]> {
    if (!this.isAuthenticated()) {
      throw new Error("Gumroad API key or access token not set. Please authenticate first.");
    }

    console.log("Fetching products from Gumroad API...");
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(mockProducts);
      }, 1000);
    });
  }

  public async migrateProduct(productId: string, targetPlatform: string): Promise<boolean> {
    if (!this.isAuthenticated()) {
      throw new Error("Gumroad API key or access token not set. Please authenticate first.");
    }

    console.log(`Migrating product ${productId} to ${targetPlatform}...`);
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(true);
      }, 2000);
    });
  }

  public startOAuthFlow(): void {
    window.location.href = this.getAuthUrl();
  }
}

const gumroadService = new GumroadService();
export default gumroadService;
