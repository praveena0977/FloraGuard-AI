export interface Prediction {
  id: string;
  timestamp: number;
  imageUrl: string;
  plantName: string;
  diseaseName: string;
  confidence: number;
  description: string;
  recommendations: string[];
}

export interface User {
  email: string;
  name: string;
}
