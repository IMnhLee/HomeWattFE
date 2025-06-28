import { useState, useEffect } from "react";
import { Box, Typography, Paper, useTheme, useMediaQuery, ToggleButtonGroup, ToggleButton } from "@mui/material";
import { tokens } from "../../theme";
import Header from "../../components/Header";
import StackBarChart from "../../components/StackBarChart";
import PieChart from "../../components/PieChart";
import ElectricBoltIcon from '@mui/icons-material/ElectricBolt';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import LocalAtmIcon from '@mui/icons-material/LocalAtm';
import PaymentsIcon from '@mui/icons-material/Payments';
import energyApi from "../../services/energy"; // Import the energy API

// Device colors palette (used for API data)
const DEVICE_COLORS = [
  "#6870fa", "#4cceac", "#ffcc00", "#db4f4a", 
  "#7e57c2", "#26c6da", "#ff7043", "#008080", "#ff69b4",
  "#8a2be2", "#00ff00", "#ff4500", "#4b0082", "#ffd700",
  "#00bfff", "#ff1493", "#00ced1", "#ff6347", "#7fff00"
];

const Dashboard = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  // State for chart data view selection (energy or cost)
  const [chartView, setChartView] = useState('energy');
  const [isLoading, setIsLoading] = useState(true);

  // Data structure for consumption and costs
  const [consumptionData, setConsumptionData] = useState({
    total: 0,
    cost: 0,
    currentRate: 2000,
    hourlyData: [],
    categoryDistribution: []
  });

  // View toggle handler
  const handleViewChange = (event, newView) => {
    if (newView !== null) {
      setChartView(newView);
    }
  };

  // Fetch data from API
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Call the API
        const response = await energyApi.getConsumptionInOneCycle();
        const apiData = response.data;
        
        // Extract basic metrics
        const total = apiData.totalEnergy;
        const cost = apiData.totalCost;
        const currentRate = apiData.currentPrice;
        
        // Transform chart data - each day entry becomes an hourly data point
        // For simplicity, we'll treat each day as a separate "hour" for the chart
        const hourlyData = apiData.chartData.map(day => {
          // Parse ISO date string directly - no manual parsing needed
          const date = new Date(day.label);
          
          // Create a data object with the date and all device values
          return {
            date: date.getTime(),
            ...Object.fromEntries(
              Object.entries(day.data).map(([deviceId, value]) => [
                apiData.lineNames[deviceId] || deviceId, // Use friendly name if available
                value // Energy value
              ])
            ),
            Total: day.totalEnergy
          };
        });
        
        // Create category distribution for pie chart with device colors
        const categoryDistribution = Object.entries(apiData.lineNames).map(([deviceId, name], index) => ({
          name: name,
          value: apiData.lineEnergy[deviceId] || 0,
          cost: apiData.lineCosts[deviceId] || 0,
          color: DEVICE_COLORS[index % DEVICE_COLORS.length] // Add color property
        })).filter(item => item.value > 0); // Remove zero-consumption devices
        
        setConsumptionData({
          total: total.toFixed(2),
          cost: cost.toFixed(0),
          currentRate: currentRate,
          hourlyData,
          categoryDistribution
        });
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []); // No dependency on timeRange anymore

  // Stack bar chart configuration
  const getStackedBarOptions = () => {
    // Create series from categories
    const series = consumptionData.categoryDistribution.map(cat => ({
      name: cat.name,
      type: 'bar',
      stack: 'total',
      itemStyle: { color: cat.color }, // Use device color
      // emphasis: { focus: 'series' }, // Highlight on hover
      data: consumptionData.hourlyData.map(hour => [
        hour.date, 
        chartView === 'energy' ? (hour[cat.name] || 0) : (hour[cat.name] || 0) * consumptionData.currentRate
      ])
    }));

    return {
      title: {
        text: chartView === 'energy' 
          ? `Năng lượng tiêu thụ theo thiết bị` 
          : `Chi phí theo thiết bị`,
        left: 'center',
        textStyle: {
          color: colors.grey[100]
        }
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
        formatter: function(params) {
          // Get date from timestamp
          const date = new Date(params[0].value[0]);
          const dateString = date.toLocaleDateString();
          
          // Create header
          let tooltip = `<div style="font-weight: bold; margin-bottom: 8px">${dateString}</div>`;
          
          // Calculate total
          let sum = 0;
          params.forEach(param => sum += param.value[1]);
          
          // Sort by the same order as series (categoryDistribution order)
          const seriesOrder = consumptionData.categoryDistribution.map(cat => cat.name);
          params.sort((a, b) => {
            const indexA = seriesOrder.indexOf(a.seriesName);
            const indexB = seriesOrder.indexOf(b.seriesName);
            return indexB - indexA;
          });
          
          // Add each device with value and percentage
          params.forEach(param => {
            if (param.value[1] === 0) return; // Skip zero values
            
            const value = param.value[1];
            const percentage = ((value / sum) * 100).toFixed(1);
            const unit = chartView === 'energy' ? 'kWh' : 'VND';
            
            // Format numbers with thousand separators
            const formattedValue = value.toLocaleString(undefined, {
              maximumFractionDigits: chartView === 'energy' ? 2 : 0
            });
            
            tooltip += `<div style="display: flex; align-items: center; margin: 3px 0">
              <span style="display: inline-block; width: 10px; height: 10px; border-radius: 50%; background-color: ${param.color}; margin-right: 5px"></span>
              <span>${param.seriesName}: ${formattedValue} ${unit}</span>
            </div>`;
          });
          
          // Add total at bottom with separator line
          const formattedSum = sum.toLocaleString(undefined, {
            maximumFractionDigits: chartView === 'energy' ? 2 : 0
          });
          
          tooltip += `
            <div style="margin-top: 8px; padding-top: 6px; border-top: 1px solid rgba(255,255,255,0.2); 
                     font-weight: bold; display: flex; justify-content: space-between">
              <span>Tổng:</span>
              <span>${formattedSum} ${chartView === 'energy' ? 'kWh' : 'VND'}</span>
            </div>`;
          
          return tooltip;
        }
      },
      legend: {
        data: consumptionData.categoryDistribution.map(cat => cat.name),
        bottom: 0,
        type: 'scroll',
        textStyle: {
          color: colors.grey[100]
        },
        pageIconColor: colors.grey[100],         // Color of the active arrows
        pageIconInactiveColor: colors.grey[300],        // Color of the inactive arrows
        pageTextStyle: {
          color: colors.primary[100] // Color of the page text
        },
        // pageIconSize: 12,                               // Size of the arrow icons
        // pageButtonItemGap: 5
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '10%',
        top: '15%',
        containLabel: true
      },
      xAxis: {
        type: 'time',
        // axisLabel: {
        //   formatter: function(value) {
        //     // Format date as day/month
        //     const date = new Date(value);
        //     return `${date.getDate()}/${date.getMonth() + 1}`;
        //   }
        // }
      },
      yAxis: {
        type: 'value',
        axisLabel: {
          formatter: function(value) {
            return value + (chartView === 'energy' ? ' kWh' : ' VND');
          }
        }
      },
      series: series
      // Remove the fixed color array since we're using device colors
    };
  };

  // Pie chart data
  const getPieChartData = () => {
    if (chartView === 'energy') {
      return {
        series: consumptionData.categoryDistribution.map(cat => parseFloat(cat.value.toFixed(2))),
        labels: consumptionData.categoryDistribution.map(cat => cat.name),
        colors: consumptionData.categoryDistribution.map(cat => cat.color), // Use device colors
        unit: "kWh"
      };
    } else {
      return {
        series: consumptionData.categoryDistribution.map(cat => parseFloat(cat.cost.toFixed(0))),
        labels: consumptionData.categoryDistribution.map(cat => cat.name),
        colors: consumptionData.categoryDistribution.map(cat => cat.color), // Use device colors
        unit: "VND"
      };
    }
  };

  return (
    <Box m="20px">
      {/* HEADER */}
      <Header title="Dashboard" subtitle="Tổng quan về tiêu thụ năng lượng" />

      {/* GRID & CHARTS */}
      <Box
        display="grid"
        gridTemplateColumns="repeat(12, 1fr)"
        gridAutoRows="auto"
        gap="20px"
      >
        {/* ENERGY CONSUMPTION CARD */}
        <Box
          gridColumn={{
            xs: "span 12",
            sm: "span 12",
            md: "span 6",
            xl: "span 4",
          }}
          backgroundColor={colors.primary[400]}
          component={Paper}
          elevation={3}
          sx={{ borderRadius: "12px", p: 3 }}
        >
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            mb={2}
          >
            <Typography variant="h5" color={colors.grey[100]} fontWeight="600">
              Năng lượng tiêu thụ
            </Typography>
            <ElectricBoltIcon sx={{ color: colors.greenAccent[500], fontSize: 32 }} />
          </Box>
          <Typography variant="h3" fontWeight="bold" sx={{ color: colors.greenAccent[500] }}>
            {consumptionData.total} kWh
          </Typography>
        </Box>

        {/* ELECTRICITY COST CARD */}
        <Box
          gridColumn={{
            xs: "span 12",
            sm: "span 12",
            md: "span 6",
            xl: "span 4",
          }}
          backgroundColor={colors.primary[400]}
          component={Paper}
          elevation={3}
          sx={{ borderRadius: "12px", p: 3 }}
        >
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            mb={2}
          >
            <Typography variant="h5" color={colors.grey[100]} fontWeight="600">
              Tiền điện tạm tính
            </Typography>
            <PaymentsIcon sx={{ color: colors.yellowAccent[500], fontSize: 32 }} />
          </Box>
          <Typography variant="h3" fontWeight="bold" sx={{ color: colors.yellowAccent[500] }}>
            {parseInt(consumptionData.cost).toLocaleString()} VND
          </Typography>
        </Box>

        {/* CURRENT PRICE CARD - SIMPLIFIED TO SHOW SINGLE RATE */}
        <Box
          gridColumn={{
            xs: "span 12",
            sm: "span 12",
            md: "span 6",
            xl: "span 4",
          }}
          component={Paper}
          backgroundColor={colors.primary[400]}
          elevation={3}
          sx={{ p: 3, borderRadius: "12px" }}
        >
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            mb={2}
          >
            <Typography variant="h5" color={colors.grey[100]} fontWeight="600">
              Giá điện hiện tại
            </Typography>
            <LocalAtmIcon sx={{ color: colors.blueAccent[500], fontSize: 32 }} />
          </Box>
          
          <Box
          >
            <Typography variant="h3" fontWeight="bold" color={colors.blueAccent[400]}>
              {consumptionData.currentRate.toLocaleString()} VND/kWh
            </Typography>
          </Box>
        </Box>

        {/* SELECTOR CONTROLS */}
        <Box
          gridColumn="span 12"
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          flexWrap="wrap"
          gap={2}
          mb={1}
        >
          <Box>
            <ToggleButtonGroup
              value={chartView}
              exclusive
              onChange={handleViewChange}
              aria-label="data view"
              sx={{
                '.MuiToggleButton-root': {
                  color: colors.grey[100],
                  borderColor: colors.grey[700],
                  '&.Mui-selected': {
                    backgroundColor: colors.blueAccent[700],
                    color: colors.grey[100],
                  }
                }
              }}
            >
              <ToggleButton value="energy">
                <ElectricBoltIcon sx={{ mr: 1 }} /> Điện năng (kWh)
              </ToggleButton>
              <ToggleButton value="cost">
                <AttachMoneyIcon sx={{ mr: 1 }} /> Chi phí (VND)
              </ToggleButton>
            </ToggleButtonGroup>
          </Box>
        </Box>

        {/* PIE CHART - INCREASED HEIGHT */}
        <Box
          gridColumn={{ xs: "span 12", lg: "span 4" }}
          gridRow="span 2"
          backgroundColor={colors.primary[400]}
          component={Paper}
          elevation={3}
          sx={{ 
            borderRadius: "12px", 
            p: 3,
            height: 500,  // Increased height from 400 to 500
            display: "flex",
            flexDirection: "column"
          }}
        >
          <Typography variant="h4" mb={2} align="center" fontWeight="bold" color={colors.grey[100]}>
            {chartView === 'energy' ? 'Năng lượng tiêu thụ' : 'Tiền điện'}
          </Typography>
          <Box sx={{ flexGrow: 1, minHeight: 0 }}>
            <PieChart data={getPieChartData()} height="100%" />
          </Box>
        </Box>

        {/* STACKED BAR CHART - INCREASED HEIGHT */}
        <Box
          gridColumn={{ xs: "span 12", lg: "span 8" }}
          gridRow="span 2"
          backgroundColor={colors.primary[400]}
          component={Paper}
          elevation={3}
          sx={{ 
            borderRadius: "12px", 
            p: 3,
            height: 500  // Increased height from 400 to 500
          }}
        >
          <StackBarChart customOptions={getStackedBarOptions()} />
        </Box>

      </Box>
    </Box>
  );
};

export default Dashboard;