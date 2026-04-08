"use client";

import { useEffect } from "react";
import { initPushNotifications } from "@/lib/push-notifications";

export default function PushNotificationInit() {
  useEffect(() => {
    initPushNotifications();
  }, []);
  return null;
}
