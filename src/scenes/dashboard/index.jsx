import { Box, Button, IconButton, Typography, useTheme } from "@mui/material";
import Divider from "@mui/material/Divider";
import { tokens } from "../../theme";
import Header from "../../components/Header";
import PieChart from "../../components/PieChart";
import BarChart from "../../components/BarChart";
import LineChart from "../../components/LineChart";
import BarChartH from "../../components/BarChartH";
import GaugeSECChart from "../../components/GaugeSECChart";
import HorizontalBarChart from "../../components/HorizontalBarChart";
import React, { useState, useEffect, useMemo } from "react";
import MonthPick from "../../components/MonthPick";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
// import ToggleButton from '@mui/material/ToggleButton';
// import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import SelectTimeType from "../../components/SelectTimeType";

import mockData from "../../data/mockDashboard"; // Lấy dữ liệu giả từ thư mục data file mockDashboard

import ARIMA from "arima";

const Dashboard = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedDate2, setSelectedDate2] = useState(null);
  const [canFetch, setCanFetch] = useState(false); // Trạng thái cho phép gọi API
  const [dataBar, setDataBar] = useState(""); // biến lưu dữ liệu cho đồ thị cột chi phí
  const [dataES, setDataES] = useState(""); // biến lưu dữ liệu thực tế cho đồ thị area ước tính tiêu thụ
  const [dataPie, setDataPie] = useState(""); // biến lưu dữ liệu cho đồ thị tròn
  const [foreCastDataES, setForeCastDataES] = useState(""); // biến lưu dữ liệu dự đoán cho đồ thị area ước tính tiêu thụ
  const [dataBarH, setDataBarH] = useState(""); //biến lưu dữ liệu cho đồ thị bar ngang Các phụ tải tiêu thụ
  const [dataSEC, setDataSEC] = useState(0); // biến lưu dữ liệu cho đồng hồ đo

  const [dataCO2, setDataCO2] = useState(""); //biến lưu dữ liệu cho đồ thị bar ngang Phát thải khí nhà kính

  // const [dataES, setDataES] = useState("");

  const [price, setPrice] = useState(""); // Lưu giá trị
  const [priceColor, setPriceColor] = useState(""); // Lưu màu
  //   const [alignment, setAlignment] = React.useState('left');
  const [currentTimeType, setCurrentTimeType] = useState("day");
  // console.log(currentTimeType)

  useEffect(() => {
    const updatePrice = () => {
      const currentHour = new Date().getHours(); // Lấy giờ hiện tại (0-23)
      let newPrice = "";
      let newColor = "";

      if (currentHour < 4) {
        newPrice = "1,136";
        newColor = colors.greenAccent[500]; // Màu xanh
      } else if (currentHour < 10) {
        newPrice = "1,749";
        newColor = colors.blueAccent[500]; // Màu vàng (dùng redAccent vì không có vàng trực tiếp)
      } else if (currentHour < 12) {
        newPrice = "3,242";
        newColor = colors.redAccent[500]; // Màu đỏ
      } else if (currentHour < 18) {
        newPrice = "1,749";
        newColor = colors.blueAccent[500]; // Màu vàng
      } else if (currentHour < 21) {
        newPrice = "3,242";
        newColor = colors.redAccent[500]; // Màu đỏ
      } else {
        newPrice = "1,136";
        newColor = colors.greenAccent[500]; // Màu xanh
      }

      setPrice(newPrice);
      setPriceColor(newColor);
    };

    updatePrice(); // Cập nhật ngay khi mount
    const interval = setInterval(updatePrice, 60000); // Cập nhật mỗi phút

    return () => clearInterval(interval); // Dọn dẹp interval
  }, [colors]); // Dependency là colors để cập nhật khi theme đổi

  //Hàm hỗ trợ tạo các timestamp còn thiếu trong 1 ngày/1 tháng/ 1 năm
  const generateNextTimestamp = (dataES, count) => {
    // lấy timestamp cuối cùng trong dữ liệu
    const lastTimeStamp = dataES[dataES.length - 1][0];
    let nextTimeStamp = lastTimeStamp;
    // mảng result: mảng chứa các giá trị timestamp tiếp theo trong 1 ngày/ 1 tháng/ 1 năm
    const result = [];
    // nếu chọn kiểu là ngày
    if (currentTimeType == "day") {
      // Vòng lặp để tạo timestamp còn thiếu trong ngày tính từ giờ của timestamp cuối trong bộ dữ liệu
      for (let i = 0; i < count; i++) {
        //timestamp có dạng yyyy-mm-ddThh:mm:ss, dataPart là phần yyyy-mm-dd, timePart là hh:mm:ss
        const [datePart, timePart] = nextTimeStamp.split("T");
        // lấy ra giờ phút giây
        let [hours, minutes, seconds] = timePart.split(":").map(Number);
        // tăng giờ thêm 1
        hours += 1;
        // tạo lại timestamp theo cấu trúc
        nextTimeStamp = `${datePart}T${String(hours).padStart(2, "0")}:${String(
          minutes
        ).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
        result.push(nextTimeStamp);
      }
      console.log(result);
    }
    // kiểu chọn là tháng
    else if (currentTimeType == "month") {
      // Vòng lặp để tạo timestamp còn thiếu trong tháng tính từ ngày của timestamp cuối trong bộ dữ liệu
      for (let i = 0; i < count; i++) {
        //timestamp có dạng yyyy-mm-ddThh:mm:ss, dataPart là phần yyyy-mm-dd, timePart là hh:mm:ss
        const [datePart, timePart] = nextTimeStamp.split("T");
        let [year, month, day] = datePart.split("-").map(Number);
        // tăng ngày thêm 1
        day += 1;
        //tạo lại timestamp theo cấu trúc
        nextTimeStamp = `${year}-${month}-${String(day).padStart(
          2,
          "0"
        )}T${timePart}`;
        result.push(nextTimeStamp);
      }
    } else if (currentTimeType == "year") {
      // Vòng lặp để tạo timestamp còn thiếu trong năm tính từ tháng của timestamp cuối trong bộ dữ liệu
      for (let i = 0; i < count; i++) {
        const [datePart, timePart] = nextTimeStamp.split("T");
        let [year, month, day] = datePart.split("-").map(Number);
        month += 1;
        nextTimeStamp = `${year}-${String(month).padStart(
          2,
          "0"
        )}-${day}T${timePart}`;
        result.push(nextTimeStamp);
      }
    }
    return result;
  };

  // Tạo dữ liệu cho phần dự đoán của estimateChart (useMemo để có thể lưu vào cache)
  useMemo(() => {
    const generateForecast = async () => {
      // hàm để tạo ra dữ liệu dự đoán cho đồ thị area
      if (dataES.length > 0) {
        //dataES có dạng [[timeStamp, value]]; biến value là mảng giá trị các value tuần tự
        const values = dataES.map((item) => item[1]);
        //lastTimestamp: giá trị timeStamp cuối cùng trong mảng
        const lastTimestamp = dataES[dataES.length - 1][0];
        // số timeStamp cần dự đoán
        let remainTimestamp;
        const date = new Date(lastTimestamp);
        if (currentTimeType === "day") {
          // số giờ còn thiếu để đủ 24 giờ (00 - 23)
          remainTimestamp = 24 - dataES.length;
        } else if (currentTimeType === "month") {
          // số ngày còn thiếu để đủ ngày cho tháng của biến date
          remainTimestamp =
            new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate() -
            date.getDate();
        } else {
          // số tháng còn thiếu trong 1 năm
          remainTimestamp = 12 - date.getMonth() - 1;
        }

        // Tạo timestamps cho các giờ tiếp theo
        const nextHours = generateNextTimestamp(dataES, remainTimestamp);

        if (remainTimestamp > 0) {
          try {
            // Khởi tạo mô hình ARIMA với các tham số p=1, d=1, q=1
            const arima = new ARIMA({
              p: 1,
              d: 0,
              q: 1,
              verbose: false,
            });

            await arima.train(values);
            // Dự báo cho các giờ còn lại trong ngày
            const forecast = arima.predict(remainTimestamp);
            console.log(forecast);

            // Kết hợp để tạo ra [[timestamp, value], ...]
            const newForecastData = nextHours.map((timestamp, index) => [
              timestamp,
              parseFloat(forecast[0][index].toFixed(2)),
            ]);
            newForecastData.unshift(dataES[dataES.length - 1]);
            setForeCastDataES(newForecastData);
          } catch (error) {
            console.error("Lỗi khi dự báo ARIMA:", error);
          }
        }
      }
    };

    // Các trường hợp không cần dự đoán (khi đã đầy đủ dữ liệu)
    if (
      (currentTimeType == "day" && dataES.length == 24) ||
      (currentTimeType == "month" && dataES.length == 30) ||
      (currentTimeType == "year" && dataES.length == 12)
    ) {
      //foreCastDataES sẽ chứa mình giá trị cuối cùng trong ngày
      const newForecastData = [];
      newForecastData.unshift(dataES[dataES.length - 1]);
      setForeCastDataES(newForecastData);
    } else {
      generateForecast();
    }
  }, [dataES]);

  const fetchData = async () => {
    const data = mockData; // lấy dữ liệu giả về

    setDataBar([
      Math.round((data["lastTotal_sum"] / 1e6) * 10) / 10,
      Math.round((data["total_sum"] / 1e6) * 10) / 10,
    ]); // 2 biến lastTotal_sum và total_sum trong mockDashboard sẽ được dùng làm dữ liệu cho đồ thị cột chi phí
    setDataES(
      data["index_array"].map((time, index) => [
        time,
        data["total_array"][index],
      ])
    );
    setDataPie(data["totalE"]);
    setDataCO2(data["dataCO2"]);
    setDataBarH({ loadType: data["loadType"] });
    if (data["SEC"]["flag"] == 1) {
      setDataSEC(data["SEC"]["SEC"]);
      data["SEC"]["msg"] = "Có lỗi trong truy vấn dữ liệu";
    } else {
      data["SEC"]["msg"] = "Có lỗi trong truy vấn dữ liệu";
      toast(data["SEC"]["msg"], {
        autoClose: 5000, // Thời gian hiển thị 5 giây
        closeButton: true, // Có nút đóng
        style: { background: "#f92672", color: "#fff" }, // Đổi màu nền giống Toastify.js
      });
      console.log("notify");
    }
    // setDataLine({
    //   title:
    //     "Hiện tại: " +
    //     data["co2_array"]
    //       .reduce((sum, currentValue) => sum + currentValue, 0)
    //       .toFixed(0) +
    //     " kg",
    //   data: data["index_array"].map((time, index) => [
    //     time,
    //     data["co2_array"][index],
    //   ]),
    //   unit: "kg",
    // });
  };

  useEffect(() => {
    if (!canFetch) {
      setCanFetch(true);
      fetchData();
    }
  }, [selectedDate, selectedDate2, currentTimeType]); // useEffect chạy một lần khi mở component

  const notify = () => {
    toast("Kiểm tra toasty!", {
      autoClose: 5000, // Thời gian hiển thị 5 giây
      closeButton: true, // Có nút đóng
      style: { background: "#f92672", color: "#fff" }, // Đổi màu nền giống Toastify.js
    });
    console.log("notify");
  };
  // useEffect(() => {
  //   fetchData();
  // }, []); // Dependency array rỗng để chạy chỉ một lần khi component mount

  // biến lưu options cho đồ thị tròn
  const pieOptions = useMemo(() => {
    if (!dataPie) return null;
    let name = [];
    let value = [];
    dataPie.forEach((item) => {
      Object.entries(item).forEach(([key, val]) => {
        if (key !== "color") {
          name.push(key);
          value.push(parseFloat(val.toFixed(3)));
        }
      });
    });

    return {
      series: value,
      labels: name,
      colors: dataPie.map((item) => item.color),
      unit: "kWh",
    };
  }, [dataPie, colors]);

  // //biến lưu options cho estimate chart sử dụng useMemo
  const estimateChartOptions = useMemo(() => {
    if (!dataES || !foreCastDataES || dataES.length === 0 || foreCastDataES.length === 0) return null;

    return {
      color: [colors.redAccent[500], colors.grey[600]],
      title: [
        {
          text: `Hiện tại: ${(dataES[dataES.length - 1][1] / 1000).toFixed(2)} MWh`,
          left: "left",
          textStyle: {
            color: colors.grey[100],
            fontSize: "0.9rem",
          },
        },
        {
          text: `Dự báo ${(foreCastDataES[foreCastDataES.length - 1][1] / 1000).toFixed(2)} MWh`,
          right: "right",
          textStyle: {
            color: colors.grey[100],
            fontSize: "0.9rem",
          },
        },
      ],
      series: [
        {
          name: "Tiêu thụ",
          type: "line",
          areaStyle: {},
          data: dataES,
          symbolSize: 9,
          showSymbol: false,
          valueFormatter: (value) => `${value.toFixed(0)} kWh`,
        },
        {
          name: "Forecast",
          type: "line",
          areaStyle: {},
          data: foreCastDataES,
          symbolSize: 9,
        },
      ],
    };
  }, [colors, dataES, foreCastDataES]);

  return (
    <Box m="20px">
      <ToastContainer />
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Header
          title="Quản Lý Năng Lượng"
          subtitle="Trang quản lý tổng quan cơ sở sử dụng năng lượng"
        />
        <MonthPick />
        {/* <SelectTimeType onTimeTypeChange={setCurrentTimeType} /> */}
        {/* <Box> */}
        {/* <ToggleButtonGroup
				value={alignment}
				exclusive
				//   onChange={handleAlignment}
				aria-label="text alignment"
				>
				<ToggleButton value="left" aria-label="left aligned" >
					Ngày
				</ToggleButton>
				<ToggleButton value="center" aria-label="centered">
					Tháng
				</ToggleButton>
				<ToggleButton value="right" aria-label="right aligned">
					Năm
				</ToggleButton>
				
				</ToggleButtonGroup> */}
        {/* </Box> */}
      </Box>

      <Box display="grid" gridTemplateColumns="repeat(12, 1fr)" gap="15px">
        {/* <Box gridColumn={{ xs: "span 12", sm: "span 12", md: "span 12", xl: "span 12" }} backgroundColor={colors.primary[400]} p="24px" borderRadius="11.2px" 
			display="grid" gridTemplateColumns="repeat(12, 1fr)" gap="15px">
				<Typography variant="h5" fontWeight="600"  gridColumn={{ xs: "span 12", sm: "span 12", md: "span 12", xl: "span 12" }} >
					Chọn thời gian
				</Typography>
				<Box gridColumn={{ xs: "span 12", sm: "span 12", md: "span 6", xl: "span 6" }} >
					<DatePick 
						initDate={[new Date(new Date(new Date().getTime() - 1 * 24 * 60 * 60 * 1000).setHours(0, 0, 0, 0)),new Date(new Date().setHours(0, 0, 0, 0))]}
						onChange={(date) => setSelectedDate(date)} 
						label="Chọn thời gian muốn xem" />
					
				</Box>
				<Box gridColumn={{ xs: "span 12", sm: "span 12", md: "span 6", xl: "span 6" }} >
				<DatePick 
					initDate={[new Date(new Date(new Date().getTime() - 2 * 24 * 60 * 60 * 1000).setHours(0, 0, 0, 0)),new Date(new Date(new Date().getTime() - 1 * 24 * 60 * 60 * 1000).setHours(0, 0, 0, 0))]}
					onChange={(date) => setSelectedDate2(date)}
					label="Chọn thời gian muốn so sánh" />
				</Box>
			</Box> */}

        <Box
          gridColumn={{
            xs: "span 12",
            sm: "span 12",
            md: "span 6",
            xl: "span 4",
          }}
          backgroundColor={colors.primary[400]}
          p="24px"
          borderRadius="11.2px"
        >
          <Typography variant="h4" fontWeight="600" pb="24px">
            Sử dụng năng lượng
          </Typography>

          <Box display="flex" height={"350px"}>
            {pieOptions && <PieChart data={pieOptions} />}
          </Box>
        </Box>

        <Box
          gridColumn={{
            xs: "span 12",
            sm: "span 12",
            md: "span 6",
            xl: "span 4",
          }}
          backgroundColor={colors.primary[400]}
          p="24px"
          borderRadius="11.2px"
        >
          <Typography variant="h4" fontWeight="600" pb="24px">
            Chi phí
          </Typography>

          <Box display="grid" gridTemplateColumns="repeat(12, 1fr)">
            <Box
              gridColumn={{
                xs: "span 7",
                sm: "span 7",
                md: "span 7",
                xl: "span 7",
              }}
              height={"350px"}
            >
              <BarChart data={dataBar} currentTimeType={currentTimeType} />
            </Box>
            <Box
              gridColumn={{
                xs: "span 5",
                sm: "span 5",
                md: "span 5",
                xl: "span 5",
              }}
              height={"100%"}
              display={"flex"}
              flexDirection={"column"}
              justifyContent={"center"}
              alignItems={"center"}
            >
              {/* <BarChart />	 */}
              <Typography variant="h2" fontWeight="600" p={"5px"}>
                {dataBar && typeof dataBar[1] === "number"
                  ? dataBar[1].toFixed(1) + " Triệu"
                  : "Chi phí"}
              </Typography>
              <Divider sx={{ borderColor: colors.grey[500], width: "80%" }} />
              <Typography
                variant="h3"
                fontWeight="600"
                sx={{
                  color: priceColor, // Áp dụng màu động
                  textAlign: "center", // Tương đương text-center
                }}
              >
                {price ? `${price}` : ""} {/* Hiển thị giá trị động */}
              </Typography>
              <Typography variant="h4" fontWeight="600">
                VNĐ/kWh{/* Hiển thị giá trị động */}
              </Typography>
            </Box>
          </Box>
        </Box>

        <Box
          gridColumn={{
            xs: "span 12",
            sm: "span 12",
            md: "span 6",
            xl: "span 4",
          }}
          backgroundColor={colors.primary[400]}
          p="24px"
          borderRadius="11.2px"
        >
          <Typography variant="h4" fontWeight="600" pb="24px">
            Ước tính tiêu thụ
          </Typography>

          <Box display="flex" height={"350px"}>
            <LineChart customOptions={estimateChartOptions} />
          </Box>
        </Box>

        <Box
          gridColumn={{
            xs: "span 12",
            sm: "span 12",
            md: "span 6",
            xl: "span 4",
          }}
          backgroundColor={colors.primary[400]}
          p="24px"
          borderRadius="11.2px"
        >
          <Typography variant="h4" fontWeight="600" pb="24px">
            Các phụ tải tiêu thụ
          </Typography>

          <Box display="flex" height={"350px"}>
            <BarChartH data={dataBarH} />
          </Box>
        </Box>

        <Box
          gridColumn={{
            xs: "span 12",
            sm: "span 12",
            md: "span 6",
            xl: "span 4",
          }}
          backgroundColor={colors.primary[400]}
          p="24px"
          borderRadius="11.2px"
        >
          <Typography variant="h4" fontWeight="600" pb="24px">
            Suất sử dụng năng lượng
          </Typography>

          <Box display="flex" height={"350px"}>
            <GaugeSECChart data={dataSEC} />
          </Box>
        </Box>

        <Box
          gridColumn={{
            xs: "span 12",
            sm: "span 12",
            md: "span 6",
            xl: "span 4",
          }}
          backgroundColor={colors.primary[400]}
          p="24px"
          borderRadius="11.2px"
        >
          <Typography variant="h4" fontWeight="600" pb="24px">
            Phát thải khí nhà kính
          </Typography>

          <Box display="flex" height={"350px"}>
            <HorizontalBarChart
              data={dataCO2}
              currentTimeType={currentTimeType}
            />
          </Box>
        </Box>

        {/* <Box gridColumn={{ xs: "span 12", sm: "span 12", md: "span 6", xl: "span 4" }} backgroundColor={colors.primary[400]} p="24px" borderRadius="11.2px" >
				<Typography variant="h4" fontWeight="600">
					Campaign
				</Typography>
				<Box display="flex" flexDirection="column" alignItems="center">
					<Typography variant="h5" color={colors.greenAccent[400]} sx={{ mt: "15px" }} >
						$48,352 revenue generated
					</Typography>
					
				</Box>
				<Box height="350px">
						<BarChart isDashboard={true} />
					</Box>
			</Box>

			<Box gridColumn={{ xs: "span 12", sm: "span 12", md: "span 6", xl: "span 4" }} backgroundColor={colors.primary[400]} p="24px" borderRadius="11.2px" >
				<Typography variant="h4" fontWeight="600">
					Campaign
				</Typography>
				<Box display="flex" flexDirection="column" alignItems="center">
					<Typography variant="h5" color={colors.greenAccent[400]} sx={{ mt: "15px" }} >
						$48,352 revenue generated
					</Typography>
					
				</Box>
				<Box height="350px">
					<BarChart />
				</Box>					
			</Box> */}
      </Box>
    </Box>
  );
};

export default Dashboard;