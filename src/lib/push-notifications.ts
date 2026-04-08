import { Capacitor } from "@capacitor/core";
import { PushNotifications } from "@capacitor/push-notifications";

export async function initPushNotifications() {
  // 네이티브 환경에서만 실행 (웹에서는 무시)
  if (!Capacitor.isNativePlatform()) return;

  const permission = await PushNotifications.requestPermissions();
  if (permission.receive !== "granted") return;

  await PushNotifications.register();

  PushNotifications.addListener("registration", (token) => {
    console.log("Push registration token:", token.value);
    // TODO: 서버에 토큰 저장 (사용자 인증 연동 후)
  });

  PushNotifications.addListener("registrationError", (err) => {
    console.error("Push registration error:", err.error);
  });

  PushNotifications.addListener("pushNotificationReceived", (notification) => {
    console.log("Push received:", notification);
  });

  PushNotifications.addListener("pushNotificationActionPerformed", (action) => {
    const url = action.notification.data?.url;
    if (url) {
      window.location.href = url;
    }
  });
}
