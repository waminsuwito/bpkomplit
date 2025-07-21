import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.ptfrp.app',
  appName: 'PT FRP App',
  webDir: 'out',
  server: {
    androidScheme: 'https'
  }
};

export default config;
