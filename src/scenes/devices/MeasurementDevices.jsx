import React, { useState, useMemo } from "react";
import {
  Box, 
  Button,
  IconButton,
  Typography,
  useTheme,
  TextField,
  Modal, // Replace Dialog with Modal
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
  List,
  Card,
  CardContent
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
import DeviceHubIcon from "@mui/icons-material/DeviceHub";

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

  // Enhanced energy-consuming devices with room and floor info
  const [energyDevices, setEnergyDevices] = useState([
    { id: 1, name: "TV", room: "Living Room", floor: "1st Floor" },
    { id: 2, name: "Air Conditioner", room: "Bedroom", floor: "1st Floor" },
    { id: 3, name: "Refrigerator", room: "Kitchen", floor: "1st Floor" },
    { id: 4, name: "Microwave", room: "Kitchen", floor: "1st Floor" },
    { id: 5, name: "Lamp", room: "Study", floor: "2nd Floor" },
    { id: 6, name: "Computer", room: "Study", floor: "2nd Floor" },
    { id: 7, name: "Washing Machine", room: "Laundry", floor: "Ground Floor" },
    { id: 8, name: "Dryer", room: "Laundry", floor: "Ground Floor" },
    { id: 9, name: "Water Heater", room: "Bathroom", floor: "1st Floor" }
  ]);
  
  // Sample measurement devices with lines
  const [measurementDevices, setMeasurementDevices] = useState([
    { 
      id: 1, 
      name: "Main Power Meter", 
      code: "MPM001", // Added code field
      location: "Garage",
      status: "active",
      lines: [
        { id: 1, name: "Line 1", connectedDeviceId: 1, status: "connected" },
        { id: 2, name: "Line 2", connectedDeviceId: 2, status: "connected" },
        { id: 3, name: "Line 3", connectedDeviceId: null, status: "disconnected" }
      ]
    },
    { 
      id: 2, 
      name: "Kitchen Power Monitor", 
      code: "KPM002", // Added code field
      location: "Kitchen",
      status: "active",
      lines: [
        { id: 4, name: "Line 1", connectedDeviceId: 3, status: "connected" },
        { id: 5, name: "Line 2", connectedDeviceId: 4, status: "connected" }
      ]
    },
    { 
      id: 3, 
      name: "Smart Power Monitor", 
      code: "SPM003", // Added code field
      location: "Living Room",
      status: "inactive",
      lines: [
        { id: 6, name: "Line 1", connectedDeviceId: 5, status: "connected" },
        { id: 7, name: "Line 2", connectedDeviceId: null, status: "disconnected" }
      ]
    }
  ]);

  const [newDevice, setNewDevice] = useState({
    name: "1",
    code: "",
    location: "",
    status: "active"
  });

  const [newLine, setNewLine] = useState({
    name: "",
    status: "disconnected"
  });
  
  // UI state
  const [expandedDevice, setExpandedDevice] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  
  // Dialog states
  const [deviceDialogOpen, setDeviceDialogOpen] = useState(false);
  const [lineDialogOpen, setLineDialogOpen] = useState(false);
  const [connectionDialogOpen, setConnectionDialogOpen] = useState(false);
  
  const [editingDevice, setEditingDevice] = useState(null);
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [selectedLine, setSelectedLine] = useState(null);
  
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
        location: device.location,
        status: device.status
      });
    } else {
      setEditingDevice(null);
      setNewDevice({
        name: "",
        code: "",
        location: "",
        status: "active"
      });
    }
    setDeviceDialogOpen(true);
  };
  
  // Handle device form input
  const handleDeviceInputChange = (e) => {
    const { name, value } = e.target;
    setNewDevice({
      ...newDevice,
      [name]: value
    });
  };
  
  // Save device
  const handleSaveDevice = () => {
    if (editingDevice) {
      // Update existing device
      setMeasurementDevices(measurementDevices.map(device => 
        device.id === editingDevice.id 
          ? { ...device, ...newDevice }
          : device
      ));
    } else {
      // Add new device
      const newId = Math.max(0, ...measurementDevices.map(d => d.id)) + 1;
      setMeasurementDevices([
        ...measurementDevices,
        {
          id: newId,
          ...newDevice,
          lines: []
        }
      ]);
    }
    setDeviceDialogOpen(false);
  };
  
  // Delete device
  const handleDeleteDevice = (deviceId) => {
    setMeasurementDevices(measurementDevices.filter(device => device.id !== deviceId));
  };
  
  // Open line dialog
  const openLineDialog = (device) => {
    setSelectedDevice(device);
    setNewLine({
      name: "",
      status: "disconnected"
    });
    setLineDialogOpen(true);
  };
  
  // Handle line form input
  const handleLineInputChange = (e) => {
    const { name, value } = e.target;
    setNewLine({
      ...newLine,
      [name]: value
    });
  };
  
  // Add new line to device
  const handleAddLine = () => {
    if (selectedDevice) {
      const newLineId = Math.max(0, ...measurementDevices.flatMap(d => d.lines.map(l => l.id))) + 1;
      
      setMeasurementDevices(measurementDevices.map(device => 
        device.id === selectedDevice.id
          ? { 
              ...device, 
              lines: [
                ...device.lines, 
                { 
                  id: newLineId, 
                  name: newLine.name, 
                  status: newLine.status,
                  connectedDeviceId: null
                }
              ] 
            }
          : device
      ));
    }
    setLineDialogOpen(false);
  };
  
  // Delete line
  const handleDeleteLine = (deviceId, lineId) => {
    setMeasurementDevices(measurementDevices.map(device => 
      device.id === deviceId
        ? { 
            ...device, 
            lines: device.lines.filter(line => line.id !== lineId)
          }
        : device
    ));
  };
  
  // Open connection dialog
  const openConnectionDialog = (device, line) => {
    setSelectedDevice(device);
    setSelectedLine(line);
    setFloorFilter("All"); // Reset filters when opening dialog
    setRoomFilter("All");
    setConnectionDialogOpen(true);
  };
  
  // Connect device to line
  const handleConnectDevice = (energyDeviceId) => {
    setMeasurementDevices(measurementDevices.map(device => 
      device.id === selectedDevice.id
        ? { 
            ...device, 
            lines: device.lines.map(line => 
              line.id === selectedLine.id
                ? { 
                    ...line, 
                    connectedDeviceId: energyDeviceId,
                    status: "connected"
                  }
                : line
            )
          }
        : device
    ));
    setConnectionDialogOpen(false);
  };
  
  // Disconnect device from line
  const handleDisconnectLine = (deviceId, lineId) => {
    setMeasurementDevices(measurementDevices.map(device => 
      device.id === deviceId
        ? { 
            ...device, 
            lines: device.lines.map(line => 
              line.id === lineId
                ? { 
                    ...line, 
                    connectedDeviceId: null,
                    status: "disconnected"
                  }
                : line
            )
          }
        : device
    ));
  };
  
  // Add filter states for the connection dialog
  const [floorFilter, setFloorFilter] = useState("All");
  const [roomFilter, setRoomFilter] = useState("All");

  // Extract unique floors and rooms for filter dropdowns
  const uniqueFloors = useMemo(() => 
    ["All", ...new Set(energyDevices.map(device => device.floor))],
    [energyDevices]
  );
  
  const uniqueRooms = useMemo(() => 
    ["All", ...new Set(energyDevices.map(device => device.room))],
    [energyDevices]
  );

  // Filter devices based on selected floor and room
  const filteredDevices = useMemo(() => 
    energyDevices.filter(device => 
      (floorFilter === "All" || device.floor === floorFilter) && 
      (roomFilter === "All" || device.room === roomFilter)
    ),
    [energyDevices, floorFilter, roomFilter]
  );

  // Handle floor filter change
  const handleFloorFilterChange = (event) => {
    setFloorFilter(event.target.value);
  };

  // Handle room filter change
  const handleRoomFilterChange = (event) => {
    setRoomFilter(event.target.value);
  };

  // Get device name by ID - include room and floor in display
  const getDeviceName = (deviceId) => {
    const device = energyDevices.find(d => d.id === deviceId);
    return device ? `${device.name} (${device.room}, ${device.floor})` : "Unknown";
  };

  // Filtered devices for pagination
  const displayedDevices = measurementDevices.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
    <Box m="20px">
      {/* Header component */}
      <Header title="Measurement Devices" subtitle="Managing power monitoring devices and connections" />
      
      <Box display="flex" justifyContent="flex-end" mb={3}>
        <Button
          variant="contained"
          color="secondary"
          startIcon={<AddIcon />}
          onClick={() => openDeviceDialog()}
          sx={{ fontSize: "14px", py: 1 }} // Increased button text size
        >
          Add Measurement Device
        </Button>
      </Box>
      
      {/* Devices Table */}
      <TableContainer component={Paper} sx={{ backgroundColor: colors.primary[400] }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ width: '60px' }} />
              <TableCell sx={{ color: colors.grey[100], fontWeight: 'bold', fontSize: "18px" }}>Name</TableCell>
              <TableCell sx={{ color: colors.grey[100], fontWeight: 'bold', fontSize: "18px" }}>Code</TableCell>
              <TableCell sx={{ color: colors.grey[100], fontWeight: 'bold', fontSize: "18px" }}>Location</TableCell>
              <TableCell sx={{ color: colors.grey[100], fontWeight: 'bold', fontSize: "18px" }}>Status</TableCell>
              <TableCell sx={{ color: colors.grey[100], fontWeight: 'bold', fontSize: "18px" }} align="center">Lines</TableCell>
              <TableCell sx={{ color: colors.grey[100], fontWeight: 'bold', fontSize: "18px" }} align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {displayedDevices.map((device) => (
              <React.Fragment key={device.id}>
                <TableRow hover>
                  <TableCell>
                    <IconButton
                      size="medium"
                      onClick={() => handleExpandDevice(device.id)}
                    >
                      {expandedDevice === device.id ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                    </IconButton>
                  </TableCell>
                  <TableCell sx={{ fontSize: "16px" }}>{device.name}</TableCell>
                  <TableCell sx={{ fontSize: "16px" }}>{device.code}</TableCell>
                  <TableCell sx={{ fontSize: "16px" }}>{device.location}</TableCell>
                  <TableCell>
                    <Chip
                      label={device.status} 
                      color={device.status === "active" ? "success" : "default"} 
                      sx={{ fontSize: "14px", height: "28px" }}
                    />
                  </TableCell>
                  <TableCell align="center" sx={{ fontSize: "16px" }}>{device.lines.length}</TableCell>
                  <TableCell align="center">
                    <Box>
                      <Tooltip title="Edit">
                        <IconButton size="medium" onClick={() => openDeviceDialog(device)}>
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Add Line">
                        <IconButton size="medium" color="primary" onClick={() => openLineDialog(device)}>
                          <DeviceHubIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton 
                          size="medium" 
                          color="error"
                          onClick={() => handleDeleteDevice(device.id)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
                
                {/* Expanded lines section */}
                <TableRow>
                  <TableCell colSpan={6} style={{ padding: 0, borderBottom: 0 }}>
                    <Collapse in={expandedDevice === device.id} timeout="auto" unmountOnExit>
                      <Box sx={{ margin: 2 }}>
                        <Typography variant="h5" gutterBottom>
                          Lines
                        </Typography>
                        {device.lines.length === 0 ? (
                          <Typography variant="body1" color={colors.grey[300]} sx={{ mb: 2, fontSize: "16px" }}>
                            No lines available. Add a line to connect devices.
                          </Typography>
                        ) : (
                          <Table size="medium">
                            <TableHead>
                              <TableRow>
                                <TableCell sx={{ color: colors.grey[100], fontWeight: 'bold', fontSize: "16px" }}>Line Name</TableCell>
                                <TableCell sx={{ color: colors.grey[100], fontWeight: 'bold', fontSize: "16px" }}>Status</TableCell>
                                <TableCell sx={{ color: colors.grey[100], fontWeight: 'bold', fontSize: "16px" }}>Connected Device</TableCell>
                                <TableCell sx={{ color: colors.grey[100], fontWeight: 'bold', fontSize: "16px" }} align="center">Actions</TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {device.lines.map((line) => (
                                <TableRow key={line.id}>
                                  <TableCell sx={{ fontSize: "16px" }}>{line.name}</TableCell>
                                  <TableCell>
                                    <Chip 
                                      label={line.status} 
                                      color={line.status === "connected" ? "success" : "default"} 
                                      icon={line.status === "connected" ? <LinkIcon />:<LinkOffIcon />}
                                      sx={{ fontSize: "14px", height: "28px" }} // Increased chip text size
                                    />
                                  </TableCell>
                                  <TableCell sx={{ fontSize: "16px" }}>
                                    {line.connectedDeviceId ? getDeviceName(line.connectedDeviceId) : "Not connected"}
                                  </TableCell>
                                  <TableCell align="center">
                                    <Box>
                                      {line.status === "disconnected" ? (
                                        <Tooltip title="Connect to Device">
                                          <IconButton 
                                            size="medium" 
                                            color="success"
                                            onClick={() => openConnectionDialog(device, line)}
                                          >
                                            <LinkIcon />
                                          </IconButton>
                                        </Tooltip>
                                      ) : (
                                        <Tooltip title="Disconnect">
                                          <IconButton 
                                            size="medium" 
                                            onClick={() => handleDisconnectLine(device.id, line.id)}
                                          >
                                            <LinkOffIcon />
                                          </IconButton>
                                        </Tooltip>
                                      )}
                                      <Tooltip title="Delete Line">
                                        <IconButton 
                                          size="medium" 
                                          color="error"
                                          onClick={() => handleDeleteLine(device.id, line.id)}
                                        >
                                          <DeleteIcon />
                                        </IconButton>
                                      </Tooltip>
                                    </Box>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        )}
                        <Button
                          variant="outlined"
                          size="medium" // Changed from small
                          startIcon={<AddIcon />}
                          onClick={() => openLineDialog(device)}
                          sx={{ mt: 2, fontSize: "14px" }}
                          color="secondary"
                        >
                          Add Line
                        </Button>
                      </Box>
                    </Collapse>
                  </TableCell>
                </TableRow>
              </React.Fragment>
            ))}
            {measurementDevices.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ fontSize: "16px" }}>
                  No measurement devices found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={measurementDevices.length}
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
      
      {/* Replace Device Dialog with Modal */}
      <Modal
        open={deviceDialogOpen}
        onClose={() => setDeviceDialogOpen(false)}
        aria-labelledby="device-modal-title"
      >
        <Box sx={modalStyle}>
          {/* Title */}
          <Typography id="device-modal-title" variant="h4" sx={{ mb: 3, fontSize: "22px" }}>
            {editingDevice ? "Edit Measurement Device" : "Add Measurement Device"}
          </Typography>
          
          {/* Content */}
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
              onChange={handleDeviceInputChange}
            />
            
            <TextField
              margin="normal"
              required
              fullWidth
              label="Device Code"
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
              required
              fullWidth
              label="Location"
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
            
            <FormControl fullWidth margin="normal">
              <InputLabel id="device-status-label" sx={{ fontSize: "16px", "&.Mui-focused": {color: colors.primary[100]}}}>Status</InputLabel>
              <Select
                labelId="device-status-label"
                name="status"
                value={newDevice.status}
                onChange={handleDeviceInputChange}
                label="Status"
                sx={{ fontSize: "16px" }}
              >
                <MenuItem value="active" sx={{ fontSize: "16px" }}>Active</MenuItem>
                <MenuItem value="inactive" sx={{ fontSize: "16px" }}>Inactive</MenuItem>
              </Select>
            </FormControl>
          </Box>
          
          {/* Actions */}
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3, gap: 1 }}>
            <Button onClick={() => setDeviceDialogOpen(false)} sx={{ fontSize: "16px", color: colors.primary[100] }}>Cancel</Button>
            <Button 
              onClick={handleSaveDevice}
              color="secondary"
              variant="contained"
              disabled={!newDevice.name || !newDevice.location || !newDevice.code}
              sx={{ fontSize: "16px" }}
            >
              Save
            </Button>
          </Box>
        </Box>
      </Modal>
      
      {/* Replace Line Dialog with Modal */}
      <Modal
        open={lineDialogOpen}
        onClose={() => setLineDialogOpen(false)}
        aria-labelledby="line-modal-title"
      >
        <Box sx={modalStyle}>
          {/* Title */}
          <Typography id="line-modal-title" variant="h4" sx={{ mb: 3, fontSize: "22px" }}>
            Add Line to {selectedDevice?.name}
          </Typography>
          
          {/* Content */}
          <Box component="form" sx={{ mt: 1 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              label="Line Name"
              name="name"
              value={newLine.name}
              onChange={handleLineInputChange}
              sx={{
                "& .MuiOutlinedInput-root": {
                  fontSize: "16px",
                },
                "& .MuiInputLabel-root.Mui-focused": { color: colors.primary[100] },
              }}
            />
          </Box>
          
          {/* Actions */}
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3, gap: 1 }}>
            <Button onClick={() => setLineDialogOpen(false)} sx={{ fontSize: "16px", color: colors.primary[100] }}>Cancel</Button>
            <Button 
              onClick={handleAddLine}
              color="secondary"
              variant="contained"
              disabled={!newLine.name}
              sx={{ fontSize: "16px" }}
            >
              Add Line
            </Button>
          </Box>
        </Box>
      </Modal>
      
      {/* Replace Connection Dialog with Modal */}
      <Modal
        open={connectionDialogOpen}
        onClose={() => setConnectionDialogOpen(false)}
        aria-labelledby="connection-modal-title"
      >
        <Box sx={{...modalStyle, width: 600, maxHeight: '80vh', overflow: 'auto'}}>
          {/* Title */}
          <Typography id="connection-modal-title" variant="h4" sx={{ mb: 3, fontSize: "22px" }}>
            Connect Device to {selectedDevice?.name} - {selectedLine?.name}
          </Typography>
          
          {/* Content */}
          <Box sx={{ mt: 1 }}>
            <Typography variant="body1" color={colors.grey[100]} gutterBottom sx={{ fontSize: "18px" }}>
              Filter devices:
            </Typography>
            
            {/* Filters */}
            <Box 
              display="grid"
              gridTemplateColumns="1fr 1fr"
              gap={2}
              sx={{ mb: 3 }}
            >
              <Box>
                <FormControl fullWidth>
                  <InputLabel id="floor-filter-label" sx={{ fontSize: "16px" }}>Floor</InputLabel>
                  <Select
                    labelId="floor-filter-label"
                    value={floorFilter}
                    onChange={handleFloorFilterChange}
                    label="Floor"
                    sx={{ fontSize: "16px" }}
                  >
                    {uniqueFloors.map(floor => (
                      <MenuItem key={floor} value={floor} sx={{ fontSize: "16px" }}>
                        {floor}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
              <Box>
                <FormControl fullWidth>
                  <InputLabel id="room-filter-label" sx={{ fontSize: "16px" }}>Room</InputLabel>
                  <Select
                    labelId="room-filter-label"
                    value={roomFilter}
                    onChange={handleRoomFilterChange}
                    label="Room"
                    sx={{ fontSize: "16px" }}
                  >
                    {uniqueRooms.map(room => (
                      <MenuItem key={room} value={room} sx={{ fontSize: "16px" }}>
                        {room}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
            </Box>

            <Typography variant="body1" color={colors.grey[100]} gutterBottom sx={{ fontSize: "18px" }}>
              Select a device to connect:
            </Typography>
            
            {filteredDevices.length > 0 ? (
              <List sx={{ maxHeight: '300px', overflow: 'auto' }}>
                {filteredDevices.map((device) => (
                  <Card 
                    key={device.id} 
                    variant="outlined"
                    sx={{ 
                      mb: 1,
                      cursor: 'pointer',
                      backgroundColor: colors.primary[900],
                      '&:hover': { backgroundColor: colors.primary[800] }
                    }}
                    onClick={() => handleConnectDevice(device.id)}
                  >
                    <CardContent sx={{ py: 1 }}>
                      <Typography variant="body1" sx={{ fontSize: "16px", fontWeight: "bold" }}>
                        {device.name}
                      </Typography>
                      <Typography variant="body2" sx={{ fontSize: "14px", color: colors.grey[300] }}>
                        {device.room} • {device.floor}
                      </Typography>
                    </CardContent>
                  </Card>
                ))}
              </List>
            ) : (
              <Typography variant="body1" color={colors.grey[300]} sx={{ fontSize: "16px" }}>
                No devices match the selected filters
              </Typography>
            )}
          </Box>
          
          {/* Actions */}
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3, gap: 1 }}>
            <Button 
              onClick={() => {
                setFloorFilter("All");
                setRoomFilter("All");
              }} 
              sx={{ fontSize: "16px" }}
              color="primary"
            >
              Clear Filters
            </Button>
            <Button 
              onClick={() => setConnectionDialogOpen(false)} 
              sx={{ fontSize: "16px", color: colors.primary[100]  }}
              variant="outlined"
            >
              Cancel
            </Button>
          </Box>
        </Box>
      </Modal>
    </Box>
  );
};

export default MeasurementDevices;
