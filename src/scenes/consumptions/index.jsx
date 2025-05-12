import React, { useState, useEffect, useMemo } from "react";
import { 
  Box, 
  Paper, 
  IconButton,
  Typography,
  Tabs,
  Tab,
  useTheme,
  Tooltip,
  Stack,
  Button,
  TextField,
  Dialog
} from "@mui/material";
import { 
  CalendarToday,
  NavigateBefore, 
  NavigateNext,
  InfoOutlined,
  EventNote
} from "@mui/icons-material";
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { format, addDays, subDays, startOfMonth, endOfMonth, addMonths, subMonths } from 'date-fns';
import { tokens } from "../../theme";
import Header from "../../components/Header";
import BarMixedLineChart from "../../components/BarMixedLineChart";
import StackBarChart from "../../components/StackBarChart";

// Mock devices and their colors
const DEVICES = [
  { id: 1, name: "Air Conditioner", color: "#6870fa" }, // blueAccent
  { id: 2, name: "Refrigerator", color: "#4cceac" },    // greenAccent
  { id: 3, name: "Television", color: "#ffcc00" },      // yellowAccent
  { id: 4, name: "Lighting", color: "#db4f4a" },        // redAccent
  { id: 5, name: "Washing Machine", color: "#a3a3a3" }, // grey
];

// Generate mock data
const generateMockData = (startDate, endDate, viewType) => {
  const data = [];
  let currentDate = new Date(startDate);
  
  const generateRandomConsumption = (baseValue, variance) => {
    return +(baseValue + (Math.random() * variance * 2 - variance)).toFixed(2);
  };
  
  while (currentDate <= endDate) {
    const entry = {
      timestamp: new Date(currentDate),
      total: 0,
      devices: {}
    };
    
    // Different patterns for different times of day
    const hour = currentDate.getHours();
    let multiplier = 1;
    const dayOfWeek = currentDate.getDay();

    
    // Higher consumption in morning and evening
    if (viewType === 'day') {
      if (hour >= 6 && hour <= 9) multiplier = 1.5; // Morning peak
      else if (hour >= 18 && hour <= 22) multiplier = 2; // Evening peak
      else if (hour >= 0 && hour <= 5) multiplier = 0.5; // Night low
    } else if (dayOfWeek === 0 || dayOfWeek === 6) {
      // Weekend vs weekday patterns for month view
      multiplier = 1.3; // Weekends
    }
    
    // Generate consumption for each device
    DEVICES.forEach(device => {
      let baseValue;
      
      switch(device.id) {
        case 1: // Air Conditioner - high in summer months
          baseValue = viewType === 'day' ? 0.2 : 5;
          if ([5, 6, 7, 8].includes(currentDate.getMonth())) baseValue *= 2;
          break;
        case 2: // Refrigerator - consistent
          baseValue = viewType === 'day' ? 0.15 : 3.5;
          break;
        case 3: // Television - higher in evening
          baseValue = viewType === 'day' ? 0.1 : 2;
          if (hour >= 19 && hour <= 23) baseValue *= 1.8;
          break;
        case 4: // Lighting - higher in evening/night
          baseValue = viewType === 'day' ? 0.05 : 1;
          if (hour >= 17 || hour <= 7) baseValue *= 2;
          break;
        case 5: // Washing Machine - periodic usage
          baseValue = viewType === 'day' ? 0.3 : 1.5;
          // More likely to be used on weekends or certain hours
          if (viewType === 'day' && (hour === 10 || hour === 18)) baseValue *= 3;
          else if (dayOfWeek === 6 || dayOfWeek === 0) baseValue *= 2;
          else baseValue *= (Math.random() > 0.7 ? 1 : 0.2); // Occasional usage
          break;
        default:
          baseValue = 0.1;
      }
      
      const consumption = generateRandomConsumption(baseValue * multiplier, baseValue * 0.3);
      entry.devices[device.id] = consumption;
      entry.total += consumption;
    });
    
    data.push(entry);
    
    // Increment based on view type
    if (viewType === 'day') {
      currentDate = addHours(currentDate, 1);
    } else {
      currentDate = addDays(currentDate, 1);
    }
  }
  
  return data;
};

// Helper to add hours
const addHours = (date, hours) => {
  const newDate = new Date(date);
  newDate.setHours(newDate.getHours() + hours);
  return newDate;
};

const ConsumptionPage = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  
  // View state (day or month)
  const [viewType, setViewType] = useState('day');
  
  // Selected date
  const [selectedDate, setSelectedDate] = useState(new Date());
  
  // Mock data
  const [consumptionData, setConsumptionData] = useState([]);
  
  // Fixed energy unit (removed selector)
  const energyUnit = "kWh";
  
  // Date picker state
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  
  // New state for inline date picker visibility
  const [isDatePickerVisible, setIsDatePickerVisible] = useState(false);
  
  // Load data when date or view type changes
  useEffect(() => {
    let startDate, endDate;
    
    if (viewType === 'day') {
      startDate = new Date(selectedDate);
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date(selectedDate);
      endDate.setHours(23, 59, 59, 999);
    } else {
      startDate = startOfMonth(selectedDate);
      endDate = endOfMonth(selectedDate);
    }
    
    // Generate mock data (in a real app, this would be an API call)
    const data = generateMockData(startDate, endDate, viewType);
    setConsumptionData(data);
  }, [selectedDate, viewType]);
  
  // Handle date navigation
  const handleDateChange = (direction) => {
    if (viewType === 'day') {
      setSelectedDate(direction === 'next' ? addDays(selectedDate, 1) : subDays(selectedDate, 1));
    } else {
      setSelectedDate(direction === 'next' ? addMonths(selectedDate, 1) : subMonths(selectedDate, 1));
    }
  };
  
  // Prepare chart data for StackBarChart
  const chartOptions = useMemo(() => {
    if (!consumptionData.length) return {};
    
    const series = DEVICES.map(device => ({
      name: device.name,
      type: 'bar',
      stack: 'consumption',
      emphasis: { focus: 'series' },
      itemStyle: { color: device.color },
      data: consumptionData.map(entry => [
        entry.timestamp,
        entry.devices[device.id]
      ])
    }));
    
    // Remove the total line since we're using a stacked bar chart
    
    const unitLabel = energyUnit === 'kWh' ? 'kWh' : 'watt';
    
    return {
      legend: {
        data: DEVICES.map(d => d.name),
        textStyle: { color: colors.primary[100] },
        top: '0%',
      },
      xAxis: {
        type: 'time',
        axisLabel: {
          formatter: (value) => {
            if (viewType === 'day') {
              return format(new Date(value), 'HH:mm');
            } else {
              return format(new Date(value), 'dd/MM');
            }
          }
        }
      },
      yAxis: {
        name: unitLabel,
        nameTextStyle: { color: colors.primary[100] },
        axisLine: { show: true },
      },
      series,
      tooltip: {
        // trigger: 'axis',
        // axisPointer: {
        //   type: 'shadow'
        // },
        formatter: (params) => {
          if (Array.isArray(params)) {
            // Group tooltip
            const date = new Date(params[0].value[0]);
            let header = viewType === 'day' 
              ? format(date, 'dd/MM/yyyy HH:mm') 
              : format(date, 'dd/MM/yyyy');
            
            let content = `<div style="margin: 0 0 5px; font-weight: bold">${header}</div>`;
            let total = 0;
            
            params.forEach(param => {
              content += `<div style="display: flex; justify-content: space-between; margin: 3px 0">
                <div>
                  <span style="display: inline-block; width: 10px; height: 10px; border-radius: 50%; background-color: ${param.color}; margin-right: 5px"></span>
                  ${param.seriesName}
                </div>
                <div style="margin-left: 15px; font-weight: bold">${param.value[1].toFixed(2)} ${unitLabel}</div>
              </div>`;
              total += param.value[1];
            });
            
            content += `<div style="margin-top: 5px; border-top: 1px solid rgba(255,255,255,0.3); padding-top: 5px">
              <div style="display: flex; justify-content: space-between; font-weight: bold">
                <div>Total</div>
                <div style="margin-left: 15px">${total.toFixed(2)} ${unitLabel}</div>
              </div>
            </div>`;
            
            return content;
          }
          return '';
        }
      }
    };
  }, [consumptionData, colors, viewType, energyUnit]);
  
  // Calculate consumption statistics
  const stats = useMemo(() => {
    if (!consumptionData.length) return { total: 0, highest: 0, deviceBreakdown: [] };
    
    // Calculate total consumption
    const total = consumptionData.reduce((sum, entry) => sum + entry.total, 0);
    
    // Calculate highest hour/day
    let highest = { value: 0, timestamp: null };
    consumptionData.forEach(entry => {
      if (entry.total > highest.value) {
        highest = { value: entry.total, timestamp: entry.timestamp };
      }
    });
    
    // Calculate device breakdown
    const deviceTotals = {};
    DEVICES.forEach(device => {
      deviceTotals[device.id] = {
        id: device.id,
        name: device.name,
        color: device.color,
        total: 0
      };
    });
    
    consumptionData.forEach(entry => {
      Object.entries(entry.devices).forEach(([deviceId, consumption]) => {
        deviceTotals[deviceId].total += consumption;
      });
    });
    
    const deviceBreakdown = Object.values(deviceTotals).sort((a, b) => b.total - a.total);
    
    return { total, highest, deviceBreakdown };
  }, [consumptionData]);

  // Format the date display
  const dateDisplay = useMemo(() => {
    if (viewType === 'day') {
      return format(selectedDate, 'EEEE, MMMM d, yyyy');
    } else {
      return format(selectedDate, 'MMMM yyyy');
    }
  }, [selectedDate, viewType]);
  
  return (
    <Box m="20px">
      <Header title="Energy Consumption" subtitle="Analyze your device energy usage" />
      
      {/* Responsive control section */}
      <Box 
        display="grid" 
        gridTemplateColumns={{ xs: "1fr", md: "1fr 1fr" }}
        gap="16px"
        mb="20px"
      >
        {/* View type toggle */}
        <Box>
          <Tabs
            value={viewType}
            onChange={(e, newValue) => setViewType(newValue)}
            textColor="secondary"
            indicatorColor="secondary"
            // variant="fullWidth"
          >
            <Tab value="day" label="Daily" />
            <Tab value="month" label="Monthly" />
          </Tabs>
        </Box>
        
        {/* Date navigation */}
        <Box 
          sx={{
            display: "flex",
            justifyContent: { xs: "center", md: "flex-end" },
            alignItems: "center"
          }}
        >
          <Stack 
            direction="row" 
            spacing={{ xs: 0.5, sm: 1 }} 
            alignItems="center" 
          >
            <IconButton 
              onClick={() => handleDateChange('prev')}
              sx={{ 
                bgcolor: colors.primary[400],
                "&:hover": { bgcolor: colors.primary[300] }
              }}
            >
              <NavigateBefore />
            </IconButton>
            
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              {viewType === 'day' ? (
                <DatePicker
                  value={selectedDate}
                  onChange={(newDate) => {
                    if (newDate) setSelectedDate(newDate);
                  }}
                  disableFuture
                  format="MMM d, yyyy"
                  sx={{ 
                    width: { xs: "140px", sm: "auto" },
                    "& .MuiInputBase-root": { 
                      bgcolor: colors.primary[400],
                      borderRadius: 1,
                      color: colors.grey[100],
                      fontSize: { xs: "0.875rem", sm: "1rem" }
                    }
                  }}
                />
              ) : (
                <DatePicker
                  views={['year', 'month']}
                  value={selectedDate}
                  onChange={(newDate) => {
                    if (newDate) setSelectedDate(newDate);
                  }}
                  disableFuture
                  format="MMM yyyy"
                  sx={{ 
                    width: { xs: "120px", sm: "auto" },
                    "& .MuiInputBase-root": { 
                      bgcolor: colors.primary[400],
                      borderRadius: 1,
                      color: colors.grey[100],
                      fontSize: { xs: "0.875rem", sm: "1rem" }
                    }
                  }}
                />
              )}
            </LocalizationProvider>
            
            <IconButton 
              onClick={() => handleDateChange('next')} 
              disabled={selectedDate >= new Date()}
              sx={{ 
                bgcolor: colors.primary[400],
                "&:hover": { bgcolor: colors.primary[300] },
                "&.Mui-disabled": { bgcolor: colors.primary[700] }
              }}
            >
              <NavigateNext />
            </IconButton>
            
            <IconButton 
              onClick={() => setSelectedDate(new Date())}
              sx={{ 
                display: { xs: 'none', sm: 'flex' },
                bgcolor: colors.primary[400],
                "&:hover": { bgcolor: colors.primary[300] }
              }}
            >
              <CalendarToday fontSize="small" />
            </IconButton>
          </Stack>
        </Box>
      </Box>
      
      {/* Stats Cards - using Box with grid */}
      <Box 
        display="grid" 
        gridTemplateColumns="repeat(12, 1fr)" 
        gap="16px"
        mb="24px"
      >
        {/* Total consumption card */}
        <Box gridColumn={{ xs: "span 12", sm: "span 6", md: "span 4" }}>
          <Paper
            sx={{
              p: 2,
              bgcolor: colors.primary[400],
              boxShadow: "0px 2px 10px rgba(0, 0, 0, 0.1)",
              borderRadius: 2,
              height: '100%'
            }}
          >
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography variant="h5">Total Consumption</Typography>
              <Tooltip title="Total energy consumed during the selected period">
                <InfoOutlined fontSize="small" />
              </Tooltip>
            </Stack>
            <Typography variant="h2" sx={{ mt: 2, fontWeight: 'bold', color: colors.greenAccent[500] }}>
              {stats.total.toFixed(2)} {energyUnit}
            </Typography>
          </Paper>
        </Box>
        
        {/* Highest consumption card */}
        <Box gridColumn={{ xs: "span 12", sm: "span 6", md: "span 4" }}>
          <Paper
            sx={{
              p: 2,
              bgcolor: colors.primary[400],
              boxShadow: "0px 2px 10px rgba(0, 0, 0, 0.1)",
              borderRadius: 2,
              height: '100%'
            }}
          >
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography variant="h5">Highest Consumption</Typography>
              <Tooltip title={`Period with highest energy consumption`}>
                <InfoOutlined fontSize="small" />
              </Tooltip>
            </Stack>
            <Typography variant="h2" sx={{ mt: 2, fontWeight: 'bold', color: colors.redAccent[500] }}>
              {stats.highest.value?.toFixed(2)} {energyUnit}
            </Typography>
            <Typography variant="body1" color={colors.grey[300]}>
              {stats.highest.timestamp && (
                viewType === 'day' 
                  ? format(stats.highest.timestamp, 'HH:mm') 
                  : format(stats.highest.timestamp, 'MMM dd')
              )}
            </Typography>
          </Paper>
        </Box>
        
        {/* Top consumer card */}
        <Box gridColumn={{ xs: "span 12", sm: "span 6", md: "span 4" }}>
          <Paper
            sx={{
              p: 2,
              bgcolor: colors.primary[400],
              boxShadow: "0px 2px 10px rgba(0, 0, 0, 0.1)",
              borderRadius: 2,
              height: '100%',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
              <Typography variant="h5">Top Consumer</Typography>
              <Tooltip title="Device with highest energy consumption">
                <InfoOutlined fontSize="small" />
              </Tooltip>
            </Stack>
            
            {stats.deviceBreakdown.length > 0 && (
              <>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Box 
                    sx={{ 
                      width: 15, 
                      height: 15, 
                      borderRadius: '50%', 
                      bgcolor: stats.deviceBreakdown[0].color,
                      mr: 1 
                    }} 
                  />
                  <Typography variant="h4">
                    {stats.deviceBreakdown[0].name}
                  </Typography>
                </Box>
                <Typography variant="h2" sx={{ fontWeight: 'bold', color: colors.blueAccent[500] }}>
                  {stats.deviceBreakdown[0].total.toFixed(2)} {energyUnit}
                </Typography>
                <Typography variant="body1" color={colors.grey[300]}>
                  {((stats.deviceBreakdown[0].total / stats.total) * 100).toFixed(0)}% of total
                </Typography>
              </>
            )}
          </Paper>
        </Box>
      </Box>
      
      {/* Main Chart - using Box with grid */}
      <Box 
        display="grid" 
        gridTemplateColumns="repeat(12, 1fr)" 
        gap="16px"
      >
        {/* Bar-line mixed chart */}
        <Box gridColumn={{ xs: "span 12", lg: "span 8" }}>
          <Paper
            sx={{
              p: 2,
              bgcolor: colors.primary[400],
              boxShadow: "0px 2px 10px rgba(0, 0, 0, 0.1)",
              borderRadius: 2,
              height: 500
            }}
          >
            <Typography variant="h5" sx={{ mb: 2 }}>
              {viewType === 'day' ? 'Hourly' : 'Daily'} Energy Consumption
            </Typography>
            <Box sx={{ height: "calc(100% - 40px)" }}>
              <StackBarChart 
                customOptions={chartOptions} 
                loading={!consumptionData.length} 
              />
            </Box>
          </Paper>
        </Box>
        
        {/* Device breakdown chart */}
        <Box gridColumn={{ xs: "span 12", lg: "span 4" }}>
          <Paper
            sx={{
              p: 2,
              bgcolor: colors.primary[400],
              boxShadow: "0px 2px 10px rgba(0, 0, 0, 0.1)",
              borderRadius: 2,
              height: 500
            }}
          >
            <Typography variant="h5" sx={{ mb: 2 }}>
              Consumption by Device
            </Typography>
            
            {/* Device Breakdown */}
            <Stack spacing={2} sx={{ height: "calc(100% - 40px)", overflow: 'auto' }}>
              {stats.deviceBreakdown.map((device) => (
                <Paper 
                  key={device.id}
                  sx={{ 
                    p: 2, 
                    bgcolor: colors.primary[700],
                    borderLeft: `4px solid ${device.color}`
                  }}
                >
                  <Typography variant="h5" sx={{ mb: 1 }}>
                    {device.name}
                  </Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                      {device.total.toFixed(2)} {energyUnit}
                    </Typography>
                    <Typography variant="body1" color={colors.grey[300]}>
                      {((device.total / stats.total) * 100).toFixed(1)}%
                    </Typography>
                  </Box>
                  <Box 
                    sx={{ 
                      mt: 1, 
                      width: '100%', 
                      height: 8, 
                      bgcolor: colors.grey[700],
                      borderRadius: 5,
                      overflow: 'hidden'
                    }}
                  >
                    <Box 
                      sx={{ 
                        width: `${(device.total / stats.total) * 100}%`, 
                        height: '100%',
                        bgcolor: device.color
                      }} 
                    />
                  </Box>
                </Paper>
              ))}
            </Stack>
          </Paper>
        </Box>
      </Box>
    </Box>
  );
};

export default ConsumptionPage;