import { tokens } from "../../theme";
import Header from "../../components/Header";
import React, { useState, useEffect, useMemo } from "react";
import { Box, useTheme,  Typography, Tabs, Tab } from "@mui/material";
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import PieChart from "../../components/PieChart";
import SelectTimeType from "../../components/SelectTimeType";
import mockData from "../../data/mockDataCost";
import StackBarChart from "../../components/StackBarChart";

  const Cost = () => {
    const [selectedCycle, setSelectedCycle] = useState("this"); // Default to "This Cycle"
    const [cycleLabel, setCycleLabel] = useState(["Hôm nay", "Hôm qua"]); //default là [hôm nay, hôm qua]

    const [totalCostThisCycle, setTotalCostThisCycle] = useState('');
    const [TotalCostPrevCycle, setTotalCostPrevCycle] = useState('');
    const [comparison, setComparision] = useState();

    const [chartData, setChartData] = useState(null);
    const [data, setData] = useState(null);

    const [currentTimeType, setCurrentTimeType] = useState("day");
  
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);

    // Hàm tính tổng tùy vào type
    const sumDataForType = (data, type) => {
      if (!data) return 0;
      return data.reduce((sum, item) => sum + item[type], 0);
    };

    // Tạo dataPie với useMemo
    const dataPie = useMemo(() => {
      if (!chartData) return null;
  
      const totalRush = sumDataForType(chartData, 'rush');
      const totalNormal = sumDataForType(chartData, 'normal');
      const totalLow = sumDataForType(chartData, 'low');
      return {
        series: [totalRush, totalNormal, totalLow],
        labels: ['Cao điểm', 'Thường', 'Thấp điểm'],
        colors: [
          colors.redAccent[600],
          colors.yellowAccent[600],
          colors.greenAccent[600],
        ],
        unit: 'VNĐ'
      };
    }, [chartData, colors]);

    // Tạo costChartOptions với useMemo
    const costChartOptions = useMemo(() => {
      if (!chartData) return null;
  
      const rushData = chartData.map(d => [new Date(d.timestamp), d.rush]);
      const normalData = chartData.map(d => [new Date(d.timestamp), d.normal]);
      const lowData = chartData.map(d => [new Date(d.timestamp), d.low]);
  
      return {
        color: [
          colors.redAccent[600],
          colors.yellowAccent[600],
          colors.greenAccent[600],
        ],
        series: [
          {
            name: 'Cao điểm',
            type: 'bar',
            stack: 'total',
            data: rushData,
          },
          {
            name: 'Thường',
            type: 'bar',
            stack: 'total',
            data: normalData,
          },
          {
            name: 'Thấp điểm',
            type: 'bar',
            stack: 'total',
            data: lowData,
          }
        ],
        // Cáu hình tooltip 
        tooltip: {
          formatter: (params) => {
            const date = new Date(params[0].axisValue);
            const formattedDate = date.toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' });
            return `
              ${formattedDate} <br/>
              ${params.map((param) =>  param.value[1] == 0 ? '' : `${param.marker} ${param.seriesName}: <strong>${param.value[1]}</strong> VNĐ <br/>`).join('')}
            `;
          },
        },
        yAxis: {
          axisLabel: {
            formatter: '{value} VNĐ'
          }
        },
        dataZoom: [ 
          { 
            type: 'inside' 
          }, 
          { 
            type: 'slider' 
          } 
        ],
      };
    }, [colors, chartData]);

    useEffect(() => {
      //fetch data từ server
      const rawData = mockData;

      setData(rawData);

      //tạo label cho các tab this cycle và last cycle
      const labels = {
        day: ["Hôm nay", "Hôm qua"],
        month: ["Tháng này", "Tháng trước"],
        year: ["Năm nay", "Năm trước"],
      };
      setCycleLabel(labels[currentTimeType] || ["Chu kỳ này", "Chu kỳ trước"]);

      // Set data cho các đồ thị tùy vào selectedCycle; tổng this cycle, las cycle, comparision
      if (rawData !== undefined) {
        // const chartData = selectedCycle === "this" ? data['current'].array : data['previous'].array;
        setTotalCostThisCycle(rawData['current'].total);
        setTotalCostPrevCycle(rawData['previous'].total);
        setComparision((rawData['current'].total - rawData['previous'].total)/rawData['previous'].total*100);

      }
    }, [currentTimeType])

    useEffect(() => {
      if (data) {
        const chartData = selectedCycle === "this" ? data['current'].array : data['previous'].array;
        setChartData(chartData);
      }
    }, [data, selectedCycle]);

    
    return (
      <Box m = "20px">
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Header title="Báo cáo chi phí" subtitle="Trang quản lý chi phí sử dụng năng lượng theo khung giờ"/>
			    <SelectTimeType onTimeTypeChange={setCurrentTimeType}/>
        </Box>

          {/* Tab chuyển cycle*/}
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs
            value={selectedCycle}
            onChange={(e, newValue) => setSelectedCycle(newValue)}
            // textColor="secondary"
            // indicatorColor="secondary"
            sx={{
              "& .MuiTabs-indicator": {
                backgroundColor: `${colors.blueAccent[600]}`, // Màu của thanh indicator
              },
              "& .MuiTab-root": {
                color: `${colors.primary[100]}`, // Màu chữ khi chưa được chọn
              },
              "& .Mui-selected": {
                color: `${colors.blueAccent[600]} !important`, // Màu chữ khi được chọn
              },
            }}
          >
            <Tab label={cycleLabel[0]} value={"this"}/>
            <Tab label={cycleLabel[1]} value={"last"}/>
          </Tabs>
        </Box>
          
        {/* Container for Charts */}
        <Box display="grid" gridTemplateColumns="repeat(12, 1fr)" gap="20px">
          {/* Cost Bar Chart (70% width) */}
          <Box gridColumn={{ xs: "span 12", sm: "span 12", md: "span 8", xl: "span 8" }} backgroundColor={colors.primary[400]} p="24px" borderRadius="11.2px" >
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              sx={{
                flexDirection: { xs: "column", sm: "row" }, // Dọc ở màn hình nhỏ, ngang ở màn hình lớn
                gap: { xs: 5, sm: 0 }, // Tạo khoảng cách giữa các box khi ở dạng dọc
                textAlign: { xs: "center", sm: "inherit" }, // Căn giữa khi dọc
              }}
            >
              {/* This Cycle */}
              <Box display="flex" flexDirection="column" alignItems={{ xs: "center", sm: "flex-start" }}>
                <Typography variant="h6" fontSize={{ xs: 20, sm: 25 }}>
                  {cycleLabel[0]}
                </Typography>
                <Typography variant="body2" fontSize={{ xs: 20, sm: 25 }}>
                  {totalCostThisCycle} VND
                </Typography>
              </Box>

              {/* Last Cycle */}
              <Box display="flex" flexDirection="column" alignItems="center">
                <Typography variant="h6" fontSize={{ xs: 20, sm: 25 }}>
                  {cycleLabel[1]}
                </Typography>
                <Typography variant="body2" fontSize={{ xs: 20, sm: 25 }}>
                  {TotalCostPrevCycle} VND
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

            <Box height="400px" bgcolor={colors.primary[400]} borderRadius={2}>
              {costChartOptions && <StackBarChart customOptions={costChartOptions}/>}
            </Box>
          </Box>
      
          {/* Pie Chart & Select Dropdown (30% width) */}
          <Box 
            gridColumn={{ xs: "span 12", sm: "span 12", md: "span 4", xl: "span 4" }} 
            backgroundColor={colors.primary[400]} 
            p="24px" 
            borderRadius="11.2px" 
            // display="flex"
            // flexDirection="column"
            // justifyContent="center"  // Căn giữa theo chiều dọc
            // alignItems="center"  // Căn giữa theo chiều ngang
            height="100%"  // Chiều cao đầy đủ
            gap={3}  // Khoảng cách giữa PieChart và Dropdown
          >
            {/* Pie Chart */}
            <Box 
              display="flex" 
              // justifyContent="center" 
              // alignItems="center"
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
  
  export default Cost;