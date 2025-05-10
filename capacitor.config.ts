import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'cloud.flowline.app',
  appName: 'FlowLine',
  webDir: 'build',
  server: {
    androidScheme: 'https',
    allowNavigation: ['*']
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#3B82F6',
      showSpinner: true,
      spinnerColor: '#FFFFFF'
    }
  },
  android: {
    allowMixedContent: true
  }
};

export default config;