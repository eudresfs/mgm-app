import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
  LinearProgress,
  Tooltip,
  IconButton,
} from '@mui/material';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';

interface MetricCardProps {
  title: string;
  value: string | number;
  description?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  progress?: {
    value: number;
    total: number;
  };
}

const MetricCard = React.memo<MetricCardProps>(({ title, value, description, trend, progress }) => (
  <Card className="h-full transition-shadow hover:shadow-lg">
    <CardContent className="p-4">
      <Box className="flex items-center justify-between mb-2">
        <Typography 
          variant="subtitle2" 
          color="textSecondary" 
          className="font-medium"
          component="h3"
          role="heading"
          aria-level={3}
        >
          {title}
          {description && (
            <Tooltip title={description} placement="top">
              <IconButton 
                size="small" 
                className="ml-1"
                aria-label={`Information about ${title.toLowerCase()}`}
              >
                <InfoOutlinedIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
        </Typography>
        {trend && (
          <Box className="flex items-center" role="status" aria-label={`${title} trend`}>
            {trend.isPositive ? (
              <TrendingUpIcon className="text-green-500" fontSize="small" aria-hidden="true" />
            ) : (
              <TrendingDownIcon className="text-red-500" fontSize="small" aria-hidden="true" />
            )}
            <Typography
              variant="body2"
              className={`ml-1 ${trend.isPositive ? 'text-green-500' : 'text-red-500'}`}
            >
              {trend.value}%
            </Typography>
          </Box>
        )}
      </Box>
      <Typography 
        variant="h4" 
        className="font-semibold mb-2"
        role="status"
        aria-label={`${title} value: ${value}`}
      >
        {value}
      </Typography>
      {progress && (
        <Box className="mt-2" role="progressbar" aria-valuenow={(progress.value / progress.total) * 100} aria-valuemin={0} aria-valuemax={100}>
          <LinearProgress
            variant="determinate"
            value={(progress.value / progress.total) * 100}
            className="rounded-full"
          />
          <Typography variant="caption" color="textSecondary" className="mt-1 block">
            {progress.value} of {progress.total}
          </Typography>
        </Box>
      )}
    </CardContent>
  </Card>
));

interface CampaignMetricsProps {
  campaignId: string;
}

export const CampaignMetrics: React.FC<CampaignMetricsProps> = ({ campaignId }) => {
  // Mock data - In real implementation, this would come from an API
  const metrics = {
    conversions: {
      value: 1250,
      trend: { value: 12.5, isPositive: true },
    },
    revenue: {
      value: '$45,678',
      trend: { value: 8.3, isPositive: true },
    },
    affiliates: {
      value: 125,
      description: 'Active affiliates in the last 30 days',
    },
    budget: {
      value: '$15,000',
      progress: { value: 15000, total: 50000 },
      description: 'Campaign budget utilization',
    },
  };

  return (
    <Box className="w-full py-4">
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Total Conversions"
            value={metrics.conversions.value}
            trend={metrics.conversions.trend}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Total Revenue"
            value={metrics.revenue.value}
            trend={metrics.revenue.trend}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Active Affiliates"
            value={metrics.affiliates.value}
            description={metrics.affiliates.description}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Budget Utilization"
            value={metrics.budget.value}
            description={metrics.budget.description}
            progress={metrics.budget.progress}
          />
        </Grid>
      </Grid>
    </Box>
  );
};