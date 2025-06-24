import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  useTheme,
  Paper,
  Button,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
} from "@mui/material";
import { Add, Remove, Calculate, Delete } from "@mui/icons-material";
import Header from "../../components/Header";
import { tokens } from "../../theme";
import energyApi from "../../services/energy";

const VirtualLine = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  // State management
  const [availableLines, setAvailableLines] = useState([]);
  const [selectedLine, setSelectedLine] = useState('');
  const [addLines, setAddLines] = useState([]); // Bảng trên - cộng
  const [subtractLines, setSubtractLines] = useState([]); // Bảng dưới - trừ
  const [calculatedResult, setCalculatedResult] = useState(null);
  const [loading, setLoading] = useState(false);

  // Fetch data từ API
  useEffect(() => {
    const fetchLineData = async () => {
      try {
        setLoading(true);
        const response = await energyApi.getLineEnergyData();
        
        if (response.data) {
          // Transform API data để phù hợp với component
          const transformedData = response.data.map((line, index) => ({
            id: index + 1,
            name: line.lineName,
            lineCode: line.lineCode,
            voltage: parseFloat(line.voltage.toFixed(2)),
            current: parseFloat(line.current.toFixed(3)),
            power: parseFloat(line.power.toFixed(2)),
            energy: parseFloat(line.energy.toFixed(3)),
            recordTime: line.recordTime
          }));
          setAvailableLines(transformedData);
        }
      } catch (error) {
        console.error("Error fetching line data:", error);
        // Fallback to mock data nếu API lỗi
        const mockLines = [
          { id: 1, name: "Lộ đo A1", voltage: 220, current: 10, power: 2200, energy: 1500 },
          { id: 2, name: "Lộ đo A2", voltage: 220, current: 8, power: 1760, energy: 1200 },
          { id: 3, name: "Lộ đo B1", voltage: 380, current: 15, power: 5700, energy: 3800 },
          { id: 4, name: "Lộ đo B2", voltage: 380, current: 12, power: 4560, energy: 3000 },
          { id: 5, name: "Lộ đo C1", voltage: 220, current: 5, power: 1100, energy: 800 },
        ];
        setAvailableLines(mockLines);
      } finally {
        setLoading(false);
      }
    };

    fetchLineData();
  }, []);

  // Thêm lộ đo vào bảng cộng
  const handleAddToAddTable = () => {
    if (selectedLine && !addLines.find(line => line.id === selectedLine)) {
      const lineToAdd = availableLines.find(line => line.id === selectedLine);
      setAddLines([...addLines, lineToAdd]);
      setSelectedLine('');
    }
  };

  // Thêm lộ đo vào bảng trừ
  const handleAddToSubtractTable = () => {
    if (selectedLine && !subtractLines.find(line => line.id === selectedLine)) {
      const lineToAdd = availableLines.find(line => line.id === selectedLine);
      setSubtractLines([...subtractLines, lineToAdd]);
      setSelectedLine('');
    }
  };

  // Xóa lộ đo khỏi bảng cộng
  const handleRemoveFromAddTable = (id) => {
    setAddLines(addLines.filter(line => line.id !== id));
  };

  // Xóa lộ đo khỏi bảng trừ
  const handleRemoveFromSubtractTable = (id) => {
    setSubtractLines(subtractLines.filter(line => line.id !== id));
  };

  // Tính toán kết quả
  const handleCalculate = () => {
    // Tổng các lộ đo trong bảng cộng
    const addTotal = addLines.reduce((acc, line) => ({
      voltage: Math.max(acc.voltage, line.voltage), // Lấy điện áp cao nhất
      current: acc.current + line.current,
      power: acc.power + line.power,
      energy: acc.energy + line.energy,
    }), { voltage: 0, current: 0, power: 0, energy: 0 });

    // Tổng các lộ đo trong bảng trừ
    const subtractTotal = subtractLines.reduce((acc, line) => ({
      voltage: Math.max(acc.voltage, line.voltage),
      current: acc.current + line.current,
      power: acc.power + line.power,
      energy: acc.energy + line.energy,
    }), { voltage: 0, current: 0, power: 0, energy: 0 });

    // Kết quả = Tổng cộng - Tổng trừ
    const result = {
      voltage: parseFloat(addTotal.voltage.toFixed(2)),
      current: parseFloat(Math.max(0, addTotal.current - subtractTotal.current).toFixed(3)),
      power: parseFloat(Math.max(0, addTotal.power - subtractTotal.power).toFixed(2)),
      energy: parseFloat(Math.max(0, addTotal.energy - subtractTotal.energy).toFixed(3)),
    };

    setCalculatedResult(result);
  };

  return (
    <Box m="20px">
      <Header title="LỘ ĐO ẢO" subtitle="Tính toán thông số điện từ các lộ đo có sẵn" />

      {/* Line Selection */}
      <Box mb="20px">
        <Paper elevation={3} sx={{ p: 2, backgroundColor: colors.primary[400] }}>
          <Typography variant="h6" color={colors.grey[100]} mb={2} sx={{ fontSize: '18px' }}>
            Chọn lộ đo
          </Typography>
          <Box display="grid" gridTemplateColumns={{
            xs: "1fr",            // Mobile: Single column
            sm: "2fr 1fr 1fr"     // Tablet and up: Original layout
          }} gap={2} alignItems="center">
            <FormControl fullWidth>
              <InputLabel sx={{ color: colors.grey[100], fontSize: '16px', "&.Mui-focused": {color: colors.primary[100]}}}>
                {loading ? "Đang tải..." : "Chọn lộ đo"}
              </InputLabel>
              <Select
                value={selectedLine}
                onChange={(e) => setSelectedLine(e.target.value)}
                sx={{ 
                  color: colors.grey[100],
                  fontSize: '16px'
                }}
                disabled={loading}
              >
                {availableLines.map((line) => (
                  <MenuItem key={line.id} value={line.id} sx={{ fontSize: '16px' }}>
                    {line.name} {line.lineCode && `(${line.lineCode})`}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={handleAddToAddTable}
              disabled={loading || !selectedLine}
              sx={{ 
                backgroundColor: colors.greenAccent[600],
                '&:hover': { backgroundColor: colors.greenAccent[700] },
                fontSize: '14px'
              }}
            >
              Thêm vào (+)
            </Button>
            <Button
              variant="contained"
              startIcon={<Remove />}
              onClick={handleAddToSubtractTable}
              disabled={loading || !selectedLine}
              sx={{ 
                backgroundColor: colors.redAccent[600],
                '&:hover': { backgroundColor: colors.redAccent[700] },
                fontSize: '14px'
              }}
            >
              Thêm vào (-)
            </Button>
          </Box>
        </Paper>
      </Box>

      <Box display="grid" gridTemplateColumns={{
        xs: "1fr",            // Mobile: Single column (stacked)
        md: "1fr 1fr"         // Desktop: Two columns side-by-side
      }} gap={3}>
        {/* Bảng CỘNG */}
        <Card sx={{ backgroundColor: colors.primary[400] }}>
          <CardContent>
            <Typography variant="h6" color={colors.greenAccent[400]} mb={2}>
              <Add sx={{ mr: 1, verticalAlign: 'middle' }} />
              CÁC LỘ ĐO CỘNG
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ color: colors.grey[100], fontSize: '16px' }}>Tên lộ đo</TableCell>
                    <TableCell sx={{ color: colors.grey[100], fontSize: '16px' }}>U (V)</TableCell>
                    <TableCell sx={{ color: colors.grey[100], fontSize: '16px' }}>I (A)</TableCell>
                    <TableCell sx={{ color: colors.grey[100], fontSize: '16px' }}>P (W)</TableCell>
                    <TableCell sx={{ color: colors.grey[100], fontSize: '16px' }}>E (kWh)</TableCell>
                    <TableCell sx={{ color: colors.grey[100], fontSize: '16px' }}>Thao tác</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {addLines.map((line) => (
                    <TableRow key={line.id}>
                      <TableCell sx={{ color: colors.grey[100], fontSize: '15px' }}>{line.name}</TableCell>
                      <TableCell sx={{ color: colors.grey[100], fontSize: '15px' }}>{line.voltage}</TableCell>
                      <TableCell sx={{ color: colors.grey[100], fontSize: '15px' }}>{line.current}</TableCell>
                      <TableCell sx={{ color: colors.grey[100], fontSize: '15px' }}>{line.power}</TableCell>
                      <TableCell sx={{ color: colors.grey[100], fontSize: '15px' }}>{line.energy}</TableCell>
                      <TableCell>
                        <IconButton
                          onClick={() => handleRemoveFromAddTable(line.id)}
                          sx={{ color: colors.redAccent[500] }}
                        >
                          <Delete />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>

        {/* Bảng TRỪ */}
        <Card sx={{ backgroundColor: colors.primary[400] }}>
          <CardContent>
            <Typography variant="h6" color={colors.redAccent[400]} mb={2}>
              <Remove sx={{ mr: 1, verticalAlign: 'middle' }} />
              CÁC LỘ ĐO TRỪ
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ color: colors.grey[100], fontSize: '16px' }}>Tên lộ đo</TableCell>
                    <TableCell sx={{ color: colors.grey[100], fontSize: '16px' }}>U (V)</TableCell>
                    <TableCell sx={{ color: colors.grey[100], fontSize: '16px' }}>I (A)</TableCell>
                    <TableCell sx={{ color: colors.grey[100], fontSize: '16px' }}>P (W)</TableCell>
                    <TableCell sx={{ color: colors.grey[100], fontSize: '16px' }}>E (kWh)</TableCell>
                    <TableCell sx={{ color: colors.grey[100], fontSize: '16px' }}>Thao tác</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {subtractLines.map((line) => (
                    <TableRow key={line.id}>
                      <TableCell sx={{ color: colors.grey[100], fontSize: '15px' }}>{line.name}</TableCell>
                      <TableCell sx={{ color: colors.grey[100], fontSize: '15px' }}>{line.voltage}</TableCell>
                      <TableCell sx={{ color: colors.grey[100], fontSize: '15px' }}>{line.current}</TableCell>
                      <TableCell sx={{ color: colors.grey[100], fontSize: '15px' }}>{line.power}</TableCell>
                      <TableCell sx={{ color: colors.grey[100], fontSize: '15px' }}>{line.energy}</TableCell>
                      <TableCell>
                        <IconButton
                          onClick={() => handleRemoveFromSubtractTable(line.id)}
                          sx={{ color: colors.redAccent[500] }}
                        >
                          <Delete />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      </Box>

      {/* Calculate Button */}
      <Box mt={3} textAlign="center">
        <Button
          variant="contained"
          size="large"
          startIcon={<Calculate />}
          onClick={handleCalculate}
          disabled={addLines.length === 0}
          sx={{
            backgroundColor: colors.blueAccent[600],
            '&:hover': { backgroundColor: colors.blueAccent[700] },
            px: 4,
            py: 1.5
          }}
        >
          TÍNH TOÁN LỘ ĐO ẢO
        </Button>
      </Box>

      {/* Kết quả */}
      {calculatedResult && (
        <Box mt={3}>
          <Card sx={{ backgroundColor: colors.primary[400] }}>
            <CardContent>
              <Typography variant="h5" color={colors.yellowAccent[400]} mb={3} textAlign="center">
                KẾT QUẢ LỘ ĐO ẢO
              </Typography>
              <Box display="grid" gridTemplateColumns={{
                xs: "repeat(1, 1fr)",  // Mobile: 1 card per row
                sm: "repeat(2, 1fr)",  // Tablet: 2 cards per row
                md: "repeat(4, 1fr)"   // Desktop: 4 cards per row
              }} gap={3}>
                <Box textAlign="center" p={2} 
                     sx={{ backgroundColor: colors.primary[500], borderRadius: 2 }}>
                  <Typography variant="h6" color={colors.grey[100]}>
                    Hiệu điện thế
                  </Typography>
                  <Typography variant="h4" color={colors.blueAccent[400]} fontWeight="bold">
                    {calculatedResult.voltage} V
                  </Typography>
                </Box>
                <Box textAlign="center" p={2} 
                     sx={{ backgroundColor: colors.primary[500], borderRadius: 2 }}>
                  <Typography variant="h6" color={colors.grey[100]}>
                    Cường độ dòng điện
                  </Typography>
                  <Typography variant="h4" color={colors.greenAccent[400]} fontWeight="bold">
                    {calculatedResult.current} A
                  </Typography>
                </Box>
                <Box textAlign="center" p={2} 
                     sx={{ backgroundColor: colors.primary[500], borderRadius: 2 }}>
                  <Typography variant="h6" color={colors.grey[100]}>
                    Công suất
                  </Typography>
                  <Typography variant="h4" color={colors.yellowAccent[400]} fontWeight="bold">
                    {calculatedResult.power} W
                  </Typography>
                </Box>
                <Box textAlign="center" p={2} 
                     sx={{ backgroundColor: colors.primary[500], borderRadius: 2 }}>
                  <Typography variant="h6" color={colors.grey[100]}>
                    Số điện
                  </Typography>
                  <Typography variant="h4" color={colors.redAccent[400]} fontWeight="bold">
                    {calculatedResult.energy} kWh
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Box>
      )}
    </Box>
  );
};

export default VirtualLine;