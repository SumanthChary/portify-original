/**
 * Gumroad API Service
 * This is a basic implementation for connecting to the Gumroad API.
 * In a production environment, you would want to handle authentication
 * and API calls through a backend service for security reasons.
 */

export interface GumroadProduct {
  id: string;
  name: string;
  price: number;
  description: string;
  url: string;
  image?: string;
  // Add other product fields as needed
}

export class GumroadService {
  private accessToken: string | null = null;
  private mockProducts: GumroadProduct[] = [
    {
      id: "prod_1",
      name: "Digital Marketing Guide",
      description: "A comprehensive guide to digital marketing strategies",
      price: 29.99,
      url: "https://gumroad.com/l/marketing-guide",
      image: "https://picsum.photos/seed/marketing/600/400"
    },
    {
      id: "prod_2",
      name: "Photography Presets Bundle",
      description: "50 premium Lightroom presets for professional photographers",
      price: 19.99,
      url: "https://gumroad.com/l/photo-presets",
      image: "https://picsum.photos/seed/photography/600/400"
    },
    {
      id: "prod_3",
      name: "UX/UI Design Course",
      description: "Learn user experience and interface design from scratch",
      price: 99.99,
      url: "https://gumroad.com/l/ux-course",
      image: "https://picsum.photos/seed/uxdesign/600/400"
    },
    {
      id: "prod_4",
      name: "Fitness Workout Plan",
      description: "12-week home workout program with nutrition guide",
      price: 39.99,
      url: "https://gumroad.com/l/fitness-plan",
      image: "https://picsum.photos/seed/fitness/600/400"
    },
    {
      id: "prod_5",
      name: "Productivity Planner",
      description: "Digital planner with goal tracking and time management tools",
      price: 14.99,
      url: "https://gumroad.com/l/planner",
      image: "https://picsum.photos/seed/planner/600/400"
    },
    {
      id: "prod_6",
      name: "Stock Photo Collection",
      description: "500+ high resolution stock photos for commercial use",
      price: 49.99,
      url: "https://gumroad.com/l/stock-photos",
      image: "https://picsum.photos/seed/stockphoto/600/400"
    }
  ];

  private appId = "CAhiRwpTAZBDnjZoDCRe-uawd7Okkloe4WSxqc-0ABw";
  private appSecret = "_--WNQRuGaGw5uNRkg8RJuiD23ITgjL6hAOA50aXw9g";
  private redirectUri = "https://portify-original.lovable.app";
  
  constructor() {
    // Check if we have a stored access token in localStorage
    const storedToken = localStorage.getItem('gumroad_access_token');
    if (storedToken) {
      this.accessToken = storedToken;
      console.log("Loaded Gumroad access token from storage");
    }
  }
  
  /**
   * Get the OAuth authorization URL
   */
  public getAuthUrl(): string {
    return `https://gumroad.com/oauth/authorize?client_id=${this.appId}&redirect_uri=${encodeURIComponent(this.redirectUri)}&scope=view_profile`;
  }
  
  /**
   * Handle the OAuth callback and exchange code for token
   */
  public async handleAuthCallback(code: string): Promise<boolean> {
    try {
      // In a real implementation, this would be done on the server side
      // For security reasons, the app secret should never be exposed to the client
      console.log("Exchanging code for token...");
      
      // Simulating successful token exchange
      this.accessToken = "1_hFYYKL2sfvDhXZtxF81xcgbwmSTTepvXo8anbdSO8";
      localStorage.setItem('gumroad_access_token', this.accessToken);
      
      return true;
    } catch (error) {
      console.error("Failed to exchange code for token", error);
      return false;
    }
  }
  
  /**
   * Get the access token (for sending to n8n webhook)
   */
  public getAccessToken(): string | null {
    return this.accessToken;
  }
  
  /**
   * Set the API key for Gumroad authentication
   */
  public setApiKey(apiKey: string): void {
    this.apiKey = apiKey;
    console.log("Gumroad API key set");
  }
  
  /**
   * Check if the API key is set
   */
  public isAuthenticated(): boolean {
    return !!this.accessToken || !!this.apiKey;
  }
  
  /**
   * Get products from Gumroad
   * In a real implementation, this would make an actual API call
   */
  public async getProducts(): Promise<GumroadProduct[]> {
    if (!this.isAuthenticated()) {
      throw new Error("Gumroad API key or access token not set. Please authenticate first.");
    }
    
    // This is a mock implementation that would be replaced with an actual API call
    // For example: return fetch('https://api.gumroad.com/v2/products', { headers: { 'Authorization': `Bearer ${this.accessToken}` } })
    console.log("Fetching products from Gumroad API...");
    
    // Simulate API response
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([
          {
            id: "prod_1",
            name: "Digital Marketing Guide",
            price: 19.99,
            description: "Complete guide to digital marketing strategies",
            url: "https://gumroad.com/l/digital-marketing",
            image: "https://picsum.photos/seed/dm1/600/400"
          },
          {
            id: "prod_2",
            name: "UI Design Templates",
            price: 29.99,
            description: "Premium Figma UI kit for modern web design",
            url: "https://gumroad.com/l/ui-templates",
            image: "https://picsum.photos/seed/ui2/600/400"
          },
          {
            id: "prod_3",
            name: "JavaScript Course",
            price: 59.99,
            description: "Advanced JavaScript techniques and patterns",
            url: "https://gumroad.com/l/js-course",
            image: "https://picsum.photos/seed/js3/600/400"
          },
          {
            id: "prod_4",
            name: "SEO Mastery Bundle",
            price: 45.00,
            description: "Complete SEO toolkit to rank higher on Google",
            url: "https://gumroad.com/l/seo-mastery",
            image: "https://picsum.photos/seed/seo4/600/400"
          },
          {
            id: "prod_5",
            name: "Social Media Marketing Templates",
            price: 24.99,
            description: "Ready-to-use templates for Instagram, Facebook, and Twitter",
            url: "https://gumroad.com/l/social-templates",
            image: "https://picsum.photos/seed/sm5/600/400"
          }
        ]);
      }, 1000);
    });
  }
  
  /**
   * Migrate a product to another platform
   * This is a placeholder for the actual migration functionality
   */
  public async migrateProduct(productId: string, targetPlatform: string): Promise<boolean> {
    if (!this.isAuthenticated()) {
      throw new Error("Gumroad API key or access token not set. Please authenticate first.");
    }
    
    console.log(`Migrating product ${productId} to ${targetPlatform}...`);
    
    // Simulate API call
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(true);
      }, 2000);
    });
  }
  
  /**
   * Initialize OAuth flow
   */
  public startOAuthFlow(): void {
    window.location.href = this.getAuthUrl();
  }

  // Simulate auth for demo purposes
  public simulateAuth(): void {
    this.accessToken = "demo_token_123456";
    localStorage.setItem("gumroad_token", this.accessToken);
  }

  // Mock product fetching for demo
  public async getProducts(): Promise<GumroadProduct[]> {
    // In a real app, we would fetch from Gumroad API
    // For demo, return mock data
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay
    return this.mockProducts;
  }
}

const gumroadService = new GumroadService();
export default gumroadService;
