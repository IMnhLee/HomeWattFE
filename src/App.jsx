import { useState, useEffect } from "react";
import { ColorModeContext, useMode } from "./theme";
import { Box, CssBaseline, ThemeProvider } from "@mui/material";
import { Route, Routes } from "react-router-dom";
import Topbar from "./scenes/global/Topbar";
import Sidebar from "./scenes/global/Sidebar";
import PrivateRoute from "./privateRoute";

import Dashboard from "./scenes/dashboard";
import Report from "./scenes/report";
import Form from "./scenes/form";
import Login from "./scenes/login";
import Signup from "./scenes/signup/signup";
import ForgotPassword from "./scenes/login/forgotPassword";
import ResetPassword from "./scenes/login/resetPassword";

import EnergyDeviceList from "./scenes/devices/EnergyDeviceList";
import FloorRoomManagement from "./scenes/devices/FloorRoomManagement";
import MeasurementDevices from "./scenes/devices/MeasurementDevices";
import ConfigBill from "./scenes/bill/configBill";
import ConsumptionPage from "./scenes/consumptions";
import Profile from "./scenes/profile/profile";
import ManageUser from "./scenes/admin/manageUser";

function App() {
  const [theme, colorMode] = useMode();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [toggled, setToggled] = useState(false);
  const [broken, setBroken] = useState(false);
  const [userRole, setUserRole] = useState("user");

  useEffect(() => {
    // Kiểm tra đăng nhập từ localStorage
    const accessToken = localStorage.getItem("access_token");
    const userItem = localStorage.getItem("user");
    
    // Kiểm tra nếu có access_token và user
    if (accessToken && userItem) {
      setIsLoggedIn(true);
      try {
        const userData = JSON.parse(userItem);
        setUserRole(userData.role || "user");
      } catch (error) {
        console.error("Error parsing user data:", error);
      }
    } else {
      setIsLoggedIn(false);
    }
  }, []);

  // Kiểm tra xem user có quyền admin không
  const isAdmin = userRole === "admin";

  // Định nghĩa các roles cho route
  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <div className="app">
          {isLoggedIn && userRole === "user" && (
            <Sidebar
              nameUser={localStorage.getItem("userName") || "User"}
              setBroken={setBroken}
              toggled={toggled}
              setToggled={setToggled}
            />
          )}
          <main className="content">
            <Box
              sx={{
                height: "100vh",
                overflowY: "auto",
                width: "100%",
              }}
            >
              {isLoggedIn && (
                <Topbar
                  setToggled={setToggled}
                  toggled={toggled}
                  broken={broken}
                  setIsLoggedIn={setIsLoggedIn}
                />
              )}
              
              <Routes>
                {/* Public routes */}
                <Route path="/login" element={<Login setIsLoggedIn={setIsLoggedIn} setUserRole={setUserRole} />} />
                <Route path="/signup" element={<Signup setIsLoggedIn={setIsLoggedIn} setUserRole={setUserRole} />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />

                {/* Protected routes */}
                <Route path="/" element={
                  <PrivateRoute roles={["user"]}>
                    <Dashboard />
                  </PrivateRoute>
                } />
                <Route path="/report" element={
                  <PrivateRoute roles={["user"]}>
                    <Report />
                  </PrivateRoute>
                } />
                <Route path="/devices/list" element={
                  <PrivateRoute roles={["user"]}>
                    <EnergyDeviceList />
                  </PrivateRoute>
                } />
                <Route path="/devices/room" element={
                  <PrivateRoute roles={["user"]}>
                    <FloorRoomManagement />
                  </PrivateRoute>
                } />
                <Route path="/devices/measurement" element={
                  <PrivateRoute roles={["user"]}>
                    <MeasurementDevices />
                  </PrivateRoute>
                } />
                <Route path="/bill/config" element={
                  <PrivateRoute roles={["user"]}>
                    <ConfigBill />
                  </PrivateRoute>
                } />
                <Route path="/consumptions" element={
                  <PrivateRoute roles={["user"]}>
                    <ConsumptionPage />
                  </PrivateRoute>
                } />
                <Route path="/form" element={
                  <PrivateRoute roles={["user"]}>
                    <Form />
                  </PrivateRoute>
                } />
                <Route path="/profile" element={
                  <PrivateRoute roles={["user"]}>
                    <Profile />
                  </PrivateRoute>
                } />
                
                {/* Admin only routes */}
                <Route path="/admin/users" element={
                  <PrivateRoute roles={["admin"]}>
                    <ManageUser />
                  </PrivateRoute>
                } />
                
              </Routes>
            </Box>
          </main>
        </div>
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
}

export default App;