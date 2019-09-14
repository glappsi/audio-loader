export interface IOptions {
  withVisualization: boolean;
  oneSoundPerRequest: boolean;
  withLoadingBar: boolean;
  colors?: {
    primary: string;
    secondary: string;
    wave?: {
      shadow: string;
      accent: string;
    };
  };
}
