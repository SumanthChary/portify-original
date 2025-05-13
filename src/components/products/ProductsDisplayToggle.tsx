
import { Button } from "@/components/ui/button";
import { Grid2X2, LayoutList } from "lucide-react";

interface ProductsDisplayToggleProps {
  displayMode: 'grid' | 'table';
  setDisplayMode: (mode: 'grid' | 'table') => void;
}

export const ProductsDisplayToggle = ({ displayMode, setDisplayMode }: ProductsDisplayToggleProps) => {
  return (
    <div className="flex gap-2">
      <Button 
        variant={displayMode === 'grid' ? "default" : "outline"} 
        onClick={() => setDisplayMode('grid')}
      >
        <Grid2X2 className="w-4 h-4 mr-2" /> Grid View
      </Button>
      <Button 
        variant={displayMode === 'table' ? "default" : "outline"} 
        onClick={() => setDisplayMode('table')}
      >
        <LayoutList className="w-4 h-4 mr-2" /> Table View
      </Button>
    </div>
  );
};
