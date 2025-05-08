import React, { useEffect, useRef, useMemo } from "react";
import * as echarts from "echarts/core";
import { BarChart } from "echarts/charts";
import {
  GridComponent,
  TooltipComponent,
  AxisPointerComponent,
  TimelineComponent,
  TitleComponent,
} from "echarts/components";
import { CanvasRenderer } from "echarts/renderers";
import { useTheme } from "@mui/material";
import { tokens } from "../theme";
import merge from "lodash/merge"; // Import riêng merge để giảm kích thước

// Đăng ký các component cần thiết
echarts.use([
  BarChart,
  GridComponent,
  TooltipComponent,
  AxisPointerComponent,
  TimelineComponent,
  TitleComponent,
  CanvasRenderer,
]);

// Chỉ render khi customOptions thay đổi
const StackBarChart = React.memo(({ customOptions }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const containerRef = useRef(null);
  const chartRef = useRef(null);
  const chartInstanceRef = useRef(null);

  // Tạo defaultOptions với useMemo để tránh tính toán lại giữa các render
  const defaultOptions = useMemo(() => ({
    textStyle: {
      fontFamily: "sans-serif, sans-serif",
    },
    grid: {
      left: '2%',
      right: '2%',
      bottom: '15%',
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
      confine: true, // Giữ tooltip trong biên chart
    },
    yAxis: {
      type: 'value',
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
    animation: false, // Tắt animation cho hiệu suất tốt hơn với dữ liệu lớn
  }), [colors]);

  // Tối ưu mergeOptions với useMemo
  const mergedOptions = useMemo(() => 
    merge({}, defaultOptions, customOptions), 
    [defaultOptions, customOptions]
  );

  useEffect(() => {
    // Hàm khởi tạo chart với thiết lập renderer tối ưu
    const initChart = () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.dispose();
      }
      
      // Renderer type: 'canvas' cho hiệu suất tốt hơn với nhiều dữ liệu
      chartInstanceRef.current = echarts.init(chartRef.current, null, {
        renderer: 'canvas',
        useDirtyRect: true // Tăng hiệu suất bằng cách chỉ vẽ lại các vùng bị thay đổi
      });
      
      chartInstanceRef.current.setOption(mergedOptions, true);
    };

    // Khởi tạo chart nếu chưa có hoặc cập nhật options
    if (!chartInstanceRef.current) {
      // Đợi DOM được render
      requestAnimationFrame(initChart);
    } else {
      chartInstanceRef.current.setOption(mergedOptions, true);
    }

    // Thiết lập ResizeObserver với throttle thay vì debounce
    let resizeTimer;
    const handleResize = () => {
      if (!resizeTimer) {
        resizeTimer = setTimeout(() => {
          if (chartInstanceRef.current) {
            chartInstanceRef.current.resize();
          }
          resizeTimer = null;
        }, 100);
      }
    };

    const resizeObserver = new ResizeObserver(handleResize);
    
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    // Cleanup
    return () => {
      resizeObserver.disconnect();
      clearTimeout(resizeTimer);
      if (chartInstanceRef.current) {
        chartInstanceRef.current.dispose();
        chartInstanceRef.current = null;
      }
    };
  }, [mergedOptions]);

  // Xử lý theme change
  useEffect(() => {
    if (chartInstanceRef.current) {
      // Chỉ cập nhật màu sắc khi theme thay đổi
      chartInstanceRef.current.setOption({
        xAxis: { axisLabel: { color: colors.primary[100] } },
        yAxis: { 
          axisLabel: { color: colors.primary[100] },
          splitLine: { lineStyle: { color: colors.grey[600] } }
        }
      });
    }
  }, [colors]);

  return (
    <div ref={containerRef} style={{ width: '100%', height: '100%' }}>
      <div ref={chartRef} style={{ width: '100%', height: '100%' }} />
    </div>
  );
});

export default StackBarChart;