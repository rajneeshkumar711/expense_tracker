import React from 'react';
import { Grid, Paper, Typography, Box, Skeleton, CircularProgress } from '@mui/material';
import { PieChart } from '@mui/x-charts/PieChart';
import { BarChart } from '@mui/x-charts/BarChart';
import { Analytics } from '../types';

interface AnalyticsDashboardProps {
  analytics: Analytics | null;
  loading?: boolean;
}

const formatCategory = (category: string) => {
  return category
    .split('_')
    .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
    .join(' ');
};

const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ analytics, loading = false }) => {
  // Define color palette for pie chart
  const colorPalette = [
    '#1976d2', // blue
    '#dc004e', // pink
    '#9c27b0', // purple
    '#f57c00', // orange
    '#388e3c', // green
    '#d32f2f', // red
    '#0288d1', // light blue
    '#7b1fa2', // deep purple
    '#fbc02d', // yellow
    '#00796b', // teal
  ];

  if (loading || !analytics) {
    return (
      <Grid container spacing={3}>
        {/* Loading Summary Cards */}
        {[1, 2, 3, 4].map((i) => (
          <Grid item xs={12} sm={6} md={3} key={i}>
            <Paper 
              elevation={2}
              sx={{ 
                p: 3, 
                textAlign: 'center',
                borderRadius: 2,
              }}
            >
              <Skeleton variant="text" width="60%" height={30} sx={{ mx: 'auto' }} />
              <Skeleton variant="text" width="80%" height={50} sx={{ mx: 'auto', mt: 1 }} />
            </Paper>
          </Grid>
        ))}

        {/* Loading Charts */}
        {[1, 2].map((i) => (
          <Grid item xs={12} md={6} key={i}>
            <Paper 
              elevation={2}
              sx={{ 
                p: 3,
                borderRadius: 2,
                height: 400,
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <Skeleton variant="text" width="40%" height={30} />
              <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', mt: 2 }}>
                <CircularProgress size={60} />
              </Box>
            </Paper>
          </Grid>
        ))}

        {/* Loading Category Breakdown */}
        <Grid item xs={12}>
          <Paper 
            elevation={2}
            sx={{ 
              p: 3,
              borderRadius: 2,
            }}
          >
            <Skeleton variant="text" width="30%" height={30} />
            <Box sx={{ mt: 2 }}>
              {[1, 2, 3, 4].map((i) => (
                <Box key={i} sx={{ py: 1 }}>
                  <Skeleton variant="text" width="100%" height={40} />
                </Box>
              ))}
            </Box>
          </Paper>
        </Grid>
      </Grid>
    );
  }

  const categoryData = analytics.byCategory.map((item, index) => ({
    id: index,
    value: item.total,
    label: formatCategory(item.category),
    color: colorPalette[index % colorPalette.length],
  }));

  const statusData = analytics.byStatus.map((item) => ({
    status: item.status,
    total: item.total,
  }));

  return (
    <Grid container spacing={3}>
      {/* Summary Cards */}
      <Grid item xs={12} sm={6} md={3}>
        <Paper 
          elevation={2}
          sx={{ 
            p: 3, 
            textAlign: 'center',
            borderRadius: 2,
            backgroundColor: 'primary.main',
            color: 'white',
          }}
        >
          <Typography variant="h6" sx={{ opacity: 0.9, fontWeight: 600 }}>
            Total Expenses
          </Typography>
          <Typography variant="h3" fontWeight="bold" sx={{ mt: 1 }}>
            ${analytics.total.toFixed(2)}
          </Typography>
        </Paper>
      </Grid>

      <Grid item xs={12} sm={6} md={3}>
        <Paper 
          elevation={2}
          sx={{ 
            p: 3, 
            textAlign: 'center',
            borderRadius: 2,
            backgroundColor: 'secondary.main',
            color: 'white',
          }}
        >
          <Typography variant="h6" sx={{ opacity: 0.9, fontWeight: 600 }}>
            Total Count
          </Typography>
          <Typography variant="h3" fontWeight="bold" sx={{ mt: 1 }}>
            {analytics.count}
          </Typography>
        </Paper>
      </Grid>

      <Grid item xs={12} sm={6} md={3}>
        <Paper 
          elevation={2}
          sx={{ 
            p: 3, 
            textAlign: 'center',
            borderRadius: 2,
            backgroundColor: 'warning.main',
            color: 'white',
          }}
        >
          <Typography variant="h6" sx={{ opacity: 0.9, fontWeight: 600 }}>
            Pending Approval
          </Typography>
          <Typography variant="h3" fontWeight="bold" sx={{ mt: 1 }}>
            {analytics.pendingCount}
          </Typography>
        </Paper>
      </Grid>

      <Grid item xs={12} sm={6} md={3}>
        <Paper 
          elevation={2}
          sx={{ 
            p: 3, 
            textAlign: 'center',
            borderRadius: 2,
            backgroundColor: 'info.main',
            color: 'white',
          }}
        >
          <Typography variant="h6" sx={{ opacity: 0.9, fontWeight: 600 }}>
            Average Expense
          </Typography>
          <Typography variant="h3" fontWeight="bold" sx={{ mt: 1 }}>
            ${analytics.count > 0 ? (analytics.total / analytics.count).toFixed(2) : '0.00'}
          </Typography>
        </Paper>
      </Grid>

      {/* Expenses by Category - Pie Chart */}
      <Grid item xs={12} md={6}>
        <Paper 
          elevation={2}
          sx={{ 
            p: 3,
            borderRadius: 2,
          }}
        >
          <Typography variant="h6" gutterBottom fontWeight="700">
            Expenses by Category
          </Typography>
          {categoryData.length > 0 ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 2 }}>
              <PieChart
                series={[
                  {
                    data: categoryData,
                    highlightScope: { faded: 'global', highlighted: 'item' },
                    faded: { innerRadius: 30, additionalRadius: -30, color: 'gray' },
                  },
                ]}
                colors={colorPalette}
                width={400}
                height={280}
                margin={{ top: 10, bottom: 10, left: 10, right: 10 }}
                slotProps={{
                  legend: { hidden: true },
                }}
              />
              <Box 
                sx={{ 
                  display: 'flex', 
                  flexWrap: 'wrap', 
                  justifyContent: 'center', 
                  gap: 2,
                  mt: 2,
                  px: 2,
                }}
              >
                {categoryData.map((item) => (
                  <Box 
                    key={item.id} 
                    sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: 0.5 
                    }}
                  >
                    <Box
                      sx={{
                        width: 12,
                        height: 12,
                        borderRadius: '50%',
                        backgroundColor: item.color,
                      }}
                    />
                    <Typography variant="body2" fontSize="0.85rem">
                      {item.label}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Box>
          ) : (
            <Typography variant="body2" color="textSecondary" sx={{ mt: 2 }}>
              No data available
            </Typography>
          )}
        </Paper>
      </Grid>

      {/* Expenses by Status - Bar Chart */}
      <Grid item xs={12} md={6}>
        <Paper 
          elevation={2}
          sx={{ 
            p: 3,
            borderRadius: 2,
          }}
        >
          <Typography variant="h6" gutterBottom fontWeight="700">
            Expenses by Status
          </Typography>
          {statusData.length > 0 ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
              <BarChart
                xAxis={[{ scaleType: 'band', data: statusData.map((d) => d.status) }]}
                series={[{ data: statusData.map((d) => d.total) }]}
                width={400}
                height={300}
              />
            </Box>
          ) : (
            <Typography variant="body2" color="textSecondary" sx={{ mt: 2 }}>
              No data available
            </Typography>
          )}
        </Paper>
      </Grid>

      {/* Category Breakdown Table */}
      <Grid item xs={12}>
        <Paper 
          elevation={2}
          sx={{ 
            p: 3,
            borderRadius: 2,
          }}
        >
          <Typography variant="h6" gutterBottom fontWeight="700">
            Category Breakdown
          </Typography>
          <Box sx={{ mt: 2 }}>
            {analytics.byCategory.map((item) => (
              <Box
                key={item.category}
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  py: 1,
                  borderBottom: '1px solid #eee',
                }}
              >
                <Typography>{formatCategory(item.category)}</Typography>
                <Box sx={{ textAlign: 'right' }}>
                  <Typography variant="body1" fontWeight="bold">
                    ${item.total.toFixed(2)}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {item.count} {item.count === 1 ? 'expense' : 'expenses'}
                  </Typography>
                </Box>
              </Box>
            ))}
          </Box>
        </Paper>
      </Grid>
    </Grid>
  );
};

export default AnalyticsDashboard;
