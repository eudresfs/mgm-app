// src/stories/CampaignCreation.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { CampaignCreation } from '../components/campaigns/CampaignCreation';  // ajuste o caminho conforme necessário

const meta = {
  title: 'Campaign/Creation',
  component: CampaignCreation,
  parameters: {
    layout: 'padded',
  },
} satisfies Meta<typeof CampaignCreation>;

export default meta;
type Story = StoryObj<typeof meta>;

export const EmptyForm: Story = {
  args: {
    onSave: () => console.log('Save clicked'),
    onCancel: () => console.log('Cancel clicked'),
  },
};

export const WithData: Story = {
  args: {
    onSave: () => console.log('Save clicked'),
    onCancel: () => console.log('Cancel clicked'),
    // Você pode adicionar dados iniciais aqui se o componente aceitar
    initialData: {
      name: 'Example Campaign',
      description: 'This is a sample campaign',
      // outros campos conforme necessário
    },
  },
};