// src/stories/CampaignMetrics.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { CampaignMetrics } from '../components/campaigns/CampaignMetrics';  // ajuste o caminho conforme necessário

const meta = {
  title: 'Campaign/Metrics',
  component: CampaignMetrics,
} satisfies Meta<typeof CampaignMetrics>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    campaignId: '1',
  },
};