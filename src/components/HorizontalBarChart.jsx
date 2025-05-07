import React, { useEffect, useRef } from "react";
import * as echarts from "echarts";
import { useTheme } from "@mui/material";
import { tokens } from "../theme";
import { Box } from "@mui/material";
// import { useTranslation } from "react-i18next";

const HorizontalBarChart = ({ data, currentTimeType }) => { // Là bar chart ngang tiêu đề "Phát thải khí nhà kính" trong dashboard.  Có 2 tham số truyền vào đó là dữ liệu số tấn khí phát thải nhà kính trong chu kỳ trước, chu kỳ này và tương lai và currentTimeType là giá trị của chu kỳ có thể là ngày hoặc tháng hoặc năm trong bên phải trên cùng của dashboard. Xem kỹ hơn file SelectTimeType trong cùng component
  const theme = useTheme();  // màu và theme được lấy từ file theme.js trong src
  const colors = tokens(theme.palette.mode);
  const chartRef = useRef(null); // Ref để gắn DOM element cho ECharts
  const chartInstanceRef = useRef(null); // Ref để lưu instance của ECharts
  // const {t} = useTranslation();

  // Khi tham số currentTimeType thay đổi, thì category trên y-axis cũng thay đổi theo chu kỳ tương úng
  let yLabel = ['Hôm nay', 'Hôm qua'];
  if (currentTimeType === "day") { //ngày
    yLabel = ['Hôm nay', 'Hôm qua'];
  }
  else if (currentTimeType === "month") { // tháng
    yLabel = ["Tháng này", "Tháng trước"];
  }
  else if (currentTimeType ==="year") { //năm

    yLabel = ["Năm nay", "Năm ngoái"];
  }
  // Khởi tạo và cập nhật ECharts instance
  useEffect(() => {
    // Khởi tạo ECharts nếu chưa có
    if (!chartInstanceRef.current) {
      chartInstanceRef.current = echarts.init(chartRef.current);
    }
    const chart = chartInstanceRef.current;

    const actualData = [data.previousCO2, data.currentCO2]; // biến dữ liệu thực tế của chu kỳ trước và chu kỳ này. Được hiển thị màu xanh trên đồ thị. 
    const forecastData = [(data.forecastCO2 - actualData[1])]; // biến lấy dữ liệu dự đoán trừ đi dữ liệu thực tế của chu kỳ này. Được hiển thị màu xám trên đồ thị.Chính vì thế, trên đồ thị không có hiện màu xám ở chu kỳ trước

    const options = {
      textStyle: {
        fontFamily: "sans-serif, sans-serif",
      },
      color: [colors.greenAccent[400], colors.grey[300]], // màu của 2 biến actualData và forecastData. Màu từ theme
      tooltip: { //custom tooltip(phần hiện ra khi di chuột vào đồ thị)

        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        },

        formatter: (params) => { // chỉnh sửa phần hiển thị dữ liệu trên tooltip trên đồ thị

          let actual = 0;
          let forecast = 0;
    
          params.forEach(item => {
           if (item.seriesName === 'Thực tế') {
              actual = item.value;
            }
            if (item.seriesName === 'Dự báo') {
              forecast = item.value;
            }
          });
    
          return `
            ${params[0].axisValue} <br/>

            ${params[0].marker} Thực tế: <strong>${actual}</strong> Tấn<br/>
            ${forecast === 0 ? '' : `${params[1].marker} Dự báo: <strong>${actual + forecast}</strong> Tấn`}

          `;
        }
      },
      grid: {
        left: '0%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
      xAxis: {
        type: 'value',
        splitLine: {
          show: true,
          lineStyle: {
            color: colors.grey[400], // Màu từ theme
            width: 1,
          },
        }
      },
      yAxis: {
        type: 'category',
        axisLabel: {
          color: colors.primary[100], // Màu từ theme

          fontSize: '0.8rem',

          interval: 0,
        },
        data: yLabel
      },
      series: [
        {
          name: 'Thực tế',
          type: 'bar',
          stack: 'total',

          data: actualData, // biến dữ liệu được hiển thị màu xanh lá bao gồm dữ liệu thực tế của chu kỳ trước và chu kỳ này
          barWidth: '25%',
          label: {
            show: true,
            // position: "insideRight",
            position: ['2%', '-50%'],
            color: colors.grey[100],
            fontSize: "0.8rem",

            formatter: (value) => "Thực tế" + ": " + value.data + " Tấn",
          },
        },
        {
          name: 'Dự báo',
          type: 'bar',
          stack: 'total',

          data: forecastData, //được hiển thị màu xám đằng sau dữ liệu của chu kỳ này
          barWidth: '25%',

          label: {
            show: true,
            // position: "insideRight",
            position: ['-30%', '-50%'],
            color: colors.grey[100],

            fontSize: "0.8rem",

            formatter: (params) => {
              const total = params.data + (params.seriesIndex === 0 ? 0 : options.series[0].data[params.dataIndex]);
              return total !== 0 ? "Dự báo: " + total + " Tấn" : '';
            },
          },
        },
      ]
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
        sx={{ width: "100%", height: "100%" }} // Sử dụng sx để định kiểu, reponsive

      />
  );
};

export default HorizontalBarChart;