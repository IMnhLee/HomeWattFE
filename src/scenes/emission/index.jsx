import LineChart from "../../components/LineChart";
import Header from "../../components/Header";
import React, { useState, useEffect, useRef,useMemo } from "react";
import { Box, useTheme, MenuItem, Select,  Typography } from "@mui/material";
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import SelectTimeType from "../../components/SelectTimeType";
import { mockDataForLineChart, mockDataForSum } from "../../data/mockEmission";

import { tokens } from "../../theme";

const Emission=()=>{
    const theme = useTheme();
    const colors = tokens(theme.palette.mode); // lấy màu từ theme
    
    const [data, setData] = useState(mockDataForLineChart);
    const [thisCycle, setThisCycle] = useState(mockDataForSum[0]);
    const [prevCycle, setPrevCycle] = useState(mockDataForSum[1]);
    const [currentTimeType, setCurrentTimeType] = useState("day");

    const emissionChartOptions = useMemo(() => {
        if (data.length === 0) return null;

        return {
            color: [colors.greenAccent[600]],
            title: [
                {
                    text: `Till now: ${thisCycle} kg CO2`,
                    left: "left",
                    textStyle: {
                        color: colors.grey[100],
                        fontSize: "0.9rem",
                    },
                },
            ],
            series: [
                {
                    name: "Emission",
                    type: "line",
                    data: data,
                    lineStyle: {
                        width: 4,
                    },
                    symbolSize: 9,
                    showSymbol: false,
                    valueFormatter: (value) => `${value.toFixed(0)} kg CO2`,
                },
            ],
            tooltip: {
                trigger: "axis",
                // backgroundColor: colors.primary[600],
                axisPointer: {
                    type: "cross",
                    label: {
                        backgroundColor: colors.grey[600],
                    },
                },
                textStyle: {
                    color: colors.primary[300],
                },
                formatter: (params) => {
                    const date = new Date(params[0].axisValue);
                    const formattedDate = date.toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' });
                    return `
                      ${formattedDate} <br/>
                      ${params[0].value[1] == 0 ? '' : `${params[0].marker} Kì này: <strong>${params[0].value[1]}</strong> kg CO2 <br/>`}`;
                },
            },
        };
    }, [data, thisCycle, colors]);

    // 🔹 Update data when `currentTimeType` changes
    useEffect(() => {
        if (currentTimeType === "day") {
            setThisCycle(mockDataForSum[0]);
            setData(mockDataForLineChart);
            setPrevCycle(mockDataForSum[1]);
        } else if (currentTimeType === "month") {
            setThisCycle(mockDataForSum[2]);  // You may need different values for month
            setData(mockDataForLineChart);   // You may need different data for month
            setPrevCycle(mockDataForSum[3]); // You may need different values for month
        } else if (currentTimeType === "year") { // ✅ Fixed "month" -> "year"
            setThisCycle(mockDataForSum[0]);  // Replace with yearly values if needed
            setData(mockDataForLineChart);   // Replace with yearly data if needed
            setPrevCycle(mockDataForSum[1]); // Replace with yearly values if needed
        }
    }, [currentTimeType]);

    // Tính toán comparison bằng useMemo
    const comparison = useMemo(() => {
        return ((thisCycle - prevCycle) / prevCycle) * 100;
    }, [thisCycle, prevCycle]);
    
    return(
        <Box m = "20px">
            <Box display="flex" justifyContent="space-between" alignItems="center">
            <Header title="Lượng khí thải" />
                    <SelectTimeType onTimeTypeChange={setCurrentTimeType}/>
            </Box>
            
            {/* Container for Charts */}
            <Box display="grid" gridTemplateColumns="repeat(1, 1fr)" gap="20px">
                <Box gridColumn={{ xs: "span 1", sm: "span 1", md: "span 1", xl: "span 1" }} backgroundColor={colors.primary[400]} p="24px" borderRadius="11.2px" >
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                        {/* This Cycle */}
                        <Box display="flex" flexDirection="column" alignItems="flex-start" >
                        <Typography variant="h6" fontSize={25}>
                            This Cycle
                        </Typography>
                        <Typography variant="body2" fontSize={25} >
                            {thisCycle} kg
                        </Typography>
                        </Box>

                        {/* Last Cycle */}
                        <Box display="flex" flexDirection="column" alignItems="center" >
                        <Typography variant="h6" fontSize={25}>
                            Last Cycle
                        </Typography>
                        <Typography variant="body2" fontSize={25} >
                            {prevCycle} kg
                        </Typography>
                        </Box>

                        {/* Compare*/}
                        <Box display="flex" flexDirection="column" alignItems="flex-end" >
                        <Typography variant="h6" fontSize={25}>
                            Compare
                        </Typography>
                        <Typography variant="body2" fontSize={25} >
                            {comparison < 0 ? (
                            <ArrowDropDownIcon style={{ color: "red", fontSize: 30 }} />
                            ) : (
                            <ArrowDropUpIcon style={{ color: "green", fontSize: 30 }} />
                            )}
                            <span>{Math.abs(comparison.toFixed(2))}%</span>
                        </Typography>
                        </Box>
                        </Box>
                        <Box height="68vh" bgcolor={colors.primary[400]} borderRadius={2}paddingTop={2} >
                            {emissionChartOptions && <LineChart customOptions={emissionChartOptions}/>}
                        </Box>
                    </Box>

            </Box>
        </Box>
    );
    
}
export default Emission;