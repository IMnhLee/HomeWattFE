import { Box, IconButton,Menu, MenuItem,useTheme } from "@mui/material";
import { useContext,useState } from "react";
import { ColorModeContext, tokens } from "../../theme";
import LightModeOutlinedIcon from "@mui/icons-material/LightModeOutlined";
import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined";
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined';
import PersonOutlinedIcon from "@mui/icons-material/PersonOutlined";
import { FaBars } from 'react-icons/fa';
import { useNavigate } from "react-router-dom";
import authApi from "../../services/auth";

const Topbar = ({ broken, setToggled, toggled, setIsLoggedIn }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const colorMode = useContext(ColorModeContext);
  const navigate = useNavigate();
  
  const handleLogout = () => {
    const refreshToken = localStorage.getItem("refresh_token");
    authApi.logout(refreshToken);
    localStorage.clear();
    setIsLoggedIn(false);
    navigate("/login");
  }
  return (
    <Box display="flex" justifyContent="space-between" p={2}>
      {/* SEARCH BAR */}
      <Box
        display="flex"
      >
        {broken&&(<IconButton onClick={() => setToggled(!toggled)}
        sx={{ display: { md: "none" } }}>
          <FaBars />
        </IconButton>)}
      </Box>

      {/* ICONS: Icon đầu tiên là icon phục vụ cho việc log out, icon thứ hai cùng với menu phục vụ chuyển ngôn ngữ, icon thứ ba là để chỉnh theme sáng tối */}
      
      <Box display="flex">
        <IconButton onClick={handleLogout} aria-label="Logout">
          <LogoutOutlinedIcon />                                  
        </IconButton>
       
        <IconButton onClick={colorMode.toggleColorMode}>
          {theme.palette.mode === "dark" ? (
            <DarkModeOutlinedIcon />
          ) : (
            <LightModeOutlinedIcon />
          )}
        </IconButton>

        {/* PROFILE BUTTON */}
        {localStorage.getItem("logged") === "true" && (
          <IconButton 
            onClick={() => navigate("/profile")} 
            aria-label="Profile"
          >
            <PersonOutlinedIcon />
          </IconButton>
        )}
        
      </Box>
    </Box>
  );
};

export default Topbar;