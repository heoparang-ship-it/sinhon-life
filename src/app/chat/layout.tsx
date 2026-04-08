export default function ChatLayout({ children }: { children: React.ReactNode }) {
  return <div className="fixed inset-0 z-50 bg-warm-bg">{children}</div>;
}
