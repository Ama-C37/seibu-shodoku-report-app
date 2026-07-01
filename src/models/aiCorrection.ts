export type AiCorrection = {
  correctionId: string;
  originalText: string;
  correctedText: string;
  adoptedText: string;
  adopted: boolean;
  retryIndex?: number;
  createdAt: string;
};
