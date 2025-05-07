import React, { useEffect, useRef } from "react";
import * as echarts from "echarts";
import { useTheme } from "@mui/material";
import { tokens } from "../theme";
import { Box } from "@mui/material";

const EstimateChart = ({ data, forecastData }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const chartRef = useRef(null); // Ref để gắn DOM element cho ECharts
  const chartInstanceRef = useRef(null); // Ref để lưu instance của ECharts

  
  useEffect(() => {
    // Khởi tạo ECharts nếu chưa có
    if (!chartInstanceRef.current) {
      chartInstanceRef.current = echarts.init(chartRef.current, null, {
        useDirtyRect: false,
      });
    }
    const chart = chartInstanceRef.current;

    // Tạo mixedArray từ data
    const mixedArray = data
      ? data
      : [];
    // console.log(mixedArray)
    // console.log(forecastData)
    // Cấu hình options dựa trên code JavaScript gốc
    const options = {
        textStyle: {
            color: colors.grey[100], // Màu chữ mặc định từ theme
          
            fontFamily: "open-sans, sans-serif",
                },
      title: [
        {
          text:
            "Hiện tại: " +
            (data
              ? (data[data.length - 1][1] / 1000).toFixed(2) + " MWh"
              : "0 MWh"), // Tiêu đề bên trái
          left: "left",
          textStyle: {
            color: colors.grey[100], // Màu từ theme
            fontSize: "0.9rem",
          },
        },
        {
          text:  
            "Dự báo " + 
            (forecastData
              ? (forecastData[forecastData.length - 1][1] / 1000).toFixed(2) + " MWh"
              : "0 Mwh"
            ),
          right: "right",
          textStyle: {
            color: colors.grey[100], // Màu từ theme
            fontSize: "0.9rem",
          },
        },
      ],
      color: [colors.redAccent[500], colors.grey[600]], // Tương ứng #d73e71 và #273c7e
      tooltip: {
        trigger: "axis",
        axisPointer: {
          type: "cross",
          label: {
            backgroundColor: colors.grey[600], // Tương ứng #6a7985
          },
        },
        
      },
      grid: {
        top: "10%",
        left: "3%",
        right: "3%",
        bottom: "3%",
        containLabel: true,
      },
      xAxis: [
        {
          type: "time", // Định dạng thời gian
          boundaryGap: false,
          axisLabel: {
            color: colors.grey[100], // Màu từ theme
          },
        },
      ],
      yAxis: [
        {
          type: "value",
          splitLine: {
            show: true,
            lineStyle: {
              color: colors.grey[400], // Tương ứng #888888
              width: 1,
            },
          },
        },
      ],
      series: [
        {
          name: "Tiêu thụ",
          type: "line",
          areaStyle: {},
          data: mixedArray, // Dữ liệu thực tế
          symbolSize: 9,
          showSymbol: false,
          // label: {
          //   show: true,
          //   position: "top",
          //   fontSize: "1.2rem",
          //   color: colors.grey[100], // Màu từ theme
          //   formatter: (value) => value.data,
          // },
          valueFormatter: (value) => `${value.toFixed(0)} kWh`, // Định dạng giá trị trong tooltip
        },
        {
          name: "Forecast",
          type: "line",
          areaStyle: {},
          data: forecastData,
          symbolSize: 9,
        },
      ],
    };

    chart.setOption(options); // Áp dụng options

    // Thiết lập ResizeObserver để resize biểu đồ
    const resizeObserver = new ResizeObserver(() => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.resize();
      }
    });

    if (chartRef.current) {
      resizeObserver.observe(chartRef.current);
    }

    // Dọn dẹp khi component unmount
    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.dispose();
        chartInstanceRef.current = null;
      }
      if (chartRef.current) {
        resizeObserver.unobserve(chartRef.current);
      }
      resizeObserver.disconnect();
    };
  }, [colors, data, forecastData]); // Dependency là colors và data

  return (
    <Box
      ref={chartRef}
      sx={{ width: "100%", height: "100%" }} // Đặt chiều cao cố định, có thể tùy chỉnh
    />
  );
};

export default EstimateChart;