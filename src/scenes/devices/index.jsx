import { useState, useEffect } from "react";
import {
  Box,
  Button,
  Typography,
  useTheme,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Paper,
  Tab,
  Tabs,
  Card,
  CardContent,
  Chip,
  Tooltip,
  Divider,
  Menu,
  ListItemIcon,
  ListItemText
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  MoreVert as MoreVertIcon,
  Room as RoomIcon,
  Apartment as FloorIcon,
  DevicesOther as DeviceIcon,
  MonitorWeight as MonitoringIcon,
  SettingsInputComponent as LineIcon
} from "@mui/icons-material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import Header from "../../components/Header";
import { tokens } from "../../theme";

const DevicesPage = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [currentTab, setCurrentTab] = useState(0);
  
  // Các state cho dữ liệu
  const [devices, setDevices] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [floors, setFloors] = useState([]);
  const [monitoringDevices, setMonitoringDevices] = useState([]);
  
  // State cho dialog
  const [openDeviceDialog, setOpenDeviceDialog] = useState(false);
  const [openRoomDialog, setOpenRoomDialog] = useState(false);
  const [openFloorDialog, setOpenFloorDialog] = useState(false);
  const [openMonitoringDialog, setOpenMonitoringDialog] = useState(false);
  const [openLineDialog, setOpenLineDialog] = useState(false);
  const [currentDevice, setCurrentDevice] = useState(null);
  const [currentRoom, setCurrentRoom] = useState(null);
  const [currentFloor, setCurrentFloor] = useState(null);
  const [currentMonitoringDevice, setCurrentMonitoringDevice] = useState(null);
  const [currentLine, setCurrentLine] = useState(null);
  
  // State cho menu
  const [contextMenu, setContextMenu] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);

  // Mock data - thay thế bằng API call thực tế
  useEffect(() => {
    // Giả lập dữ liệu - thay thế bằng API call thực tế
    setFloors([
      { id: 1, name: "Tầng 1", description: "Tầng trệt" },
      { id: 2, name: "Tầng 2", description: "Tầng lầu" }
    ]);
    
    setRooms([
      { id: 1, name: "Phòng khách", floorId: 1, description: "Phòng khách tầng 1" },
      { id: 2, name: "Phòng ngủ chính", floorId: 1, description: "Phòng ngủ master" },
      { id: 3, name: "Phòng bếp", floorId: 1, description: "Phòng bếp và ăn" },
      { id: 4, name: "Phòng làm việc", floorId: 2, description: "Phòng làm việc tầng 2" }
    ]);
    
    setDevices([
      { id: 1, name: "Đèn phòng khách", description: "Đèn trần LED", lineCode: "LD001", roomId: 1 },
      { id: 2, name: "Điều hòa phòng khách", description: "Điều hòa Inverter", lineCode: "AC001", roomId: 1 },
      { id: 3, name: "Đèn phòng ngủ", description: "Đèn ngủ LED", lineCode: "LD002", roomId: 2 },
      { id: 4, name: "Bếp điện từ", description: "Bếp điện từ 2 vùng nấu", lineCode: "KT001", roomId: 3 },
      { id: 5, name: "Máy tính", description: "PC làm việc", lineCode: "PC001", roomId: 4 }
    ]);

    setMonitoringDevices([
      {
        id: 1,
        name: "Thiết bị đo 1",
        description: "Thiết bị đo điện năng lượng mặt trời",
        location: "Mái nhà",
        lines: [
          { id: 1, name: "Lộ 1", maxPower: 1000 },
          { id: 2, name: "Lộ 2", maxPower: 1500 }
        ]
      },
      {
        id: 2,
        name: "Thiết bị đo 2",
        description: "Thiết bị đo điện năng lượng gió",
        location: "Sân thượng",
        lines: [
          { id: 3, name: "Lộ 1", maxPower: 1200 }
        ]
      }
    ]);
  }, []);

  // Columns cho DataGrid Thiết bị
  const deviceColumns = [
    { field: "id", headerName: "ID", flex: 0.5 },
    { field: "name", headerName: "Tên thiết bị", flex: 1 },
    { field: "description", headerName: "Mô tả", flex: 1 },
    { field: "lineCode", headerName: "Mã Line", flex: 0.8 },
    {
      field: "roomId",
      headerName: "Phòng",
      flex: 0.8,
      valueGetter: (params) => {
        // Kiểm tra params và params.row có tồn tại không
        if (!params) return "Không có dữ liệu";
        
        // Kiểm tra roomId có tồn tại không
        const roomId = params;
        if (roomId === undefined || roomId === null) return "Chưa phân phòng";
        
        // Tìm phòng theo roomId
        const room = rooms.find(r => r.id === roomId);
        return room ? room.name : "Chưa phân phòng";
      }
    },
    {
      field: "actions",
      headerName: "Thao tác",
      flex: 0.8,
      renderCell: (params) => (
        <Box>
          <Tooltip title="Chỉnh sửa">
            <IconButton onClick={() => handleEditDevice(params.row)}>
              <EditIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Xóa">
            <IconButton 
              onClick={() => handleDeleteDevice(params.row.id)}
              sx={{ color: colors.redAccent[500] }}
            >
              <DeleteIcon />
            </IconButton>
          </Tooltip>
        </Box>
      )
    }
  ];

  // Handler functions
  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
  };

  const handleAddDevice = () => {
    setCurrentDevice(null);
    setOpenDeviceDialog(true);
  };

  const handleAddRoom = () => {
    setCurrentRoom(null);
    setOpenRoomDialog(true);
  };

  const handleAddFloor = () => {
    setCurrentFloor(null);
    setOpenFloorDialog(true);
  };

  // Handler functions for monitoring devices
  const handleAddMonitoringDevice = () => {
    setCurrentMonitoringDevice(null);
    setOpenMonitoringDialog(true);
  };

  const handleEditMonitoringDevice = (device) => {
    setCurrentMonitoringDevice(device);
    setOpenMonitoringDialog(true);
  };

  const handleDeleteMonitoringDevice = (id) => {
    // Xóa thiết bị đo - thay bằng API call thực tế
    setMonitoringDevices(monitoringDevices.filter(device => device.id !== id));
    
    // Xóa thiết bị đo sẽ xóa liên kết với tất cả thiết bị
    const updatedDevices = devices.map(device => {
      if (device.monitoringDeviceId === id) {
        return { ...device, monitoringDeviceId: null, lineId: null };
      }
      return device;
    });
    setDevices(updatedDevices);
  };

  const handleAddLine = (monitoringDeviceId) => {
    setCurrentLine(null);
    setCurrentMonitoringDevice(monitoringDevices.find(d => d.id === monitoringDeviceId));
    setOpenLineDialog(true);
  };

  const handleEditLine = (monitoringDeviceId, line) => {
    setCurrentLine(line);
    setCurrentMonitoringDevice(monitoringDevices.find(d => d.id === monitoringDeviceId));
    setOpenLineDialog(true);
  };

  const handleDeleteLine = (monitoringDeviceId, lineId) => {
    // Cập nhật thiết bị đo bằng cách xóa line
    const updatedMonitoringDevices = monitoringDevices.map(device => {
      if (device.id === monitoringDeviceId) {
        return {
          ...device,
          lines: device.lines.filter(line => line.id !== lineId)
        };
      }
      return device;
    });
    
    setMonitoringDevices(updatedMonitoringDevices);
    
    // Cập nhật thiết bị để xóa liên kết với line đã xóa
    const updatedDevices = devices.map(device => {
      if (device.monitoringDeviceId === monitoringDeviceId && device.lineId === lineId) {
        return { ...device, monitoringDeviceId: null, lineId: null };
      }
      return device;
    });
    setDevices(updatedDevices);
  };

  const handleEditDevice = (device) => {
    setCurrentDevice(device);
    setOpenDeviceDialog(true);
  };

  const handleEditRoom = (room) => {
    setCurrentRoom(room);
    setOpenRoomDialog(true);
  };

  const handleEditFloor = (floor) => {
    setCurrentFloor(floor);
    setOpenFloorDialog(true);
  };

  const handleDeleteDevice = (id) => {
    // Thực hiện xóa thiết bị - thay thế bằng API call
    setDevices(devices.filter(device => device.id !== id));
  };

  const handleDeleteRoom = (id) => {
    // Thực hiện xóa phòng - thay thế bằng API call
    setRooms(rooms.filter(room => room.id !== id));
  };

  const handleDeleteFloor = (id) => {
    // Thực hiện xóa tầng - thay thế bằng API call
    setFloors(floors.filter(floor => floor.id !== id));
  };

  const handleSaveDevice = (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const monitoringInfo = formData.get("monitoringInfo") ? formData.get("monitoringInfo").split("|") : [null, null];
    
    const deviceData = {
      name: formData.get("name"),
      description: formData.get("description"),
      lineCode: formData.get("lineCode"),
      roomId: parseInt(formData.get("roomId"), 10),
      monitoringDeviceId: monitoringInfo[0] ? parseInt(monitoringInfo[0], 10) : null,
      lineId: monitoringInfo[1] ? parseInt(monitoringInfo[1], 10) : null
    };

    if (currentDevice) {
      // Cập nhật thiết bị hiện có
      const updatedDevices = devices.map(device => 
        device.id === currentDevice.id ? { ...device, ...deviceData } : device
      );
      setDevices(updatedDevices);
    } else {
      // Thêm thiết bị mới
      const newDevice = {
        ...deviceData,
        id: Math.max(...devices.map(d => d.id), 0) + 1
      };
      setDevices([...devices, newDevice]);
    }
    
    setOpenDeviceDialog(false);
  };

  const handleSaveRoom = (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const roomData = {
      name: formData.get("name"),
      description: formData.get("description"),
      floorId: parseInt(formData.get("floorId"), 10)
    };

    if (currentRoom) {
      // Cập nhật phòng hiện có
      const updatedRooms = rooms.map(room => 
        room.id === currentRoom.id ? { ...room, ...roomData } : room
      );
      setRooms(updatedRooms);
    } else {
      // Thêm phòng mới
      const newRoom = {
        ...roomData,
        id: Math.max(...rooms.map(r => r.id), 0) + 1
      };
      setRooms([...rooms, newRoom]);
    }
    
    setOpenRoomDialog(false);
  };

  const handleSaveFloor = (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const floorData = {
      name: formData.get("name"),
      description: formData.get("description")
    };

    if (currentFloor) {
      // Cập nhật tầng hiện có
      const updatedFloors = floors.map(floor => 
        floor.id === currentFloor.id ? { ...floor, ...floorData } : floor
      );
      setFloors(updatedFloors);
    } else {
      // Thêm tầng mới
      const newFloor = {
        ...floorData,
        id: Math.max(...floors.map(f => f.id), 0) + 1
      };
      setFloors([...floors, newFloor]);
    }
    
    setOpenFloorDialog(false);
  };

  const handleSaveMonitoringDevice = (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const deviceData = {
      name: formData.get("name"),
      description: formData.get("description"),
      location: formData.get("location"),
      lines: currentMonitoringDevice?.lines || []
    };

    if (currentMonitoringDevice) {
      // Cập nhật thiết bị hiện có
      const updatedDevices = monitoringDevices.map(device => 
        device.id === currentMonitoringDevice.id ? { ...device, ...deviceData } : device
      );
      setMonitoringDevices(updatedDevices);
    } else {
      // Thêm thiết bị mới
      const newDevice = {
        ...deviceData,
        id: Math.max(...monitoringDevices.map(d => d.id), 0) + 1,
        lines: []
      };
      setMonitoringDevices([...monitoringDevices, newDevice]);
    }
    
    setOpenMonitoringDialog(false);
  };

  const handleSaveLine = (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const lineData = {
      name: formData.get("name"),
      maxPower: parseInt(formData.get("maxPower"), 10)
    };

    const updatedMonitoringDevices = monitoringDevices.map(device => {
      if (device.id === currentMonitoringDevice.id) {
        if (currentLine) {
          // Cập nhật line hiện có
          return {
            ...device,
            lines: device.lines.map(line => 
              line.id === currentLine.id ? { ...line, ...lineData } : line
            )
          };
        } else {
          // Thêm line mới
          const newLineId = device.lines.length > 0 ? 
            Math.max(...device.lines.map(line => line.id)) + 1 : 1;
          return {
            ...device,
            lines: [
              ...device.lines,
              { ...lineData, id: newLineId }
            ]
          };
        }
      }
      return device;
    });
    
    setMonitoringDevices(updatedMonitoringDevices);
    setOpenLineDialog(false);
  };

  const handleContextMenu = (event, item, type) => {
    event.preventDefault();
    setContextMenu({ mouseX: event.clientX, mouseY: event.clientY });
    setSelectedItem({ item, type });
  };

  const handleCloseContextMenu = () => {
    setContextMenu(null);
    setSelectedItem(null);
  };

  const handleContextMenuAction = (action) => {
    if (!selectedItem) return;
    
    const { item, type } = selectedItem;
    
    if (action === "edit") {
      if (type === "floor") handleEditFloor(item);
      if (type === "room") handleEditRoom(item);
      if (type === "device") handleEditDevice(item);
      if (type === "monitoring") handleEditMonitoringDevice(item);
    } else if (action === "delete") {
      if (type === "floor") handleDeleteFloor(item.id);
      if (type === "room") handleDeleteRoom(item.id);
      if (type === "device") handleDeleteDevice(item.id);
      if (type === "monitoring") handleDeleteDevice(item.id);
    }
    
    handleCloseContextMenu();
  };

  // Render các tab
  const renderDevicesTab = () => (
    <Box mt={2}>
      <Box display="flex" justifyContent="flex-end" mb={2}>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAddDevice}
          sx={{
            backgroundColor: colors.greenAccent[700],
            "&:hover": { backgroundColor: colors.greenAccent[600] }
          }}
        >
          Thêm thiết bị
        </Button>
      </Box>
      
      <Paper sx={{ height: "70vh", width: "100%" }}>
        {devices.length > 0 && rooms.length > 0 && (
          <DataGrid
            rows={devices}
            columns={deviceColumns}
            components={{ Toolbar: GridToolbar }}
            componentsProps={{
              toolbar: {
                showQuickFilter: true,
                quickFilterProps: { debounceMs: 500 }
              }
            }}
            sx={{
              "& .MuiDataGrid-cell": { borderBottom: `1px solid ${colors.grey[800]}` },
              "& .MuiDataGrid-columnHeader": {
                backgroundColor: colors.blueAccent[700],
                color: colors.grey[100]
              },
              "& .MuiDataGrid-columnHeaderTitle": {
                fontWeight: "bold",
              },
              "& .MuiDataGrid-footerContainer": {
                backgroundColor: colors.blueAccent[700],
                color: colors.grey[100]
              },
              "& .MuiDataGrid-virtualScroller": {
                backgroundColor: colors.primary[400],
              },
              "& .MuiDataGrid-toolbarContainer": {
                backgroundColor: colors.primary[500],
                "& .MuiButton-root": {
                  color: colors.grey[100]
                }
              }
            }}
          />
        )}
      </Paper>
    </Box>
  );

  // Render struct hiển thị phòng và thiết bị theo tầng
  const renderStructureTab = () => (
    <Box mt={2}>
      <Box display="flex" justifyContent="flex-end" gap={2} mb={2}>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAddFloor}
          sx={{
            backgroundColor: colors.blueAccent[500],
            "&:hover": { backgroundColor: colors.blueAccent[400] }
          }}
        >
          Thêm tầng
        </Button>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAddRoom}
          sx={{
            backgroundColor: colors.greenAccent[700],
            "&:hover": { backgroundColor: colors.greenAccent[600] }
          }}
        >
          Thêm phòng
        </Button>
      </Box>

      <Box display="grid" gap={3}>
        {floors.map((floor) => (
          <Box key={floor.id}>
            <Card
              sx={{
                backgroundColor: colors.primary[400],
                boxShadow: 3,
                overflow: "visible"
              }}
            >
              <CardContent>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    mb: 2
                  }}
                  onContextMenu={(e) => handleContextMenu(e, floor, "floor")}
                >
                  <Box display="flex" alignItems="center">
                    <FloorIcon sx={{ mr: 1, color: colors.blueAccent[400] }} />
                    <Typography variant="h4" fontWeight="bold">
                      {floor.name}
                    </Typography>
                  </Box>
                  <Tooltip title="Tùy chọn">
                    <IconButton onClick={(e) => handleContextMenu(e, floor, "floor")}>
                      <MoreVertIcon />
                    </IconButton>
                  </Tooltip>
                </Box>

                <Typography variant="body2" sx={{ mb: 2, color: colors.grey[300] }}>
                  {floor.description}
                </Typography>

                <Divider sx={{ my: 2 }} />

                <Box 
                  display="grid" 
                  gridTemplateColumns={{
                    xs: "1fr",
                    md: "repeat(2, 1fr)",
                    lg: "repeat(3, 1fr)"
                  }}
                  gap={2}
                >
                  {rooms
                    .filter((room) => room.floorId === floor.id)
                    .map((room) => (
                      <Box key={room.id}>
                        <Card
                          sx={{
                            backgroundColor: colors.blueAccent[700],
                            height: "100%"
                          }}
                        >
                          <CardContent>
                            <Box
                              sx={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                mb: 2
                              }}
                              onContextMenu={(e) => handleContextMenu(e, room, "room")}
                            >
                              <Box display="flex" alignItems="center">
                                <RoomIcon sx={{ mr: 1, color: colors.greenAccent[400] }} />
                                <Typography variant="h5">{room.name}</Typography>
                              </Box>
                              <Tooltip title="Tùy chọn">
                                <IconButton onClick={(e) => handleContextMenu(e, room, "room")}>
                                  <MoreVertIcon />
                                </IconButton>
                              </Tooltip>
                            </Box>

                            <Typography variant="body2" sx={{ mb: 2, color: colors.grey[300] }}>
                              {room.description}
                            </Typography>

                            <Typography variant="subtitle2" sx={{ mt: 2, mb: 1, color: colors.grey[200] }}>
                              Thiết bị trong phòng:
                            </Typography>

                            {devices.filter((device) => device.roomId === room.id).length > 0 ? (
                              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                                {devices
                                  .filter((device) => device.roomId === room.id)
                                  .map((device) => (
                                    <Chip
                                      key={device.id}
                                      icon={<DeviceIcon />}
                                      label={device.name}
                                      onClick={() => handleEditDevice(device)}
                                      onDelete={() => handleDeleteDevice(device.id)}
                                      onContextMenu={(e) => handleContextMenu(e, device, "device")}
                                      sx={{
                                        backgroundColor: colors.greenAccent[600],
                                        "& .MuiChip-icon": { color: colors.yellowAccent[500] },
                                        "& .MuiChip-deleteIcon": { color: colors.redAccent[400] }
                                      }}
                                    />
                                  ))}
                              </Box>
                            ) : (
                              <Typography variant="body2" color={colors.grey[400]}>
                                Chưa có thiết bị
                              </Typography>
                            )}
                          </CardContent>
                        </Card>
                      </Box>
                    ))}
                </Box>
              </CardContent>
            </Card>
          </Box>
        ))}
      </Box>
    </Box>
  );

  // Render tab Monitoring
  const renderMonitoringTab = () => (
    <Box mt={2}>
      <Box display="flex" justifyContent="flex-end" mb={2}>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAddMonitoringDevice}
          sx={{
            backgroundColor: colors.redAccent[600],
            "&:hover": { backgroundColor: colors.redAccent[500] }
          }}
        >
          Thêm thiết bị đo
        </Button>
      </Box>
      
      <Box display="grid" gap={3}>
        {monitoringDevices.map((device) => (
          <Box key={device.id}>
            <Card
              sx={{
                backgroundColor: colors.primary[400],
                boxShadow: 3,
                overflow: "visible"
              }}
            >
              <CardContent>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    mb: 2
                  }}
                  onContextMenu={(e) => handleContextMenu(e, device, "monitoring")}
                >
                  <Box display="flex" alignItems="center">
                    <MonitoringIcon sx={{ mr: 1, color: colors.redAccent[400] }} />
                    <Typography variant="h4" fontWeight="bold">
                      {device.name}
                    </Typography>
                  </Box>
                  <Box>
                    <Tooltip title="Thêm lộ">
                      <IconButton onClick={() => handleAddLine(device.id)}>
                        <AddIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Tùy chọn">
                      <IconButton onClick={(e) => handleContextMenu(e, device, "monitoring")}>
                        <MoreVertIcon />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Box>

                <Typography variant="body2" sx={{ mb: 1, color: colors.grey[300] }}>
                  {device.description}
                </Typography>
                
                <Typography variant="body2" sx={{ mb: 2, color: colors.grey[300] }}>
                  Vị trí: {device.location}
                </Typography>

                <Divider sx={{ my: 2 }} />

                <Typography variant="subtitle1" sx={{ mb: 2, color: colors.grey[100] }}>
                  Các lộ điện:
                </Typography>

                {device.lines.length > 0 ? (
                  <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                    {device.lines.map((line) => (
                      <Card key={line.id} sx={{ backgroundColor: colors.primary[600] }}>
                        <CardContent>
                          <Box display="flex" justifyContent="space-between" alignItems="center">
                            <Box display="flex" alignItems="center">
                              <LineIcon sx={{ mr: 1, color: colors.greenAccent[400] }} />
                              <Typography variant="h6">
                                {line.name} - {line.maxPower}W
                              </Typography>
                            </Box>
                            <Box>
                              <Tooltip title="Chỉnh sửa lộ">
                                <IconButton onClick={() => handleEditLine(device.id, line)}>
                                  <EditIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Xóa lộ">
                                <IconButton 
                                  onClick={() => handleDeleteLine(device.id, line.id)}
                                  sx={{ color: colors.redAccent[500] }}
                                >
                                  <DeleteIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </Box>
                          </Box>
                          
                          <Divider sx={{ my: 1 }} />
                          
                          <Typography variant="subtitle2" sx={{ mb: 1, color: colors.grey[200] }}>
                            Thiết bị được gán:
                          </Typography>
                          
                          {devices.filter(d => d.monitoringDeviceId === device.id && d.lineId === line.id).length > 0 ? (
                            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                              {devices
                                .filter(d => d.monitoringDeviceId === device.id && d.lineId === line.id)
                                .map((d) => (
                                  <Chip
                                    key={d.id}
                                    icon={<DeviceIcon />}
                                    label={d.name}
                                    onClick={() => handleEditDevice(d)}
                                    sx={{
                                      backgroundColor: colors.primary[300],
                                      "& .MuiChip-icon": { color: colors.yellowAccent[500] }
                                    }}
                                  />
                                ))}
                            </Box>
                          ) : (
                            <Typography variant="body2" color={colors.grey[400]}>
                              Chưa có thiết bị
                            </Typography>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </Box>
                ) : (
                  <Typography variant="body2" color={colors.grey[400]}>
                    Chưa có lộ điện
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Box>
        ))}
      </Box>
    </Box>
  );

  return (
    <Box m="20px">
      <Header title="QUẢN LÝ THIẾT BỊ" subtitle="Quản lý các thiết bị trong nhà" />

      <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
        <Tabs 
          value={currentTab} 
          onChange={handleTabChange}
          textColor="secondary"
          indicatorColor="secondary"
        >
          <Tab label="Cấu trúc" />
          <Tab label="Danh sách thiết bị" />
          <Tab label="Giám sát" />
        </Tabs>
      </Box>

      {currentTab === 0 && renderStructureTab()}
      {currentTab === 1 && renderDevicesTab()}
      {currentTab === 2 && renderMonitoringTab()}

      {/* Dialog thêm/sửa thiết bị */}
      <Dialog open={openDeviceDialog} onClose={() => setOpenDeviceDialog(false)} fullWidth>
        <form onSubmit={handleSaveDevice}>
          <DialogTitle>
            {currentDevice ? "Chỉnh sửa thiết bị" : "Thêm thiết bị mới"}
          </DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              name="name"
              label="Tên thiết bị"
              type="text"
              fullWidth
              variant="outlined"
              defaultValue={currentDevice?.name || ""}
              required
              sx={{ mb: 2, mt: 1 }}
            />
            <TextField
              margin="dense"
              name="description"
              label="Mô tả"
              type="text"
              fullWidth
              variant="outlined"
              defaultValue={currentDevice?.description || ""}
              sx={{ mb: 2 }}
            />
            <TextField
              margin="dense"
              name="lineCode"
              label="Mã Line"
              type="text"
              fullWidth
              variant="outlined"
              defaultValue={currentDevice?.lineCode || ""}
              required
              sx={{ mb: 2 }}
            />
            <FormControl fullWidth>
              <InputLabel id="room-select-label">Phòng</InputLabel>
              <Select
                labelId="room-select-label"
                name="roomId"
                defaultValue={currentDevice?.roomId || ""}
                label="Phòng"
                required
              >
                {rooms.map((room) => (
                  <MenuItem key={room.id} value={room.id}>
                    {room.name} ({floors.find(f => f.id === room.floorId)?.name})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth sx={{ mt: 2 }}>
              <InputLabel id="monitoring-select-label">Thiết bị đo / Lộ</InputLabel>
              <Select
                labelId="monitoring-select-label"
                name="monitoringInfo"
                defaultValue={
                  currentDevice?.monitoringDeviceId && currentDevice?.lineId
                    ? `${currentDevice.monitoringDeviceId}|${currentDevice.lineId}`
                    : ""
                }
                label="Thiết bị đo / Lộ"
                required
              >
                {monitoringDevices.flatMap(device => 
                  device.lines.map(line => (
                    <MenuItem key={`${device.id}-${line.id}`} value={`${device.id}|${line.id}`}>
                      {device.name} / {line.name}
                    </MenuItem>
                  ))
                )}
              </Select>
            </FormControl>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDeviceDialog(false)}>Hủy</Button>
            <Button type="submit" variant="contained" color="primary">
              {currentDevice ? "Cập nhật" : "Thêm"}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Dialog thêm/sửa phòng */}
      <Dialog open={openRoomDialog} onClose={() => setOpenRoomDialog(false)} fullWidth>
        <form onSubmit={handleSaveRoom}>
          <DialogTitle>
        {currentRoom ? "Chỉnh sửa phòng" : "Thêm phòng mới"}
          </DialogTitle>
          <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          name="name"
          label="Tên phòng"
          type="text"
          fullWidth
          variant="outlined"
          defaultValue={currentRoom?.name || ""}
          required
          sx={{ mb: 2, mt: 1, "& .MuiInputLabel-root.Mui-focused": { color: colors.primary[100] }, }}
        />
        <TextField
          margin="dense"
          name="description"
          label="Mô tả"
          type="text"
          fullWidth
          variant="outlined"
          defaultValue={currentRoom?.description || ""}
          sx={{ mb: 2, "& .MuiInputLabel-root.Mui-focused": { color: colors.primary[100] }}}
        />
        <FormControl fullWidth>
          <InputLabel id="floor-select-label">Tầng</InputLabel>
          <Select
            labelId="floor-select-label"
            name="floorId"
            defaultValue={currentRoom?.floorId || ""}
            label="Tầng"
            required
            sx={{"&.Mui-focused": {color: colors.primary[100]}}}
            MenuProps={{
              PaperProps: {
                style: {
                  maxHeight: 224,
                  width: 'auto',
                },
              },
              anchorOrigin: {
                vertical: 'bottom',
                horizontal: 'left',
              },
              transformOrigin: {
                vertical: 'top',
                horizontal: 'left',
              },
                }}
              >
                {floors.map((floor) => (
              <MenuItem key={floor.id} value={floor.id}>
                {floor.name}
              </MenuItem>
                ))}
              </Select>
            </FormControl>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenRoomDialog(false)}>Hủy</Button>
            <Button type="submit" variant="contained" color="primary">
              {currentRoom ? "Cập nhật" : "Thêm"}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

        {/* Dialog thêm/sửa tầng */}
      <Dialog open={openFloorDialog} onClose={() => setOpenFloorDialog(false)} fullWidth>
        <form onSubmit={handleSaveFloor}>
          <DialogTitle>
            {currentFloor ? "Chỉnh sửa tầng" : "Thêm tầng mới"}
          </DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              name="name"
              label="Tên tầng"
              type="text"
              fullWidth
              variant="outlined"
              defaultValue={currentFloor?.name || ""}
              required
              sx={{ mb: 2, mt: 1 }}
            />
            <TextField
              margin="dense"
              name="description"
              label="Mô tả"
              type="text"
              fullWidth
              variant="outlined"
              defaultValue={currentFloor?.description || ""}
              sx={{ mb: 2 }}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenFloorDialog(false)}>Hủy</Button>
            <Button type="submit" variant="contained" color="primary">
              {currentFloor ? "Cập nhật" : "Thêm"}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Dialog thêm/sửa thiết bị đo */}
      <Dialog open={openMonitoringDialog} onClose={() => setOpenMonitoringDialog(false)} fullWidth>
        <form onSubmit={handleSaveMonitoringDevice}>
          <DialogTitle>
            {currentMonitoringDevice ? "Chỉnh sửa thiết bị đo" : "Thêm thiết bị đo mới"}
          </DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              name="name"
              label="Tên thiết bị đo"
              type="text"
              fullWidth
              variant="outlined"
              defaultValue={currentMonitoringDevice?.name || ""}
              required
              sx={{ mb: 2, mt: 1 }}
            />
            <TextField
              margin="dense"
              name="description"
              label="Mô tả"
              type="text"
              fullWidth
              variant="outlined"
              defaultValue={currentMonitoringDevice?.description || ""}
              sx={{ mb: 2 }}
            />
            <TextField
              margin="dense"
              name="location"
              label="Vị trí"
              type="text"
              fullWidth
              variant="outlined"
              defaultValue={currentMonitoringDevice?.location || ""}
              required
              sx={{ mb: 2 }}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenMonitoringDialog(false)}>Hủy</Button>
            <Button type="submit" variant="contained" color="primary">
              {currentMonitoringDevice ? "Cập nhật" : "Thêm"}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Dialog thêm/sửa lộ điện */}
      <Dialog open={openLineDialog} onClose={() => setOpenLineDialog(false)} fullWidth>
        <form onSubmit={handleSaveLine}>
          <DialogTitle>
            {currentLine ? "Chỉnh sửa lộ" : "Thêm lộ mới"}
          </DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              name="name"
              label="Tên lộ"
              type="text"
              fullWidth
              variant="outlined"
              defaultValue={currentLine?.name || ""}
              required
              sx={{ mb: 2, mt: 1 }}
            />
            <TextField
              margin="dense"
              name="maxPower"
              label="Công suất tối đa (W)"
              type="number"
              fullWidth
              variant="outlined"
              defaultValue={currentLine?.maxPower || 0}
              required
              sx={{ mb: 2 }}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenLineDialog(false)}>Hủy</Button>
            <Button type="submit" variant="contained" color="primary">
              {currentLine ? "Cập nhật" : "Thêm"}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Context Menu */}
      <Menu
        open={contextMenu !== null}
        onClose={handleCloseContextMenu}
        anchorReference="anchorPosition"
        anchorPosition={
          contextMenu !== null
            ? { top: contextMenu.mouseY, left: contextMenu.mouseX }
            : undefined
        }
      >
        <MenuItem onClick={() => handleContextMenuAction("edit")}>
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="Chỉnh sửa" />
        </MenuItem>
        <MenuItem onClick={() => handleContextMenuAction("delete")}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" sx={{ color: colors.redAccent[500] }} />
          </ListItemIcon>
          <ListItemText primary="Xóa" sx={{ color: colors.redAccent[500] }} />
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default DevicesPage;