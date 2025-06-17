import { Box, Paper, Typography, useTheme, useMediaQuery } from "@mui/material";
import { tokens } from "../../theme";
import Header from "../../components/Header";
import BarMixedLineChart from "../../components/BarMixedLineChart";
import { useState, useEffect } from "react";

const Report = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [chartLoading, setChartLoading] = useState(true);
  
  // Responsive breakpoints
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const isMediumScreen = useMediaQuery(theme.breakpoints.between('sm', 'lg'));

  // Mock data for the chart - replace with API call in a real application
  const [electricityData, setElectricityData] = useState([]);

  useEffect(() => {
    // Simulate API call with mock data
    const fetchData = async () => {
      setChartLoading(true);
      try {
        // Mock data - replace with actual API call
        const mockData = [
          { month: "2024-01", consumption: 210, cost: 420000 },
          { month: "2024-02", consumption: 230, cost: 460000 },
          { month: "2024-03", consumption: 245, cost: 490000 },
          { month: "2024-04", consumption: 260, cost: 520000 },
          { month: "2024-05", consumption: 300, cost: 600000 },
          { month: "2024-06", consumption: 350, cost: 700000 },
          { month: "2024-07", consumption: 380, cost: 760000 },
          { month: "2024-08", consumption: 400, cost: 800000 },
          { month: "2024-09", consumption: 320, cost: 640000 },
          { month: "2024-10", consumption: 290, cost: 580000 },
          { month: "2024-11", consumption: 270, cost: 540000 },
          { month: "2024-12", consumption: 250, cost: 500000 },
        ];
        
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        setElectricityData(mockData);
      } catch (error) {
        console.error("Error fetching electricity data:", error);
      } finally {
        setChartLoading(false);
      }
    };

    fetchData();
  }, []);

  // Prepare chart options
  const chartOptions = {
    title: {
      text: 'Điện năng Tiêu Thụ và Chi Phí',
      left: 'center',
      textStyle: {
        color: colors.grey[100]
      }
    },
    legend: {
      data: ['Consumption', 'Cost'],
      bottom: 0,
      textStyle: {
        color: colors.grey[100]
      }
    },
    xAxis: {
      type: 'category',
      data: electricityData.map(item => {
        const date = new Date(item.month);
        return date.toLocaleString('default', { month: 'short', year: '2-digit' });
      }),
      // axisLabel: {
      //   interval: 0,
      //   rotate: 45
      // }
    },
    yAxis: [
      {
        type: 'value',
        // name: 'kWh',
        // nameTextStyle: { color: colors.grey[100], fontSize: '15px' },
        min: 0,
        axisLabel: {
          formatter: '{value} kWh'
        }
      },
      {
        type: 'value',
        // name: 'VND',
        // nameTextStyle: { color: colors.grey[100], fontSize: '15px' },
        min: 0,
        axisLabel: {
          formatter: '{value} VND'
        }
      }
    ],
    series: [
      {
        name: 'Consumption',
        type: 'bar',
        data: electricityData.map(item => item.consumption),
        itemStyle: {
          color: colors.blueAccent[600]
        },
        emphasis: {
          itemStyle: {
            color: colors.greenAccent[500]
          }
        },
      },
      {
        name: 'Cost',
        type: 'line',
        yAxisIndex: 1,
        data: electricityData.map(item => item.cost),
        lineStyle: {
          color: colors.yellowAccent[400],
          width: 3
        },
        itemStyle: {
          color: colors.yellowAccent[400]
        },
        symbol: 'circle',
        symbolSize: 8,
        // smooth: true
      }
    ],
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'cross'
      },
      formatter: function(params) {
        let result = `<div style="font-weight: bold; margin-bottom: 5px">${params[0].axisValueLabel}</div>`;
        params.forEach(param => {
          const value = param.seriesName.includes('Cost') 
            ? param.value.toLocaleString() + ' VND'
            : param.value + ' kWh';
            
          result += `<div style="display: flex; align-items: center; margin: 5px 0">
            <span style="display: inline-block; width: 10px; height: 10px; border-radius: 50%; background-color: ${param.color}; margin-right: 5px"></span>
            <span><b>${param.seriesName}:</b> ${value}</span>
          </div>`;
        });
        return result;
      }
    }
  };

  // Statistics for the top summary cards
  const getTotalConsumption = () => {
    return electricityData.reduce((sum, item) => sum + item.consumption, 0);
  };

  const getTotalCost = () => {
    return electricityData.reduce((sum, item) => sum + item.cost, 0);
  };

  const getAverageConsumption = () => {
    if (electricityData.length === 0) return 0;
    return getTotalConsumption() / electricityData.length;
  };

  const getAverageCost = () => {
    if (electricityData.length === 0) return 0;
    return getTotalCost() / electricityData.length;
  };

  return (
    <Box m="20px">
      {/* HEADER */}
      <Header title="Report" subtitle="Electricity Consumption and Cost Report" />

      {/* CSS GRID LAYOUT */}
      <Box 
        display="grid" 
        gridTemplateColumns="repeat(12, 1fr)"
        gap="24px"
      >
        {/* STATISTICS CARDS */}
        <Box 
          gridColumn={isSmallScreen ? "span 12" : (isMediumScreen ? "span 6" : "span 3")}
          component={Paper}
          sx={{
            p: 2,
            display: "flex",
            flexDirection: "column",
            height: 140,
            bgcolor: colors.primary[400],
            border: `1px solid ${colors.grey[800]}`,
          }}
        >
          <Typography variant="h5" color={colors.grey[100]}>
            Tổng Tiêu Thụ Điện
          </Typography>
          <Box
            display="flex"
            alignItems="center"
            justifyContent="center"
            height="100%"
          >
            <Typography variant="h3" fontWeight="bold" color={colors.greenAccent[500]}>
              {getTotalConsumption().toLocaleString()} kWh
            </Typography>
          </Box>
        </Box>
        
        <Box 
          gridColumn={isSmallScreen ? "span 12" : (isMediumScreen ? "span 6" : "span 3")}
          component={Paper}
          sx={{
            p: 2,
            display: "flex",
            flexDirection: "column",
            height: 140,
            bgcolor: colors.primary[400],
            border: `1px solid ${colors.grey[800]}`,
          }}
        >
          <Typography variant="h5" color={colors.grey[100]}>
            Tổng chi phí
          </Typography>
          <Box
            display="flex"
            alignItems="center"
            justifyContent="center"
            height="100%"
          >
            <Typography variant="h3" fontWeight="bold" color={colors.yellowAccent[400]}>
              {getTotalCost().toLocaleString()} VND
            </Typography>
          </Box>
        </Box>
        
        <Box 
          gridColumn={isSmallScreen ? "span 12" : (isMediumScreen ? "span 6" : "span 3")}
          component={Paper}
          sx={{
            p: 2,
            display: "flex",
            flexDirection: "column",
            height: 140,
            bgcolor: colors.primary[400],
            border: `1px solid ${colors.grey[800]}`,
          }}
        >
          <Typography variant="h5" color={colors.grey[100]}>
            Trung bình Tiêu Thụ hàng tháng
          </Typography>
          <Box
            display="flex"
            alignItems="center"
            justifyContent="center"
            height="100%"
          >
            <Typography variant="h3" fontWeight="bold" color={colors.greenAccent[500]}>
              {getAverageConsumption().toFixed(2)} kWh
            </Typography>
          </Box>
        </Box>
        
        <Box 
          gridColumn={isSmallScreen ? "span 12" : (isMediumScreen ? "span 6" : "span 3")}
          component={Paper}
          sx={{
            p: 2,
            display: "flex",
            flexDirection: "column",
            height: 140,
            bgcolor: colors.primary[400],
            border: `1px solid ${colors.grey[800]}`,
          }}
        >
          <Typography variant="h5" color={colors.grey[100]}>
            Trung bình chi phí hàng tháng
          </Typography>
          <Box
            display="flex"
            alignItems="center"
            justifyContent="center"
            height="100%"
          >
            <Typography variant="h3" fontWeight="bold" color={colors.yellowAccent[400]}>
              {getAverageCost().toLocaleString()} VND
            </Typography>
          </Box>
        </Box>
        
        {/* CHART */}
        <Box 
          gridColumn="span 12"
          component={Paper}
          sx={{
            p: 2,
            display: "flex",
            flexDirection: "column",
            height: 550,
            bgcolor: colors.primary[400],
            border: `1px solid ${colors.grey[800]}`,
          }}
        >
          <Box
            height="500px"
            width="100%"
            display="flex" 
            flexDirection="column"
          >
            <BarMixedLineChart 
              customOptions={chartOptions} 
              loading={chartLoading} 
            />
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default Report;