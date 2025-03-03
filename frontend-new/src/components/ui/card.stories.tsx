import type { Meta, StoryObj } from '@storybook/react';
import {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
} from './card';
import { Button } from './button';

const meta: Meta<typeof Card> = {
  title: 'UI/Card',
  component: Card,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Card>;

export const Default: Story = {
  render: () => (
    <Card className="w-[350px]">
      <CardHeader>
        <CardTitle>Create Campaign</CardTitle>
        <CardDescription>Deploy your new marketing campaign in one click.</CardDescription>
      </CardHeader>
      <CardContent>
        <p>Configure your campaign settings and targeting options here.</p>
      </CardContent>
      <CardFooter>
        <Button>Save Campaign</Button>
      </CardFooter>
    </Card>
  ),
};

export const WithMultipleActions: Story = {
  render: () => (
    <Card className="w-[350px]">
      <CardHeader>
        <CardTitle>Campaign Metrics</CardTitle>
        <CardDescription>Your campaign performance at a glance</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <p>Clicks: 1,234</p>
          <p>Conversions: 123</p>
          <p>Revenue: $1,234.56</p>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline">Export</Button>
        <Button>View Details</Button>
      </CardFooter>
    </Card>
  ),
};

export const Simple: Story = {
  render: () => (
    <Card className="w-[350px]">
      <CardHeader>
        <CardTitle>Notification</CardTitle>
      </CardHeader>
      <CardContent>
        <p>You have a new message from your affiliate partner.</p>
      </CardContent>
    </Card>
  ),
};

export const WithoutHeader: Story = {
  render: () => (
    <Card className="w-[350px]">
      <CardContent>
        <p className="text-center font-medium">Quick Stats</p>
        <p className="text-center text-3xl font-bold">$1,234.56</p>
        <p className="text-center text-sm text-muted-foreground">Total Revenue</p>
      </CardContent>
      <CardFooter className="justify-center">
        <Button variant="ghost">View Report</Button>
      </CardFooter>
    </Card>
  ),
};