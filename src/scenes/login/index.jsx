import * as React from 'react';
import {
  Button,
  Checkbox,
  FormControlLabel,
  Divider,
  TextField,
  Box,
  Typography,
  Container,
  Paper,
  Link as MuiLink,
  InputAdornment,
  IconButton,
  Alert,
  Snackbar,
  CircularProgress
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { useTheme } from "@mui/material";
import { tokens } from "../../theme";
import authApi from '../../services/auth';
import { useNavigate, Link } from 'react-router-dom';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import LoginIcon from '@mui/icons-material/Login';
import GoogleIcon from '@mui/icons-material/Google';
import { Visibility, VisibilityOff, Person, Lock } from '@mui/icons-material';

const Login = ({ setIsLoggedIn }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const navigate = useNavigate();

  // Form state
  const [formValues, setFormValues] = React.useState({
    username: "",
    password: "",
    rememberMe: false
  });

  // Error states
  const [formErrors, setFormErrors] = React.useState({
    username: "",
    password: ""
  });

  // UI states
  const [isLoading, setIsLoading] = React.useState(false);
  const [showPassword, setShowPassword] = React.useState(false);
  const [notification, setNotification] = React.useState({
    open: false,
    message: "",
    type: "info" // 'success', 'error', 'info', 'warning'
  });

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value, checked } = e.target;
    setFormValues({
      ...formValues,
      [name]: name === 'rememberMe' ? checked : value,
    });
    
    // Clear error when typing
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: "",
      });
    }
  };

  // Close notification
  const handleCloseNotification = () => {
    setNotification({
      ...notification,
      open: false
    });
  };
  
  // Validate form
  const validateForm = () => {
    const errors = {};
    let isValid = true;
    
    // Username validation
    if (!formValues.username.trim()) {
      errors.username = "Vui lòng nhập tên đăng nhập";
      isValid = false;
    }
    
    // Password validation
    if (!formValues.password) {
      errors.password = "Vui lòng nhập mật khẩu";
      isValid = false;
    } else if (formValues.password.length < 6) {
      errors.password = "Mật khẩu phải có ít nhất 6 ký tự";
      isValid = false;
    }
    
    setFormErrors(errors);
    return isValid;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);

    try {
      const response = await authApi.login({
        username: formValues.username,
        password: formValues.password
      });
      
      // Lưu tokens vào localStorage
      localStorage.setItem("access_token", JSON.stringify(response.data.tokens.accessToken));
      localStorage.setItem("refresh_token", JSON.stringify(response.data.tokens.refreshToken));
      
      // Lưu thông tin người dùng
      localStorage.setItem("user", JSON.stringify(response.data.user));
      localStorage.setItem("logged", true);
      
      setIsLoggedIn(true);
      
      setNotification({
        open: true,
        message: "Đăng nhập thành công!",
        type: "success"
      });
      
      // Chuyển hướng sau khi đăng nhập thành công
      navigate('/');
    } catch (error) {
      console.error("Login error:", error);
      
      setNotification({
        open: true,
        message: error.response?.data?.message || "Đăng nhập thất bại. Vui lòng thử lại.",
        type: "error"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    // Implement Google login integration
    setNotification({
      open: true,
      message: "Tính năng đăng nhập bằng Google đang được phát triển.",
      type: "info"
    });
  };

  const handleNavigateToSignup = () => {
    navigate('/signup');
  };

  return (
    <Box
      sx={{
        display: "flex",
        minHeight: "100vh",
        alignItems: "center",
        backgroundColor: colors.primary[500],
      }}
    >
      <Container maxWidth="sm">
        <Paper
          elevation={3}
          sx={{
            padding: { xs: "20px", sm: "40px" },
            backgroundColor: colors.primary[400],
            borderRadius: "8px",
          }}
        >
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            mb: 4
          }}>
            <Typography
              component="h1"
              variant="h2"
              color={colors.blueAccent[500]}
              fontWeight="bold"
              textAlign="center"
              gutterBottom
            >
              HomeWatt
            </Typography>
            <Typography
              variant="h3"
              color={colors.grey[100]}
              textAlign="center"
            >
              Đăng nhập
            </Typography>
          </Box>
          
          <form onSubmit={handleSubmit}>
            {/* Username field */}
            <TextField
              fullWidth
              variant="filled"
              label="Tên đăng nhập"
              name="username"
              value={formValues.username}
              onChange={handleChange}
              error={!!formErrors.username}
              helperText={formErrors.username}
              disabled={isLoading}
              sx={{ mb: 3 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Person sx={{ color: colors.grey[300] }} />
                  </InputAdornment>
                ),
                sx: { color: colors.grey[100] }
              }}
              InputLabelProps={{
                sx: { color: colors.grey[300] }
              }}
            />
            
            {/* Password field */}
            <TextField
              fullWidth
              variant="filled"
              label="Mật khẩu"
              name="password"
              type={showPassword ? "text" : "password"}
              value={formValues.password}
              onChange={handleChange}
              error={!!formErrors.password}
              helperText={formErrors.password}
              disabled={isLoading}
              sx={{ mb: 2 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock sx={{ color: colors.grey[300] }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                      disabled={isLoading}
                      sx={{ color: colors.grey[300] }}
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
                sx: { color: colors.grey[100] }
              }}
              InputLabelProps={{
                sx: { color: colors.grey[300] }
              }}
            />
            
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              mb: 3
            }}>
              <FormControlLabel
                control={
                  <Checkbox 
                    checked={formValues.rememberMe}
                    onChange={handleChange}
                    name="rememberMe"
                    sx={{
                      color: colors.grey[300],
                      '&.Mui-checked': {
                        color: colors.blueAccent[500],
                      },
                    }}
                  />
                }
                label={
                  <Typography 
                    variant="body2" 
                    color={colors.grey[300]}
                  >
                    Ghi nhớ đăng nhập
                  </Typography>
                }
              />
              <MuiLink 
                href="/forgot-password" 
                variant="body2" 
                sx={{
                  color: colors.blueAccent[500],
                  textDecoration: 'none',
                  '&:hover': {
                    textDecoration: 'underline',
                  },
                }}
              >
                Quên mật khẩu?
              </MuiLink>
            </Box>
            
            {/* Login button */}
            <Button
              type="submit"
              variant="contained"
              fullWidth
              disabled={isLoading}
              startIcon={isLoading ? null : <LoginIcon />}
              sx={{ 
                mb: 2,
                py: 1.5,
                fontSize: "16px",
                fontWeight: "bold",
                backgroundColor: colors.blueAccent[500],
                color: '#fff',
                '&:hover': {
                  backgroundColor: colors.blueAccent[600],
                },
                '&:disabled': {
                  backgroundColor: theme.palette.mode === 'light'
                    ? colors.grey[400]
                    : colors.grey[700],
                  color: theme.palette.mode === 'light'
                    ? colors.grey[100]
                    : colors.grey[300],
                }
              }}
            >
              {isLoading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                "Đăng nhập"
              )}
            </Button>
            
            {/* Google login button */}
            <Button
              fullWidth
              variant="contained"
              startIcon={<GoogleIcon />}
              onClick={handleGoogleLogin}
              disabled={isLoading}
              sx={{ 
                mb: 3,
                py: 1.5,
                backgroundColor: "#ffffff",
                color: "#757575",
                fontSize: "16px",
                fontWeight: "bold",
                '&:hover': {
                  backgroundColor: "#f1f1f1",
                },
                '&:disabled': {
                  backgroundColor: "#e0e0e0",
                  color: "#9e9e9e",
                }
              }}
            >
              Đăng nhập bằng Google
            </Button>
          </form>
          
          <Divider 
            sx={{ 
              my: 2,
              '&::before, &::after': {
                borderColor: theme.palette.mode === 'light'
                  ? colors.grey[400]
                  : colors.grey[700],
              }
            }}
          >
            <Typography 
              variant="body2" 
              color={colors.grey[300]}
            >
              HOẶC
            </Typography>
          </Divider>
          
          {/* Sign up button */}
          <Button
            fullWidth
            variant="outlined"
            startIcon={<PersonAddIcon />}
            onClick={handleNavigateToSignup}
            sx={{ 
              py: 1.2,
              color: colors.greenAccent[700],
              borderColor: colors.greenAccent[700],
              '&:hover': {
                borderColor: colors.greenAccent[600],
                backgroundColor: theme.palette.mode === 'light'
                  ? 'rgba(0, 128, 128, 0.08)'
                  : 'rgba(0, 128, 128, 0.08)',
              }
            }}
          >
            Đăng ký tài khoản mới
          </Button>
        </Paper>
      </Container>
      
      {/* Notifications */}
      <Snackbar 
        open={notification.open} 
        autoHideDuration={6000} 
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseNotification} 
          severity={notification.type} 
          sx={{ width: '100%' }}
          variant="filled"
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Login;
