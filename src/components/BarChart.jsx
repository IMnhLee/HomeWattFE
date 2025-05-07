import React, { useEffect, useRef } from "react";
import * as echarts from "echarts";
import { useTheme } from "@mui/material";
import { tokens } from "../theme";
import { Box } from "@mui/material";


const BarChart = ({ data, currentTimeType }) => { // Đây là bar chart dọc với tiêu đề chi phí trên dashboard chung. Sử dụng thư viện echarts. Có 2 dữ liệu tham số truyền vào. Data là dữ liệu của giá trị chi phí của kỳ so sánh và kỳ được chọn cùng với giá trị tương lai của kỳ so sánh. CurrentTimeType là dữ liệu truyền vào từ hàm selectTimeType trong thư mục components(có thể là ngày hoặc tháng hoặc năm). Dùng để chọn tần suất của kỳ so sánh và kỳ được chọn. Xuất hiện bên phải trên cùng của dashboard

  
  const theme = useTheme();
  const colors = tokens(theme.palette.mode); // theme và màu sắc được lấy từ trong file theme.js
  const chartRef = useRef(null); // Ref để gắn DOM element cho ECharts
  const chartInstanceRef = useRef(null); // Ref để lưu instance của ECharts


  // currentTimeType phải được dùng kiểu khác chứ không dùng cho việc xác định category trên y-axis. Coi như tham số currentTimeType chưa được sử dụng. Phần này chưa code xong .

  let yLabel = ['Hôm nay', 'Hôm qua'];
  if (currentTimeType === "day") {
    yLabel = ['Hôm qua', 'Hôm nay'];
  }
  else if (currentTimeType === "month") {
    yLabel = ["Tháng trước", "Tháng này"];
  }
  else if (currentTimeType ==="year") {
    yLabel = ["Năm ngoái", "Năm nay"];
  }
  // Khởi tạo và cập nhật ECharts instance
  useEffect(() => {
    // Khởi tạo ECharts nếu chưa có
    if (!chartInstanceRef.current) {
      chartInstanceRef.current = echarts.init(chartRef.current);
    }
    const chart = chartInstanceRef.current;

    // Cấu hình options với màu từ colors
    const options = {
      textStyle: {
        fontFamily: "open-sans, sans-serif",
      },
      color: [colors.greenAccent[600], colors.greenAccent[400]], // Màu từ theme
      grid: {
        bottom: 30,
        right: "3%",
        top: "8%",
        left: "3%",
      },
      xAxis: {
        type: "category",
        data: yLabel, // Dữ liệu cho y-axis
        axisLabel: {
          color: colors.primary[100], // Màu từ theme
          fontSize: '1rem',
          interval: 0,
        },
      },
      yAxis: {
        type: "value",
        axisLabel: { show: false },
        splitLine: {
          show: true,
          lineStyle: {
            color: colors.grey[400], // Màu từ theme
            width: 1,
          },
        },
      },
      series: [
        {
          data: data? data
            : [34.5, 12.6], // Giá trị mặc định hoặc từ data
          type: "bar",
          barWidth: "50%",
          colorBy: "data",
          showBackground: true,
          itemStyle: {
            borderRadius: [10, 10, 0, 0],
          },
          label: {
            show: true,
            position: "top",
            fontSize: "1.2rem",
            color: colors.grey[100], // Màu từ theme
            formatter: (value) => value.data + " Triệu",
          },
        },
      ],
    };

    chart.setOption(options); // Áp dụng options

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
  }, [colors, data]); // Dependency là colors và data

  return (
      <Box
        ref={chartRef}
        sx={{ width: "100%", height: "100%" }} // Sử dụng sx để định kiểu
      />
  );
};

export default BarChart;