import type { ReactNode } from "react";

type AppFrameProps = {
  children: ReactNode;
  description: string;
  eyebrow: string;
  title: string;
};

export function AppFrame({ children, description, eyebrow, title }: AppFrameProps) {
  return (
    <main
      style={{
        margin: "0 auto",
        maxWidth: 960,
        minHeight: "100vh",
        padding: "56px 20px"
      }}
    >
      <header style={{ marginBottom: 28 }}>
        <p
          style={{
            color: "#315c45",
            fontSize: 14,
            fontWeight: 800,
            margin: "0 0 10px"
          }}
        >
          {eyebrow}
        </p>
        <h1
          style={{
            fontSize: 44,
            lineHeight: 1.1,
            margin: 0
          }}
        >
          {title}
        </h1>
        <p
          style={{
            color: "#4f5a52",
            fontSize: 18,
            lineHeight: 1.6,
            margin: "16px 0 0",
            maxWidth: 640
          }}
        >
          {description}
        </p>
      </header>
      {children}
    </main>
  );
}
