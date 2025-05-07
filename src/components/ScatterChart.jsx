import React, { useEffect, useRef } from "react";
import * as echarts from "echarts";
import { useTheme } from "@mui/material";
import { tokens } from "../theme";
import { Box } from "@mui/material";
import {merge} from "lodash";

// Chỉ render khi customOptions thay đổi
const ScatterChart = React.memo(( {customOptions} ) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const chartRef = useRef(null); // Ref để gắn DOM element cho ECharts
  const chartInstanceRef = useRef(null); // Ref để lưu instance của ECharts

  // Khởi tạo và cập nhật ECharts instance
  useEffect(() => {
    // Khởi tạo ECharts nếu chưa có
    if (!chartInstanceRef.current) {
      chartInstanceRef.current = echarts.init(chartRef.current);
    }
    const chart = chartInstanceRef.current;
   

    const defaultOptions = {
      textStyle: {
        fontFamily: "sans-serif, sans-serif",
      },
      // color: [colors.redAccent[600],colors.yellowAccent[600],colors.greenAccent[600]],
      grid: {
        left: '2%',
        right: '2%',
        bottom: '15%',
        containLabel: true
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        },
      },
      xAxis: {
        axisLabel: {
          color: colors.primary[100],
          fontSize: '0.8rem',
          margin: 15,
        },
        axisTick: {
          alignWithLabel: true
        }
      },
      yAxis: {
        axisLabel: {
          color: colors.primary[100], // Màu từ theme
          fontSize: '0.8rem',
          interval: 0,
        },
        splitLine: {
          show: true,
          lineStyle: {
            color: colors.grey[600], // Tương ứng #888888
            width: 1,
          },
        },
      
      },
      
    };
    // kết hợp defaul và custom
    const mergedOptions = merge({}, defaultOptions, customOptions );

    chart.setOption(mergedOptions); // Áp dụng options

    // Thiết lập ResizeObserver để resize biểu đồ khi element cha thay đổi kích thước
    const resizeObserver = new ResizeObserver(() => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.resize();
      }
    });

    // Quan sát element chứa biểu đồ
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
      resizeObserver.disconnect(); // Ngắt ResizeObserver hoàn toàn
    };
  }, [colors, customOptions]); // Dependency là colors và data

  return (
      <Box
        ref={chartRef}
        sx={{ width: "100%", height: "100%" }} // Sử dụng sx để định kiểu
      />
  );
});

export default ScatterChart;