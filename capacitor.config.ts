import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "life.sinhon.app",
  appName: "신혼생활",
  // 라이브 서버를 WebView로 로드 (API Routes 유지)
  server: {
    url: "https://sinhon.life",
    cleartext: false,
  },
  plugins: {
    PushNotifications: {
      presentationOptions: ["badge", "sound", "alert"],
    },
  },
  ios: {
    contentInset: "automatic",
    backgroundColor: "#FAFAF8",
    preferredContentMode: "mobile",
    scheme: "신혼생활",
  },
  android: {
    backgroundColor: "#FAFAF8",
    allowMixedContent: false,
  },
};

export default config;
