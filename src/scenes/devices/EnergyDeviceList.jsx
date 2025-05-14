import { useState, useEffect } from "react";
import {
  Box,
  Button,
  IconButton,
  useTheme,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Tooltip,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  FormHelperText
} from "@mui/material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { tokens } from "../../theme";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import Header from "../../components/Header";

const EnergyDeviceList = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  // Available floors and rooms (would come from API)
  const [availableFloors, setAvailableFloors] = useState([]);
  const [availableRooms, setAvailableRooms] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch floors and rooms from API on component mount
  useEffect(() => {
    fetchFloorsAndRooms();
  }, []);

  // Simulated API call to fetch floors and rooms
  const fetchFloorsAndRooms = async () => {
    setIsLoading(true);
    try {
      // In a real app, these would be API calls
      // const floorsResponse = await api.getFloors();
      // const roomsResponse = await api.getRooms();
      
      // Mock data - replace with actual API responses
      const mockFloors = ["Tầng 1", "Tầng 2", "Tầng 3"];
      const mockRooms = [
        { id: 1, name: "Living Room", floor: "Tầng 1" },
        { id: 2, name: "Kitchen", floor: "Tầng 1" },
        { id: 3, name: "Master Bedroom", floor: "Tầng 2" },
        { id: 4, name: "Study Room", floor: "Tầng 2" },
        { id: 5, name: "Bathroom", floor: "Tầng 1" },
        { id: 6, name: "Guest Room", floor: "Tầng 3" }
      ];
      
      setAvailableFloors(mockFloors);
      setAvailableRooms(mockRooms);
    } catch (error) {
      console.error("Error fetching floors and rooms:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Get rooms for selected floor
  const getRoomsForFloor = (floorName) => {
    if (!floorName) return [];
    return availableRooms.filter(room => room.floor === floorName);
  };

  // Updated sample devices with floor, room, and monitoringCode
  const [devices, setDevices] = useState([
    { id: 1, name: "TV", floor: "Tầng 1", room: "Living Room", monitoringCode: "MT001", lineId: "1", lineName: "Line 1" },
    { id: 2, name: "Air Conditioner", floor: "Tầng 2", room: "Master Bedroom", monitoringCode: "MT002", lineId: "2", lineName: "Line 2" },
    { id: 3, name: "Refrigerator", floor: "Tầng 1", room: "Kitchen", monitoringCode: "MT003", lineId: "3", lineName: "Line 3" },
    { id: 4, name: "Microwave", floor: "Tầng 1", room: "Kitchen", monitoringCode: "" },
    { id: 5, name: "Lamp", floor: "Tầng 1", room: null, monitoringCode: "MT001", lineId: "2", lineName: "Line 2" },
    { id: 6, name: "Fan", floor: "Tầng 2", room: "Study Room", monitoringCode: "MT004", lineId: "2", lineName: "Line 2" },
    { id: 7, name: "Smart Light", floor: "Tầng 1", room: "Living Room", monitoringCode: "MT001", lineId: "3", lineName: "Line 3" },
    { id: 8, name: "Heater", floor: null, room: null, monitoringCode: "MT005", lineId: "1", lineName: "Line 1" },
  ]);
  
  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingDevice, setEditingDevice] = useState(null);
  const [newDevice, setNewDevice] = useState({
    name: "",
    floor: "",
    room: "",
    monitoringCode: ""
  });
  
  // Open dialog for adding/editing
  const openDeviceDialog = (device = null) => {
    if (device) {
      setEditingDevice(device);
      setNewDevice({
        name: device.name,
        floor: device.floor || "",
        room: device.room || "",
        monitoringCode: device.monitoringCode || ""
      });
    } else {
      setEditingDevice(null);
      setNewDevice({
        name: "",
        floor: "",
        room: "",
        monitoringCode: ""
      });
    }
    setDialogOpen(true);
  };
  
  // Handle form change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewDevice({
      ...newDevice,
      [name]: value
    });
    
    // Reset room when floor changes
    if (name === 'floor') {
      setNewDevice(prev => ({
        ...prev,
        room: ''
      }));
    }
  };
  
  // Save device
  const handleSaveDevice = () => {
    if (editingDevice) {
      // Update existing device
      setDevices(devices.map(device => 
        device.id === editingDevice.id 
          ? { ...device, ...newDevice }
          : device
      ));
    } else {
      // Add new device
      const newId = Math.max(0, ...devices.map(d => d.id)) + 1;
      setDevices([
        ...devices, 
        { 
          id: newId,
          ...newDevice
        }
      ]);
    }
    setDialogOpen(false);
  };
  
  // Delete device
  const handleDeleteDevice = (id) => {
    setDevices(devices.filter(device => device.id !== id));
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
        // Calculate the row index (+1 for human-readable numbering)
        return devices.indexOf(params.row) + 1;
      }
    },
    { 
      field: 'name', 
      headerName: 'Name', 
      flex: 1, 
      minWidth: 150,
      filterable: true 
    },
    { 
      field: 'monitoringCode', 
      headerName: 'Monitoring Code', 
      flex: 1,
      minWidth: 150,
      filterable: true,
      renderCell: (params) => params.value || "—"
    },
    {
      field: 'lineName',
      headerName: 'Line',
      flex: 1,
      minWidth: 150,
      filterable: true,
      renderCell: (params) => params.value || "—"
    },
    { 
      field: 'floor', 
      headerName: 'Floor', 
      flex: 1,
      minWidth: 120,
      filterable: true,
      renderCell: (params) => params.value || "—"
    },
    { 
      field: 'room', 
      headerName: 'Room', 
      flex: 1,
      minWidth: 150,
      filterable: true,
      renderCell: (params) => params.value || "—"
    },
    {
      field: 'actions',
      headerName: 'Actions',
      sortable: false,
      filterable: false,
      width: 120,
      renderCell: (params) => {
        return (
          <Box>
            <Tooltip title="Edit">
              <IconButton size="small" onClick={() => openDeviceDialog(params.row)}>
                <EditIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Delete">
              <IconButton 
                size="small" 
                onClick={() => handleDeleteDevice(params.row.id)}
                color="error"
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        );
      }
    }
  ];

  return (
    <Box m="20px">
      <Header title="Energy Consuming Devices" subtitle="Manage your energy consuming devices" />
      
      {/* <Box display="flex" justifyContent="flex-end" mb={3}>
        <Button
          variant="contained"
          color="secondary"
          startIcon={<AddIcon />}
          onClick={() => openDeviceDialog()}
        >
          Add Device
        </Button>
      </Box> */}

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
            pageSize={10}
            rowsPerPageOptions={[5, 10, 20]}
            disableSelectionOnClick
            components={{ Toolbar: GridToolbar }}
            componentsProps={{
              toolbar: {
                showQuickFilter: true,
                quickFilterProps: { debounceMs: 500 },
              },
            }}
            initialState={{
              filter: {
                filterModel: {
                  items: [],
                  quickFilterValues: [],
                },
              },
            }}
          />
        </Box>
      </Box>

      {/* Add/Edit Device Dialog */}
      <Dialog 
        open={dialogOpen} 
        onClose={() => setDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {editingDevice ? "Edit Device" : "Add New Device"}
        </DialogTitle>
        <DialogContent>
          <Box component="form" sx={{ mt: 1 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              label="Device Name"
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
              <InputLabel id="floor-select-label" sx={{ fontSize: "16px", "&.Mui-focused": {color: colors.primary[100]}}}>Floor</InputLabel>
              <Select
                labelId="floor-select-label"
                id="floor-select"
                name="floor"
                value={newDevice.floor}
                label="Floor"
                onChange={handleInputChange}
              >
                <MenuItem value="">
                  <em>None</em>
                </MenuItem>
                {availableFloors.map((floor) => (
                  <MenuItem key={floor} value={floor}>{floor}</MenuItem>
                ))}
              </Select>
              <FormHelperText>Select a floor or leave empty</FormHelperText>
            </FormControl>
            
            {/* Room dropdown (filtered by selected floor) */}
            <FormControl fullWidth margin="normal" disabled={!newDevice.floor}>
              <InputLabel id="room-select-label" sx={{ fontSize: "16px", "&.Mui-focused": {color: colors.primary[100]}}}>Room</InputLabel>
              <Select
                labelId="room-select-label"
                id="room-select"
                name="room"
                value={newDevice.room}
                label="Room"
                onChange={handleInputChange}
              >
                <MenuItem value="">
                  <em>None</em>
                </MenuItem>
                {getRoomsForFloor(newDevice.floor).map((room) => (
                  <MenuItem key={room.id} value={room.name}>{room.name}</MenuItem>
                ))}
              </Select>
              <FormHelperText>
                {newDevice.floor 
                  ? "Select a room or leave empty" 
                  : "Select a floor first"}
              </FormHelperText>
            </FormControl>
            
            {/* Removed Meter ID field */}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button sx={{color: colors.grey[100]}} onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleSaveDevice}
            disabled={!newDevice.name}
            sx={{
              color: colors.grey[100],
            }}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default EnergyDeviceList;