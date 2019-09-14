export interface IOptions {
  withVisualization: boolean;
  oneSoundPerRequest: boolean;
  withProgressBar: boolean;
  colors?: {
    primary: string;
    secondary: string;
    wave?: {
      shadow: string;
      accent: string;
    };
  };
}
