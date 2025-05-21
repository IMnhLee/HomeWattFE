import * as React from 'react';
import {
  Button,
  TextField,
  Box,
  Typography,
  Container,
  Paper,
  Link,
  InputAdornment,
  Alert,
  Snackbar,
  CircularProgress
} from '@mui/material';
import { useTheme } from "@mui/material";
import { tokens } from "../../theme";
import authApi from '../../services/auth';
import { useNavigate } from 'react-router-dom';
import EmailIcon from '@mui/icons-material/Email';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SendIcon from '@mui/icons-material/Send';

const ForgotPassword = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const navigate = useNavigate();

  // Form state
  const [email, setEmail] = React.useState("");
  const [emailError, setEmailError] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const [notification, setNotification] = React.useState({
    open: false,
    message: "",
    type: "info" // 'success', 'error', 'info', 'warning'
  });

  // Handle email input change
  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    setEmailError("");
  };

  // Close notification
  const handleCloseNotification = () => {
    setNotification({
      ...notification,
      open: false
    });
  };

  // Validate email format
  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate email
    if (!email.trim()) {
      setEmailError("Vui lòng nhập email");
      return;
    } else if (!validateEmail(email)) {
      setEmailError("Email không hợp lệ");
      return;
    }
    
    setIsLoading(true);

    try {
      const response = await authApi.forgotPassword({
        email: email
      });
      
      setNotification({
        open: true,
        message: "Đã gửi hướng dẫn đặt lại mật khẩu tới email của bạn!",
        type: "success"
      });
      
      // Clear form after successful submission
      setEmail("");
    } catch (error) {
      console.error("Forgot password error:", error);
      
      setNotification({
        open: true,
        message: error.response?.data?.message || "Không thể gửi yêu cầu. Vui lòng thử lại sau.",
        type: "error"
      });
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
              Quên mật khẩu
            </Typography>
          </Box>
          
          <Typography
            variant="body1"
            color={colors.grey[300]}
            textAlign="center"
            sx={{ mb: 3 }}
          >
            Nhập email của bạn để nhận liên kết đặt lại mật khẩu
          </Typography>
          
          <form onSubmit={handleSubmit}>
            {/* Email field */}
            <TextField
              fullWidth
              variant="filled"
              label="Email"
              type="email"
              value={email}
              onChange={handleEmailChange}
              error={!!emailError}
              helperText={emailError}
              disabled={isLoading}
              sx={{ mb: 4 }}
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
            
            {/* Submit button */}
            <Button
              type="submit"
              variant="contained"
              fullWidth
              disabled={isLoading}
              startIcon={isLoading ? null : <SendIcon />}
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
                "Gửi yêu cầu"
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

export default ForgotPassword;