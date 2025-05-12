import React, { useEffect, useRef, useMemo } from "react";
import * as echarts from "echarts";
import { useTheme } from "@mui/material";
import { tokens } from "../theme";
import { Box } from "@mui/material";
import { merge } from "lodash";

const BarMixedLineChart = ({ customOptions, loading = false }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const chartRef = useRef(null);
  const chartInstanceRef = useRef(null);
  const resizeObserverRef = useRef(null);

  // Tách và memoize defaultOptions để tránh tính toán lại khi re-render
  const defaultOptions = useMemo(() => ({
    textStyle: {
      fontFamily: "sans-serif, sans-serif",
    },
    grid: {
      left: '2%',
      right: '2%',
      bottom: '10%',
      top: '15%',
      containLabel: true
    },
    xAxis: {
      type: 'time',
      axisLabel: {
        color: colors.primary[100],
        fontSize: '0.8rem',
        margin: 15,
      },
      axisTick: {
        alignWithLabel: true
      }
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      },
    },
    yAxis: [
      {
        type: "value",
        position: "left",
        axisLabel: {
          color: colors.primary[100],
          fontSize: '0.8rem',
          interval: 0,
        },
        splitLine: {
          show: true,
          lineStyle: {
            color: colors.grey[600],
            width: 1,
          },
        },
      },
      {
        type: "value",
        position: "right",
        axisLabel: {
          color: colors.primary[100],
          fontSize: '0.8rem',
          interval: 0,
        },
        splitLine: {
          show: true,
          lineStyle: {
            color: colors.grey[600],
            width: 1,
          },
        },
      },
    ],
  }), [colors]);

  // Memoize mergedOptions để tránh merge không cần thiết
  const mergedOptions = useMemo(() => 
    merge({}, defaultOptions, customOptions),
    [defaultOptions, customOptions]
  );

  useEffect(() => {
    // Hàm khởi tạo biểu đồ
    const initChart = () => {
      if (!chartRef.current) return;

      try {
        // Khởi tạo chart nếu chưa có
        if (!chartInstanceRef.current) {
          chartInstanceRef.current = echarts.init(chartRef.current);
        }
        
        // Cập nhật options
        chartInstanceRef.current.setOption(mergedOptions, true);
        
        // Xử lý trạng thái loading nếu có
        if (loading) {
          chartInstanceRef.current.showLoading({
            text: 'Loading data...',
            color: colors.blueAccent[500],
            textColor: colors.primary[100],
            maskColor: 'rgba(0, 0, 0, 0.1)',
          });
        } else {
          chartInstanceRef.current.hideLoading();
        }
      } catch (error) {
        console.error("Error initializing chart:", error);
      }
    };

    initChart();

    // Tạo ResizeObserver một lần duy nhất
    if (!resizeObserverRef.current && chartRef.current) {
      resizeObserverRef.current = new ResizeObserver(() => {
        if (chartInstanceRef.current) {
          chartInstanceRef.current.resize();
        }
      });
      resizeObserverRef.current.observe(chartRef.current);
    }

    // Window resize handler
    const handleWindowResize = () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.resize();
      }
    };
    
    window.addEventListener('resize', handleWindowResize);

    // Cleanup khi component unmount
    return () => {
      window.removeEventListener('resize', handleWindowResize);
      
      if (resizeObserverRef.current) {
        if (chartRef.current) {
          resizeObserverRef.current.unobserve(chartRef.current);
        }
        resizeObserverRef.current.disconnect();
        resizeObserverRef.current = null;
      }
      
      if (chartInstanceRef.current) {
        chartInstanceRef.current.dispose();
        chartInstanceRef.current = null;
      }
    };
  }, [mergedOptions, colors, loading]);

  return (
    <Box
      ref={chartRef}
      sx={{ 
        width: "100%", 
        height: "100%",
        position: "relative" 
      }}
      data-testid="bar-mixed-line-chart"
    />
  );
};

// Sử dụng React.memo để tối ưu renders
export default React.memo(BarMixedLineChart);