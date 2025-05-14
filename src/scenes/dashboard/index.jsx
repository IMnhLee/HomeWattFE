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

const Dashboard = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  // State for chart data view selection (energy or cost)
  const [chartView, setChartView] = useState('energy');
  const [isLoading, setIsLoading] = useState(true);

  // Mock data for consumption and costs - simplified to a single rate
  const [consumptionData, setConsumptionData] = useState({
    total: 0,
    cost: 0,
    currentRate: 2000, // Single rate: 2000 VND/kWh
    hourlyData: [],
    categoryDistribution: []
  });

  // View toggle handler
  const handleViewChange = (event, newView) => {
    if (newView !== null) {
      setChartView(newView);
    }
  };

  // Fetch mock data
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Specific mock data for a full day with realistic patterns
        const now = new Date();
        let hourlyData = [];
        
        // Predefined consumption patterns
        const mockHourlyData = [
          { hour: 0, Lighting: 0.2, HVAC: 0.8, Kitchen: 0.1, Electronics: 0.3, Other: 0.1 }, // 12 AM
          { hour: 1, Lighting: 0.1, HVAC: 0.7, Kitchen: 0.1, Electronics: 0.2, Other: 0.1 }, // 1 AM
          { hour: 2, Lighting: 0.1, HVAC: 0.6, Kitchen: 0.0, Electronics: 0.2, Other: 0.0 }, // 2 AM
          { hour: 3, Lighting: 0.1, HVAC: 0.6, Kitchen: 0.0, Electronics: 0.1, Other: 0.0 }, // 3 AM
          { hour: 4, Lighting: 0.2, HVAC: 0.5, Kitchen: 0.1, Electronics: 0.1, Other: 0.0 }, // 4 AM
          { hour: 5, Lighting: 0.3, HVAC: 0.5, Kitchen: 0.2, Electronics: 0.2, Other: 0.1 }, // 5 AM
          { hour: 6, Lighting: 0.4, HVAC: 0.6, Kitchen: 0.4, Electronics: 0.3, Other: 0.1 }, // 6 AM
          { hour: 7, Lighting: 0.4, HVAC: 0.7, Kitchen: 0.6, Electronics: 0.4, Other: 0.2 }, // 7 AM
          { hour: 8, Lighting: 0.3, HVAC: 0.8, Kitchen: 0.4, Electronics: 0.5, Other: 0.2 }, // 8 AM
          { hour: 9, Lighting: 0.2, HVAC: 0.9, Kitchen: 0.3, Electronics: 0.6, Other: 0.2 }, // 9 AM
          { hour: 10, Lighting: 0.2, HVAC: 1.0, Kitchen: 0.2, Electronics: 0.7, Other: 0.2 }, // 10 AM
          { hour: 11, Lighting: 0.2, HVAC: 1.1, Kitchen: 0.5, Electronics: 0.8, Other: 0.2 }, // 11 AM
          { hour: 12, Lighting: 0.2, HVAC: 1.2, Kitchen: 0.7, Electronics: 0.8, Other: 0.2 }, // 12 PM
          { hour: 13, Lighting: 0.2, HVAC: 1.3, Kitchen: 0.4, Electronics: 0.7, Other: 0.2 }, // 1 PM
          { hour: 14, Lighting: 0.2, HVAC: 1.4, Kitchen: 0.3, Electronics: 0.6, Other: 0.2 }, // 2 PM
          { hour: 15, Lighting: 0.2, HVAC: 1.3, Kitchen: 0.3, Electronics: 0.7, Other: 0.2 }, // 3 PM
          { hour: 16, Lighting: 0.3, HVAC: 1.2, Kitchen: 0.4, Electronics: 0.8, Other: 0.3 }, // 4 PM
          { hour: 17, Lighting: 0.4, HVAC: 1.3, Kitchen: 0.6, Electronics: 0.9, Other: 0.3 }, // 5 PM
          { hour: 18, Lighting: 0.6, HVAC: 1.4, Kitchen: 0.8, Electronics: 1.0, Other: 0.3 }, // 6 PM
          { hour: 19, Lighting: 0.7, HVAC: 1.3, Kitchen: 0.9, Electronics: 1.1, Other: 0.3 }, // 7 PM
          { hour: 20, Lighting: 0.7, HVAC: 1.2, Kitchen: 0.5, Electronics: 1.2, Other: 0.3 }, // 8 PM
          { hour: 21, Lighting: 0.6, HVAC: 1.1, Kitchen: 0.3, Electronics: 1.0, Other: 0.2 }, // 9 PM
          { hour: 22, Lighting: 0.5, HVAC: 1.0, Kitchen: 0.2, Electronics: 0.8, Other: 0.2 }, // 10 PM
          { hour: 23, Lighting: 0.3, HVAC: 0.9, Kitchen: 0.1, Electronics: 0.5, Other: 0.1 }, // 11 PM
        ];

        // Categories for aggregated data
        let categories = {
          "Lighting": 0,
          "HVAC": 0,
          "Kitchen": 0,
          "Electronics": 0,
          "Other": 0
        };

        // Calculate the total, create proper hourly data format
        let total = 0;
        
        mockHourlyData.forEach(hourData => {
          const date = new Date();
          date.setHours(hourData.hour, 0, 0, 0);
          
          const lighting = hourData.Lighting;
          const hvac = hourData.HVAC;
          const kitchen = hourData.Kitchen;
          const electronics = hourData.Electronics;
          const other = hourData.Other;
          
          const hourTotal = lighting + hvac + kitchen + electronics + other;
          total += hourTotal;
          
          categories.Lighting += lighting;
          categories.HVAC += hvac;
          categories.Kitchen += kitchen;
          categories.Electronics += electronics;
          categories.Other += other;
          
          hourlyData.push({
            date: date.getTime(),
            Lighting: lighting,
            HVAC: hvac,
            Kitchen: kitchen,
            Electronics: electronics,
            Other: other,
            Total: hourTotal
          });
        });

        // Calculate cost (fixed rate: 2000 VND per kWh)
        const cost = total * 2000;

        // Prepare category distribution for pie chart
        const categoryDistribution = Object.entries(categories).map(([name, value]) => ({
          name,
          value,
          cost: value * 2000
        }));

        setConsumptionData({
          ...consumptionData,
          total: total.toFixed(2),
          cost: cost.toFixed(0),
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
    const series = consumptionData.categoryDistribution.map(cat => ({
      name: cat.name,
      type: 'bar',
      stack: 'total',
      data: consumptionData.hourlyData.map(hour => [
        hour.date,
        chartView === 'energy' ? hour[cat.name] : hour[cat.name] * 2000
      ])
    }));

    return {
      title: {
        text: chartView === 'energy' 
          ? `Năng lượng tiêu thụ` 
          : `Tiền điện`,
        left: 'center',
        textStyle: {
          color: colors.grey[100]
        }
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
        formatter: function(params) {
          let tooltip = `<div style="font-weight: bold; margin-bottom: 5px">${new Date(params[0].value[0]).toLocaleString()}</div>`;
          let sum = 0;
          
          params.forEach(param => {
            const value = param.value[1];
            sum += value;
            tooltip += `<div style="display: flex; align-items: center; margin: 3px 0">
              <span style="display: inline-block; width: 10px; height: 10px; border-radius: 50%; background-color: ${param.color}; margin-right: 5px"></span>
              <span>${param.seriesName}: ${value.toLocaleString(undefined, {maximumFractionDigits: 2})} ${chartView === 'energy' ? 'kWh' : 'VND'}</span>
            </div>`;
          });
          
          tooltip += `<div style="margin-top: 5px; font-weight: bold">Total: ${sum.toLocaleString(undefined, {maximumFractionDigits: 2})} ${chartView === 'energy' ? 'kWh' : 'VND'}</div>`;
          return tooltip;
        }
      },
      legend: {
        data: consumptionData.categoryDistribution.map(cat => cat.name),
        bottom: 0,
        type: 'scroll',
        textStyle: {
          color: colors.grey[100]
        }
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
        axisLabel: {
          formatter: function(value) {
            const date = new Date(value);
            return date.getHours() + ':00';
          }
        }
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
    };
  };

  // Pie chart data
  const getPieChartData = () => {
    if (chartView === 'energy') {
      return {
        series: consumptionData.categoryDistribution.map(cat => parseFloat(cat.value.toFixed(2))),
        labels: consumptionData.categoryDistribution.map(cat => cat.name),
        colors: [
          colors.greenAccent[500], 
          colors.blueAccent[500], 
          colors.redAccent[500],
          colors.yellowAccent[500],
          colors.grey[400]
        ],
        unit: "kWh"
      };
    } else {
      return {
        series: consumptionData.categoryDistribution.map(cat => parseFloat(cat.cost.toFixed(0))),
        labels: consumptionData.categoryDistribution.map(cat => cat.name),
        colors: [
          colors.greenAccent[500], 
          colors.blueAccent[500], 
          colors.redAccent[500],
          colors.yellowAccent[500],
          colors.grey[400]
        ],
        unit: "VND"
      };
    }
  };

  return (
    <Box m="20px">
      {/* HEADER */}
      <Header title="Dashboard" subtitle="Energy Consumption Overview" />

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
                <ElectricBoltIcon sx={{ mr: 1 }} /> Energy (kWh)
              </ToggleButton>
              <ToggleButton value="cost">
                <AttachMoneyIcon sx={{ mr: 1 }} /> Cost (VND)
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