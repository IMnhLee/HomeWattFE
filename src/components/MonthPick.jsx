import React, { useState } from "react";
import dayjs from "dayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import "dayjs/locale/vi"; // Import ngôn ngữ tiếng Việt
import { Box } from "@mui/material";
dayjs.locale("vi");

const MonthPick = () => {
  const today = dayjs(); // Lấy ngày hiện tại
  // Confirm button click - Send final date selection
  const [selectedMonth, setSelectedMonth] = useState(dayjs()); // chọn tháng hiện tại ngay khi render
  const day = 3; // giả sử day là 15

  const handleMonthChange = (date) => {
    if (!date) return;

    // Tạo ngày `day` trong tháng được chọn
    const selectedDay = date.date(day); // giữ nguyên năm/tháng, set ngày = day

    let startCir, endCir, startLastCir, endLastCir;

    if (selectedDay.isSame(today, "month")) {
      endCir = today;
      // Nếu là tháng hiện tại
      if (day > today.date()) {
        // Nếu ngày chưa đến, lùi về tháng trước
        startCir = date.subtract(1, "month").date(day);
        endLastCir = startCir.subtract(1, "second");
        startLastCir = startCir.subtract(1, "month");
      } else {
        startCir = selectedDay;
        endLastCir = startCir.subtract(1, "second");
        startLastCir = startCir.subtract(1, "month");
      }
    } else if (selectedDay.isBefore(today, "day")) {
      // Nếu trong quá khứ
      startCir = selectedDay;
      endCir = startCir.add(1, "month");
      endLastCir = startCir.subtract(1, "second");
      startLastCir = startCir.subtract(1, "month");
    }

    console.log("🟢 Cuối kỳ:", endCir.format("YYYY-MM-DD"));
    if (startCir) {
      console.log("🔵 Đầu kỳ (day =", day, "):", startCir.format("YYYY-MM-DD"));
    } else {
      console.log("⚠️ Không có ngày hợp lệ trong quá khứ.");
    }
    console.log("🔵 Đầu kỳ trước (day =", day, "):", startLastCir.format("YYYY-MM-DD"));
    console.log("🔵 Cưới kỳ trước (day =", day, "):", endLastCir.format("YYYY-MM-DD"));


    setSelectedMonth(date);
  };

  return (
    <Box display="flex" flexDirection="row">
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <DatePicker
          label="Chọn kỳ"
          views={["month", "year"]} // Chỉ cho phép chọn tháng
          format="MM/YYYY" // Định dạng hiển thị là tháng/năm
          maxDate={today}
          value={selectedMonth}
          onChange={handleMonthChange}
        />
      </LocalizationProvider>
    </Box>
  );
};

export default MonthPick;
