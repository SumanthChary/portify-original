
// This is a lightweight alternative to using the full puppeteer package
// The actual puppeteer functionality is only used in server scripts, not in the main app

export const createMockBrowser = () => {
  console.log("Creating mock browser - for production use only actual puppeteer in server scripts");
  return {
    newPage: () => ({
      goto: async () => Promise.resolve(),
      type: async () => Promise.resolve(),
      click: async () => Promise.resolve(),
      waitForNavigation: async () => Promise.resolve(),
      waitForSelector: async () => Promise.resolve(),
      evaluate: async (fn: Function) => Promise.resolve(fn()),
      content: async () => Promise.resolve(""),
      close: async () => Promise.resolve(),
    }),
    close: async () => Promise.resolve(),
  };
};

// This is a placeholder function that would use real puppeteer in production
export const runPuppeteerScript = async (scriptFn: Function) => {
  console.log("Puppeteer script would run in production environment");
  return { success: true, message: "Puppeteer script mock completed" };
};
