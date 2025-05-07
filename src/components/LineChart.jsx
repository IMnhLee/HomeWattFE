import React, { useEffect, useRef } from "react";
import * as echarts from "echarts";
import { useTheme } from "@mui/material";
import { tokens } from "../theme";
import { Box } from "@mui/material";
import {merge} from "lodash";

const LineChart = ({ customOptions }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const containerRef = useRef(null);
  const chartRef = useRef(null);
  const chartInstanceRef = useRef(null);

  useEffect(() => {
    if (!chartInstanceRef.current) {
      chartInstanceRef.current = echarts.init(chartRef.current, null, {
        useDirtyRect: false,
      });
    }
    const chart = chartInstanceRef.current;

    const defaultOptions = {
      textStyle: {
        // color: colors.grey[100], // Màu chữ mặc định từ theme
      
        fontFamily: "open-sans, sans-serif",
      },
      color: [colors.redAccent[500]], // Tương ứng #d73e71
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
            color: colors.primary[100],
            fontSize: '0.8rem',
            margin: 15,
          },
        },
      ],
      yAxis: [
        {
          type: "value",
          axisLabel: {
            color: colors.primary[100], // Màu từ theme
            fontSize: '0.8rem',
            interval: 0,
          },
          splitLine: {
            show: true,
            lineStyle: {
              color: colors.primary[200],
              width: 1,
            },
          },
        },
      ],
    };

    // Kết hợp options mặc định và options tùy chỉnh
    const mergedOptions = merge({}, defaultOptions, customOptions );

    chart.setOption(mergedOptions);


    
    // Resize observer with debounce
    let resizeTimeout;
    const resizeObserver = new ResizeObserver(() => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        chartInstanceRef.current?.resize();
      }, 100);
    });

    // Observe the outer container
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    // Initial resize to fix layout issues
    setTimeout(() => {
      chartInstanceRef.current?.resize();
    }, 200);

    // Fallback: window resize
    const handleWindowResize = () => {
      chartInstanceRef.current?.resize();
    };
    window.addEventListener('resize', handleWindowResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleWindowResize);
      resizeObserver.disconnect();
      if (chartInstanceRef.current) {
        chartInstanceRef.current.dispose();
        chartInstanceRef.current = null;
      }
    };
  }, [customOptions, colors]);

  return (
    <div ref={containerRef} style={{ width: '100%', height: '100%' }}>
      <div ref={chartRef} style={{ width: '100%', height: '100%' }} />
    </div>
  );
};

export default LineChart;