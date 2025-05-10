import { useState } from "react";
import {
  Box, Button, IconButton, Typography, useTheme, TextField, Dialog,
  DialogActions, DialogContent, DialogTitle, Card, CardContent, Divider,
  List, ListItem, ListItemText, Menu, MenuItem, Chip
} from "@mui/material";
import { tokens } from "../../theme";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import MoreVertIcon from "@mui/icons-material/MoreVert";

const FloorRoomManagement = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  
  // Sample data - would come from API in real application
  const [floors, setFloors] = useState([
    { 
      id: 1, 
      name: "Ground Floor", 
      rooms: [
        { 
          id: 1, 
          name: "Living Room", 
          devices: [
            { id: 1, name: "TV", monitoringCode: "MT001dfbafchsjchvjdsbcjdscbdsjch", line: "Line 1" }, 
            { id: 2, name: "Air Conditioner", monitoringCode: "MT002", line: "Line 2" }
          ]
        },
        { 
          id: 2, 
          name: "Kitchen", 
          devices: [
            { id: 3, name: "Refrigerator", monitoringCode: "MT003", line: "Line 3" }, 
            { id: 4, name: "Microwave", monitoringCode: "", line: "" }
          ]
        },
      ]
    },
    { 
      id: 2, 
      name: "First Floor", 
      rooms: [
        { 
          id: 3, 
          name: "Bedroom", 
          devices: [
            { id: 5, name: "Lamp", monitoringCode: "MT001", line: "Line 2" }
          ]
        },
        { 
          id: 4, 
          name: "Bathroom", 
          devices: [
            { id: 6, name: "Heater", monitoringCode: "MT005", line: "Line 1" }
          ]
        },
      ]
    },
  ]);

  // Dialog states
  const [dialogState, setDialogState] = useState({
    type: null, // 'floor' or 'room'
    open: false,
    isEditing: false,
    itemData: null,
    parentData: null,
    name: ""
  });
  
  // Menu state
  const [menuState, setMenuState] = useState({
    anchorEl: null,
    type: null,
    item: null
  });

  // Dialog helpers
  const openDialog = (type, item = null, parent = null) => {
    setDialogState({
      type,
      open: true,
      isEditing: !!item,
      itemData: item,
      parentData: parent,
      name: item ? item.name : ""
    });
  };

  const closeDialog = () => {
    setDialogState(prev => ({ ...prev, open: false }));
  };

  const handleNameChange = (e) => {
    setDialogState(prev => ({ ...prev, name: e.target.value }));
  };

  // Menu helpers
  const openMenu = (event, item, type) => {
    setMenuState({
      anchorEl: event.currentTarget,
      type,
      item
    });
  };

  const closeMenu = () => {
    setMenuState({
      anchorEl: null,
      type: null,
      item: null
    });
  };
  
  // CRUD operations
  const handleSaveItem = () => {
    const { type, isEditing, itemData, parentData, name } = dialogState;
    
    if (type === 'floor') {
      if (isEditing) {
        // Edit existing floor
        setFloors(floors.map(floor => 
          floor.id === itemData.id ? { ...floor, name } : floor
        ));
      } else {
        // Add new floor
        const newId = Math.max(0, ...floors.map(f => f.id)) + 1;
        setFloors([...floors, { id: newId, name, rooms: [] }]);
      }
    } else if (type === 'room') {
      if (isEditing) {
        // Edit existing room
        setFloors(floors.map(floor => 
          floor.id === parentData.id 
            ? { 
                ...floor, 
                rooms: floor.rooms.map(room => 
                  room.id === itemData.id ? { ...room, name } : room
                ) 
              } 
            : floor
        ));
      } else {
        // Add new room
        const roomIds = floors.flatMap(f => f.rooms.map(r => r.id));
        const newId = Math.max(0, ...roomIds) + 1;
        
        setFloors(floors.map(floor => 
          floor.id === parentData.id 
            ? { 
                ...floor, 
                rooms: [...floor.rooms, { id: newId, name, devices: [] }]
              } 
            : floor
        ));
      }
    }
    
    closeDialog();
  };
  
  const handleDeleteItem = () => {
    const { type, item } = menuState;
    
    if (type === 'floor') {
      setFloors(floors.filter(floor => floor.id !== item.id));
    } else if (type === 'room') {
      setFloors(floors.map(floor => 
        floor.id === item.floor.id 
          ? { 
              ...floor, 
              rooms: floor.rooms.filter(room => room.id !== item.room.id)
            } 
          : floor
      ));
    }
    
    closeMenu();
  };
  
  const handleRemoveDevice = (floorId, roomId, deviceId) => {
    setFloors(floors.map(floor => 
      floor.id === floorId 
        ? { 
            ...floor, 
            rooms: floor.rooms.map(room => 
              room.id === roomId 
                ? { ...room, devices: room.devices.filter(device => device.id !== deviceId) }
                : room
            ) 
          } 
        : floor
    ));
  };

  // Common styles
  const textFieldStyle = {
    InputProps: { style: { fontSize: '1.2rem' } },
    InputLabelProps: { style: { fontSize: '1.2rem' } }
  };

  // Render methods
  const renderDeviceChips = (device) => (
    <Box mt={1}>
      {device.monitoringCode && (
        <Chip 
          label={`Code: ${device.monitoringCode}`} 
          size="medium"
          sx={{ 
            mr: 1, 
            mb: 0.5,
            backgroundColor: colors.blueAccent[700],
            fontSize: '0.9rem',
            py: 0.5
          }}
        />
      )}
      {device.line && (
        <Chip 
          label={`Line: ${device.line}`} 
          size="medium"
          sx={{ 
            mb: 0.5,
            backgroundColor: colors.greenAccent[700],
            fontSize: '0.9rem',
            py: 0.5
          }}
        />
      )}
    </Box>
  );

  const renderDevice = (device, floor, room) => (
    <ListItem 
      key={device.id} 
      sx={{
        display: 'block',
        paddingY: 1.5,
        borderBottom: `1px solid ${colors.grey[800]}`
      }}
    >
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <ListItemText 
          primary={device.name} 
          primaryTypographyProps={{ 
            fontWeight: 'medium',
            fontSize: '1.1rem' 
          }}
        />
        <IconButton 
          size="medium"
          color="error"
          onClick={() => handleRemoveDevice(floor.id, room.id, device.id)}
        >
          <DeleteIcon />
        </IconButton>
      </Box>
      {renderDeviceChips(device)}
    </ListItem>
  );

  const renderRoom = (room, floor) => (
    <Box key={room.id} gridColumn="span 1">
      <Card sx={{ backgroundColor: colors.primary[500], height: '100%', display: 'flex', flexDirection: 'column' }}>
        <CardContent sx={{ flexGrow: 1 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
            <Typography variant="h5" color={colors.grey[100]} fontWeight="bold">
              {room.name}
            </Typography>
            <IconButton onClick={(e) => openMenu(e, { floor, room }, "room")} size="medium">
              <MoreVertIcon />
            </IconButton>
          </Box>
          
          <Typography variant="h6" color={colors.grey[300]} mb={1}>
            Devices: {room.devices.length}
          </Typography>
          
          <List dense sx={{ mt: 1 }}>
            {room.devices.map(device => renderDevice(device, floor, room))}
          </List>
        </CardContent>
      </Card>
    </Box>
  );

  const renderFloor = (floor) => (
    <Box key={floor.id} gridColumn="span 1">
      <Card sx={{ backgroundColor: colors.primary[400], boxShadow: 3, mb: 2 }}>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h4" color={colors.grey[100]} fontWeight="bold">
              {floor.name}
            </Typography>
            <IconButton onClick={(e) => openMenu(e, floor, "floor")} size="medium">
              <MoreVertIcon />
            </IconButton>
          </Box>
          
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h5" color={colors.grey[300]}>
              Rooms ({floor.rooms.length})
            </Typography>
            <Button
              variant="outlined"
              color="secondary"
              startIcon={<AddIcon />}
              size="medium"
              onClick={() => openDialog('room', null, floor)}
              sx={{ fontSize: '1rem' }}
            >
              Add Room
            </Button>
          </Box>
          
          <Divider sx={{ mb: 2, borderColor: colors.grey[800] }} />
          
          {floor.rooms.length > 0 ? (
            <Box 
              display="grid" 
              gap={2}
              sx={{
                gridTemplateColumns: {
                  xs: "1fr",
                  md: "repeat(2, 1fr)",
                  lg: "repeat(3, 1fr)"
                }
              }}
            >
              {floor.rooms.map(room => renderRoom(room, floor))}
            </Box>
          ) : (
            <Typography color={colors.grey[400]} textAlign="center" fontSize="1.2rem">
              No rooms added yet
            </Typography>
          )}
        </CardContent>
      </Card>
    </Box>
  );

  return (
    <Box m="20px">
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h3" color={colors.grey[100]} fontWeight="bold">
          Floors & Rooms
        </Typography>
        <Button
          variant="contained"
          color="secondary"
          startIcon={<AddIcon />}
          onClick={() => openDialog('floor')}
          size="large"
          sx={{ fontSize: '1.1rem', py: 1 }}
        >
          Add Floor
        </Button>
      </Box>
      
      {/* Floor List */}
      <Box display="grid" gap={3} sx={{ gridTemplateColumns: "1fr" }}>
        {floors.map(renderFloor)}
      </Box>
      
      {/* Context Menu */}
      <Menu
        anchorEl={menuState.anchorEl}
        open={Boolean(menuState.anchorEl)}
        onClose={closeMenu}
        PaperProps={{ style: { fontSize: '1.1rem' } }}
      >
        <MenuItem 
          onClick={() => {
            closeMenu();
            if (menuState.type === 'floor') {
              openDialog('floor', menuState.item);
            } else if (menuState.type === 'room') {
              openDialog('room', menuState.item.room, menuState.item.floor);
            }
          }}
          sx={{ fontSize: '1.1rem', py: 1.5 }}
        >
          <EditIcon fontSize="medium" sx={{ mr: 1 }} /> Edit
        </MenuItem>
        <MenuItem 
          onClick={handleDeleteItem}
          sx={{ fontSize: '1.1rem', py: 1.5 }}
        >
          <DeleteIcon fontSize="medium" sx={{ mr: 1 }} /> Delete
        </MenuItem>
      </Menu>
      
      {/* Generic Dialog */}
      <Dialog 
        open={dialogState.open} 
        onClose={closeDialog}
        PaperProps={{ style: { padding: '10px' } }}
      >
        <DialogTitle sx={{ fontSize: '1.5rem' }}>
          {dialogState.isEditing ? `Edit ${dialogState.type === 'floor' ? 'Floor' : 'Room'}` : `Add New ${dialogState.type === 'floor' ? 'Floor' : 'Room'}`}
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="normal"
            label={`${dialogState.type === 'floor' ? 'Floor' : 'Room'} Name`}
            fullWidth
            variant="outlined"
            value={dialogState.name}
            onChange={handleNameChange}
            {...textFieldStyle}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDialog} sx={{ fontSize: '1.1rem' }}>
            Cancel
          </Button>
          <Button 
            onClick={handleSaveItem} 
            color="secondary"
            disabled={!dialogState.name.trim()}
            sx={{ fontSize: '1.1rem' }}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default FloorRoomManagement;