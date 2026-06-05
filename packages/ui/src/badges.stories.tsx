import type { Meta, StoryObj } from "@storybook/react-vite";
import { ApprovalBadge, SourceBadge, TrustBadge } from "./badges";

const meta = {
  tags: ["autodocs"],
  title: "UI/Badges"
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

export const TrustBadgeStory: Story = {
  name: "TrustBadge",
  render: () => <TrustBadge verifiedAt="2026. 6. 3." />
};

export const SourceBadgeStory: Story = {
  name: "SourceBadge",
  render: () => <SourceBadge sourceLabel="서울시 공고문" sourceUpdatedAt="2026. 6. 1." />
};

export const ApprovalBadgeStory: Story = {
  name: "ApprovalBadge",
  render: () => (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
      <ApprovalBadge status="approved" />
      <ApprovalBadge status="pending" />
      <ApprovalBadge status="rejected" />
    </div>
  )
};
