// src/stories/CampaignManagement.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import CampaignManagement from '../components/campaigns/CampaignManagement';

const meta = {
  title: 'Campaign/Management',
  component: CampaignManagement,
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof CampaignManagement>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};