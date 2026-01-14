/**
 * Global TypeScript declarations for the MANO app
 */

// Global __DEV__ flag
declare const __DEV__: boolean;

// Environment variables
declare module '@env' {
  export const API_BASE_URL: string;
  export const FIREBASE_WEB_API_KEY: string;
  export const STRIPE_PUBLISHABLE_KEY: string;
}

// Image imports
declare module '*.png' {
  const value: any;
  export default value;
}

declare module '*.jpg' {
  const value: any;
  export default value;
}

declare module '*.jpeg' {
  const value: any;
  export default value;
}

declare module '*.gif' {
  const value: any;
  export default value;
}

declare module '*.svg' {
  import { SvgProps } from 'react-native-svg';
  const content: React.FC<SvgProps>;
  export default content;
}
