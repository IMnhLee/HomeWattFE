import React, { useState, useEffect } from "react";
import Chart from "react-apexcharts";
import { useTheme } from "@mui/material";
import { tokens } from "../theme";
import { Box } from "@mui/material";
import {merge} from "lodash";

//Chỉ re render khi customOptions thay đổi 
const PieChart = React.memo(({ isDashboard = false,data, height='350px', customOptions }) => { // Là biểu đồ hình tròn hiển thị trên dashboad chung thể hiện phần trăm các năng lượng được sử dụng. Hiện tại thì điện chiếm 100%. Sử dụng apexchart. Data thì lấy từ mockDashboard, Tham số isDashboard chưa được sử dụng, 
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const [chartData, setChartData] = useState({
    series: data?.series || [], 
    labels: data?.labels || [],
    colors: data?.colors || [],
  });

  // Cập nhật dữ liệu khi `data` thay đổi
  useEffect(() => {
    if (data) {
      setChartData({
        series: data.series ,
        labels: data.labels ,
        colors: data.colors ,
        unit: data.unit,
      });
    }
  }, [data]); // Chạy lại khi `data` thay đổi

  const options = {
    colors: chartData.colors,
    series: chartData.series,
    labels: chartData.labels,

    chart: {
      type: "donut", // Chuyển thành "donut" thay vì "pie"
      background: "transparent",
      height: "100%",
      animations: {
        enabled: false,
      },
    },
    dataLabels: {
      enabled: true,
   
    },
    stroke: {
      show: false,
      width: 0,
    },
    fill: {
      opacity: 1,
    },
    noData: {
      text: "Loading...",
      style: {
        color: colors.grey[100], // Màu chữ khi không có dữ liệu
      },
    },
    legend: {
    //   show: !isDashboard,
      position: "bottom",
      labels: {
        colors: colors.grey[100], // Màu chữ của legend
      },
   
      formatter: function (seriesName) {
        return seriesName;
      },
    },
    responsive: [
      {
        breakpoint: 480,
        options: {
          legend: {
            position: "bottom",
          },
        },
      },
    ],
    plotOptions: {
      pie: {
        expandOnClick: false,
        donut: {
          size: "75%",
          labels: {
            show: true,
            total: {
              show: true,
              label: "Tổng",
              showAlways: false,
              formatter: function (w) {
                return (
                  (w.globals.seriesTotals.reduce((a, b) => a + b, 0)).toFixed(1) +
                  " " + chartData.unit
                );
              },
              color: colors.grey[100], // Màu chữ
            },
            value: {
              show: true,
              formatter: function (val) {
                return Number(val).toFixed(2) + " " + chartData.unit
              },
              color: colors.grey[100], // Màu chữ
            },
          },
        },
      },
    },
    yaxis: {
      decimalsInFloat: 1,
      labels: {
        formatter: function (value) {
          return value.toFixed(1) + " " + chartData.unit;
        },
        style: {
          colors: colors.grey[100], // Màu chữ của trục y
        },
      },
    },
 
 
  };
  // const mergedOptions = merge({}, options, customOptions);
  return (
    <Box style={{ width: "100%" , height:"100%"}}>
      <Chart options={options} series={chartData.series} type="donut" width="100%" height={height} />
    </Box>
  );
});

export default PieChart;