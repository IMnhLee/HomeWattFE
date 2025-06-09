import React, { useState, useEffect } from "react";
import {
  Box, 
  Button,
  IconButton,
  Typography,
  useTheme,
  TextField,
  Modal,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Collapse,
  TablePagination,
  Tooltip,
  FormHelperText,
  CircularProgress
} from "@mui/material";
import { tokens } from "../../theme";
import Header from "../../components/Header";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import LinkIcon from "@mui/icons-material/Link";
import LinkOffIcon from "@mui/icons-material/LinkOff";
import monitoringApi from "../../services/monitoring";
import floorApi from "../../services/floor";
import lineApi from "../../services/line";

import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const MeasurementDevices = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  
  // Define common modal style
  const modalStyle = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 500,
    bgcolor: colors.primary[400],
    border: '2px solid ' + colors.primary[500],
    boxShadow: 24,
    borderRadius: 1,
    p: 4,
  };

  // State for API data
  const [loading, setLoading] = useState(false);
  const [measurementDevices, setMeasurementDevices] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  
  // Add missing state variables
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [expandedDevice, setExpandedDevice] = useState(null);
  
  // Dialog states
  const [deviceDialogOpen, setDeviceDialogOpen] = useState(false);
  const [lineDialogOpen, setLineDialogOpen] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  
  // Form states
  const [editingDevice, setEditingDevice] = useState(null);
  const [newDevice, setNewDevice] = useState({
    name: "",
    code: "",
    location: "",
    active: true
  });
  
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [editingLine, setEditingLine] = useState(null);
  const [newLine, setNewLine] = useState({
    code: "",
    name: "",
    floor: "",
    room: "",
    roomId: "",
    active: true
  });
  
  const [deleteDeviceId, setDeleteDeviceId] = useState(null);
  const [disconnectInfo, setDisconnectInfo] = useState({ deviceId: null, lineId: null });
  
  // Update state definition
  const [availableFloors, setAvailableFloors] = useState([]);
  const [availableRooms, setAvailableRooms] = useState([]);
  
  // Fetch floors and rooms data from API
  const fetchFloorsAndRooms = async () => {
    try {
      const response = await floorApi.getAllFloor();
      
      // Xử lý trường hợp response rỗng hoặc không có data
      if (response && response.data && Array.isArray(response.data) && response.data.length > 0) {
        // Extract floor names
        const floors = response.data
          .filter(floor => floor && floor.name)
          .map(floor => floor.name);
        
        // Extract rooms with their floor relationships
        const rooms = [];
        response.data.forEach(floor => {
          if (floor && floor.rooms && Array.isArray(floor.rooms) && floor.name) {
            floor.rooms.forEach(room => {
              if (room && room.id && room.name) {
                rooms.push({
                  id: room.id,
                  name: room.name,
                  floor: floor.name
                });
              }
            });
          }
        });
        
        setAvailableFloors(floors);
        setAvailableRooms(rooms);
      } else {
        // Trường hợp không có dữ liệu
        setAvailableFloors([]);
        setAvailableRooms([]);
        console.log("No floors and rooms data available");
      }
    } catch (err) {
      console.error("Error fetching floors and rooms:", err);
      setAvailableFloors([]);
      setAvailableRooms([]);
      toast.error("Không thể tải dữ liệu tầng và phòng. Vui lòng thử lại.");
    }
  };
  
  // Get rooms for selected floor
  const getRoomsForFloor = (floorName) => {
    if (!floorName || !availableRooms || !Array.isArray(availableRooms) || availableRooms.length === 0) return [];
    return availableRooms.filter(room => room && room.floor === floorName);
  };

  // Fetch data from API
  const fetchDevices = async () => {
    try {
      setLoading(true);
      const response = await monitoringApi.getAllMonitoring(page + 1, rowsPerPage);
      
      // Xử lý trường hợp response rỗng
      if (response && response.data) {
        setMeasurementDevices(Array.isArray(response.data.data) ? response.data.data : []);
        setTotalCount(response.data.meta?.totalCount || 0);
        setTotalPages(response.data.meta?.totalPages || 0);
      } else {
        setMeasurementDevices([]);
        setTotalCount(0);
        setTotalPages(0);
      }
    } catch (err) {
      console.error("Error fetching devices:", err);
      setMeasurementDevices([]);
      setTotalCount(0);
      setTotalPages(0);
      toast.error("Không thể tải danh sách thiết bị. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  // Initial data fetch and when pagination changes
  useEffect(() => {
    fetchDevices();
    fetchFloorsAndRooms(); // Add this call to load floors and rooms
  }, [page, rowsPerPage]);

  const handleExpandDevice = (deviceId) => {
    setExpandedDevice(expandedDevice === deviceId ? null : deviceId);
  };
  
  // Handle pagination
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };
  
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  
  // Open device dialog
  const openDeviceDialog = (device = null) => {
    if (device) {
      setEditingDevice(device);
      setNewDevice({
        name: device.name,
        code: device.code,
        location: device.location || "",
        active: device.active
      });
    } else {
      setEditingDevice(null);
      setNewDevice({
        name: "",
        code: "",
        location: "",
        active: true
      });
    }
    setDeviceDialogOpen(true);
  };
  
  // Handle device form input
  const handleDeviceInputChange = (e) => {
    const { name, value } = e.target;
    if (name === "active") {
      setNewDevice({
        ...newDevice,
        active: value === "true"
      });
    } else {
      setNewDevice({
        ...newDevice,
        [name]: value
      });
    }
  };
  
  // Save device
  const handleSaveDevice = async () => {
    try {
      setLoading(true);
      if (editingDevice) {
        // Update existing device
        await monitoringApi.updateMonitoring({
          id: editingDevice.id,
          ...newDevice
        });
      } else {
        // Add new device
        await monitoringApi.addMonitoring(newDevice);
      }
      // Refresh device list
      fetchDevices();
      setDeviceDialogOpen(false);
      toast.success(editingDevice ? "Device updated successfully!" : "Device added successfully!");
    } catch (err) {
      console.error("Error saving device:", err);
      toast.error("Failed to save device. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  
  // Delete device
  const handleDeleteDevice = (deviceId) => {
    setDeleteDeviceId(deviceId);
    setDeleteDialogOpen(true);
  };
  
  const confirmDeleteDevice = async () => {
    try {
      setLoading(true);
      await monitoringApi.removeMonitoring(deleteDeviceId);
      // Refresh device list
      await fetchDevices();
      setDeleteDialogOpen(false);
      toast.success("Device deleted successfully!");
    } catch (err) {
      console.error("Error deleting device:", err);
      toast.error("Failed to delete device. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  
  // Open line dialog for editing
  const openLineDialog = (device, line) => {
    setSelectedDevice(device);
    setEditingLine(line);
    
    // Determine floor and room from line.room if it exists
    let floorName = "";
    let roomName = "";
    let roomId = "";
    
    if (line.room) {
      roomName = line.room.name;
      roomId = line.room.id;
      if (line.room.floor) {
        floorName = line.room.floor.name;
      }
    }
    
    setNewLine({
      code: line.code,
      name: line.name || "",
      floor: floorName,
      room: roomName,
      roomId: roomId,
      active: line.active
    });
    
    setLineDialogOpen(true);
  };
  
  // Handle line form input
  const handleLineInputChange = (e) => {
    const { name, value } = e.target;
    if (name === "active") {
      setNewLine({
        ...newLine,
        active: value === "true"
      });
    } else {
      setNewLine({
        ...newLine,
        [name]: value
      });
      
      // Reset room when floor changes
      if (name === 'floor') {
        setNewLine(prev => ({
          ...prev,
          room: ''
        }));
      }
    }
  };
  
  // Update line
  const handleSaveLine = async () => {
    if (selectedDevice && editingLine) {
      try {
        setLoading(true);
        
        // Find the room ID based on room name and floor
        let roomId = null;
        if (newLine.room && newLine.floor && availableRooms && Array.isArray(availableRooms) && availableRooms.length > 0) {
          const matchedRoom = availableRooms.find(
            room => room && room.name === newLine.room && room.floor === newLine.floor
          );
          if (matchedRoom) {
            roomId = matchedRoom.id;
          }
        }
        
        // Prepare line data with the required API structure
        const lineData = {
          monitoringId: selectedDevice.id,
          lineId: editingLine.id,
          name: newLine.name || null,
          roomId: roomId
        };
        
        // Call the line API to update the line
        await lineApi.editLine(lineData);
        
        // Refresh devices list
        await fetchDevices();
        setLineDialogOpen(false);
        toast.success("Cập nhật lộ điện thành công!");
      } catch (err) {
        console.error("Error updating line:", err);
        toast.error("Không thể cập nhật lộ điện. Vui lòng thử lại.");
      } finally {
        setLoading(false);
      }
    }
  };
  
  // Disconnect line (clear device info)
  const handleDisconnectLine = (deviceId, lineId) => {
    setDisconnectInfo({ deviceId, lineId });
    setConfirmDialogOpen(true);
  };

  const confirmDisconnect = async () => {
    const { deviceId, lineId } = disconnectInfo;
    try {
      setLoading(true);
      
      await lineApi.disconnectLine({ 
        monitoringId: deviceId,
        lineId: lineId 
      });
      
      await fetchDevices();
      setConfirmDialogOpen(false);
      toast.success("Line disconnected successfully!");
    } catch (err) {
      console.error("Error disconnecting line:", err);
      toast.error("Failed to disconnect line. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box m="20px">
      
      {/* Header component */}
      <Header title="Thiết bị đo" subtitle="Quản lý thiết bị giám sát công suất và kết nối" />

      <Box display="flex" justifyContent="flex-end" mb={3}>
        <Button
          variant="contained"
          color="secondary"
          startIcon={<AddIcon />}
          onClick={() => openDeviceDialog()}
          sx={{ fontSize: "14px", py: 1 }}
        >
          Thêm thiết bị đo
        </Button>
      </Box>
      
      {/* Devices Table */}
      <TableContainer component={Paper} sx={{ backgroundColor: colors.primary[400] }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ width: '60px' }} />
              <TableCell sx={{ color: colors.grey[100], fontWeight: 'bold', fontSize: "18px" }}>Tên</TableCell>
              <TableCell sx={{ color: colors.grey[100], fontWeight: 'bold', fontSize: "18px" }}>Mã thiết bị</TableCell>
              <TableCell sx={{ color: colors.grey[100], fontWeight: 'bold', fontSize: "18px" }}>Vị trí</TableCell>
              <TableCell sx={{ color: colors.grey[100], fontWeight: 'bold', fontSize: "18px" }}>Trạng thái</TableCell>
              <TableCell sx={{ color: colors.grey[100], fontWeight: 'bold', fontSize: "18px" }} align="center">Số lộ</TableCell>
              <TableCell sx={{ color: colors.grey[100], fontWeight: 'bold', fontSize: "18px" }} align="center">Hành động</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
                  <CircularProgress color="secondary" />
                </TableCell>
              </TableRow>
            ) : (measurementDevices && Array.isArray(measurementDevices) && measurementDevices.length > 0) ? (
              measurementDevices.map((device) => (
                <React.Fragment key={device?.id || Math.random()}>
                  <TableRow hover>
                    <TableCell>
                      <IconButton
                        size="medium"
                        onClick={() => handleExpandDevice(device?.id)}
                      >
                        {expandedDevice === device?.id ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                      </IconButton>
                    </TableCell>
                    <TableCell sx={{ fontSize: "16px" }}>{device?.name || "-"}</TableCell>
                    <TableCell sx={{ fontSize: "16px" }}>{device?.code || "-"}</TableCell>
                    <TableCell sx={{ fontSize: "16px" }}>{device?.location || "-"}</TableCell>
                    <TableCell>
                      <Chip
                        label={device?.active ? "Active" : "Inactive"} 
                        color={device?.active ? "success" : "default"} 
                        sx={{ fontSize: "14px", height: "28px" }}
                      />
                    </TableCell>
                    <TableCell align="center" sx={{ fontSize: "16px" }}>
                      {(device?.lines && Array.isArray(device.lines)) ? device.lines.length : 0}
                    </TableCell>
                    <TableCell align="center">
                      <Box>
                        <Tooltip title="Edit">
                          <IconButton size="medium" onClick={() => openDeviceDialog(device)}>
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton 
                            size="medium" 
                            color="error"
                            onClick={() => handleDeleteDevice(device?.id)}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                  
                  {/* Expanded lines section */}
                  <TableRow>
                    <TableCell colSpan={7} style={{ padding: 0, borderBottom: 0 }}>
                      <Collapse in={expandedDevice === device?.id} timeout="auto" unmountOnExit>
                        <Box sx={{ margin: 2 }}>
                          <Typography variant="h5" gutterBottom>
                            Lộ điện
                          </Typography>
                          {(!device?.lines || !Array.isArray(device.lines) || device.lines.length === 0) ? (
                            <Typography variant="body1" color={colors.grey[300]} sx={{ mb: 2, fontSize: "16px" }}>
                              Thiết bị này chưa có lộ điện nào.
                            </Typography>
                          ) : (
                            <Table size="medium">
                              <TableHead>
                                <TableRow>
                                  <TableCell sx={{ color: colors.grey[100], fontWeight: 'bold', fontSize: "16px" }}>Mã Lộ</TableCell>
                                  <TableCell sx={{ color: colors.grey[100], fontWeight: 'bold', fontSize: "16px" }}>Trạng thái</TableCell>
                                  <TableCell sx={{ color: colors.grey[100], fontWeight: 'bold', fontSize: "16px" }}>Tên</TableCell>
                                  <TableCell sx={{ color: colors.grey[100], fontWeight: 'bold', fontSize: "16px" }}>Phòng</TableCell>
                                  <TableCell sx={{ color: colors.grey[100], fontWeight: 'bold', fontSize: "16px" }}>Tầng</TableCell>
                                  <TableCell sx={{ color: colors.grey[100], fontWeight: 'bold', fontSize: "16px" }} align="center">Hành động</TableCell>
                                </TableRow>
                              </TableHead>
                              <TableBody>
                                {device.lines.map((line) => (
                                  <TableRow key={line?.id || Math.random()}>
                                    <TableCell sx={{ fontSize: "16px" }}>{line?.code || "-"}</TableCell>
                                    <TableCell>
                                      <Chip 
                                        label={line?.active ? "Active" : "Inactive"} 
                                        color={line?.active ? "success" : "default"} 
                                        icon={line?.active ? <LinkIcon /> : <LinkOffIcon />}
                                        sx={{ fontSize: "14px", height: "28px" }}
                                      />
                                    </TableCell>
                                    <TableCell sx={{ fontSize: "16px" }}>
                                      {line?.name || "Chưa đặt tên"}
                                    </TableCell>
                                    <TableCell sx={{ fontSize: "16px" }}>
                                      {line?.room?.name || "-"}
                                    </TableCell>
                                    <TableCell sx={{ fontSize: "16px" }}>
                                      {line?.room?.floor?.name || "-"}
                                    </TableCell>
                                    <TableCell align="center">
                                      <Box>
                                        <Tooltip title="Edit Line">
                                          <IconButton 
                                            size="medium" 
                                            onClick={() => openLineDialog(device, line)}
                                          >
                                            <EditIcon />
                                          </IconButton>
                                        </Tooltip>
                                        
                                        {line?.room && (
                                          <Tooltip title="Disconnect">
                                            <IconButton 
                                              size="medium"
                                              onClick={() => handleDisconnectLine(device?.id, line?.id)}
                                            >
                                              <LinkOffIcon />
                                            </IconButton>
                                          </Tooltip>
                                        )}
                                      </Box>
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          )}
                        </Box>
                      </Collapse>
                    </TableCell>
                  </TableRow>
                </React.Fragment>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ fontSize: "16px" }}>
                  Không tìm thấy thiết bị đo nào.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={totalCount}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          sx={{ 
            ".MuiTablePagination-selectLabel, .MuiTablePagination-displayedRows": { 
              fontSize: "16px" 
            }
          }}
        />
      </TableContainer>
      
      {/* Device Dialog */}
      <Modal
        open={deviceDialogOpen}
        onClose={() => setDeviceDialogOpen(false)}
        aria-labelledby="device-modal-title"
      >
        <Box sx={modalStyle}>
          {/* Title */}
          <Typography id="device-modal-title" variant="h4" sx={{ mb: 3, fontSize: "22px" }}>
            {editingDevice ? "Chỉnh sửa thiết bị đo" : "Thêm thiết bị đo"}
          </Typography>
          
          {/* Content */}
          <Box component="form" sx={{ mt: 1 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              label="Tên thiết bị"
              name="name"
              value={newDevice.name}
              sx={{
                "& .MuiOutlinedInput-root": {
                  fontSize: "16px",
                },
                "& .MuiInputLabel-root.Mui-focused": { color: colors.primary[100] },
              }}
              onChange={handleDeviceInputChange}
            />
            
            <TextField
              margin="normal"
              required
              fullWidth
              label="Mã thiết bị"
              disabled={editingDevice}
              name="code"
              value={newDevice.code}
              sx={{
                "& .MuiOutlinedInput-root": {
                  fontSize: "16px",
                },
                "& .MuiInputLabel-root.Mui-focused": { color: colors.primary[100] },
              }}              
              onChange={handleDeviceInputChange}
            />
            
            <TextField
              margin="normal"
              fullWidth
              label="Vị trí"
              name="location"
              value={newDevice.location}
              sx={{
                "& .MuiOutlinedInput-root": {
                  fontSize: "16px",
                },
                "& .MuiInputLabel-root.Mui-focused": { color: colors.primary[100] },
              }}
              onChange={handleDeviceInputChange}
            />
          </Box>
          
          {/* Actions */}
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3, gap: 1 }}>
            <Button 
              onClick={() => setDeviceDialogOpen(false)} 
              sx={{ fontSize: "16px", color: colors.primary[100] }}
            >
              Hủy
            </Button>
            <Button 
              onClick={handleSaveDevice}
              color="secondary"
              variant="contained"
              disabled={loading || !newDevice.name || !newDevice.code}
              sx={{ fontSize: "16px" }}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : "Lưu"}
            </Button>
          </Box>
        </Box>
      </Modal>
      
      {/* Line Dialog */}
      <Modal
        open={lineDialogOpen}
        onClose={() => setLineDialogOpen(false)}
        aria-labelledby="line-modal-title"
      >
        <Box sx={modalStyle}>
          {/* Title */}
          <Typography id="line-modal-title" variant="h4" sx={{ mb: 3, fontSize: "22px" }}>
            Edit Line - {selectedDevice?.name}
          </Typography>
          
          {/* Content */}
          <Box component="form" sx={{ mt: 1 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              label="Mã lộ điện"
              name="code"
              value={newLine.code}
              disabled={true}
              sx={{
                "& .MuiOutlinedInput-root": {
                  fontSize: "16px",
                },
                "& .MuiInputLabel-root.Mui-focused": { color: colors.primary[100] },
              }}
            />
            
            <TextField
              margin="normal"
              fullWidth
              label="Tên thiết bị"
              name="name"
              value={newLine.name}
              onChange={handleLineInputChange}
              sx={{
                "& .MuiOutlinedInput-root": {
                  fontSize: "16px",
                },
                "& .MuiInputLabel-root.Mui-focused": { color: colors.primary[100] },
              }}
              placeholder="Nhập tên lộ điện"
            />
            
            {/* Floor dropdown */}
            <FormControl fullWidth margin="normal">
              <InputLabel id="floor-select-label" sx={{ fontSize: "16px", "&.Mui-focused": {color: colors.primary[100]}}}>Tầng</InputLabel>
              <Select
                labelId="floor-select-label"
                id="floor-select"
                name="floor"
                value={newLine.floor}
                label="Tầng"
                onChange={handleLineInputChange}
              >
                <MenuItem value="">
                  <em>None</em>
                </MenuItem>
                {availableFloors.map((floor) => (
                  <MenuItem key={floor} value={floor}>{floor}</MenuItem>
                ))}
              </Select>
              <FormHelperText>Chọn tầng hoặc để trống</FormHelperText>
            </FormControl>
            
            {/* Room dropdown (filtered by selected floor) */}
            <FormControl fullWidth margin="normal" disabled={!newLine.floor}>
              <InputLabel id="room-select-label" sx={{ fontSize: "16px", "&.Mui-focused": {color: colors.primary[100]}}}>Phòng</InputLabel>
              <Select
                labelId="room-select-label"
                id="room-select"
                name="room"
                value={newLine.room}
                label="Phòng"
                onChange={handleLineInputChange}
              >
                <MenuItem value="">
                  <em>None</em>
                </MenuItem>
                {getRoomsForFloor(newLine.floor).map((room) => (
                  <MenuItem key={room.id} value={room.name}>{room.name}</MenuItem>
                ))}
              </Select>
              <FormHelperText>
                {newLine.floor 
                  ? "Chọn phòng hoặc để trống" 
                  : "Chọn tầng trước"}
              </FormHelperText>
            </FormControl>
          </Box>
          
          {/* Actions */}
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3, gap: 1 }}>
            <Button onClick={() => setLineDialogOpen(false)} sx={{ fontSize: "16px", color: colors.primary[100] }}>Hủy</Button>
            <Button 
              onClick={handleSaveLine}
              color="secondary"
              variant="contained"
              disabled={loading}
              sx={{ fontSize: "16px" }}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : "Cập nhật"}
            </Button>
          </Box>
        </Box>
      </Modal>

      {/* Confirm Disconnect Dialog */}
      <Modal
        open={confirmDialogOpen}
        onClose={() => setConfirmDialogOpen(false)}
      >
        <Box sx={modalStyle}>
          <Typography id="disconnect-confirm-title" variant="h5" sx={{ mb: 2, fontSize: "22px" }}>
            Xác nhận ngắt kết nối
          </Typography>
          <Typography variant="body1" sx={{ mb: 3, fontSize: "16px" }}>
            Bạn có chắc chắn muốn ngắt kết nối lộ điện này khỏi thiết bị?
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
            <Button onClick={() => setConfirmDialogOpen(false)} sx={{ fontSize: "16px", color: colors.primary[100] }}>
              Hủy
            </Button>
            <Button
              onClick={confirmDisconnect}
              color="error"
              variant="contained"
              disabled={loading}
              sx={{ fontSize: "16px" }}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : "Ngắt kết nối"}
            </Button>
          </Box>
        </Box>
      </Modal>

      {/* Delete Confirmation Dialog */}
      <Modal
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <Box sx={modalStyle}>
          <Typography id="delete-confirm-title" variant="h5" sx={{ mb: 2, fontSize: "22px" }}>
            Xác nhận xóa
          </Typography>
          <Typography variant="body1" sx={{ mb: 3, fontSize: "16px" }}>
            Bạn có chắc chắn muốn xóa thiết bị đo này không? Hành động này sẽ xóa tất cả dữ liệu lộ điện liên quan.
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
            <Button 
              onClick={() => setDeleteDialogOpen(false)} 
              sx={{ fontSize: "16px", color: colors.primary[100] }}
            >
              Hủy
            </Button>
            <Button
              onClick={confirmDeleteDevice}
              color="error"
              variant="contained"
              disabled={loading}
              sx={{ fontSize: "16px" }}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : "Xóa"}
            </Button>
          </Box>
        </Box>
      </Modal>

      {/* Toast Container for notifications */}
      <ToastContainer />
    </Box>
  );
};

export default MeasurementDevices;