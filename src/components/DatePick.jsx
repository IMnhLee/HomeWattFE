import React, { useRef, useEffect, useState } from "react";
import Flatpickr from "flatpickr";
import "flatpickr/dist/flatpickr.min.css";
import { Button, TextField,Box,useTheme } from "@mui/material"; // MUI components
import { tokens } from "../theme";
import CheckIcon from '@mui/icons-material/Check';
const DatePick = ({ onChange, initDate, label = "Chọn thời gian" }) => {
  const inputRef = useRef(null);
  const flatpickrInstance = useRef(null);
  const [value, setValue] = useState("");
  const [selectedDates, setSelectedDates] = useState([]);
   const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  useEffect(() => {
    if (inputRef.current) {
      flatpickrInstance.current = new Flatpickr(inputRef.current, {
        mode: "range",
        allowInput: true,
        defaultDate: [
          new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
          new Date(),
        ],
        enableTime: true,
        time_24hr: true,
        altInput: true,
        altFormat: "H:i d/m/Y",
        dateFormat: "Y-m-d H:i",
        onChange: (dates, dateStr) => {
          setValue(dateStr);
          setSelectedDates(dates); // Store dates in state
        },
      });
    }

    return () => {
      if (flatpickrInstance.current) {
        flatpickrInstance.current.destroy();
      }
    };
  }, [initDate]);

  // Confirm button click - Send final date selection
  const handleConfirm = () => {
    if (selectedDates.length > 0) {
      const formattedDates = selectedDates.map((date) => date.toISOString());
      onChange(formattedDates); // Send dates to parent
    }
  };

  return (
    <Box display="flex" flexDirection="row">
      <TextField
        inputRef={inputRef}
        label={label}
        variant="outlined"
        fullWidth
      />

      {selectedDates.length > 0 && (
        <Button
          variant="outlined"
          color="primary"
          onClick={handleConfirm}
          style={{ height:"50px" }}
          sx={{ backgroundColor: '#8897F4', '&:hover': { backgroundColor: 'darkblue' } }}
        >
           <Box 
            sx={{ 
                width: 24, 
                height: 24, 
                border: '2px solid white', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
               
            }}
        >
            <CheckIcon sx={{ color: 'white', fontSize: 18 }} />
        </Box>

        </Button>
      )}
    </Box>
  );
};

export default DatePick;
