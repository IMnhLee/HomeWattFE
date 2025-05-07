import { useState, useEffect } from "react";
import {Box, ToggleButton, ToggleButtonGroup} from "@mui/material";



const SelectTimeType = ({onTimeTypeChange}) => { //Đây chính là button ngày tháng năm ở phía bên phải trên cùng ở dashboard. Tham số truyền vào là biến lưu giá trị lựa chọn nghĩa là ngày hoặc tháng hoặc năm
    const [timeType, setTimeType] = useState('day'); // biến lưu giá trị chu kỳ. Giá trị default là ngày
    const [data, setData] = useState(null);

   
    const handleChange = (event, newType) => { //Nếu người dùng có hành động chuyển đổi giá trị, set giá trị chu kỳ mới
        newType && setTimeType(newType);
    };

    useEffect(() => { // cập nhật giá trị chu kỳ

        if (onTimeTypeChange) {
            onTimeTypeChange(timeType)
        };
      }, [timeType]);

    return (
        <Box>
            <ToggleButtonGroup
                value={timeType}
                exclusive
                onChange={handleChange}
                aria-label="time type"
            >
                <ToggleButton value="day" aria-label="left aligned" >
                    Ngày
                </ToggleButton>
                <ToggleButton value="month" aria-label="centered">
                Tháng
                </ToggleButton>
                <ToggleButton value="year" aria-label="right aligned">
                Năm
                </ToggleButton>
            </ToggleButtonGroup>
        </Box>
    )
}

export default SelectTimeType