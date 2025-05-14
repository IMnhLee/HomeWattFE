import { useState, useEffect } from "react";
import axios from "axios";
import {
  Box,
  Button,
  TextField,
  Typography,
  useTheme,
  Card,
  CardContent,
  Divider,
  Alert,
  IconButton,
  InputAdornment,
  Snackbar,
} from "@mui/material";
import { tokens } from "../../theme";
import Header from "../../components/Header";
import { Visibility, VisibilityOff } from "@mui/icons-material";
// import LoadingButton from "@mui/lab/LoadingButton";

const Profile = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const API_BASE_URL = "REACT_APP_API_BASE_URL";

  // State cho thông tin người dùng
  const [userInfo, setUserInfo] = useState({
    username: "",
    email: "",
    phoneNumber: "",
    address: "",
  });

  // State cho mật khẩu
  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // State hiện/ẩn mật khẩu
  const [showPassword, setShowPassword] = useState({
    currentPassword: false,
    newPassword: false,
    confirmPassword: false,
  });

  // State loading khi submit
  const [loading, setLoading] = useState({
    profile: false,
    password: false,
  });

  // State thông báo
  const [notification, setNotification] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  // State lỗi validation
  const [errors, setErrors] = useState({
    profile: {},
    password: {},
  });

  // Lấy thông tin người dùng khi component mount
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const response = await axios.get(`${API_BASE_URL}/api/user/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setUserInfo({
          username: response.data.username || "",
          email: response.data.email || "",
          phoneNumber: response.data.phoneNumber || "",
          address: response.data.address || "",
        });
      } catch (error) {
        console.error("Error fetching user data:", error);
        showNotification("Không thể tải thông tin người dùng", "error");
      }
    };

    fetchUserData();
  }, []);

  // Xử lý thay đổi cho thông tin cá nhân
  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setUserInfo((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Xóa thông báo lỗi khi người dùng sửa trường
    if (errors.profile[name]) {
      setErrors((prev) => ({
        ...prev,
        profile: { ...prev.profile, [name]: "" },
      }));
    }
  };

  // Xử lý thay đổi cho mật khẩu
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswords((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Xóa thông báo lỗi khi người dùng sửa trường
    if (errors.password[name]) {
      setErrors((prev) => ({
        ...prev,
        password: { ...prev.password, [name]: "" },
      }));
    }
  };

  // Hiển thị thông báo
  const showNotification = (message, severity = "success") => {
    setNotification({
      open: true,
      message,
      severity,
    });
  };

  // Đóng thông báo
  const closeNotification = () => {
    setNotification((prev) => ({
      ...prev,
      open: false,
    }));
  };

  // Xác thực dữ liệu profile
  const validateProfileData = () => {
    const newErrors = {};
    
    if (!userInfo.username.trim()) {
      newErrors.username = "Tên người dùng không được để trống";
    }
    
    if (userInfo.phoneNumber && !/^[0-9]{10,11}$/.test(userInfo.phoneNumber)) {
      newErrors.phoneNumber = "Số điện thoại không hợp lệ";
    }
    
    setErrors((prev) => ({ ...prev, profile: newErrors }));
    return Object.keys(newErrors).length === 0;
  };

  // Xác thực dữ liệu mật khẩu
  const validatePasswordData = () => {
    const newErrors = {};
    
    if (!passwords.currentPassword) {
      newErrors.currentPassword = "Mật khẩu hiện tại không được để trống";
    }
    
    if (!passwords.newPassword) {
      newErrors.newPassword = "Mật khẩu mới không được để trống";
    } else if (passwords.newPassword.length < 6) {
      newErrors.newPassword = "Mật khẩu mới phải có ít nhất 6 ký tự";
    }
    
    if (passwords.newPassword !== passwords.confirmPassword) {
      newErrors.confirmPassword = "Mật khẩu xác nhận không khớp";
    }
    
    setErrors((prev) => ({ ...prev, password: newErrors }));
    return Object.keys(newErrors).length === 0;
  };

  // Xử lý cập nhật thông tin cá nhân
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    
    if (!validateProfileData()) return;
    
    setLoading((prev) => ({ ...prev, profile: true }));
    
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `${API_BASE_URL}/api/user/profile`, 
        {
          username: userInfo.username,
          phoneNumber: userInfo.phoneNumber,
          address: userInfo.address,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      
      showNotification("Cập nhật thông tin thành công");
    } catch (error) {
      console.error("Error updating profile:", error);
      showNotification(
        error.response?.data?.message || "Cập nhật thông tin thất bại",
        "error"
      );
    } finally {
      setLoading((prev) => ({ ...prev, profile: false }));
    }
  };

  // Xử lý thay đổi mật khẩu
  const handleChangePassword = async (e) => {
    e.preventDefault();
    
    if (!validatePasswordData()) return;
    
    setLoading((prev) => ({ ...prev, password: true }));
    
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `${API_BASE_URL}/api/user/change-password`,
        {
          currentPassword: passwords.currentPassword,
          newPassword: passwords.newPassword,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      
      setPasswords({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      
      showNotification("Thay đổi mật khẩu thành công");
    } catch (error) {
      console.error("Error changing password:", error);
      showNotification(
        error.response?.data?.message || "Thay đổi mật khẩu thất bại",
        "error"
      );
    } finally {
      setLoading((prev) => ({ ...prev, password: false }));
    }
  };

  return (
    <Box m="20px">
      <Header title="HỒ SƠ" subtitle="Quản lý thông tin cá nhân của bạn" />

      <Box
        display="grid"
        gridTemplateColumns="repeat(12, 1fr)"
        gridAutoRows="auto"
        gap="20px"
      >
        {/* Thông tin cá nhân */}
        <Box gridColumn="span 6">
          <Card
            sx={{
              backgroundColor: colors.primary[400],
              boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
              height: "100%",
            }}
          >
            <CardContent>
              <Typography variant="h3" mb="20px" color={colors.greenAccent[300]}>
                Thông tin cá nhân
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <Box component="form" onSubmit={handleUpdateProfile} noValidate>
                <TextField
                  fullWidth
                  margin="normal"
                  id="username"
                  name="username"
                  label="Tên người dùng"
                  value={userInfo.username}
                  onChange={handleProfileChange}
                  error={Boolean(errors.profile.username)}
                  helperText={errors.profile.username}
                />
                
                <TextField
                  fullWidth
                  margin="normal"
                  id="email"
                  name="email"
                  label="Email"
                  type="email"
                  value={userInfo.email}
                  disabled
                />
                
                <TextField
                  fullWidth
                  margin="normal"
                  id="phoneNumber"
                  name="phoneNumber"
                  label="Số điện thoại"
                  value={userInfo.phoneNumber}
                  onChange={handleProfileChange}
                  error={Boolean(errors.profile.phoneNumber)}
                  helperText={errors.profile.phoneNumber}
                />
                
                <TextField
                  fullWidth
                  margin="normal"
                  id="address"
                  name="address"
                  label="Địa chỉ"
                  value={userInfo.address}
                  onChange={handleProfileChange}
                  multiline
                  rows={3}
                />
                
                <Box mt={3}>
                  <Button
                    type="submit"
                    variant="contained"
                    loading={loading.profile}
                    sx={{
                      backgroundColor: colors.greenAccent[700],
                      color: colors.grey[900],
                      "&:hover": {
                        backgroundColor: colors.greenAccent[500],
                      },
                    }}
                  >
                    Cập nhật thông tin
                  </Button>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Box>

        {/* Thay đổi mật khẩu */}
        <Box gridColumn="span 6">
          <Card
            sx={{
              backgroundColor: colors.primary[400],
              boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
              height: "100%",
            }}
          >
            <CardContent>
              <Typography variant="h3" mb="20px" color={colors.greenAccent[300]}>
                Thay đổi mật khẩu
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <Box component="form" onSubmit={handleChangePassword} noValidate>
                <TextField
                  fullWidth
                  margin="normal"
                  id="currentPassword"
                  name="currentPassword"
                  label="Mật khẩu hiện tại"
                  type={showPassword.currentPassword ? "text" : "password"}
                  value={passwords.currentPassword}
                  onChange={handlePasswordChange}
                  error={Boolean(errors.password.currentPassword)}
                  helperText={errors.password.currentPassword}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() =>
                            setShowPassword((prev) => ({
                              ...prev,
                              currentPassword: !prev.currentPassword,
                            }))
                          }
                          edge="end"
                        >
                          {showPassword.currentPassword ? (
                            <VisibilityOff />
                          ) : (
                            <Visibility />
                          )}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
                
                <TextField
                  fullWidth
                  margin="normal"
                  id="newPassword"
                  name="newPassword"
                  label="Mật khẩu mới"
                  type={showPassword.newPassword ? "text" : "password"}
                  value={passwords.newPassword}
                  onChange={handlePasswordChange}
                  error={Boolean(errors.password.newPassword)}
                  helperText={errors.password.newPassword}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() =>
                            setShowPassword((prev) => ({
                              ...prev,
                              newPassword: !prev.newPassword,
                            }))
                          }
                          edge="end"
                        >
                          {showPassword.newPassword ? (
                            <VisibilityOff />
                          ) : (
                            <Visibility />
                          )}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
                
                <TextField
                  fullWidth
                  margin="normal"
                  id="confirmPassword"
                  name="confirmPassword"
                  label="Xác nhận mật khẩu mới"
                  type={showPassword.confirmPassword ? "text" : "password"}
                  value={passwords.confirmPassword}
                  onChange={handlePasswordChange}
                  error={Boolean(errors.password.confirmPassword)}
                  helperText={errors.password.confirmPassword}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() =>
                            setShowPassword((prev) => ({
                              ...prev,
                              confirmPassword: !prev.confirmPassword,
                            }))
                          }
                          edge="end"
                        >
                          {showPassword.confirmPassword ? (
                            <VisibilityOff />
                          ) : (
                            <Visibility />
                          )}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
                
                <Box mt={3}>
                  <Button
                    type="submit"
                    variant="contained"
                    loading={loading.password}
                    sx={{
                      backgroundColor: colors.blueAccent[400],
                      color: colors.grey[900],
                      "&:hover": {
                        backgroundColor: colors.blueAccent[500],
                      },
                    }}
                  >
                    Đổi mật khẩu
                  </Button>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Box>
      </Box>

      {/* Snackbar thông báo */}
      <Snackbar
        open={notification.open}
        autoHideDuration={5000}
        onClose={closeNotification}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert 
          onClose={closeNotification} 
          severity={notification.severity} 
          variant="filled"
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Profile;