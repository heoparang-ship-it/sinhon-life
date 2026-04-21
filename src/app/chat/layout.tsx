// Chat was a fullscreen fixed overlay pre-v9. We removed the overlay so the
// root layout's BottomNav stays visible — users asked to keep tab navigation
// accessible during AI conversations (2026-04-21).
export default function ChatLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
