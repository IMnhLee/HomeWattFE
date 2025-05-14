import { useState, useEffect } from "react";

import { ColorModeContext, useMode } from "./theme";
import { Box, CssBaseline, ThemeProvider } from "@mui/material";
import { Route, Routes } from "react-router-dom";
import Topbar from "./scenes/global/Topbar";
import Sidebar from "./scenes/global/Sidebar";

import Dashboard from "./scenes/dashboard";

import Form from "./scenes/form";
import FAQ from "./scenes/faq";
import Login from "./scenes/login";
import Signup from "./scenes/signup/signup"; // Import Signup component
import Appliances from "./scenes/appliances";
import Setting from "./scenes/setting";
import Emission from "./scenes/emission";
import EnergyDeviceList from "./scenes/devices/EnergyDeviceList";
import FloorRoomManagement from "./scenes/devices/FloorRoomManagement";
import MeasurementDevices from "./scenes/devices/MeasurementDevices";
import ConfigBill from "./scenes/bill/configBill";
import ConsumptionPage from "./scenes/consumptions";
import Profile from "./scenes/profile/profile";
import ManageUser from "./scenes/admin/manageUser";
import Team from "./scenes/team";

function App() {

const [theme, colorMode] = useMode();
const [isLoggedIn, setIsLoggedIn] = useState(false);
const [toggled, setToggled] = useState(false); // State to control sidebar toggling
const [broken, setBroken] = useState(false); // State to control sidebar broken state


useEffect(() => {
	const loggedStatus = localStorage.getItem("logged");
	setIsLoggedIn(loggedStatus === "true");
	}, []);

  useEffect(() => {
    const loggedStatus = localStorage.getItem("logged");
    setIsLoggedIn(loggedStatus === "true");
  }, []);

  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <div className='app'>
          {isLoggedIn && (
            <Sidebar
              nameUser={"Dũng"}
              setBroken={setBroken}
              toggled={toggled}
              setToggled={setToggled}
            />
          )}
          <main className="content">
            <Box
              sx={{
                height: "100vh", // Chiều cao bằng Sidebar
                overflowY: "auto", // Cho phép cuộn nội dung trong Box
                width: "100%", // Đảm bảo Box chiếm toàn bộ chiều rộng
              }}
            >
              {isLoggedIn ? (
                <>
                  <Topbar
                    setToggled={setToggled}
                    toggled={toggled}
                    broken={broken}
                    isLoggedIn={isLoggedIn}
                  />
                  <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/monitoring/app" element={<Appliances />} />
                    <Route path ="/monitoring/emission" element={<Emission/>}/>
                    <Route path ="/setting" element={<Setting/>}/>
                    <Route path="/devices/list" element={<EnergyDeviceList/>}></Route>
                    <Route path="/devices/room" element={<FloorRoomManagement/>}></Route>
                    <Route path="/devices/measurement" element={<MeasurementDevices/>}></Route>
                    <Route path="/bill/config" element={<ConfigBill/>}></Route>
                    <Route path="/consumptions" element={<ConsumptionPage/>}></Route>
                    <Route path="/form" element={<Form />} />
                    <Route path="/faq" element={<FAQ />} />
                    <Route path="/profile" element={<Profile />}></Route>
                    <Route path="/team" element={<Team />}></Route>
                    <Route path="/admin/users" element={<ManageUser />}></Route>
                  </Routes>
                </>
              ) : (
                // Auth routes when not logged in
                <Routes>
                  <Route path="/signup" element={<Signup />} />
                  <Route path="*" element={<Login />} /> {/* Default to login for any other path */}
                </Routes>
              )}
            </Box>
          </main>
				</div>
			</ThemeProvider>
			
		</ColorModeContext.Provider>
	);
}
export default App;
