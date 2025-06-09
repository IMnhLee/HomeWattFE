import * as React from 'react';
import {
  Button,
  TextField,
  Box,
  Typography,
  Container,
  Paper,
  InputAdornment,
  CircularProgress,
  IconButton
} from '@mui/material';
import { useTheme } from "@mui/material";
import { tokens } from "../../theme";
import authApi from '../../services/auth';
import { useNavigate, useLocation } from 'react-router-dom';
import LockIcon from '@mui/icons-material/Lock';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SaveIcon from '@mui/icons-material/Save';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import EmailIcon from '@mui/icons-material/Email';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const ResetPassword = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const navigate = useNavigate();
  const location = useLocation();

  // Extract email and token from URL
  const [email, setEmail] = React.useState("");
  const [token, setToken] = React.useState("");

  React.useEffect(() => {
    // Parse URL to extract email and token
    const fullPath = location.pathname + location.search;
    
    // Extract token first (now comes before email)
    const tokenMatch = fullPath.match(/token=([^?]+)/);
    if (tokenMatch && tokenMatch[1]) {
      setToken(decodeURIComponent(tokenMatch[1]));
    }
    
    // Extract email (now comes after token)
    const emailMatch = fullPath.match(/email=([^&]+)/);
    if (emailMatch && emailMatch[1]) {
      setEmail(decodeURIComponent(emailMatch[1]));
    }
    
    console.log("URL parsed:", { fullPath, email: emailMatch?.[1], token: tokenMatch?.[1] });
  }, [location]);

  // Form state
  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);
  
  // Error states
  const [passwordError, setPasswordError] = React.useState("");
  const [confirmPasswordError, setConfirmPasswordError] = React.useState("");
  
  // UI states
  const [isLoading, setIsLoading] = React.useState(false);

  // Handle form input changes
  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
    setPasswordError("");
    
    // Clear confirm password error if passwords match
    if (confirmPassword && e.target.value === confirmPassword) {
      setConfirmPasswordError("");
    }
  };

  const handleConfirmPasswordChange = (e) => {
    setConfirmPassword(e.target.value);
    setConfirmPasswordError("");
  };

  // Toggle password visibility
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  // Validate form
  const validateForm = () => {
    let isValid = true;
    
    // Password validation
    if (!password) {
      setPasswordError("Vui lòng nhập mật khẩu mới");
      isValid = false;
    } else if (password.length < 6) {
      setPasswordError("Mật khẩu phải có ít nhất 6 ký tự");
      isValid = false;
    }
    
    // Confirm password validation
    if (!confirmPassword) {
      setConfirmPasswordError("Vui lòng xác nhận mật khẩu");
      isValid = false;
    } else if (password !== confirmPassword) {
      setConfirmPasswordError("Mật khẩu không khớp");
      isValid = false;
    }
    
    return isValid;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    if (!email || !token) {
      toast.error("Liên kết đặt lại mật khẩu không hợp lệ hoặc đã hết hạn");
      return;
    }
    
    setIsLoading(true);

    try {
      await authApi.resetPassword({
        email: email,
        password: password,
        token: token
      });
      
      toast.success("Đặt lại mật khẩu thành công!");
      
      // Clear form and redirect to login after a delay
      setPassword("");
      setConfirmPassword("");
      
      setTimeout(() => {
        navigate('/login');
      }, 3000);
      
    } catch (error) {
      console.error("Reset password error:", error);
      
      toast.error(error.response?.data?.message || "Không thể đặt lại mật khẩu. Liên kết có thể đã hết hạn.");
    } finally {
      setIsLoading(false);
    }
  };

  // Navigate back to login page
  const handleBackToLogin = () => {
    navigate('/login');
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
              Đặt lại mật khẩu
            </Typography>
          </Box>
          
          <Typography
            variant="body1"
            color={colors.grey[300]}
            textAlign="center"
            sx={{ mb: 3 }}
          >
            Tạo mật khẩu mới cho tài khoản của bạn
          </Typography>
          
          {/* Email display (read-only) */}
          <TextField
            fullWidth
            variant="filled"
            label="Email"
            value={email}
            disabled
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
                  <EmailIcon sx={{ color: colors.grey[300] }} />
                </InputAdornment>
              ),
              sx: { color: colors.grey[100] }
            }}
            InputLabelProps={{
              sx: { color: colors.grey[300] }
            }}
          />
          
          <form onSubmit={handleSubmit}>
            {/* New Password field */}
            <TextField
              fullWidth
              variant="filled"
              label="Mật khẩu mới"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={handlePasswordChange}
              error={!!passwordError}
              helperText={passwordError}
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
                    <LockIcon sx={{ color: colors.grey[300] }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton 
                      onClick={togglePasswordVisibility}
                      edge="end"
                      sx={{ color: colors.grey[300] }}
                    >
                      {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                    </IconButton>
                  </InputAdornment>
                ),
                sx: { color: colors.grey[100] }
              }}
              InputLabelProps={{
                sx: { color: colors.grey[300] }
              }}
            />
            
            {/* Confirm Password field */}
            <TextField
              fullWidth
              variant="filled"
              label="Xác nhận mật khẩu mới"
              type={showConfirmPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={handleConfirmPasswordChange}
              error={!!confirmPasswordError}
              helperText={confirmPasswordError}
              disabled={isLoading}
              sx={{
                mb: 4,
                "& .MuiOutlinedInput-root": {
                  fontSize: "16px",
                },
                "& .MuiInputLabel-root.Mui-focused": { color: colors.primary[100] },
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockIcon sx={{ color: colors.grey[300] }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton 
                      onClick={toggleConfirmPasswordVisibility}
                      edge="end"
                      sx={{ color: colors.grey[300] }}
                    >
                      {showConfirmPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                    </IconButton>
                  </InputAdornment>
                ),
                sx: { color: colors.grey[100] }
              }}
              InputLabelProps={{
                sx: { color: colors.grey[300] }
              }}
            />
            
            {/* Submit button */}
            <Button
              type="submit"
              variant="contained"
              fullWidth
              disabled={isLoading}
              startIcon={isLoading ? null : <SaveIcon />}
              sx={{ 
                mb: 3,
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
                "Đặt lại mật khẩu"
              )}
            </Button>
            
            {/* Back to login button */}
            <Button
              fullWidth
              variant="outlined"
              startIcon={<ArrowBackIcon />}
              onClick={handleBackToLogin}
              sx={{ 
                py: 1.2,
                color: colors.grey[300],
                borderColor: colors.grey[700],
                '&:hover': {
                  borderColor: colors.grey[400],
                  backgroundColor: colors.grey[800],
                }
              }}
            >
              Quay lại đăng nhập
            </Button>
          </form>
        </Paper>
      </Container>
      <ToastContainer />
    </Box>
  );
};

export default ResetPassword;