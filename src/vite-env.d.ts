declare module '*.css' {
    const content: string;
    export default content;
}

declare module '*.svg' {
    const content: string;
    export default content;
}

declare module '*.png' {
    const content: string;
    export default content;
}

declare module '*.jpg' {
    const content: string;
    export default content;
}

// Vite env – API URL and Firebase (optional; app has in-memory fallbacks)
interface ImportMetaEnv {
    readonly DEV?: boolean;
    readonly MODE?: string;
    readonly VITE_API_URL?: string;
    readonly VITE_APP_BUILD?: string;
    readonly VITE_ERROR_REPORTING_URL?: string;
    readonly VITE_RECAPTCHA_V3_SITE_KEY?: string;
    readonly VITE_FIREBASE_API_KEY?: string;
    readonly VITE_FIREBASE_AUTH_DOMAIN?: string;
    readonly VITE_FIREBASE_PROJECT_ID?: string;
    readonly VITE_FIREBASE_STORAGE_BUCKET?: string;
    readonly VITE_FIREBASE_MESSAGING_SENDER_ID?: string;
    readonly VITE_FIREBASE_APP_ID?: string;
    readonly VITE_FIREBASE_MEASUREMENT_ID?: string;
    readonly VITE_USE_FIREBASE_EMULATORS?: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}

declare module 'react-window' {
  import type { ComponentType, CSSProperties } from 'react';
  export const FixedSizeList: ComponentType<{
    children: (props: { index: number; style: CSSProperties }) => React.ReactNode;
    height: number;
    itemCount: number;
    itemSize: number;
    width: number | string;
    className?: string;
  }>;
}
