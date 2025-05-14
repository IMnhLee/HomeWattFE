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
} from "@mui/material";
import { Visibility, VisibilityOff, AccountCircle, Email, Lock } from "@mui/icons-material";
import { Link } from "react-router-dom";
import { tokens } from "../../theme";

const Signup = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

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
  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      console.log("Form submitted:", formValues);
      // Add your registration logic here
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
              Sign Up
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
    </Box>
  );
};

export default Signup;