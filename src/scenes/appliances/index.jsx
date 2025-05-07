import { tokens } from "../../theme";
import Header from "../../components/Header";
import React, { useState, useEffect, useMemo } from "react";
import { Box, useTheme, MenuItem, Select, Typography, Tabs, Tab } from "@mui/material";
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import PieChart from "../../components/PieChart";
import SelectTimeType from "../../components/SelectTimeType";
import mockData from "../../data/mockDataAppliances";
import StackBarChart from "../../components/StackBarChart";

const Appliances = () => {
  const [selectedCycle, setSelectedCycle] = useState("this"); // Default to "This Cycle"
  const [cycleLabel, setCycleLabel] = useState(["Hôm nay", "Hôm qua"]); //default là [hôm nay, hôm qua]

  const [totalConsumptionThisCycle, setTotalConsumptionThisCycle] = useState('');
  const [totalConsumptionPrevCycle, setTotalConsumptionPrevCycle] = useState('');
  const [comparison, setComparision] = useState();

  const [currentTimeType, setCurrentTimeType] = useState("day");
  const [chartData, setChartData] = useState(null);
  const [data, setData] = useState(null);
  
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  // Lấy dữ liệu từ server
  useEffect(() => {
    const rawData = mockData;

    setData(rawData);

    // tạo label cho các tab this cycle và last cycle
    const labels = {
      day: ["Hôm nay", "Hôm qua"],
      month: ["Tháng này", "Tháng trước"],
      year: ["Năm nay", "Năm trước"],
    };
    setCycleLabel(labels[currentTimeType] || ["Chu kỳ này", "Chu kỳ trước"]);

    // Dữ liệu Tổng và so sánh
    if (rawData !== undefined) {
      setTotalConsumptionThisCycle(rawData['current'].total);
      setTotalConsumptionPrevCycle(rawData['previous'].total);
      setComparision((rawData['current'].total - rawData['previous'].total)/rawData['previous'].total*100);

    }
  }, [currentTimeType]);

  useEffect(() => {
    if (data) {
      const chartData = selectedCycle === "this" ? data['current'] : data['previous'];
      setChartData(chartData);
    }
  }, [data, selectedCycle]);

  // Sử dụng useMemo để tính toán dataPie
  const dataPie = useMemo(() => {
    if (!chartData) return null;
    
    // Hàm tính tổng tùy vào type (hỗ trợ pie chart)
    const sumDataForType = (type) => {
      return chartData.array.reduce((sum, item) => sum + item[type], 0);
    };

    // Tạo mảng màu dựa vào số lượng labels (cho piechart)
    const generateColors = () => {
      const colorOptions = [
        colors.redAccent[600], 
        colors.greenAccent[600], 
        colors.blueAccent[600], 
        colors.yellowAccent[600],
        colors.redAccent[400],
        colors.greenAccent[400],
        colors.blueAccent[400],
        colors.yellowAccent[400]
      ];
      
      // Đảm bảo đủ màu cho số lượng labels
      return chartData.labels.map((_, index) => 
        colorOptions[index % colorOptions.length]
      );
    };
    
    // mảng chứa dữ liệu theo thứ tự từng label (series cho pie)
    const totalForTypeArray = chartData.labels.map(label => sumDataForType(label));
    
    return {
      series: totalForTypeArray,
      labels: chartData.labels,
      colors: generateColors(),
      unit: 'kWh'
    };
  }, [chartData, colors]); // Cập nhật khi colors thay đổi (khi đổi theme)

  // Sử dụng useMemo để tạo options cho bar chart
  const appliancesChartOptions = useMemo(() => {
    if (!chartData) return null;

    // Tạo series cho stack bar chart
    const series = chartData.labels.map((label, index) => ({
      name: label,
      type: 'bar',
      stack: 'total',
      data: chartData.array.map(item => [
        new Date(item.timestamp), 
        item[label] ? item[label] : 0
      ])
    }));

    // Tạo mảng màu cho stack bar chart (dựa trên màu của pie chart)
    const chartColors = dataPie ? dataPie.colors : [
      colors.redAccent[600], 
      colors.greenAccent[600], 
      colors.blueAccent[600], 
      colors.yellowAccent[600]
    ];

    return {
      color: chartColors,
      series: series,
      tooltip: {
        formatter: (params) => {
          const date = new Date(params[0].axisValue);
          const formattedDate = date.toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' });
          return `
            ${formattedDate} <br/>
            ${params.map((param) => param.value[1] == 0 ? '' : 
              `${param.marker} ${param.seriesName}: <strong>${param.value[1]}</strong> kWh <br/>`
            ).join('')}
          `;
        },
      },
      yAxis: {
        axisLabel: {
          formatter: '{value} kWh',
          // color: theme.palette.mode === 'dark' ? colors.grey[100] : colors.grey[700]
        }
      },
      // xAxis: {
      //   axisLabel: {
      //     color: theme.palette.mode === 'dark' ? colors.grey[100] : colors.grey[700]
      //   }
      // },
      // textStyle: {
      //   color: theme.palette.mode === 'dark' ? colors.grey[100] : colors.grey[700]
      // },
      // cấu hình thanh brush
      dataZoom: [ 
        { 
          type: 'inside' 
        }, 
        { 
          type: 'slider' 
        } 
      ], 
    };
  }, [chartData, colors, dataPie]); // Cập nhật khi theme thay đổi

  return (
    <Box m="20px">
      {/* Phần còn lại của component giữ nguyên */}
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Header title="Báo cáo tiêu thụ năng lượng" subtitle="Trang quản lý sử dụng năng lượng của các dạng tải"/>
        <SelectTimeType onTimeTypeChange={setCurrentTimeType}/>
      </Box>

      {/* Tab chuyển cycle*/}
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs
          value={selectedCycle}
          onChange={(e, newValue) => setSelectedCycle(newValue)}
          sx={{
            "& .MuiTabs-indicator": {
              backgroundColor: `${colors.blueAccent[600]}`,
            },
            "& .MuiTab-root": {
              color: `${colors.primary[100]}`,
            },
            "& .Mui-selected": {
              color: `${colors.blueAccent[600]} !important`,
            },
          }}
        >
          <Tab label={cycleLabel[0]} value={"this"}/>
          <Tab label={cycleLabel[1]} value={"last"}/>
        </Tabs>
      </Box>
        
      {/* Container for Charts */}
      <Box display="grid" gridTemplateColumns="repeat(12, 1fr)" gap="20px">
        {/* Appliances Bar Chart */}
        <Box gridColumn={{ xs: "span 12", sm: "span 12", md: "span 8", xl: "span 8" }} backgroundColor={colors.primary[400]} p="24px" borderRadius="11.2px" >
          {/* Header with statistics */}
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            sx={{
              flexDirection: { xs: "column", sm: "row" },
              gap: { xs: 5, sm: 0 },
              textAlign: { xs: "center", sm: "inherit" },
            }}
          >
            {/* This Cycle */}
            <Box display="flex" flexDirection="column" alignItems={{ xs: "center", sm: "flex-start" }}>
              <Typography variant="h6" fontSize={{ xs: 20, sm: 25 }}>
                {cycleLabel[0]}
              </Typography>
              <Typography variant="body2" fontSize={{ xs: 20, sm: 25 }}>
                {totalConsumptionThisCycle} kWh
              </Typography>
            </Box>

            {/* Last Cycle */}
            <Box display="flex" flexDirection="column" alignItems="center">
              <Typography variant="h6" fontSize={{ xs: 20, sm: 25 }}>
                {cycleLabel[1]}
              </Typography>
              <Typography variant="body2" fontSize={{ xs: 20, sm: 25 }}>
                {totalConsumptionPrevCycle} kWh
              </Typography>
            </Box>

            {/* Compare */}
            <Box display="flex" flexDirection="column" alignItems={{ xs: "center", sm: "flex-end" }}>
              <Typography variant="h6" fontSize={{ xs: 20, sm: 25 }}>
                So sánh
              </Typography>
              <Typography variant="body2" fontSize={{ xs: 20, sm: 25 }}>
                {comparison < 0 ? (
                  <ArrowDropDownIcon style={{ color: "red", fontSize: { xs: 20, sm: 25 } }} />
                ) : (
                  <ArrowDropUpIcon style={{ color: "green", fontSize: { xs: 20, sm: 25 } }} />
                )}
                <span>{Math.abs(comparison?.toFixed(2))}%</span>
              </Typography>
            </Box>
          </Box>

          {/* Bar Chart */}
          <Box height="375px" bgcolor={colors.primary[400]} borderRadius={2}>
            {appliancesChartOptions && <StackBarChart customOptions={appliancesChartOptions}/>}
          </Box>
        </Box>
    
        {/* Pie Chart */}
        <Box 
          gridColumn={{ xs: "span 12", sm: "span 12", md: "span 4", xl: "span 4" }} 
          backgroundColor={colors.primary[400]} 
          p="24px" 
          borderRadius="11.2px" 
          height="100%"
          gap={3}
        >
          <Box 
            display="flex" 
            height="350px"
            p={2} 
            borderRadius={2}
          >
            {dataPie && <PieChart data={dataPie} />}
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default Appliances;