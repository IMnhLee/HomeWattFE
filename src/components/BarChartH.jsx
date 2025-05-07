import React, { useState, useEffect } from "react";
import Chart from "react-apexcharts";
import { useTheme } from "@mui/material";
import { tokens } from "../theme";
import { Box } from "@mui/material";

const BarChartH = ({ // Là bar ngang có tiêu đề "Các phụ tải tiêu thụ" trong dashboard chung. Đồ thị này sử dụng thư viện apexchart. Thể hiện sự tiêu thụ điện của các phụ tải khác
  data = { }, // Dữ liệu mặc định là object rỗng
  columnWidth = "75%",
  stack = false,
  id = "barchart-h",
  unit = "kWh",
  height = "100%", // Chiều cao mặc định
}) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode); //màu sắc và theme được lấy từ file theme.js

  // State để lưu dữ liệu biểu đồ
  const [chartData, setChartData] = useState({
    series: [],
    categories: [],
    chartColors: [],
  });

  // Cập nhật dữ liệu khi `data` thay đổi
  useEffect(() => {
    if (data.loadType) {
      const seriesData = data.loadType? Object.values(data.loadType):[]; // Giá trị từ loadType
      const categories = data.loadType? Object.keys(data.loadType):[]; // Tên từ loadType
   

      setChartData({
        series: [{ data: seriesData }],
        categories: categories,
      });
    }
  }, [data]); // Chạy lại khi data hoặc colors thay đổi

  // Cấu hình options dựa trên renderBarChart
  const options = {
    series: chartData.series,
    chart: {
      height: height,
      type: "bar",
      id: id,
      stacked: stack,
      background: "transparent",
      toolbar: {
        show: false,
      },
    },
    theme: {
      mode: theme.palette.mode, // Đồng bộ với theme (dark/light)
    },
    dataLabels: {
      enabled: false, // Tắt dataLabels cho biểu đồ ngang như trong renderBarChart
    },
    plotOptions: {
      bar: {
        columnWidth: columnWidth,
        borderRadius: 4,
        borderRadiusApplication: "end", // Chỉ áp dụng bo tròn ở "end" (phía trên với horizontal bar)
        borderRadiusWhenStacked: "all", // Không ảnh hưởng vì không stack
        horizontal: true, // Biểu đồ ngang
        distributed: true, // Phân phối màu cho từng cột
      },
    },
    xaxis: {
      categories: chartData.categories,
      labels: {
        hideOverlappingLabels: true,
        formatter: function (val) {
          if (val > 1000000) return (val / 1000000).toFixed(1) + "GWh";
          if (val > 1000) return (val / 1000).toFixed(1) + "MWh";
          else return val.toFixed(0) + unit;
        },
        style: {
          colors: colors.grey[100], // Màu chữ từ theme
        },
      },
      decimalsInFloat: 0,
      forceNiceScale: true,
      // tickAmount: 4,
    },
    yaxis: {
      show: true,
      labels: {
        style: {
          colors: colors.grey[100], // Màu chữ từ theme
          fontSize: "0.75rem"
        },
      },
    },
    tooltip: {
      theme: theme.palette.mode,
      x: {
        show: true,
      },
      y: {
        title: {
          formatter: function () {
            return ""; // Bỏ tiêu đề y trong tooltip
          },
        },
        formatter: function (value) {
          return value.toFixed(2).toLocaleString() + unit; // "1,234.56 kWh"
        },
      },
    },
    grid: {
      borderColor: colors.grey[500], // Tương ứng #555
    },
    // colors: chartData.chartColors, // Màu từ theme
    legend: {
      show: false, // Ẩn legend như trong renderBarChart
    },
    noData: {
      text: "Loading...",
      style: {
        color: colors.grey[100],
      },
    },
  };

  return (
    <Box sx={{ width: "100%", height: "100%" }}>
      <Chart
        options={options}
        series={chartData.series}
        type="bar"
        width="100%"
        height={height}
      />
    </Box>
  );
};

export default BarChartH;