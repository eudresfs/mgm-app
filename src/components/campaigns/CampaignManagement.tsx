import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Container,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  TextField,
  InputAdornment,
  IconButton,
  Chip,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tooltip,
  Paper,
  Tab,
  Tabs,
  CircularProgress,
  Alert,
  Snackbar
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import AddIcon from '@mui/icons-material/Add';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { CampaignCreation } from './CampaignCreation';
import { CampaignMetrics } from './CampaignMetrics';

interface Campaign {
  id: string;
  name: string;
  status: 'active' | 'draft' | 'paused' | 'ended';
  type: string;
  affiliates: number;
  conversions: number;
  budget: {
    spent: number;
    total: number;
  };
  startDate: string;
  endDate?: string;
}

const CampaignManagement: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAnchorEl, setFilterAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [actionMenuAnchorEl, setActionMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedTab, setSelectedTab] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState<{message: string, type: 'success' | 'error' | 'info'} | null>(null);

  // Mock data for demonstration
  const campaigns: Campaign[] = [
    {
      id: '1',
      name: 'Summer Sale 2023',
      status: 'active',
      type: 'CPS',
      affiliates: 125,
      conversions: 1250,
      budget: { spent: 15000, total: 50000 },
      startDate: '2023-06-01',
      endDate: '2023-08-31',
    },
    {
      id: '2',
      name: 'Black Friday 2023',
      status: 'draft',
      type: 'CPA',
      affiliates: 0,
      conversions: 0,
      budget: { spent: 0, total: 75000 },
      startDate: '2023-11-20',
      endDate: '2023-11-30',
    },
    {
      id: '3',
      name: 'Referral Program Q4',
      status: 'active',
      type: 'CPL',
      affiliates: 78,
      conversions: 450,
      budget: { spent: 8500, total: 25000 },
      startDate: '2023-10-01',
      endDate: '2023-12-31',
    }
  ];

  // Simulate data loading
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setIsLoading(false);
    };
    
    loadData();
  }, []);

  const handleFilterClick = useCallback((event: React.MouseEvent<HTMLElement>) => {
    setFilterAnchorEl(event.currentTarget);
  }, []);

  const handleFilterClose = useCallback(() => {
    setFilterAnchorEl(null);
  }, []);

  const handleActionClick = useCallback((event: React.MouseEvent<HTMLElement>, campaign: Campaign) => {
    setSelectedCampaign(campaign);
    setActionMenuAnchorEl(event.currentTarget);
  }, []);

  const handleActionClose = useCallback(() => {
    setActionMenuAnchorEl(null);
    setSelectedCampaign(null);
  }, []);

  const handleCreateCampaign = useCallback(() => {
    setIsCreateDialogOpen(true);
  }, []);

  const handleTabChange = useCallback((event: React.SyntheticEvent, newValue: number) => {
    setSelectedTab(newValue);
  }, []);

  const handleCloseNotification = useCallback(() => {
    setNotification(null);
  }, []);

  const handleCampaignAction = useCallback((action: 'edit' | 'duplicate' | 'delete', campaign: Campaign) => {
    switch (action) {
      case 'edit':
        // Implement edit functionality
        setNotification({
          message: 'Edit functionality will be implemented soon',
          type: 'info'
        });
        break;
      case 'duplicate':
        // Implement duplicate functionality
        setNotification({
          message: 'Campaign duplicated successfully',
          type: 'success'
        });
        break;
      case 'delete':
        // Implement delete functionality
        setNotification({
          message: 'Campaign deleted successfully',
          type: 'success'
        });
        break;
    }
    handleActionClose();
  }, [handleActionClose]);

  const getStatusColor = (status: string) => {
    const colors = {
      active: 'success',
      draft: 'default',
      paused: 'warning',
      ended: 'error',
    };
    return colors[status as keyof typeof colors];
  };

  return (
    <Container maxWidth="lg" className="py-8">
      <Box className="mb-8">
        <Grid container spacing={3}>
          <Grid item xs={12} className="flex justify-between items-center mb-6">
            <Typography variant="h4" component="h1" className="text-3xl font-bold">
              Campaign Management
            </Typography>
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={handleCreateCampaign}
              className="bg-blue-600 hover:bg-blue-700 transition-colors duration-200"
            >
              Create Campaign
            </Button>
          </Grid>

          <Grid item xs={12}>
            <Paper className="mb-6 overflow-hidden">
              <Tabs 
                value={selectedTab} 
                onChange={handleTabChange} 
                className="border-b border-gray-200"
                indicatorColor="primary"
                textColor="primary"
              >
                <Tab label="All Campaigns" />
                <Tab label="Active" />
                <Tab label="Drafts" />
                <Tab label="Ended" />
              </Tabs>
            </Paper>
          </Grid>

          <Grid item xs={12}>
            <Box className="flex gap-4 mb-6">
              <TextField
                fullWidth
                variant="outlined"
                placeholder="Search campaigns..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
                className="bg-white"
              />
              <IconButton onClick={handleFilterClick} className="bg-gray-100 hover:bg-gray-200 transition-colors duration-200">
                <FilterListIcon />
              </IconButton>
            </Box>
          </Grid>

          {isLoading ? (
            <Grid item xs={12} className="flex justify-center items-center py-12">
              <CircularProgress />
            </Grid>
          ) : (
            campaigns.map((campaign) => (
              <Grid item xs={12} key={campaign.id}>
                <Card className="hover:shadow-md transition-shadow duration-200">
                  <CardContent>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="h6" gutterBottom className="font-semibold">
                          {campaign.name}
                        </Typography>
                        <Box className="flex gap-2 mb-2">
                          <Chip
                            label={campaign.status.toUpperCase()}
                            color={getStatusColor(campaign.status) as 'default' | 'success' | 'warning' | 'error'}
                            size="small"
                            className="text-xs"
                          />
                          <Chip label={campaign.type} size="small" className="text-xs bg-gray-100" />
                        </Box>
                      </Grid>
                      <Grid item xs={12} sm={6} className="text-right">
                        <Typography variant="body2" color="textSecondary" className="mb-1">
                          Budget: ${campaign.budget.spent.toLocaleString()} / ${campaign.budget.total.toLocaleString()}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          {campaign.affiliates} Affiliates • {campaign.conversions} Conversions
                        </Typography>
                      </Grid>
                    </Grid>
                  </CardContent>
                  <CardActions className="justify-end">
                    <IconButton 
                      size="small" 
                      onClick={(e) => handleActionClick(e, campaign)}
                      className="hover:bg-gray-100 transition-colors duration-200"
                    >
                      <MoreVertIcon />
                    </IconButton>
                  </CardActions>
                </Card>
              </Grid>
            ))
          )}
        </Grid>
      </Box>

      <CampaignMetrics campaignId={selectedCampaign?.id || ''} />

      <Snackbar
        open={!!notification}
        autoHideDuration={6000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={handleCloseNotification}
          severity={notification?.type || 'info'}
          variant="filled"
          className="w-full"
        >
          {notification?.message}
        </Alert>
      </Snackbar>

      {/* Filter Menu */}
      <Menu
        anchorEl={filterAnchorEl}
        open={Boolean(filterAnchorEl)}
        onClose={handleFilterClose}
        className="mt-2"
      >
        <MenuItem className="px-4 py-2 hover:bg-gray-100">Commission Type</MenuItem>
        <MenuItem className="px-4 py-2 hover:bg-gray-100">Date Range</MenuItem>
        <MenuItem className="px-4 py-2 hover:bg-gray-100">Budget Range</MenuItem>
      </Menu>

      {/* Action Menu */}
      <Menu
        anchorEl={actionMenuAnchorEl}
        open={Boolean(actionMenuAnchorEl)}
        onClose={handleActionClose}
        className="mt-2"
      >
        <MenuItem 
          className="px-4 py-2 hover:bg-gray-100" 
          onClick={() => selectedCampaign && handleCampaignAction('edit', selectedCampaign)}
        >
          <EditIcon fontSize="small" className="mr-2 text-blue-600" /> Edit
        </MenuItem>
        <MenuItem 
          className="px-4 py-2 hover:bg-gray-100"
          onClick={() => selectedCampaign && handleCampaignAction('duplicate', selectedCampaign)}
        >
          <ContentCopyIcon fontSize="small" className="mr-2 text-green-600" /> Duplicate
        </MenuItem>
        <MenuItem 
          className="px-4 py-2 hover:bg-gray-100 text-red-600"
          onClick={() => selectedCampaign && handleCampaignAction('delete', selectedCampaign)}
        >
          <DeleteIcon fontSize="small" className="mr-2" /> Delete
        </MenuItem>
      </Menu>

      {/* Create Campaign Dialog */}
      <Dialog
        open={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Create New Campaign</DialogTitle>
        <DialogContent>
          <CampaignCreation
            onSave={() => {
              setIsCreateDialogOpen(false);
              setNotification({
                message: 'Campaign created successfully!',
                type: 'success'
              });
            }}
            onCancel={() => setIsCreateDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog */}
      <Dialog
        open={!!selectedCampaign && actionMenuAnchorEl !== null}
        onClose={handleActionClose}
        aria-labelledby="confirm-dialog-title"
        aria-describedby="confirm-dialog-description"
      >
        <DialogTitle id="confirm-dialog-title">
          Confirm Action
        </DialogTitle>
        <DialogContent id="confirm-dialog-description">
          <Typography>
            Are you sure you want to delete the campaign "{selectedCampaign?.name}"? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleActionClose} color="primary">
            Cancel
          </Button>
          <Button
            onClick={() => selectedCampaign && handleCampaignAction('delete', selectedCampaign)}
            color="error"
            variant="contained"
            autoFocus
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default CampaignManagement;