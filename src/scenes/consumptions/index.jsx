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
  Dialog,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  CircularProgress
} from "@mui/material";
import { 
  CalendarToday,
  NavigateBefore, 
  NavigateNext,
  InfoOutlined,
  EventNote,
  FilterAlt
} from "@mui/icons-material";
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { format, addDays, subDays, startOfMonth, endOfMonth, addMonths, subMonths } from 'date-fns';
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { tokens } from "../../theme";
import Header from "../../components/Header";
import StackBarChart from "../../components/StackBarChart";
import energyApi from "../../services/energy.js"; // Import the energy API

// Device colors palette (used for API data)
const DEVICE_COLORS = [
  "#6870fa", "#4cceac", "#ffcc00", "#db4f4a", 
  "#7e57c2", "#26c6da", "#ff7043", "#008080", "#ff69b4",
  "#8a2be2", "#00ff00", "#ff4500", "#4b0082", "#ffd700",
  "#00bfff", "#ff1493", "#00ced1", "#ff6347", "#7fff00"
];

// Helper function to transform API data to the format expected by our charts
const transformApiData = (apiResponse) => {
  if (!apiResponse || !apiResponse.data) return [];

  const { timeLabels, lines, totalsByTime } = apiResponse.data;
  
  const data = timeLabels.map((timeLabel, index) => {
    const entry = {
      timestamp: new Date(timeLabel),
      total: totalsByTime[index] || 0,
      devices: {}
    };
    
    // Map each line's data to the devices object
    lines.forEach((line) => {
      entry.devices[line.lineCode] = line.data[index] || 0;
    });
    
    return entry;
  });
  
  return data;
};

// Function to extract device data from API lines
const extractApiDevices = (apiResponse) => {
  if (!apiResponse || !apiResponse.data || !apiResponse.data.lines) return [];
  
  return apiResponse.data.lines.map((line, index) => ({
    id: line.lineCode,
    name: line.lineName,
    room: line.roomName,
    floor: line.floorName,
    color: DEVICE_COLORS[index % DEVICE_COLORS.length]
  }));
};

// Keep the rest of the helper functions as they might be needed later

const ConsumptionPage = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  
  // View state - change default to 'daily' and fix naming
  const [viewType, setViewType] = useState('daily');
  
  // Selected date
  const [selectedDate, setSelectedDate] = useState(new Date());
  
  // API data states
  const [consumptionData, setConsumptionData] = useState([]);
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Fixed energy unit (removed selector)
  const energyUnit = "kWh";
  
  // Date picker state
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  
  // New state for inline date picker visibility
  const [isDatePickerVisible, setIsDatePickerVisible] = useState(false);
  
  // Filter states
  const [filterType, setFilterType] = useState('none'); // 'none', 'floor', 'room'
  const [selectedFloor, setSelectedFloor] = useState('');
  const [selectedRoom, setSelectedRoom] = useState('');
  
  // Derived data for filters
  const uniqueFloors = useMemo(() => 
    [...new Set(devices.map(device => device.floor))].sort(),
    [devices]
  );
  
  const uniqueRooms = useMemo(() => 
    [...new Set(devices.map(device => device.room))].sort(),
    [devices]
  );
  
  // Filter devices based on selected criteria
  const filteredDevices = useMemo(() => {
    if (filterType === 'none') return devices;
    if (filterType === 'floor' && selectedFloor) {
      return devices.filter(device => device.floor === selectedFloor);
    }
    if (filterType === 'room' && selectedRoom) {
      return devices.filter(device => device.room === selectedRoom);
    }
    return devices;
  }, [filterType, selectedFloor, selectedRoom, devices]);
  
  // Load data from API when date or view type changes
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      
      try {
        // Chuyển đổi selectedDate để giữ nguyên giờ local khi gửi API
        const adjustedDate = new Date(selectedDate.getTime() - selectedDate.getTimezoneOffset() * 60000);
        
        const response = await energyApi.getConsumptionByDate(viewType, adjustedDate);
        
        // Transform API data to the format expected by our component
        const transformedData = transformApiData(response);
        setConsumptionData(transformedData);
        
        // Extract device information from the response
        const extractedDevices = extractApiDevices(response);
        setDevices(extractedDevices);
      } catch (err) {
        console.error("Error fetching consumption data:", err);
        toast.error("Failed to load energy consumption data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [selectedDate, viewType]);
  
  // Update chart options - change 'day' to 'daily' in all conditionals
  const chartOptions = useMemo(() => {
    if (!consumptionData.length || loading) return {};
    
    // Generate series from filtered devices
    const series = filteredDevices.map(device => ({
      name: device.name,
      type: 'bar',
      stack: 'consumption',
      itemStyle: { color: device.color },
      data: consumptionData.map(entry => [
        entry.timestamp,
        entry.devices[device.id] || 0  // Use 0 if the device has no data for this timestamp
      ])
    }));
    
    const unitLabel = 'kWh';
    
    return {
      legend: {
        data: filteredDevices.map(d => d.name),
        textStyle: { color: colors.primary[100] },
        top: '0%',
        type: 'scroll',
        // selectedMode: 'multiple',
        pageIconColor: colors.grey[100],         // Color of the active arrows
        pageIconInactiveColor: colors.grey[300],        // Color of the inactive arrows
        pageTextStyle: {
          color: colors.primary[100] // Color of the page text
        },
        // pageIconSize: 12,                               // Size of the arrow icons
        // pageButtonItemGap: 5
      },
      xAxis: {
        type: 'time',
        axisLabel: {
          formatter: (value) => {
            if (viewType === 'daily') {
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
        formatter: (params) => {
          if (Array.isArray(params)) {
            // Group tooltip
            const date = new Date(params[0].value[0]);
            let header = viewType === 'daily' 
              ? format(date, 'dd/MM/yyyy HH:mm') 
              : format(date, 'dd/MM/yyyy');
            
            let content = `<div style="margin: 0 0 5px; font-weight: bold">${header}</div>`;
            let total = 0;
            
            // Sort
            const deviceOrder = filteredDevices.map(device => device.name);
            params.sort((a, b) => {
              const indexA = deviceOrder.indexOf(a.seriesName);
              const indexB = deviceOrder.indexOf(b.seriesName);
              return indexB - indexA; // Reverse order
            });
            
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
  }, [consumptionData, colors, viewType, filteredDevices, loading]);
  
  // Update the stats calculation to use filtered devices from API
  const stats = useMemo(() => {
    if (!consumptionData.length || loading) return { total: 0, highest: 0, deviceBreakdown: [] };
    
    // Get IDs of filtered devices
    const filteredDeviceIds = filteredDevices.map(device => device.id);
    
    // Calculate total consumption for filtered devices only
    const total = consumptionData.reduce((sum, entry) => {
      let filteredTotal = 0;
      Object.entries(entry.devices).forEach(([deviceId, consumption]) => {
        if (filteredDeviceIds.includes(deviceId)) {
          filteredTotal += consumption;
        }
      });
      return sum + filteredTotal;
    }, 0);
    
    // Calculate highest hour/day for filtered devices
    let highest = { value: 0, timestamp: null };
    consumptionData.forEach(entry => {
      let filteredEntryTotal = 0;
      Object.entries(entry.devices).forEach(([deviceId, consumption]) => {
        if (filteredDeviceIds.includes(deviceId)) {
          filteredEntryTotal += consumption;
        }
      });
      
      if (filteredEntryTotal > highest.value) {
        highest = { value: filteredEntryTotal, timestamp: entry.timestamp };
      }
    });
    
    // Calculate device breakdown for filtered devices
    const deviceTotals = {};
    filteredDevices.forEach(device => {
      deviceTotals[device.id] = {
        id: device.id,
        name: device.name,
        color: device.color,
        room: device.room,
        floor: device.floor,
        total: 0
      };
    });
    
    consumptionData.forEach(entry => {
      Object.entries(entry.devices).forEach(([deviceId, consumption]) => {
        if (deviceTotals[deviceId]) {
          deviceTotals[deviceId].total += consumption;
        }
      });
    });
    
    const deviceBreakdown = Object.values(deviceTotals).sort((a, b) => b.total - a.total);
    
    return { total, highest, deviceBreakdown };
  }, [consumptionData, filteredDevices, loading]);
  
  // Format the date display
  const dateDisplay = useMemo(() => {
    if (viewType === 'daily') {
      return format(selectedDate, 'EEEE, MMMM d, yyyy');
    } else {
      return format(selectedDate, 'MMMM yyyy');
    }
  }, [selectedDate, viewType]);
  
  return (
    <Box m="20px">
      <Header title="Điện năng tiêu thụ" subtitle="Phân tích mức tiêu thụ năng lượng của thiết bị" />

      {/* Responsive control section */}
      <Box 
        display="grid" 
        gridTemplateColumns={{ xs: "1fr", md: "2fr 1fr" }}
        gap="16px"
        mb="20px"
      >
        {/* View type toggle and filters */}
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center' }}>
          <Tabs
            value={viewType}
            onChange={(e, newValue) => setViewType(newValue)}
            textColor="secondary"
            indicatorColor="secondary"
          >
            <Tab value="daily" label="Theo ngày" />
            <Tab value="monthly" label="Theo tháng" />
          </Tabs>
          
          {/* Room/Floor filters */}
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 1,
            flexWrap: 'wrap',
            ml: { xs: 0, sm: 2 }
          }}>
            <FormControl 
              size="small" 
              sx={{ 
                minWidth: 140,
                "& .MuiInputLabel-root": {
                  color: colors.grey[200]
                }
              }}
            >
              <InputLabel id="room-filter-label" sx={{"&.Mui-focused": {color: colors.primary[100]}}}>Phòng</InputLabel>
              <Select
                labelId="room-filter-label"
                value={selectedRoom}
                label="Phòng"
                onChange={(e) => {
                  if (e.target.value) {
                    setFilterType('room');
                    setSelectedRoom(e.target.value);
                    setSelectedFloor(''); // Clear floor when selecting room
                  } else {
                    setFilterType('none');
                    setSelectedRoom('');
                  }
                }}
                sx={{
                  bgcolor: colors.primary[400],
                  color: colors.grey[100],
                  "& .MuiSvgIcon-root": {
                    color: colors.grey[200]
                  }
                }}
              >
                <MenuItem value="">All Rooms</MenuItem>
                {uniqueRooms.map((room) => (
                  <MenuItem key={room} value={room}>{room}</MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <FormControl 
              size="small" 
              sx={{ 
                minWidth: 140,
                "& .MuiInputLabel-root": {
                  color: colors.grey[200]
                }
              }}
            >
              <InputLabel id="floor-filter-label" sx={{"&.Mui-focused": {color: colors.primary[100]}}}>Tầng</InputLabel>
              <Select
                labelId="floor-filter-label"
                value={selectedFloor}
                label="Tầng"
                onChange={(e) => {
                  if (e.target.value) {
                    setFilterType('floor');
                    setSelectedFloor(e.target.value);
                    setSelectedRoom(''); // Clear room when selecting floor
                  } else {
                    setFilterType('none');
                    setSelectedFloor('');
                  }
                }}
                sx={{
                  bgcolor: colors.primary[400],
                  color: colors.grey[100],
                  "& .MuiSvgIcon-root": {
                    color: colors.grey[200]
                  }
                }}
              >
                <MenuItem value="">All Floors</MenuItem>
                {uniqueFloors.map((floor) => (
                  <MenuItem key={floor} value={floor}>{floor}</MenuItem>
                ))}
              </Select>
            </FormControl>
            
          </Box>
        </Box>
        
        {/* Date navigation */}
        <Box 
          sx={{
            display: "flex",
            justifyContent: { xs: "center", md: "flex-end" },
            // alignItems: "center"
          }}
        >
          <Stack 
            direction="row" 
            spacing={{ xs: 0.5, sm: 1 }} 
            alignItems="center" 
          >      
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              {viewType === 'daily' ? (
                <DatePicker
                  value={selectedDate}
                  onChange={(newDate) => {
                    if (newDate) setSelectedDate(newDate);
                  }}
                  disableFuture
                  format="MMM d, yyyy"
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
                />
              )}
            </LocalizationProvider>
            
            <IconButton 
              onClick={() => setSelectedDate(new Date())}
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
        gap="20px"
        mb="24px"
      >
        {/* Total consumption card */}
        <Box 
          gridColumn={{ xs: "span 12", sm: "span 6", md: "span 4" }}
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
              Tổng điện năng tiêu thụ
            </Typography>
            <Tooltip title="Total energy consumed during the selected period">
              <InfoOutlined sx={{ color: colors.greenAccent[500], fontSize: 32 }} />
            </Tooltip>
          </Box>
          <Typography variant="h3" fontWeight="bold" sx={{ color: colors.greenAccent[500] }}>
            {stats.total.toFixed(2)} {energyUnit}
          </Typography>
        </Box>
        
        {/* Highest consumption card */}
        <Box 
          gridColumn={{ xs: "span 12", sm: "span 6", md: "span 4" }}
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
              Tiêu thụ nhiều nhất
            </Typography>
            <Tooltip title={`Thời điểm có mức tiêu thụ cao nhất trong khoảng thời gian đã chọn`}>
              <InfoOutlined sx={{ color: colors.redAccent[500], fontSize: 32 }} />
            </Tooltip>
          </Box>
          <Typography variant="h3" fontWeight="bold" sx={{ color: colors.redAccent[500] }}>
            {stats.highest.value?.toFixed(2)} {energyUnit}
          </Typography>
          <Typography variant="body1" color={colors.grey[300]} sx={{ mt: 1 }}>
            {stats.highest.timestamp && (
              viewType === 'daily' 
                ? format(stats.highest.timestamp, 'HH:mm') 
                : format(stats.highest.timestamp, 'MMM dd')
            )}
          </Typography>
        </Box>
        
        {/* Top consumer card */}
        <Box 
          gridColumn={{ xs: "span 12", sm: "span 6", md: "span 4" }}
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
              Thiết bị tiêu thụ nhiều nhất
            </Typography>
            <Tooltip title="Thiết bị tiêu thụ nhiều nhất trong khoảng thời gian đã chọn">
              <InfoOutlined sx={{ color: colors.blueAccent[500], fontSize: 32 }} />
            </Tooltip>
          </Box>
          
          {stats.deviceBreakdown.length > 0 && (
            <>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Box 
                  sx={{ 
                    width: 12, 
                    height: 12, 
                    borderRadius: '50%', 
                    bgcolor: stats.deviceBreakdown[0].color,
                    mr: 1 
                  }} 
                />
                <Typography variant="h6" color={colors.grey[100]}>
                  {stats.deviceBreakdown[0].name}
                </Typography>
              </Box>
              <Typography variant="h3" fontWeight="bold" sx={{ color: colors.blueAccent[500] }}>
                {stats.deviceBreakdown[0].total.toFixed(2)} {energyUnit}
              </Typography>
              <Typography variant="body1" color={colors.grey[300]} sx={{ mt: 1 }}>
                {((stats.deviceBreakdown[0].total / stats.total) * 100).toFixed(0)}% of total
              </Typography>
            </>
          )}
        </Box>
      </Box>
      
      {/* Main Chart - using Box with grid */}
      <Box 
        display="grid" 
        gridTemplateColumns="repeat(12, 1fr)" 
        gap="20px"
      >
        {/* Bar-line mixed chart */}
        <Box gridColumn={{ xs: "span 12", lg: "span 8" }}>
          <Box
            backgroundColor={colors.primary[400]}
            component={Paper}
            elevation={3}
            sx={{
              borderRadius: "12px",
              p: 3,
              height: 500
            }}
          >
            <Typography variant="h4" mb={2} fontWeight="bold" color={colors.grey[100]}>
              Điện năng tiêu thụ theo {viewType === 'daily' ? 'giờ' : 'ngày'}
              {filterType !== 'none' && (
                <Box component="span" sx={{ ml: 1, color: colors.greenAccent[400], fontSize: '0.8em', fontWeight: 400 }}>
                  {filterType === 'floor' && selectedFloor ? ` - ${selectedFloor}` : ''}
                  {filterType === 'room' && selectedRoom ? ` - ${selectedRoom}` : ''}
                </Box>
              )}
            </Typography>
            <Box sx={{ height: "calc(100% - 60px)" }}>
              <StackBarChart 
                customOptions={chartOptions} 
                loading={!consumptionData.length} 
              />
            </Box>
          </Box>
        </Box>
        
        {/* Device breakdown chart */}
        <Box gridColumn={{ xs: "span 12", lg: "span 4" }}>
          <Box
            backgroundColor={colors.primary[400]}
            component={Paper}
            elevation={3}
            sx={{
              borderRadius: "12px",
              p: 3,
              height: 500,
              display: "flex",
              flexDirection: "column"
            }}
          >
            <Typography variant="h4" mb={2} fontWeight="bold" color={colors.grey[100]}>
              {filterType === 'none' 
                ? 'Các thiết bị tiêu thụ năng lượng' 
                : filterType === 'floor' && selectedFloor 
                  ? `Các thiết bị ở ${selectedFloor}` 
                  : filterType === 'room' && selectedRoom 
                    ? `Các thiết bị trong ${selectedRoom}` 
                    : 'Các thiết bị tiêu thụ năng lượng'}
            </Typography>
            
            {filterType !== 'none' && stats.deviceBreakdown.length > 0 && (
              <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography variant="body2" color={colors.grey[300]}>
                  Hiển thị {stats.deviceBreakdown.length} {stats.deviceBreakdown.length === 1 ? 'thiết bị' : 'thiết bị'}
                </Typography>
                <Typography variant="body2" color={colors.grey[300]}>
                  {stats.total.toFixed(2)} {energyUnit} total
                </Typography>
              </Box>
            )}
            
            {/* Device Breakdown */}
            <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
              <Stack spacing={2}>
                {stats.deviceBreakdown.map((device) => (
                  <Box
                    key={device.id}
                    sx={{ 
                      p: 2, 
                      backgroundColor: colors.primary[500],
                      borderRadius: "8px",
                      borderLeft: `4px solid ${device.color}`,
                      boxShadow: "0px 1px 3px rgba(0, 0, 0, 0.1)"
                    }}
                  >
                    <Typography variant="h6" sx={{ mb: 1, color: colors.grey[100], fontWeight: 600 }}>
                      {device.name}
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <Typography variant="h5" sx={{ fontWeight: 'bold', color: colors.grey[100] }}>
                        {device.total.toFixed(2)} {energyUnit}
                      </Typography>
                      <Typography variant="body1" color={colors.grey[300]}>
                        {((device.total / stats.total) * 100).toFixed(1)}%
                      </Typography>
                    </Box>
                    <Box 
                      sx={{ 
                        width: '100%', 
                        height: 6, 
                        backgroundColor: colors.grey[700],
                        borderRadius: 3,
                        overflow: 'hidden'
                      }}
                    >
                      <Box 
                        sx={{ 
                          width: `${(device.total / stats.total) * 100}%`, 
                          height: '100%',
                          backgroundColor: device.color,
                          borderRadius: 3
                        }} 
                      />
                    </Box>
                  </Box>
                ))}
              </Stack>
            </Box>
          </Box>
        </Box>
      </Box>
      
      {/* Add loading indicator */}
      {loading && (
        <Box display="flex" justifyContent="center" mt={3}>
          <CircularProgress />
        </Box>
      )}
      <ToastContainer />
    </Box>
  );
};

export default ConsumptionPage;