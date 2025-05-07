import React, { useEffect, useRef } from "react";
import * as echarts from "echarts";
import { useTheme } from "@mui/material";
import { tokens } from "../theme";
import { Box } from "@mui/material";
import { merge } from "lodash";

const SankeyChart = ({ customOptions }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const chartRef = useRef(null); // Ref for chart container
  const chartInstanceRef = useRef(null); // Ref for ECharts instance

  useEffect(() => {
    // Initialize ECharts instance if not already created
    if (!chartInstanceRef.current) {
      chartInstanceRef.current = echarts.init(chartRef.current);
    }
    const chart = chartInstanceRef.current;

    const defaultOptions = {
      textStyle: { fontFamily: "open-sans, sans-serif" },
      tooltip: { trigger: "item", triggerOn: "mousemove" },
      backgroundColor: "transparent",
      series: [
        {
          type: "sankey",
          layout: "none",
          emphasis: {
            focus: "adjacency",
          },
          data: [
            { name: "a" },
            { name: "b" },
            { name: "a1" },
            { name: "a2" },
            { name: "b1" },
            { name: "c" },
          ],
          links: [
            { source: "a", target: "a1", value: 5 },
            { source: "a", target: "a2", value: 3 },
            { source: "b", target: "b1", value: 8 },
            { source: "a", target: "b1", value: 3 },
            { source: "b1", target: "a1", value: 1 },
            { source: "b1", target: "c", value: 2 },
          ],
        },
      ],
    };

    // Merge default and custom options
    const mergedOptions = merge({}, defaultOptions, customOptions);

    // ✅ Ensure series[0] exists and contains data + links
    if (
      !mergedOptions.series ||
      mergedOptions.series.length === 0 ||
      !mergedOptions.series[0].data ||
      !mergedOptions.series[0].links
    ) {
      console.warn("⚠️ Sankey data is missing or incorrect:", mergedOptions);
      return;
    }

    console.log("🎯 Applying Sankey Options:", mergedOptions);

    // ✅ Update the chart with the new options
    chart.setOption(mergedOptions, { notMerge: true });

    // ✅ Resize observer to adjust chart on container resize
    const resizeObserver = new ResizeObserver(() => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.resize();
      }
    });

    if (chartRef.current) {
      resizeObserver.observe(chartRef.current);
    }

    // Cleanup function to remove observers and dispose of the chart
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
  }, [customOptions]); // Runs when `customOptions` change

  return (
    <Box ref={chartRef} sx={{ width: "100%", height: "100%" }} />
  );
};

export default SankeyChart;
