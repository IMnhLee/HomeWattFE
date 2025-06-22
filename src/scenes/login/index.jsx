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
  CircularProgress
} from '@mui/material';
import { GoogleLogin, useGoogleLogin } from '@react-oauth/google';
import { styled } from '@mui/material/styles';
import { useTheme } from "@mui/material";
import { tokens } from "../../theme";
import authApi from '../../services/auth';
import { useNavigate, Link } from 'react-router-dom';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import LoginIcon from '@mui/icons-material/Login';
import GoogleIcon from '@mui/icons-material/Google';
import { Visibility, VisibilityOff, Person, Lock } from '@mui/icons-material';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Login = ({ setIsLoggedIn, setUserRole }) => {
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

  // Check if user is already logged in
  React.useEffect(() => {
    const checkLoggedIn = () => {
      const accessToken = localStorage.getItem("access_token");
      const refreshToken = localStorage.getItem("refresh_token");
      const user = localStorage.getItem("user");
      const logged = localStorage.getItem("logged");

      // Nếu có đầy đủ thông tin đăng nhập
      if (accessToken && refreshToken && user && logged === 'true') {
        try {
          const userData = JSON.parse(user);
          setIsLoggedIn(true);
          setUserRole(userData.role || "");
          
          // Chuyển hướng dựa trên role
          if (userData.role === 'admin') {
            navigate('/admin/users');
          } else if (userData.role === 'user') {
            navigate('/');
          } else {
            navigate('/');
          }
        } catch (error) {
          console.error("Error parsing user data:", error);
          // Nếu có lỗi parse, xóa dữ liệu không hợp lệ
          localStorage.removeItem("access_token");
          localStorage.removeItem("refresh_token");
          localStorage.removeItem("user");
          localStorage.removeItem("logged");
        }
      }
    };

    checkLoggedIn();
  }, [navigate, setIsLoggedIn]);

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
      setUserRole(response.data.user.role || "");
      
      toast.success("Đăng nhập thành công!");
      
      // Chuyển hướng sau khi đăng nhập thành công
      if (response.data.user.role === 'admin') {
        navigate('/admin/users');
      }
      else if (response.data.user.role === 'user') {
        navigate('/');
      }
    } catch (error) {
      console.error("Login error:", error);
      
      toast.error(error.response?.data?.message || "Đăng nhập thất bại. Vui lòng thử lại.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = (credentialResponse ) => {
      console.log(credentialResponse);
      authApi.loginWithGoogle(credentialResponse.credential)
        .then(response => {
          // Handle successful login
          console.log("Login successful:", response);

          localStorage.setItem("access_token", JSON.stringify(response.data.tokens.accessToken));
          localStorage.setItem("refresh_token", JSON.stringify(response.data.tokens.refreshToken));
          
          // Lưu thông tin người dùng
          localStorage.setItem("user", JSON.stringify(response.data.user));
          localStorage.setItem("logged", true);
          
          setIsLoggedIn(true);
          setUserRole(response.data.user.role || "");
          
          toast.success("Đăng nhập bằng Google thành công!");
          
          // Chuyển hướng sau khi đăng nhập thành công
          if (response.data.user.role === 'admin') {
            navigate('/admin/users');
          }
          else if (response.data.user.role === 'user') {
            navigate('/');
          }
        })
        .catch(error => {
          console.error("Login failed:", error);
          toast.error(error.response.data.message || "Đăng nhập bằng Google thất bại. Vui lòng thử lại.");
        });
    }

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
              sx={{
                mb: 3,
                "& .MuiOutlinedInput-root": {
                  fontSize: "16px",
                },
                "& .MuiInputLabel-root.Mui-focused": { color: colors.primary[100] },
              }}
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
              sx={{
                mb: 2,
                "& .MuiOutlinedInput-root": {
                  fontSize: "16px",
                },
                "& .MuiInputLabel-root.Mui-focused": { color: colors.primary[100] },
              }}
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
            <GoogleLogin
              onSuccess={handleGoogleLogin}
              onError={() => toast.error("Đăng nhập bằng Google thất bại.")}
              style={{
                width: '100%',
                marginBottom: '16px',
              }}
            />
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
      <ToastContainer />
    </Box>
  );
};

export default Login;
