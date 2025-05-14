import * as React from 'react';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import Divider from '@mui/material/Divider';
import FormLabel from '@mui/material/FormLabel';
import FormControl from '@mui/material/FormControl';
import Link from '@mui/material/Link';
import TextField from '@mui/material/TextField';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { styled } from '@mui/material/styles';
import { useTheme } from "@mui/material";
import { tokens } from "../../theme";
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import LoginIcon from '@mui/icons-material/Login';

const SignInContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  minHeight: '100vh',
  width: '100%',
  padding: theme.spacing(2),
  background: theme.palette.mode === 'light' 
    ? 'radial-gradient(ellipse at 50% 50%, hsl(210, 100%, 97%), hsl(0, 0%, 100%))'
    : 'radial-gradient(at 50% 50%, hsla(210, 100%, 16%, 0.5), hsl(220, 30%, 5%))',
}));

const FormCard = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  width: '100%',
  maxWidth: '450px',
  padding: theme.spacing(4),
  gap: theme.spacing(2),
  margin: 'auto',
  borderRadius: theme.shape.borderRadius,
  backgroundColor: theme.palette.background.paper,
  boxShadow: 'rgba(0, 0, 0, 0.1) 0px 5px 15px 0px, rgba(0, 0, 0, 0.05) 0px 15px 35px -5px',
}));

const Login = ({ handleToggleSidebar, isLoggedIn }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const navigate = useNavigate();

  const [emailError, setEmailError] = React.useState(false);
  const [emailErrorMessage, setEmailErrorMessage] = React.useState('');
  const [passwordError, setPasswordError] = React.useState(false);
  const [passwordErrorMessage, setPasswordErrorMessage] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  
  const handleSubmit = async (event) => {
    event.preventDefault();
    
    if (!validateInputs()) {
      return;
    }
    
    const data = new FormData(event.currentTarget);
    setIsLoading(true);

    try {
      const response = await axios.post("http://localhost:5000/login", {
        username: data.get('email'),
        password: data.get('password')
      }, {
        headers: {
          "Content-Type": "application/json"
        }
      });
  
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("logged", true);
      window.location.reload();
    } catch (error) {
      console.error("Error:", error.response?.data?.message || "Login failed");
      alert(error.response?.data?.message || "Login failed");
    } finally {
      setIsLoading(false);
    }
  };
  
  const validateInputs = () => {
    const email = document.getElementById('email');
    const password = document.getElementById('password');

    let isValid = true;

    if (!email.value) {
      setEmailError(true);
      setEmailErrorMessage('Vui lòng nhập tên đăng nhập');
      isValid = false;
    } else {
      setEmailError(false);
      setEmailErrorMessage('');
    }

    if (!password.value || password.value.length < 6) {
      setPasswordError(true);
      setPasswordErrorMessage('Mật khẩu phải có ít nhất 6 ký tự');
      isValid = false;
    } else {
      setPasswordError(false);
      setPasswordErrorMessage('');
    }
    return isValid;
  };

  const handleNavigateToSignup = () => {
    navigate('/signup');
  };

  return (
    <SignInContainer>
      <FormCard>
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          mb: 2
        }}>
          <Typography
            component="h1"
            variant="h3"
            color={colors.blueAccent[500]}
            fontWeight="bold"
            textAlign="center"
            gutterBottom
          >
            HomeWatt
          </Typography>
          <Typography
            variant="h4"
            sx={{ fontSize: 'clamp(1.5rem, 5vw, 2rem)' }}
          >
            Đăng nhập
          </Typography>
        </Box>
        
        <Box
          component="form"
          onSubmit={handleSubmit}
          noValidate
          sx={{
            display: 'flex',
            flexDirection: 'column',
            width: '100%',
            gap: 2,
          }}
        >
          <FormControl>
            <FormLabel htmlFor="email">Tên đăng nhập</FormLabel>
            <TextField
              error={emailError}
              helperText={emailErrorMessage}
              id="email"
              type="text"
              name="email"
              placeholder="Nhập tên đăng nhập"
              autoComplete="email"
              autoFocus
              required
              fullWidth
              variant="outlined"
              color={emailError ? 'error' : 'primary'}
            />
          </FormControl>
          
          <FormControl>
            <FormLabel htmlFor="password">Mật khẩu</FormLabel>
            <TextField
              error={passwordError}
              helperText={passwordErrorMessage}
              name="password"
              placeholder="••••••"
              type="password"
              id="password"
              autoComplete="current-password"
              required
              fullWidth
              variant="outlined"
              color={passwordError ? 'error' : 'primary'}
            />
          </FormControl>
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <FormControlLabel
              control={<Checkbox value="remember" color="primary" />}
              label="Ghi nhớ đăng nhập"
            />
            <Link href="#" variant="body2" color="primary">
              Quên mật khẩu?
            </Link>
          </Box>
          
          <Button
            type="submit"
            fullWidth
            variant="contained"
            disabled={isLoading}
            startIcon={<LoginIcon />}
            sx={{ 
              mt: 1, 
              py: 1.5,
              fontSize: '1rem',
              fontWeight: 'bold'
            }}
          >
            {isLoading ? "Đang xử lý..." : "Đăng nhập"}
          </Button>
        </Box>
        
        <Divider sx={{ my: 2 }}>
          <Typography variant="body2" color="text.secondary">
            HOẶC
          </Typography>
        </Divider>
        
        <Button
          fullWidth
          variant="outlined"
          color="secondary"
          startIcon={<PersonAddIcon />}
          onClick={handleNavigateToSignup}
          sx={{ py: 1.2 }}
        >
          Đăng ký tài khoản mới
        </Button>
      </FormCard>
    </SignInContainer>
  );
};

export default Login;
