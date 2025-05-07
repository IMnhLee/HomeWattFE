import { tokens } from "../../theme";
import Header from "../../components/Header";
import React, { useState, useEffect } from "react";
import { Box, useTheme, Typography, Tabs, Tab, Button, Stack, Modal, Divider, IconButton } from "@mui/material";
import CheckboxTree from 'react-checkbox-tree';
import 'react-checkbox-tree/lib/react-checkbox-tree.css';
import "@fortawesome/fontawesome-free/css/all.min.css";

import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import CloseIcon from "@mui/icons-material/Close";
import PieChart from "../../components/PieChart";
import SelectTimeType from "../../components/SelectTimeType";
import { mockDataLocation, mockTreeLocation } from "../../data/mockDataLocation";
import StackBarChart from "../../components/StackBarChart";

const Location = () => {
  const [selectedCycle, setSelectedCycle] = useState("this"); // Default to "This Cycle"
  const [cycleLabel, setCycleLabel] = useState(["Hôm nay", "Hôm qua"]); //default là [hôm nay, hôm qua]

  const [totalConsumptionThisCycle, setTotalConsumptionThisCycle] = useState('');     // tổng sẽ hiển thị ở this cycle (hôm nay...)
  const [totalConsumptionPrevCycle, setTotalConsumptionPrevCycle] = useState('');     // tổng sẽ hiển thị ở last cycle (hôm qua...)
  const [comparison, setComparision] = useState();                                    // số % hiển thị ở phần so sánh

  const [locationStackBarChartOptions, setLocationStackBarChartOptions] = useState()  // options cho stack bar chart
  const [dataPie, setDataPie] = useState();       // dữ liệu cho piechart
  const [filterLabel, setFilterLabel] = useState([]);     // mảng chứa các label khi lọc và nhấn oke (tiếp theo sẽ truyền về back end)
  const [treeNodes, setTreeNodes] = useState([]);     // dữ liệu để truyền vào treeview with checkbox

  const [currentTimeType, setCurrentTimeType] = useState("day");      // loại thời gian chọn (day/month/year)

  const [openFilter, setOpenFilter] = useState(false);        //quản lý tắt, mở modal lọc
  const [checked, setChecked] = useState([]);                 // state lưu checked của treeview (tick hay ko)
  const [expanded, setExpanded] = useState([]);               // state lưu expanded của treeview (mở rộng hay ko)

  const [data, setData] = useState(null);                     // State to store the fetched data

  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  // Separate useEffect for fetching data
  useEffect(() => {
    //fetch data từ server (chỉ khi currentTimeType hoặc filterLabel thay đổi)
    const fetchedData = mockDataLocation;
    setData(fetchedData);

    // tạo label cho các tab this cycle và last cycle
    const labels = {
      day: ["Hôm nay", "Hôm qua"],
      month: ["Tháng này", "Tháng trước"],
      year: ["Năm nay", "Năm trước"],
    };

    // Cập nhật label của cycle khi thay đổi loại thời gian (ngày tháng năm)
    setCycleLabel(labels[currentTimeType] || ["Chu kỳ này", "Chu kỳ trước"]);

    // Dữ liệu sẽ sử dụng cho các Chart, Tổng và so sánh
    setTotalConsumptionThisCycle(fetchedData['current'].total);
    setTotalConsumptionPrevCycle(fetchedData['previous'].total);
    setComparision((fetchedData['current'].total - fetchedData['previous'].total) / fetchedData['previous'].total * 100);
  }, [currentTimeType, filterLabel]);

  // Separate useEffect for processing data based on selectedCycle
  useEffect(() => {
    if (!data) return;

    // Lấy dữ liệu dựa trên cycle đã chọn mà không cần fetch lại
    const chartData = selectedCycle === "this" ? data['current'] : data['previous'];

    // xử lý dữ liệu cho đồ thị bar và pie
    if (chartData !== undefined) {
      // hàm tính tổng tùy vào type label (hỗ trợ pie)
      const sumDataForType = (type) => {
        const totalForType = chartData.array.reduce((sum, item) => {
          return sum + item[type]
        }, 0);
        return totalForType;
      }

      // mảng chứa dữ liệu theo thứ tự từng label (series cho pie) (tổng từng phần)
      const totalForTypeArray = chartData.labels.map((label) => sumDataForType(label));

      // set dữ liệu cho đồ thị Pie
      setDataPie({
        series: totalForTypeArray,      //mảng tổng từng phần
        labels: chartData.labels,       //mảng nhãn từng phần
        colors: [
          colors.redAccent[600], 
          colors.greenAccent[600], 
          colors.blueAccent[600], 
          colors.yellowAccent[600]
        ],
        unit: 'kWh'                     //đơn vị
      });

      //tạo series cho bar chart dựa vào dữ liệu 
      const series = chartData.labels.map((label) => ({
        name: label,            // ví dụ ['A', 'B', ...]
        type: 'bar',
        stack: 'total',
        data: chartData.array.map(item => [new Date(item.timestamp), item[label] ? item[label] : 0])      //ví dụ: [["2025-03-21T00:00:00", 781246], ...]
      }))
      //Tạo options cho Appliances bar chart
      setLocationStackBarChartOptions({
        // cấu hình dữ liệu truyền vào
        color: [
          colors.redAccent[600], 
          colors.greenAccent[600], 
          colors.blueAccent[600], 
          colors.yellowAccent[600]
        ],
        series: series,
        // Cáu hình tooltip 
        tooltip: {
          formatter: (params) => {
            const date = new Date(params[0].axisValue);
            const formattedDate = date.toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' });
            return `
              ${formattedDate} <br/>
              ${params.map((param) => param.value[1] == 0 ? '' : `${param.marker} ${param.seriesName}: <strong>${param.value[1]}</strong> VNĐ <br/>`).join('')}
            `;
          },
        },
        yAxis: {
          axisLabel: {
            formatter: '{value} kWh'
          }
        },
        dataZoom: [
          {
            type: 'inside'
          },
          {
            type: 'slider'
          }
        ],
      });
    }
  }, [data, selectedCycle, theme.palette.mode]);

  useEffect(() => {
    const tree = mockTreeLocation;
    setTreeNodes(tree);
  }, [])

  // Xử lý mở rộng tất cả trong modal
  const handleExpandAll = () => {
    // Hàm đệ quy để lấy tất cả các giá trị của các node có con (tất cả node trừ node lá)
    const getAllParentValues = (node) => {
      // Nếu node không có con => bỏ
      if (!node.children || node.children.length === 0) {
        return [];
      }

      // Lấy giá trị của node hiện tại (nếu là lá thì đã vào lệnh if trước)
      // gọi đệ quy để lấy giá trị của tất cả các node con có con
      return [
        node.value,
        ...node.children.flatMap(child => getAllParentValues(child))
      ];
    };

    // Áp dụng hàm getAllParentValues cho mỗi node gốc trong treeNodes
    const allExpandableValues = treeNodes.flatMap(node => getAllParentValues(node));

    // Cập nhật state expanded với tất cả các giá trị cần mở rộng
    setExpanded(allExpandableValues);
  };

  // Xử lý thu gọn tất cả
  const handleCollapseAll = () => {
    setExpanded([]); // Thu gọn tất cả
  };

  // Chọn tất cả (chọn tất cả node lá)
  const handleSelectAll = () => {
    // Hàm đệ quy để lấy tất cả các giá trị của node lá là node con của nó
    const getAllValues = (node) => {
      if (!node.children || node.children.length === 0) {
        return [node.value];
      }

      // gọi đệ quy đối với con của nó
      return [
        ...node.children.flatMap(child => getAllValues(child))
      ];
    };

    // Áp dụng hàm getAllValues cho mỗi node gốc trong treeNodes
    const allValues = treeNodes.flatMap(node => getAllValues(node));

    // Cập nhật state checked với tất cả các giá trị
    setChecked(allValues);
  };

  // Bỏ chọn tất cả
  const handleDeselectAll = () => {
    setChecked([]);
  };

  // Hàm gọi khi nhấn Oke
  const handleChangeFilter = () => {
    console.log("Đã chọn:", checked);
    setOpenFilter(false);     // đóng modal
    setFilterLabel(checked);
  }

  return (
    <Box m="20px">
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Header title="Báo cáo" subtitle="Trang quản lý sử dụng năng lượng của các khu vực" />
        <Stack
          direction={{ xs: "column", sm: "row" }} // Dọc trên xs, ngang trên sm trở lên
          spacing={4} // Khoảng cách giữa các phần tử
          alignItems="center"
        >
          <Button
            sx={{
              backgroundColor: colors.blueAccent[600],
              height: "45px",
              borderRadius: "4px",
              width: { xs: "100%", sm: "100px" }, // Khi nhỏ thì full width
              color: colors.primary[100]
            }}
            onClick={() => setOpenFilter(true)}
          >
            Lọc
          </Button>
          <SelectTimeType onTimeTypeChange={setCurrentTimeType} />

          {/* Modal lọc */}
          <Modal
            // keepMounted
            open={openFilter}
            onClose={() => setOpenFilter(false)}
            aria-labelledby="modal-modal-title"
            aria-describedby="modal-modal-description"
          >
            <Box sx={{
              position: 'absolute',
              top: '40%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '90%', // Chiếm 90% màn hình trên mobile
              maxWidth: 500, // Không vượt quá 500px trên màn hình lớn
              // maxHeight: "80vh",
              bgcolor: colors.primary[400],
              borderRadius: 3,
              boxShadow: 24,
              overflowY: "auto", // Cuộn nếu nội dung dài
              px: 4,
              py: 2
            }}>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant="h4">Bộ lọc dữ liệu</Typography>
                <IconButton onClick={() => setOpenFilter(false)} sx={{}}>
                  <CloseIcon />
                </IconButton>
              </Box>
              <Divider sx={{
                bgcolor: colors.primary[400],
                mt: 1,
                mb: 2
              }} />

              <Box display="flex" justifyContent="space-between" gap={1} mb={2}>
                <Button variant="contained" size="small" onClick={handleExpandAll}
                  sx={{ bgcolor: colors.blueAccent[600] }}
                >
                  Mở rộng
                </Button>
                <Button variant="contained" size="small" onClick={handleCollapseAll}
                  sx={{ bgcolor: colors.blueAccent[600] }}
                >
                  Thu gọn
                </Button>
                <Button variant="contained" size="small" onClick={handleSelectAll}
                  sx={{ bgcolor: colors.blueAccent[600] }}
                >
                  Chọn tất cả
                </Button>
                <Button variant="contained" size="small" onClick={handleDeselectAll}
                  sx={{ bgcolor: colors.blueAccent[600] }}
                >
                  Bỏ chọn tất cả
                </Button>
              </Box>

              <CheckboxTree
                nodes={treeNodes}
                checked={checked}
                expanded={expanded}
                iconsClass="fa5"
                onCheck={setChecked}
                onExpand={setExpanded}
                showNodeIcon={false} // Ẩn icon thư mục mặc định


                icons={{
                  check: <span className="fas fa-check-square" />, // Icon khi checked
                  uncheck: <span className="far fa-square" />, // Icon khi chưa checked
                  halfCheck: <span className="fas fa-minus-square" />, // Icon trạng thái half-checked
                  expandClose: <span className="fas fa-chevron-right" />, // Icon mở rộng
                  expandOpen: <span className="fas fa-chevron-down" />, // Icon thu gọn
                  parentClose: <span className="fas fa-folder" />, // Icon folder đóng
                  parentOpen: <span className="fas fa-folder-open" />, // Icon folder mở
                  leaf: <span className="fas fa-leaf" />, // Icon lá (node con)
                }}
              />
              <Divider sx={{
                bgcolor: colors.primary[400],
                mt: 2,
                mb: 2
              }} />
              <Box display="flex" justifyContent="end">
                <Button
                  variant="contained"
                  // fullWidth
                  onClick={handleChangeFilter}
                  sx={{ bgcolor: colors.primary[300], "&:hover": { bgcolor: colors.blueAccent[600] }, }}
                >
                  OK
                </Button>
              </Box>
            </Box>
          </Modal>
        </Stack>
      </Box>
      {/* Tab chuyển cycle*/}
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs
          value={selectedCycle}
          onChange={(e, newValue) => setSelectedCycle(newValue)}
          // textColor="secondary"
          // indicatorColor="secondary"
          sx={{
            "& .MuiTabs-indicator": {
              backgroundColor: `${colors.blueAccent[600]}`, // Màu của thanh indicator
            },
            "& .MuiTab-root": {
              color: `${colors.primary[100]}`, // Màu chữ khi chưa được chọn
            },
            "& .Mui-selected": {
              color: `${colors.blueAccent[600]} !important`, // Màu chữ khi được chọn
            },
          }}
        >
          <Tab label={cycleLabel[0]} value={"this"} />
          <Tab label={cycleLabel[1]} value={"last"} />
        </Tabs>
      </Box>

      {/* Container for Charts */}
      <Box display="grid" gridTemplateColumns="repeat(12, 1fr)" gap="20px">
        {/* Appliances Bar Chart (70% width) */}
        <Box gridColumn={{ xs: "span 12", sm: "span 12", md: "span 8", xl: "span 8" }} backgroundColor={colors.primary[400]} p="24px" borderRadius="11.2px" >
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            sx={{
              flexDirection: { xs: "column", sm: "row" }, // Dọc ở màn hình nhỏ, ngang ở màn hình lớn
              gap: { xs: 5, sm: 0 }, // Tạo khoảng cách giữa các box khi ở dạng dọc
              textAlign: { xs: "center", sm: "inherit" }, // Căn giữa khi dọc
            }}
          >
            {/* This Cycle */}
            <Box display="flex" flexDirection="column" alignItems={{ xs: "center", sm: "flex-start" }}>
              <Typography variant="h6" fontSize={{ xs: 20, sm: 25 }}>
                {cycleLabel[0]}
              </Typography>
              <Typography variant="body2" fontSize={{ xs: 20, sm: 25 }}>
                {totalConsumptionThisCycle} kWh
              </Typography>
            </Box>

            {/* Last Cycle */}
            <Box display="flex" flexDirection="column" alignItems="center">
              <Typography variant="h6" fontSize={{ xs: 20, sm: 25 }}>
                {cycleLabel[1]}
              </Typography>
              <Typography variant="body2" fontSize={{ xs: 20, sm: 25 }}>
                {totalConsumptionPrevCycle} kWh
              </Typography>
            </Box>

            {/* Compare */}
            <Box display="flex" flexDirection="column" alignItems={{ xs: "center", sm: "flex-end" }}>
              <Typography variant="h6" fontSize={{ xs: 20, sm: 25 }}>
                So sánh
              </Typography>
              <Typography variant="body2" fontSize={{ xs: 20, sm: 25 }}>
                {comparison < 0 ? (
                  <ArrowDropDownIcon style={{ color: "red", fontSize: { xs: 20, sm: 25 } }} />
                ) : (
                  <ArrowDropUpIcon style={{ color: "green", fontSize: { xs: 20, sm: 25 } }} />
                )}
                <span>{Math.abs(comparison?.toFixed(2))}%</span>
              </Typography>
            </Box>
          </Box>

          <Box height="375px" bgcolor={colors.primary[400]} borderRadius={2}>
            {locationStackBarChartOptions && <StackBarChart customOptions={locationStackBarChartOptions} />}
          </Box>
        </Box>

        {/* Pie Chart */}
        <Box
          gridColumn={{ xs: "span 12", sm: "span 12", md: "span 4", xl: "span 4" }}
          backgroundColor={colors.primary[400]}
          p="24px"
          borderRadius="11.2px"
          // display="flex"         //Cố định ko resize
          // flexDirection="column"
          // justifyContent="center"  // Căn giữa theo chiều dọc
          // alignItems="center"  // Căn giữa theo chiều ngang
          height="100%"  // Chiều cao đầy đủ
        // gap={3}  // Khoảng cách giữa PieChart
        >
          {/* Pie Chart */}
          <Box
            display="flex"
            height="350px"
            p={2}
            borderRadius={2}
          >
            {dataPie && <PieChart data={dataPie} />}
          </Box>
        </Box>

      </Box>
    </Box>

  );
};

export default Location;