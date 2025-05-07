import { tokens } from "../../theme";
import { Box, Button, TextField, FormControl, InputLabel, Select, MenuItem, useTheme } from "@mui/material";
import { Formik } from "formik";
import * as yup from "yup";
import useMediaQuery from "@mui/material/useMediaQuery";
import Header from "../../components/Header";

const EnergySettings = () => {
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);

    const isNonMobile = useMediaQuery("(min-width:600px)");

    const handleFormSubmit = (values) => {
        console.log(values);
    };

    return (
        <Box m="20px">
            <Header title="Cài đặt năng lượng" subtitle="Nhập thông tin cấu hình" />

            <Formik
                onSubmit={handleFormSubmit}
                initialValues={initialValues}
                validationSchema={settingsSchema}
            >
                {({
                values,
                errors,
                touched,
                handleBlur,
                handleChange,
                handleSubmit,
                }) => (
                <form onSubmit={handleSubmit}>
                    <Box
                        display="grid"
                        gap="30px"
                        gridTemplateColumns="repeat(4, minmax(0, 1fr))"
                        sx={{
                            "& > div": { gridColumn: isNonMobile ? undefined : "span 4" },
                        }}
                    >
                    <FormControl fullWidth sx={{ gridColumn: "span 2", }}>
                        <InputLabel sx={{"&.Mui-focused": {color: colors.primary[100]}}}>Công trình</InputLabel>
                        <Select
                            value={values.buildingType}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            name="buildingType"
                            error={!!touched.buildingType && !!errors.buildingType}
                            label="Công trình"
                        >
                            <MenuItem value="toanha">Toà nhà</MenuItem>
                            <MenuItem value="nhamay">Nhà máy</MenuItem>
                        </Select>
                    </FormControl>

                    <FormControl fullWidth sx={{ gridColumn: "span 2" }}>
                        <InputLabel sx={{"&.Mui-focused": {color: colors.primary[100]}}}>SEC Mode</InputLabel>
                        <Select
                            value={values.secMode}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            name="secMode"
                            error={!!touched.secMode && !!errors.secMode}
                            label="SEC Mode"
                        >
                            <MenuItem value="dien_tich">Diện tích</MenuItem>
                            <MenuItem value="san_pham">Sản phẩm</MenuItem>
                        </Select>
                    </FormControl>

                    <TextField
                        fullWidth
                        variant="filled"
                        type="number"
                        label="Diện tích"
                        onBlur={handleBlur}
                        onChange={handleChange}
                        value={values.area}
                        name="area"
                        error={!!touched.area && !!errors.area}
                        helperText={touched.area && errors.area}
                        sx={{
                            gridColumn: "span 4",
                            // "& .MuiInputLabel-root": { color: "gray" }, // Màu mặc định của label
                            "& .MuiInputLabel-root.Mui-focused": { color: colors.primary[100] }, // Màu khi nhập
                        }}
                    />

                    <TextField
                        fullWidth
                        variant="filled"
                        type="number"
                        label="SEC tiêu chuẩn ngày"
                        onBlur={handleBlur}
                        onChange={handleChange}
                        value={values.standardSec}
                        name="standardSec"
                        error={!!touched.standardSec && !!errors.standardSec}
                        helperText={touched.standardSec && errors.standardSec}
                        sx={{
                            gridColumn: "span 4",
                            // "& .MuiInputLabel-root": { color: "gray" }, // Màu mặc định của label
                            "& .MuiInputLabel-root.Mui-focused": { color: colors.primary[100] }, // Màu khi nhập
                        }}
                    />
                    </Box>
                    <Box display="flex" justifyContent="end" mt="20px">
                        <Button type="submit" color='secondary' variant="contained">
                            Lưu
                        </Button>
                    </Box>
                </form>
                )}
            </Formik>
        </Box>
    );
};

    const settingsSchema = yup.object().shape({
        buildingType: yup.string().required("Vui lòng chọn công trình"),
        secMode: yup.string().required("Vui lòng chọn SEC mode"),
        area: yup.number().positive("Diện tích phải là số dương").required("Vui lòng nhập diện tích"),
        standardSec: yup.number().positive("SEC phải là số dương").required("Vui lòng nhập SEC tiêu chuẩn"),
    });

    const initialValues = {
        buildingType: "",
        secMode: "",
        area: "",
        standardSec: "",
    };

export default EnergySettings;
