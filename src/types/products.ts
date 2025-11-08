export type ExtractionPreviewProduct = {
  id: string;
  sourceProductId?: string;
  name: string;
  price: number;
  description: string;
  type: string;
  image?: string;
  images?: string[];
  tags?: string[];
};
