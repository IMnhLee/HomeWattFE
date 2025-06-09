import { useState, useEffect } from "react";
import {
  Box,
  Button,
  IconButton,
  useTheme,
  Modal,
  TextField,
  Tooltip,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  FormHelperText,
  Typography,
  Paper,
  CircularProgress
} from "@mui/material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { tokens } from "../../theme";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import Header from "../../components/Header";
import monitoringApi from "../../services/monitoring";
import floorApi from "../../services/floor";
import lineApi from "../../services/line"; // Thêm import này

const EnergyDeviceList = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  // Define modal style
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

  // Available floors and rooms (would come from API)
  const [availableFloors, setAvailableFloors] = useState([]);
  const [availableRooms, setAvailableRooms] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [devices, setDevices] = useState([]);
  
  // Pagination state
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);

  // Fetch devices and floors+rooms data
  useEffect(() => {
    fetchMonitoringData();
    fetchFloorsAndRooms();
  }, [page, pageSize]);

  // Function to fetch monitoring data from API
const fetchMonitoringData = async () => {
  setIsLoading(true);
  try {
    // API uses 1-based indexing for pages
    const apiPage = page + 1;
    const response = await monitoringApi.getAllMonitoring(apiPage, pageSize);
    
    if (response.data && Array.isArray(response.data.data)) {
      // Update pagination metadata
      setTotalCount(response.data.meta.totalCount);
      
      // Transform API data to match component's expected format
      const formattedDevices = [];
      
      response.data.data.forEach(monitor => {
        // Handle monitoring devices with no lines
        if (!monitor.lines || monitor.lines.length === 0) {
          formattedDevices.push({
            id: monitor.id,
            name: "No Line", // Changed from monitor.name
            monitorName: monitor.name || "Unnamed Device", // Keep monitor name separately
            monitoringCode: monitor.code || "",
            lineId: "",
            lineName: "",
            floor: "",
            room: ""
          });
        } else {
          // For devices with lines, create a row for each line
          monitor.lines.forEach(line => {
            formattedDevices.push({
              id: `${monitor.id}-${line.id}`, // Create a unique ID
              monitorId: monitor.id,
              lineId: line.id,
              name: line.name || "Unnamed Line", // Using line.name for the name field
              monitorName: monitor.name || "Unnamed Device", // Keep monitor name separately
              monitoringCode: monitor.code || "",
              lineName: line.name || "",
              lineCode: line.code || "",
              floor: line.room?.floor?.name || "",
              room: line.room?.name || ""
            });
          });
        }
      });
      
      setDevices(formattedDevices);
    }
  } catch (error) {
    console.error("Error fetching monitoring data:", error);
  } finally {
    setIsLoading(false);
  }
};

  // Fetch floors and rooms from API
  const fetchFloorsAndRooms = async () => {
    try {
      const response = await floorApi.getAllFloor();
      
      if (response.data) {
        // Extract floors
        const floors = response.data.map(floor => ({
          id: floor.id,
          name: floor.name
        }));
        setAvailableFloors(floors);
        
        // Extract rooms with their corresponding floor
        const rooms = [];
        response.data.forEach(floor => {
          if (floor.rooms && floor.rooms.length > 0) {
            floor.rooms.forEach(room => {
              rooms.push({
                id: room.id,
                name: room.name,
                floorId: floor.id,
                floorName: floor.name
              });
            });
          }
        });
        setAvailableRooms(rooms);
      }
    } catch (error) {
      console.error("Error fetching floors and rooms:", error);
    }
  };

  // Get rooms for selected floor
  const getRoomsForFloor = (floorId) => {
    if (!floorId) return [];
    return availableRooms.filter(room => room.floorId === floorId);
  };

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingDevice, setEditingDevice] = useState(null);
  const [newDevice, setNewDevice] = useState({
    name: "",
    floorId: "",
    roomId: "",
  });
  
  // Confirmation modal state
  const [confirmDelete, setConfirmDelete] = useState({
    open: false,
    device: null
  });

  // Open modal for adding/editing
  const openDeviceModal = (device = null) => {
    if (device) {
      // Find the floor ID based on the floor name
      const floorId = availableFloors.find(f => f.name === device.floor)?.id || "";
      // Find the room ID based on the room name and floor
      const roomId = availableRooms.find(r => r.name === device.room && r.floorName === device.floor)?.id || "";
      
      setEditingDevice(device);
      setNewDevice({
        name: device.name,
        floorId: floorId,
        roomId: roomId,
        lineCode: device.lineCode || "",
      });
    } else {
      setEditingDevice(null);
      setNewDevice({
        name: "",
        floorId: "",
        roomId: "",
        lineCode: "",
      });
    }
    setModalOpen(true);
  };

  // Handle form change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewDevice({
      ...newDevice,
      [name]: value
    });
    
    // Reset room when floor changes
    if (name === 'floorId') {
      setNewDevice(prev => ({
        ...prev,
        roomId: ''
      }));
    }
  };
  
  // Save device 
  const handleSaveDevice = async () => {
    try {
      if (editingDevice && editingDevice.lineId) {
        // Editing existing line
        const requestBody = {
          lineId: editingDevice.lineId,
          monitoringId: editingDevice.monitorId,
          name: newDevice.name,
          roomId: newDevice.roomId || null
        };
        
        const response = await lineApi.editLine(requestBody);
        
        if (response.message === "Update line success") {
          console.log("Line updated successfully:", response.data);
        }
      } else {
        // Adding new device - would need implementation based on your add API
        console.log("Adding new device functionality needs to be implemented");
      }
      
      // Close the modal and refresh data
      setModalOpen(false);
      fetchMonitoringData();
    } catch (error) {
      console.error("Error saving device:", error);
    }
  };
  
  // Open delete confirmation
  const openDeleteConfirmation = (device) => {
    setConfirmDelete({
      open: true,
      device: device
    });
  };

  // Close delete confirmation
  const closeDeleteConfirmation = () => {
    setConfirmDelete({
      open: false,
      device: null
    });
  };
  
  // Delete device
  const confirmDeleteDevice = async () => {
    try {
      if (confirmDelete.device) {
        if (confirmDelete.device.lineId) {
          // Disconnect line if it's a line device
          const requestBody = {
            monitoringId: confirmDelete.device.monitorId,
            lineId: confirmDelete.device.lineId
          };
          
          const response = await lineApi.disconnectLine(requestBody);
          
          if (response.message === "Disconnect line success") {
            console.log("Line disconnected successfully:", response.data);
          }
        } else {
          // Delete monitoring device if it has no line
          await monitoringApi.removeMonitoring(confirmDelete.device.monitorId);
        }
        
        // Refresh data after deletion
        fetchMonitoringData();
      }
      closeDeleteConfirmation();
    } catch (error) {
      console.error("Error deleting device:", error);
      closeDeleteConfirmation();
    }
  };

  // DataGrid columns definition 
  const columns = [
    { 
      field: 'orderNumber', 
      headerName: 'STT', 
      width: 70,
      sortable: false,
      filterable: false,
      renderCell: (params) => {
        return (page * pageSize) + devices.indexOf(params.row) + 1;
      }
    },
    { 
      field: 'name', 
      headerName: 'Tên Thiết Bị', 
      flex: 1, 
      minWidth: 150,
      filterable: true 
    },
    { 
      field: 'monitoringCode', 
      headerName: 'Mã Thiết Bị Đo', 
      flex: 1,
      minWidth: 150,
      filterable: true,
      renderCell: (params) => params.value || "—"
    },
    {
      field: 'lineCode',
      headerName: 'Mã Lộ',
      flex: 1,
      minWidth: 150,
      filterable: true,
      renderCell: (params) => params.value || "—"
    },
    { 
      field: 'floor', 
      headerName: 'Tầng', 
      flex: 1,
      minWidth: 120,
      filterable: true,
      renderCell: (params) => params.value || "—"
    },
    { 
      field: 'room', 
      headerName: 'Phòng', 
      flex: 1,
      minWidth: 150,
      filterable: true,
      renderCell: (params) => params.value || "—"
    },
    {
      field: 'actions',
      headerName: 'Hành động',
      sortable: false,
      filterable: false,
      width: 120,
      renderCell: (params) => {
        // Only show edit/delete for lines, not for monitoring devices without lines
        const isLine = params.row.lineId && params.row.lineId !== "";
        
        return (
          <Box>
            {isLine && (
              <>
                <Tooltip title="Edit Line">
                  <IconButton size="small" onClick={() => openDeviceModal(params.row)}>
                    <EditIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Disconnect Line">
                  <IconButton 
                    size="small" 
                    onClick={() => openDeleteConfirmation(params.row)}
                    color="error"
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </>
            )}
            {!isLine && (
              <Tooltip title="Delete Monitoring Device">
                <IconButton 
                  size="small" 
                  onClick={() => openDeleteConfirmation(params.row)}
                  color="error"
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
          </Box>
        );
      }
    }
  ];

  return (
    <Box m="20px">
      <Header title="Thiết bị tiêu thụ" subtitle="Quản lý thiết bị tiêu thụ điện năng" />

      {/* DataGrid with built-in filtering */}
      <Box
        display="grid"
        gridTemplateColumns="repeat(12, 1fr)"
        gap="10px"
      >
        <Box
          gridColumn="span 12"
          height="75vh"
          sx={{
            "& .MuiDataGrid-root": {
              border: "none",
            },
            "& .MuiDataGrid-cell": {
              borderBottom: "none",
              fontSize: "16px"
            },
            "& .MuiDataGrid-columnHeaders": {
              backgroundColor: colors.blueAccent[700],
              borderBottom: "none",
              fontSize: "18px",
              fontWeight: "bold"
            },
            "& .MuiDataGrid-virtualScroller": {
              backgroundColor: colors.primary[400],
            },
            "& .MuiDataGrid-footerContainer": {
              borderTop: "none",
              backgroundColor: colors.blueAccent[700],
            },
            "& .MuiCheckbox-root": {
              color: `${colors.greenAccent[200]} !important`,
            },
            "& .MuiDataGrid-toolbarContainer .MuiButton-text": {
              color: `${colors.grey[100]} !important`,
            },
          }}
        >
          <DataGrid
            rows={devices}
            columns={columns}
            page={page}
            pageSize={pageSize}
            rowCount={totalCount}
            rowsPerPageOptions={[5, 10, 20]}
            paginationMode="server"
            onPageChange={(newPage) => setPage(newPage)}
            onPageSizeChange={(newPageSize) => setPageSize(newPageSize)}
            loading={isLoading}
            disableSelectionOnClick
            components={{ Toolbar: GridToolbar }}
            componentsProps={{
              toolbar: {
                showQuickFilter: true,
                quickFilterProps: { debounceMs: 500 },
              },
            }}
          />
        </Box>
      </Box>

      {/* Add/Edit Device Modal */}
      <Modal 
        open={modalOpen} 
        onClose={() => setModalOpen(false)}
        aria-labelledby="device-modal-title"
      >
        <Box sx={modalStyle}>
          {/* Title */}
          <Typography id="device-modal-title" variant="h4" sx={{ mb: 3, fontSize: "22px" }}>
            {editingDevice ? "Chỉnh sửa thiết bị" : "Thêm thiết bị mới"}
          </Typography>
          
          {/* Content */}
          <Box component="form" sx={{ mt: 1 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              label="Mã lộ điện"
              name="lineCode"
              value={newDevice.lineCode || ""}
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
              onChange={handleInputChange}
            />
            
            {/* Floor dropdown */}
            <FormControl fullWidth margin="normal">
              <InputLabel id="floor-select-label" sx={{ fontSize: "16px", "&.Mui-focused": {color: colors.primary[100]}}}>Tầng</InputLabel>
              <Select
                labelId="floor-select-label"
                id="floor-select"
                name="floorId"
                value={newDevice.floorId}
                label="Tầng"
                onChange={handleInputChange}
              >
                <MenuItem value="">
                  <em>None</em>
                </MenuItem>
                {availableFloors.map((floor) => (
                  <MenuItem key={floor.id} value={floor.id}>{floor.name}</MenuItem>
                ))}
              </Select>
              <FormHelperText>Chọn tầng hoặc để trống</FormHelperText>
            </FormControl>
            
            {/* Room dropdown (filtered by selected floor) */}
            <FormControl fullWidth margin="normal" disabled={!newDevice.floorId}>
              <InputLabel id="room-select-label" sx={{ fontSize: "16px", "&.Mui-focused": {color: colors.primary[100]}}}>Phòng</InputLabel>
              <Select
                labelId="room-select-label"
                id="room-select"
                name="roomId"
                value={newDevice.roomId}
                label="Phòng"
                onChange={handleInputChange}
              >
                <MenuItem value="">
                  <em>None</em>
                </MenuItem>
                {getRoomsForFloor(newDevice.floorId).map((room) => (
                  <MenuItem key={room.id} value={room.id}>{room.name}</MenuItem>
                ))}
              </Select>
              <FormHelperText>
                {newDevice.floorId 
                  ? "Chọn phòng hoặc để trống" 
                  : "Chọn tầng trước"}
              </FormHelperText>
            </FormControl>
          </Box>
          
          {/* Actions */}
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3, gap: 1 }}>
            <Button 
              sx={{color: colors.grey[100], fontSize: "16px"}} 
              onClick={() => setModalOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSaveDevice}
              disabled={!newDevice.name}
              color="secondary"
              variant="contained"
              sx={{ fontSize: "16px" }}
            >
              Save
            </Button>
          </Box>
        </Box>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        open={confirmDelete.open}
        onClose={closeDeleteConfirmation}
        aria-labelledby="delete-modal-title"
      >
        <Box sx={modalStyle}>
          {/* Title */}
          <Typography id="delete-modal-title" variant="h4" sx={{ mb: 3, fontSize: "22px" }}>
            Confirm {confirmDelete.device?.lineId ? "Disconnect" : "Deletion"}
          </Typography>
          
          {/* Content */}
          <Typography sx={{ mb: 3, fontSize: "16px" }}>
            {confirmDelete.device?.lineId 
              ? `Bạn có chắc ngắt kết nối line "${confirmDelete.device?.name}"?`
              : `Bạn có chắc xóa thiết bị "${confirmDelete.device?.name}"? Điều này sẽ xóa thiết bị giám sát và tất cả các dòng liên quan.`
            }
          </Typography>
          
          {/* Actions */}
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
            <Button 
              onClick={closeDeleteConfirmation} 
              sx={{color: colors.grey[100], fontSize: "16px"}}
            >
              Hủy
            </Button>
            <Button 
              onClick={confirmDeleteDevice} 
              color="error"
              variant="contained"
              sx={{ fontSize: "16px" }}
            >
              {confirmDelete.device?.lineId ? "Ngắt kết nối" : "Xóa"}
            </Button>
          </Box>
        </Box>
      </Modal>
    </Box>
  );
};

export default EnergyDeviceList;