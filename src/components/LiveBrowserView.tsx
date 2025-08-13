import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Monitor, Maximize2, Minimize2 } from "lucide-react";

interface LiveBrowserViewProps {
  isActive: boolean;
  currentAction?: string;
}

const LiveBrowserView = ({ isActive, currentAction }: LiveBrowserViewProps) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [screenshot, setScreenshot] = useState<string>("");
  
  // Simulate browser screenshots (in real implementation, these would come from Playwright)
  const mockScreenshots = [
    "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iIzI2MzIzOCIvPjx0ZXh0IHg9IjIwMCIgeT0iMTUwIiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSI+UGF5aGlwIExvZ2luPC90ZXh0PjwvZz48L3N2Zz4=",
    "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iIzE2MzI1OSIvPjx0ZXh0IHg9IjIwMCIgeT0iMTUwIiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSI+TmV3IFByb2R1Y3Q8L3RleHQ+PC9nPjwvc3ZnPg==",
    "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iIzA1OTY2OSIvPjx0ZXh0IHg9IjIwMCIgeT0iMTUwIiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSI+U3VjY2VzcyE8L3RleHQ+PC9nPjwvc3ZnPg=="
  ];

  useEffect(() => {
    if (isActive) {
      const interval = setInterval(() => {
        const randomScreenshot = mockScreenshots[Math.floor(Math.random() * mockScreenshots.length)];
        setScreenshot(randomScreenshot);
      }, 3000); // Update every 3 seconds

      return () => clearInterval(interval);
    }
  }, [isActive]);

  return (
    <Card className={`${isFullscreen ? 'fixed inset-4 z-50' : ''} bg-gradient-to-br from-background to-muted/20`}>
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Monitor className="w-5 h-5 text-primary" />
            <span className="font-semibold">Live Browser View</span>
            <Badge variant={isActive ? "default" : "secondary"}>
              {isActive ? "🟢 Live" : "⏸️ Waiting"}
            </Badge>
          </div>
          
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>

        <div className="relative">
          {/* Browser Frame */}
          <div className="bg-gray-200 rounded-t-lg p-2 flex items-center gap-2">
            <div className="flex gap-1">
              <div className="w-3 h-3 rounded-full bg-red-400"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
              <div className="w-3 h-3 rounded-full bg-green-400"></div>
            </div>
            <div className="bg-white rounded px-3 py-1 text-sm flex-1 text-gray-600">
              payhip.com/products/new
            </div>
          </div>
          
          {/* Browser Content */}
          <div className={`bg-white border border-gray-200 rounded-b-lg ${isFullscreen ? 'h-[calc(100vh-8rem)]' : 'h-64'} flex items-center justify-center overflow-hidden`}>
            {isActive && screenshot ? (
              <img 
                src={screenshot} 
                alt="Live browser screenshot" 
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="text-center text-muted-foreground">
                <Monitor className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>Browser will show here when automation starts</p>
              </div>
            )}
          </div>
          
          {/* Current Action Overlay */}
          {currentAction && isActive && (
            <div className="absolute bottom-4 left-4 right-4">
              <div className="bg-black/80 text-white px-3 py-2 rounded-lg text-sm">
                {currentAction}
              </div>
            </div>
          )}
          
          {/* Live Indicator */}
          {isActive && (
            <div className="absolute top-6 right-6">
              <div className="flex items-center gap-2 bg-red-500 text-white px-2 py-1 rounded text-xs">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                LIVE
              </div>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};

export default LiveBrowserView;