import React, { useState } from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  useTheme,
  Paper,
  InputAdornment,
  IconButton,
  Container,
  Link as MuiLink,
  Alert,
  Snackbar,
  CircularProgress
} from "@mui/material";
import { Visibility, VisibilityOff, AccountCircle, Email, Lock } from "@mui/icons-material";
import { Link, useNavigate } from "react-router-dom";
import { tokens } from "../../theme";
import authApi from "../../services/auth";

const Signup = ({setIsLoggedIn}) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const navigate = useNavigate();

  // Form state
  const [formValues, setFormValues] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  // Error state
  const [formErrors, setFormErrors] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  // Loading and notification states
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState({
    open: false,
    message: "",
    type: "info" // 'success', 'error', 'info', 'warning'
  });

  // Password visibility state
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormValues({
      ...formValues,
      [name]: value,
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
      errors.username = "Username is required";
      isValid = false;
    } else if (formValues.username.length < 3) {
      errors.username = "Username must be at least 3 characters";
      isValid = false;
    }
    
    // Email validation
    if (!formValues.email.trim()) {
      errors.email = "Email is required";
      isValid = false;
    } else if (!/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(formValues.email)) {
      errors.email = "Please enter a valid email address";
      isValid = false;
    }
    
    // Password validation
    if (!formValues.password) {
      errors.password = "Password is required";
      isValid = false;
    } else if (formValues.password.length < 6) {
      errors.password = "Password must be at least 6 characters";
      isValid = false;
    }
    
    // Confirm password validation
    if (!formValues.confirmPassword) {
      errors.confirmPassword = "Please confirm your password";
      isValid = false;
    } else if (formValues.password !== formValues.confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
      isValid = false;
    }
    
    setFormErrors(errors);
    return isValid;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      setIsLoading(true);
      
      try {
        const response = await authApi.register({
          username: formValues.username,
          email: formValues.email,
          password: formValues.password
        });

        // Lưu tokens vào localStorage
        localStorage.setItem("access_token", JSON.stringify(response.data.tokens.accessToken));
        localStorage.setItem("refresh_token", JSON.stringify(response.data.tokens.refreshToken));
        
        // Lưu thông tin người dùng
        localStorage.setItem("user", JSON.stringify(response.data.user));
        localStorage.setItem("logged", true);
        
        console.log("Registration successful:", response);
        
        setNotification({
          open: true,
          message: "Registration successful! Redirecting to login...",
          type: "success"
        });
        
        setIsLoggedIn(true);
        navigate("/");
        
      } catch (error) {
        console.error("Registration error:", error);
        
        setNotification({
          open: true,
          message: error.response?.data?.message || "Registration failed. Please try again.",
          type: "error"
        });
      } finally {
        setIsLoading(false);
      }
    }
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
          <Typography
            variant="h2"
            color={colors.grey[100]}
            fontWeight="bold"
            textAlign="center"
            mb={4}
          >
            Create Account
          </Typography>

          <form onSubmit={handleSubmit}>
            {/* Username field */}
            <TextField
              fullWidth
              variant="filled"
              label="Username"
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
                    <AccountCircle sx={{ color: colors.grey[300] }} />
                  </InputAdornment>
                ),
                sx: { color: colors.grey[100] }
              }}
              InputLabelProps={{
                sx: { color: colors.grey[300] }
              }}
            />

            {/* Email field */}
            <TextField
              fullWidth
              variant="filled"
              label="Email"
              name="email"
              type="email"
              value={formValues.email}
              onChange={handleChange}
              error={!!formErrors.email}
              helperText={formErrors.email}
              disabled={isLoading}
              sx={{ mb: 3 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Email sx={{ color: colors.grey[300] }} />
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
              label="Password"
              name="password"
              type={showPassword ? "text" : "password"}
              value={formValues.password}
              onChange={handleChange}
              error={!!formErrors.password}
              helperText={formErrors.password}
              disabled={isLoading}
              sx={{ mb: 3 }}
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

            {/* Confirm Password field */}
            <TextField
              fullWidth
              variant="filled"
              label="Confirm Password"
              name="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              value={formValues.confirmPassword}
              onChange={handleChange}
              error={!!formErrors.confirmPassword}
              helperText={formErrors.confirmPassword}
              disabled={isLoading}
              sx={{ mb: 4 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock sx={{ color: colors.grey[300] }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      edge="end"
                      disabled={isLoading}
                      sx={{ color: colors.grey[300] }}
                    >
                      {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
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
              sx={{
                backgroundColor: colors.greenAccent[700],
                color: colors.primary[900],
                fontSize: "16px",
                fontWeight: "bold",
                padding: "12px",
                marginBottom: "20px",
                "&:hover": {
                  backgroundColor: colors.greenAccent[600],
                },
              }}
            >
              {isLoading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                "Sign Up"
              )}
            </Button>
          </form>

          {/* Login link */}
          <Box textAlign="center">
            <Typography variant="body1" color={colors.grey[300]}>
              Already have an account?{" "}
              <MuiLink
                component={Link}
                to="/login"
                sx={{
                  color: colors.blueAccent[500],
                  textDecoration: "none",
                  "&:hover": {
                    textDecoration: "underline",
                  },
                }}
              >
                Log In
              </MuiLink>
            </Typography>
          </Box>
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

export default Signup;