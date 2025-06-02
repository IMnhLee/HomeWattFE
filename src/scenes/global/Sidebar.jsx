import { useState, useEffect } from "react";
import { Sidebar, Menu, MenuItem, SubMenu } from "react-pro-sidebar";
import { Box, IconButton, Typography, useTheme } from "@mui/material";
import { Link, useLocation } from "react-router-dom";
import { tokens } from "../../theme";
import PeopleOutlinedIcon from "@mui/icons-material/PeopleOutlined";
import ContactsOutlinedIcon from "@mui/icons-material/ContactsOutlined";
import PersonOutlinedIcon from "@mui/icons-material/PersonOutlined";
import CalendarTodayOutlinedIcon from "@mui/icons-material/CalendarTodayOutlined";
import HelpOutlineOutlinedIcon from "@mui/icons-material/HelpOutlineOutlined";
import BarChartOutlinedIcon from "@mui/icons-material/BarChartOutlined";
import TimelineOutlinedIcon from "@mui/icons-material/TimelineOutlined";
import SpeedIcon from "@mui/icons-material/Speed";
import Co2OutlinedIcon from "@mui/icons-material/Co2Outlined";
import DashboardOutlinedIcon from "@mui/icons-material/DashboardOutlined";
import AccountTreeOutlinedIcon from "@mui/icons-material/AccountTreeOutlined";
import MonitorHeartOutlinedIcon from "@mui/icons-material/MonitorHeartOutlined";
import SummarizeOutlinedIcon from "@mui/icons-material/SummarizeOutlined";
import QueryStatsOutlinedIcon from "@mui/icons-material/QueryStatsOutlined";
import FindInPageOutlinedIcon from "@mui/icons-material/FindInPageOutlined";
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import DevicesOtherOutlinedIcon from '@mui/icons-material/DevicesOtherOutlined';
import ApartmentOutlinedIcon from '@mui/icons-material/ApartmentOutlined';
import ElectricMeterOutlinedIcon from '@mui/icons-material/ElectricMeterOutlined';

import { FaAngleDoubleLeft, FaAngleDoubleRight } from "react-icons/fa";

const Item = ({ title, to, icon, selected, setSelected, setToggled }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  
  return (
    <MenuItem
      component={<Link to={to} />}
      active={selected === title}
      style={{ color: colors.grey[100] }}
      icon={icon}
      onClick={() => {
        setSelected(title);
        setToggled(false); // Đóng sidebar khi chọn một mục
      }}
    >
      <Typography>{title}</Typography>
    </MenuItem>
  );
};



const ProSidebar = ({
  nameUser,
  setBroken,
  toggled,
  setToggled,
}) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [role, setRole] = useState("user");
  const [selected, setSelected] = useState("Overview");
  const location = useLocation();


  useEffect(() => {
    const storedRole = localStorage.getItem("role");
    if (storedRole !== null) {
      setRole(storedRole);
    }
  }, []);

  // useEffect(() => {
  //   const handleResize = () => {
  //     if (window.innerWidth <= 1024) {
  //       setIsCollapsed(true);
  //     } else {
  //       setIsCollapsed(false);
  //     }
  //   };
  //   handleResize();
  //   window.addEventListener("resize", handleResize);
  //   return () => window.removeEventListener("resize", handleResize);
  // }, []);

  // Hàm kiểm tra active của SubMenu dựa trên các Item con
  const isSubMenuActive = (subItems) => {
    return subItems.some((item) => location.pathname === item.to);
  };

  const menuConfig = [
 
    {
      title: "EMS",
      items: [
        {
          title: "Dashboard",
          icon: <DashboardOutlinedIcon />,
          subItems: [
            { title: 'Overview', to: "/", icon: <MonitorHeartOutlinedIcon /> },
            // { title: "Applicant", to: "/monitoring/app", icon: <SpeedIcon /> },
            { title: "Usage", to: "/consumptions", icon: <TimelineOutlinedIcon /> },
            // { title: "Emission", to: "/monitoring/emission", icon: <Co2OutlinedIcon /> },
          ],
          defaultOpen: false, // Thêm lại defaultOpen cho Dashboard
        },
        { title:"Bill Config", to: "/bill/config", icon: <AccountTreeOutlinedIcon /> },
        { title: "Report", to: "/report", icon: <SummarizeOutlinedIcon /> },
      ],
    },
    {
      title: "Manage Devices",
      items: [
        {
          title: "Devices",
          icon: <DashboardOutlinedIcon />,
          subItems: [
            { title: "List", to: "/devices/list", icon: <DevicesOtherOutlinedIcon /> },
            { title: "Floor&Room", to: "/devices/room", icon: <ApartmentOutlinedIcon /> },
            { title: "Monitoring", to: "/devices/measurement", icon: <ElectricMeterOutlinedIcon /> },
          ],
          defaultOpen: false, // Thêm lại defaultOpen cho Dashboard
        },
        // { title: "Settings", to: "/setting", icon: <SettingsOutlinedIcon /> },
        // { title: "report", to: "/report", icon: <QueryStatsOutlinedIcon /> },
      ],
    },
    {
      title: "User",
      items: [
        { title: "Manage Team", to: "/team", icon: <PeopleOutlinedIcon /> },
        { title: "Contacts Information", to: "/faq", icon: <ContactsOutlinedIcon /> },
      ],
    },
    // {
    //   title: "Admin",
    //   role: ["admin", "superadmin"],
    //   items: [
    //     { title: "Profile Form", to: "/form", icon: <PersonOutlinedIcon /> },
    //     { title: "Calendar", to: "/calendar", icon: <CalendarTodayOutlinedIcon /> },
    //     { title: "FAQ Page", to: "/faq", icon: <HelpOutlineOutlinedIcon /> },
    //   ],
    // },
    // {
    //   title: "Superadmin",
    //   role: ["superadmin"],
    //   items: [
    //     { title: "Bar Chart", to: "/bar", icon: <BarChartOutlinedIcon /> },
    //   ],
    // },
  ];
  


  return (
    <Box
      sx={{
        position: "sticky",
        display: "flex",
        height: "100vh",
        top: 0,
        bottom: 0,
        zIndex: 10000,
        "& .ps-sidebar-container": {
          background: `${colors.primary[400]} !important`,
        },
        "& .ps-submenu-content": {
          background: `${colors.primary[400]} !important`,
        },
        "& .ps-menu-button": {
          padding: "5px 35px 5px 20px !important",
        },
        "& .ps-submenu-content .ps-menu-button": {
          padding: "4px 16px 4px 36px !important",
        },
        "& .ps-menu-button:hover": {
          color: "#868dfb !important",
          backgroundColor: "transparent !important",
        },
        "& .ps-active": {
          color: "#868dfb !important",
        },
        "& .ps-menu-root > .ps-menu-button.ps-active": {
          color: "#868dfb !important",
          backgroundColor: "rgba(255, 87, 34, 0.1) !important",
        },
      }}
    >
      <Sidebar
        collapsed={isCollapsed}
        toggled={toggled}
        onBackdropClick={() => setToggled(false)}
        breakPoint="md"
        onBreakPoint={setBroken}
        style={{ border: 'none' }}
      >
        <Menu iconShape="square" closeOnClick={true}>
          <MenuItem
            onClick={() => setIsCollapsed(!isCollapsed)}
            icon={isCollapsed ? <FaAngleDoubleRight /> : undefined}
            style={{ margin: "10px 0 20px 0", color: colors.grey[100] }}
          >
            {!isCollapsed && (
              <Box display="flex" justifyContent="flex-end" alignItems="center" ml="15px">
                <IconButton onClick={() => setIsCollapsed(!isCollapsed)}>
                  <FaAngleDoubleLeft />
                </IconButton>
              </Box>
            )}
          </MenuItem>

          {menuConfig.map((section) => (
            <div key={section.title}>
              {(!section.role || section.role.includes(role)) && (
                <>
                  <Typography
                    variant="h6"
                    color={colors.grey[300]}
                    sx={{ m: "15px 0 5px 20px" }}
                  >
                    {section.title}
                  </Typography>
                  {section.items.map((item) =>
                    item.subItems ? (
                      <SubMenu
                        key={item.title}
                        title={item.title}
                        label={item.title}
                        icon={item.icon}
                        defaultOpen={item.defaultOpen || true} // Sử dụng defaultOpen từ config
                        active={isSubMenuActive(item.subItems)}
                      >
                        {item.subItems.map((subItem) => (
                          <Item
                            key={subItem.title}
                            title={subItem.title}
                            to={subItem.to}
                            icon={subItem.icon}
                            selected={selected}
                            setSelected={setSelected}
                            setToggled={setToggled} // Truyền setToggled vào Item
                          />
                        ))}
                      </SubMenu>
                    ) : (
                      <Item
                        key={item.title}
                        title={item.title}
                        to={item.to}
                        icon={item.icon}
                        selected={selected}
                        setSelected={setSelected}
                        setToggled={setToggled}
                      />
                    )
                  )}
                </>
              )}
            </div>
          ))}
        </Menu>
      </Sidebar>
    </Box>
  );
};

export default ProSidebar;