import React, { useEffect, useRef } from "react";
import * as echarts from "echarts";
import { useRadioGroup, useTheme } from "@mui/material";
import { tokens } from "../theme";
import { Box } from "@mui/material";
import {merge} from "lodash";

// Chỉ render khi customOptions thay đổi
const StackBarChart = React.memo(( {customOptions} ) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const containerRef=useRef(null);
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
        top: '20%',
        bottom: '2%',
        containLabel: true
      },
      //cấu hình trục x
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
      //hiển thị thông tin khi hover vào cột
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        },
      },

      //Cấu hình trục y
      yAxis: {
        type: 'value',
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

      // cấu hình thanh brush
    }

    
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
  }, [customOptions]);

  return (
    <div ref={containerRef} style={{ width: '100%', height: '100%' }}>
      <div ref={chartRef} style={{ width: '100%', height: '100%' }} />
    </div>
  );
});

export default StackBarChart;