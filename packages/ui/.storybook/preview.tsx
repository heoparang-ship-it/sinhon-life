import type { Preview } from "@storybook/react-vite";

const preview: Preview = {
  decorators: [
    (Story) => (
      <div
        style={{
          background: "#f7f8f5",
          color: "#171717",
          fontFamily:
            'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
          minHeight: "100vh",
          padding: 24
        }}
      >
        <Story />
      </div>
    )
  ],
  parameters: {
    a11y: {
      test: "todo"
    },
    controls: {
      expanded: true
    },
    layout: "fullscreen"
  }
};

export default preview;
