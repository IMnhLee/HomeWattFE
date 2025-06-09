import { useState, useEffect } from "react";
import profileAPI from "../../services/profile";
import {
  Box,
  Button,
  TextField,
  Typography,
  useTheme,
  Card,
  CardContent,
  Divider,
  IconButton,
  InputAdornment,
  List,
  ListItem,
  ListItemText,
  useMediaQuery,
} from "@mui/material";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { tokens } from "../../theme";
import Header from "../../components/Header";
import { Visibility, VisibilityOff, Edit, Person, Email, Phone, Home } from "@mui/icons-material";

const Profile = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  
  // Thêm media queries cho responsive
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));

  // State lưu user ID
  const [userId, setUserId] = useState(null);

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

  // State edit mode
  const [editMode, setEditMode] = useState(false);

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

  // State lỗi validation
  const [errors, setErrors] = useState({
    profile: {},
    password: {},
  });

  // Backup state for canceling edits
  const [userInfoBackup, setUserInfoBackup] = useState({});

  // Lấy thông tin người dùng khi component mount
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Lấy user ID từ localStorage
        const user = localStorage.getItem("user");
        const storedUserId = user ? JSON.parse(user).id : null;
        console.log("storedUserId", storedUserId);
        if (storedUserId) {
          setUserId(storedUserId);
          const response = await profileAPI.getUserInfo(storedUserId);
          
          if (response.data) {
            setUserInfo({
              username: response.data.username || "",
              email: response.data.email || "",
              phoneNumber: response.data.phoneNumber || "",
              address: response.data.address || "",
            });
          }
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        toast.error("Không thể tải thông tin người dùng");
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

  // Hiển thị thông báo sử dụng toastify
  const showNotification = (message, severity = "success") => {
    if (severity === "success") {
      toast.success(message);
    } else if (severity === "error") {
      toast.error(message);
    } else if (severity === "warning") {
      toast.warning(message);
    } else {
      toast.info(message);
    }
  };

  // Đóng thông báo
  const closeNotification = () => {
    setNotification((prev) => ({
      ...prev,
      open: false,
    }));
  };

  // Bắt đầu chế độ chỉnh sửa
  const startEditMode = () => {
    // Backup current data for cancel operation
    setUserInfoBackup({...userInfo});
    setEditMode(true);
  };

  // Hủy chỉnh sửa
  const cancelEdit = () => {
    setUserInfo(userInfoBackup);
    setEditMode(false);
    setErrors((prev) => ({...prev, profile: {}}));
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
      if (!userId) {
        throw new Error("Không tìm thấy ID người dùng");
      }
      
      const response = await profileAPI.updateUser(userId, {
        username: userInfo.username,
        phoneNumber: userInfo.phoneNumber,
        address: userInfo.address,
      });
      
      if (response.data) {
        // Cập nhật state với dữ liệu trả về từ API
        setUserInfo({
          username: response.data.username || "",
          email: response.data.email || "",
          phoneNumber: response.data.phoneNumber || "",
          address: response.data.address || "",
        });
        
        setEditMode(false);
        showNotification(response.message || "Cập nhật thông tin thành công");
      }
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
      const response = await profileAPI.updatePassword({
        currentPassword: passwords.currentPassword,
        newPassword: passwords.newPassword,
      });
      
      setPasswords({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      
      showNotification(response.message || "Thay đổi mật khẩu thành công");
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
    <Box m={isMobile ? "10px" : "20px"}>
      <Header 
        title="HỒ SƠ" 
        subtitle="Quản lý thông tin cá nhân của bạn"
      />

      <Box
        display="grid"
        gridTemplateColumns="repeat(12, 1fr)"
        gridAutoRows="auto"
        gap={isMobile ? "10px" : "20px"}
      >
        {/* Thông tin cá nhân */}
        <Box gridColumn={isMobile ? "span 12" : "span 6"}>
          <Card
            sx={{
              backgroundColor: colors.primary[400],
              boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
              height: "100%",
            }}
          >
            <CardContent>
              <Box 
                display="flex" 
                flexDirection={isMobile ? "column" : "row"}
                justifyContent="space-between" 
                alignItems={isMobile ? "flex-start" : "center"}
                gap={isMobile ? 1 : 0}
                mb="20px"
              >
                <Typography 
                  variant={isMobile ? "h4" : "h3"} 
                  color={colors.greenAccent[300]}
                >
                  Thông tin cá nhân
                </Typography>
                {!editMode && (
                  <Button
                    variant="outlined"
                    startIcon={<Edit />}
                    onClick={startEditMode}
                    size={isMobile ? "small" : "medium"}
                    sx={{
                      borderColor: colors.greenAccent[400],
                      color: colors.greenAccent[400],
                      mt: isMobile ? 1 : 0
                    }}
                  >
                    Chỉnh sửa
                  </Button>
                )}
              </Box>
              
              <Divider sx={{ mb: 2 }} />
              
              {editMode ? (
                // Form chỉnh sửa
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
                    size={isMobile ? "small" : "medium"}
                    sx={{
                    "& .MuiOutlinedInput-root": {
                      fontSize: "16px",
                    },
                    "& .MuiInputLabel-root.Mui-focused": { color: colors.primary[100] },
                  }}
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
                    size={isMobile ? "small" : "medium"}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        fontSize: "16px",
                      },
                      "& .MuiInputLabel-root.Mui-focused": { color: colors.primary[100] },
                    }}
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
                    size={isMobile ? "small" : "medium"}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        fontSize: "16px",
                      },
                      "& .MuiInputLabel-root.Mui-focused": { color: colors.primary[100] },
                    }}
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
                    rows={isMobile ? 2 : 3}
                    size={isMobile ? "small" : "medium"}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        fontSize: "16px",
                      },
                      "& .MuiInputLabel-root.Mui-focused": { color: colors.primary[100] },
                    }}
                  />
                  
                  <Box 
                    mt={3} 
                    display="flex" 
                    flexDirection={isMobile ? "column" : "row"}
                    gap={2}
                  >
                    <Button
                      type="submit"
                      variant="contained"
                      fullWidth={isMobile}
                      disabled={loading.profile}
                      size={isMobile ? "small" : "medium"}
                      sx={{
                        backgroundColor: colors.greenAccent[700],
                        color: colors.grey[900],
                        "&:hover": {
                          backgroundColor: colors.greenAccent[500],
                        },
                      }}
                    >
                      {loading.profile ? "Đang lưu..." : "Lưu thay đổi"}
                    </Button>
                    
                    <Button
                      type="button"
                      variant="outlined"
                      onClick={cancelEdit}
                      fullWidth={isMobile}
                      disabled={loading.profile}
                      size={isMobile ? "small" : "medium"}
                      sx={{
                        borderColor: colors.grey[500],
                        color: colors.grey[300],
                      }}
                    >
                      Hủy
                    </Button>
                  </Box>
                </Box>
              ) : (
                // View chế độ xem
                <List sx={{ width: '100%' }}>
                  <ListItem
                    sx={{
                      borderRadius: 1,
                      mb: 1,
                      backgroundColor: colors.primary[400],
                      flexDirection: isMobile ? "column" : "row",
                      alignItems: isMobile ? "flex-start" : "center",
                      p: isMobile ? 1 : 2,
                    }}
                  >
                    <Box display="flex" alignItems="center" mb={isMobile ? 1 : 0}>
                      <Person sx={{ mr: 2, color: colors.greenAccent[400] }} />
                      <Typography variant="body2" color={colors.grey[400]}>Tên người dùng</Typography>
                    </Box>
                    <Typography 
                      variant="h5" 
                      ml={isMobile ? 4 : "auto"}
                      fontSize={isMobile ? "16px" : "16px"}
                    >
                      {userInfo.username || "Chưa cập nhật"}
                    </Typography>
                  </ListItem>
                  
                  <ListItem
                    sx={{
                      borderRadius: 1,
                      mb: 1,
                      backgroundColor: colors.primary[400],
                      flexDirection: isMobile ? "column" : "row",
                      alignItems: isMobile ? "flex-start" : "center",
                      p: isMobile ? 1 : 2,
                    }}
                  >
                    <Box display="flex" alignItems="center" mb={isMobile ? 1 : 0}>
                      <Email sx={{ mr: 2, color: colors.blueAccent[400] }} />
                      <Typography variant="body2" color={colors.grey[400]}>Email</Typography>
                    </Box>
                    <Typography 
                      variant="h5" 
                      ml={isMobile ? 4 : "auto"}
                      fontSize={isMobile ? "16px" : "16px"}
                      sx={{ wordBreak: "break-word" }}
                    >
                      {userInfo.email || "Chưa cập nhật"}
                    </Typography>
                  </ListItem>
                  
                  <ListItem
                    sx={{
                      borderRadius: 1,
                      mb: 1,
                      backgroundColor: colors.primary[400],
                      flexDirection: isMobile ? "column" : "row",
                      alignItems: isMobile ? "flex-start" : "center",
                      p: isMobile ? 1 : 2,
                    }}
                  >
                    <Box display="flex" alignItems="center" mb={isMobile ? 1 : 0}>
                      <Phone sx={{ mr: 2, color: colors.redAccent[400] }} />
                      <Typography variant="body2" color={colors.grey[400]}>Số điện thoại</Typography>
                    </Box>
                    <Typography 
                      variant="h5" 
                      ml={isMobile ? 4 : "auto"}
                      fontSize={isMobile ? "16px" : "16px"}
                    >
                      {userInfo.phoneNumber || "Chưa cập nhật"}
                    </Typography>
                  </ListItem>
                  
                  <ListItem
                    sx={{
                      borderRadius: 1,
                      backgroundColor: colors.primary[400],
                      flexDirection: isMobile ? "column" : "row",
                      alignItems: isMobile ? "flex-start" : "center",
                      p: isMobile ? 1 : 2,
                    }}
                  >
                    <Box display="flex" alignItems="center" mb={isMobile ? 1 : 0}>
                      <Home sx={{ mr: 2, color: colors.yellowAccent || "#FFD700" }} />
                      <Typography variant="body2" color={colors.grey[400]}>Địa chỉ</Typography>
                    </Box>
                    <Typography 
                      variant="h5" 
                      ml={isMobile ? 4 : "auto"}
                      fontSize={isMobile ? "16px" : "16px"}
                      sx={{ wordBreak: "break-word" }}
                    >
                      {userInfo.address || "Chưa cập nhật"}
                    </Typography>
                  </ListItem>
                </List>
              )}
            </CardContent>
          </Card>
        </Box>

        {/* Thay đổi mật khẩu */}
        <Box gridColumn={isMobile ? "span 12" : "span 6"}>
          <Card
            sx={{
              backgroundColor: colors.primary[400],
              boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
              height: "100%",
            }}
          >
            <CardContent>
              <Typography 
                variant={isMobile ? "h4" : "h3"} 
                mb="20px" 
                color={colors.greenAccent[300]}
              >
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
                  size={isMobile ? "small" : "medium"}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      fontSize: "16px",
                    },
                    "& .MuiInputLabel-root.Mui-focused": { color: colors.primary[100] },
                  }}
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
                          size={isMobile ? "small" : "medium"}
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
                  size={isMobile ? "small" : "medium"}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      fontSize: "16px",
                    },
                    "& .MuiInputLabel-root.Mui-focused": { color: colors.primary[100] },
                  }}
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
                          size={isMobile ? "small" : "medium"}
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
                  size={isMobile ? "small" : "medium"}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      fontSize: "16px",
                    },
                    "& .MuiInputLabel-root.Mui-focused": { color: colors.primary[100] },
                  }}
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
                          size={isMobile ? "small" : "medium"}
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
                    fullWidth={isMobile}
                    disabled={loading.password}
                    size={isMobile ? "small" : "medium"}
                    sx={{
                      backgroundColor: colors.blueAccent[400],
                      color: colors.grey[900],
                      "&:hover": {
                        backgroundColor: colors.blueAccent[500],
                      },
                    }}
                  >
                    {loading.password ? "Đang xử lý..." : "Đổi mật khẩu"}
                  </Button>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Box>
      </Box>

      <ToastContainer />
    </Box>
  );
};

export default Profile;