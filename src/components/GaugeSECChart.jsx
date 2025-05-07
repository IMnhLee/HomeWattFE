import React, { useEffect, useRef } from "react";
import * as echarts from "echarts";
import { useTheme } from "@mui/material";
import { tokens } from "../theme";
import { Box } from "@mui/material";

const GaugeSECChart = ({ data }) => { // Là đồ thị đồng hồ đo trong dashboard chung để hiển thị suất sử dụng năng lượng. Sử dụng thư viện echarts.
  const theme = useTheme();  //lấy màu sắc và theme từ file theme.js
  const colors = tokens(theme.palette.mode);
  const chartRef = useRef(null); // Ref để gắn DOM element cho ECharts
  const chartInstanceRef = useRef(null); // Ref để lưu instance của ECharts

  useEffect(() => {
    // Kiểm tra điều kiện flag để hiển thị biểu đồ
    // console.log(data);
   
      // Khởi tạo ECharts nếu chưa có
      if (!chartInstanceRef.current) {
        chartInstanceRef.current = echarts.init(chartRef.current, null, {
          useDirtyRect: false,
        });
      }
      const chart = chartInstanceRef.current;

      // Cấu hình options từ code gốc
      const options = {
        textStyle: {
            fontFamily: "open-sans, sans-serif",
        },
        series: [
          {
            type: "gauge",
            center: ["50%", "60%"],
            startAngle: 235,
            endAngle: -55,
            min: 0,
            max: 120,
            splitNumber: 12,
            itemStyle: {
              color: colors.greenAccent[500], // Tương ứng #FFAB91
            },
            progress: {
              show: true,
              width: 30,
            },
            pointer: {
              show: false,
            },
            axisLine: {
              lineStyle: {
                width: 30,
              },
            },
            axisTick: {
              distance: -45,
              splitNumber: 5,
              lineStyle: {
                width: 2,
                color: colors.grey[200], // Tương ứng #999
              },
            },
            splitLine: {
              distance: -52,
              length: 14,
              lineStyle: {
                width: 3,
                color: colors.grey[200], // Tương ứng #999
              },
            },
            axisLabel: {
              distance: -20,
              color: colors.grey[200], // Tương ứng #999
              fontSize: 15,
            },
            anchor: {
              show: false,
            },
            title: {
              show: false,
            },
            detail: {
              valueAnimation: true,
              width: "60%",
              lineHeight: 40,
              borderRadius: 8,
              offsetCenter: [0, "0%"],
              formatter: "{value}\nkWh/m2",
              color: "inherit",
            },
            data: [
              {
                value: Math.round(data* 10) / 10,
              },
            ],
          },
          {
            type: "gauge",
            center: ["50%", "60%"],
            startAngle: 235,
            endAngle: -55,
            min: 0,
            max: 120,
            itemStyle: {
              color: colors.greenAccent[400], // Tương ứng #FD7347
            },
            progress: {
              show: true,
              width: 8,
            },
            pointer: {
              show: false,
            },
            axisLine: {
              show: false,
            },
            axisTick: {
              show: false,
            },
            splitLine: {
              show: false,
            },
            axisLabel: {
              show: false,
            },
            detail: {
              show: false,
            },
            data: [
              {
                value: Math.round(data * 100) / 100,
              },
            ],
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
    
  }, [colors, data]); // Dependency là colors và data

  return (
    <Box
      ref={chartRef}
      sx={{ width: "100%", height: "100%" }} // reponsive
    />
  );
};

export default GaugeSECChart;