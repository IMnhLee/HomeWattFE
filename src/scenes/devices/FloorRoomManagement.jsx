import { useState, useEffect } from "react";
import {
  Box, Button, IconButton, Typography, useTheme, TextField, Modal,
  Card, CardContent, Divider, List, ListItem, ListItemText, Menu, MenuItem, Chip
} from "@mui/material";
import { tokens } from "../../theme";
import Header from "../../components/Header";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import floorApi from "../../services/floor";
import lineApi from "../../services/line"; // Thêm import này nếu chưa có

const FloorRoomManagement = () => {
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
  
  const [floors, setFloors] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Fetch floors data
  useEffect(() => {
    const fetchFloors = async () => {
      try {
        const response = await floorApi.getAllFloor();
        console.log("Floors data:", response.data);
        // Transform API data to match component structure
        const formattedFloors = response.data.map(floor => ({
          id: floor.id,
          name: floor.name,
          rooms: floor.rooms?.map(room => ({
            id: room.id,
            name: room.name,
            devices: room.lines?.map(line => ({
              id: line.id,
              name: line.name,
              monitoringId: line.monitoringId,
              monitoringCode: line.monitoringCode,
              line: line.code
            })) || []
          })) || []
        }));
        setFloors(formattedFloors);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching floors:", error);
        setLoading(false);
      }
    };

    fetchFloors();
    console.log("Floors data fetched:", floors);
  }, []);

  // Dialog states - renamed to modalState
  const [modalState, setModalState] = useState({
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

  // Add this new state for delete confirmation
  const [confirmDelete, setConfirmDelete] = useState({
    open: false,
    type: null, // 'floor' or 'room'
    item: null
  });

  // Modal helpers
  const openModal = (type, item = null, parent = null) => {
    setModalState({
      type,
      open: true,
      isEditing: !!item,
      itemData: item,
      parentData: parent,
      name: item ? item.name : ""
    });
  };

  const closeModal = () => {
    setModalState(prev => ({ ...prev, open: false }));
  };

  const handleNameChange = (e) => {
    setModalState(prev => ({ ...prev, name: e.target.value }));
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
  const handleSaveItem = async () => {
    const { type, isEditing, itemData, parentData, name } = modalState;
    
    try {
      if (type === 'floor') {
        if (isEditing) {
          // Edit existing floor using API
          const response = await floorApi.updateFloor(itemData.id, name);
          if (response.message) {
            // Success - update local state
            setFloors(floors.map(floor => 
              floor.id === itemData.id ? { ...floor, name } : floor
            ));
          }
        } else {
          // Add new floor using API
          const response = await floorApi.addFloor({ name });
          if (response.data) {
            // Add new floor to state with data from API response
            const newFloor = {
              id: response.data.id,
              name: response.data.name,
              rooms: []
            };
            setFloors([...floors, newFloor]);
          }
        }
      } else if (type === 'room') {
        if (isEditing) {
          // Edit existing room using API
          const response = await floorApi.editRoom(itemData.id, name);
          if (response.message) {
            // Success - update local state
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
          }
        } else {
          // Add new room using API
          const response = await floorApi.addRoomToFloor(parentData.id, name);
          if (response.data) {
            // Add new room to state with data from API response
            const newRoom = {
              id: response.data.id,
              name: response.data.name,
              devices: []
            };
            
            setFloors(floors.map(floor => 
              floor.id === parentData.id 
                ? { 
                    ...floor, 
                    rooms: [...floor.rooms, newRoom]
                  } 
                : floor
            ));
          }
        }
      }
      
      closeModal();
    } catch (error) {
      console.error("Error saving item:", error);
      // You could add error handling UI here
    }
  };
  
  // Add these helper functions for confirmation dialog
  const openDeleteConfirmation = (type, item) => {
    setConfirmDelete({
      open: true,
      type,
      item
    });
    closeMenu(); // Close the menu when opening confirmation
  };

  const closeDeleteConfirmation = () => {
    setConfirmDelete({
      open: false,
      type: null,
      item: null
    });
  };

  // Modified version of handleDeleteItem
  const confirmDeleteItem = async () => {
    const { type, item } = confirmDelete;
    
    try {
      if (type === 'floor') {
        // Delete floor using API
        const response = await floorApi.deleteFloor(item.id);
        if (response.message) {
          // Remove floor from local state after successful API deletion
          setFloors(floors.filter(floor => floor.id !== item.id));
        }
      } else if (type === 'room') {
        // Delete room using API
        const response = await floorApi.deleteRoom(item.room.id);
        if (response.message) {
          // Success - update local state
          setFloors(floors.map(floor => 
            floor.id === item.floor.id 
              ? { 
                  ...floor, 
                  rooms: floor.rooms.filter(room => room.id !== item.room.id)
                } 
              : floor
          ));
        }
      }
      
      closeDeleteConfirmation();
    } catch (error) {
      console.error("Error deleting item:", error);
      closeDeleteConfirmation();
      // You could add error handling UI here
    }
  };
  
  const handleRemoveDevice = async (floorId, roomId, deviceId) => {
    try {
      // Find the device to get its details
      const floor = floors.find(f => f.id === floorId);
      const room = floor?.rooms.find(r => r.id === roomId);
      const device = room?.devices.find(d => d.id === deviceId);
      
      if (device) {
        // Call API to update line with roomId = null
        const requestBody = {
          lineId: device.id,
          monitoringId: device.monitoringId,
          name: device.name,
          roomId: null
        };
        
        const response = await lineApi.editLine(requestBody);
        
        if (response.message === "Update line success") {
          console.log("Line updated successfully:", response.data);
          
          // Update local state after successful API call
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
        }
      }
    } catch (error) {
      console.error("Error removing device from room:", error);
      // You could add error handling UI here
    }
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
            Thiết bị: {room.devices.length}
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
              {floor.rooms.length} Phòng
            </Typography>
            <Button
              variant="outlined"
              color="secondary"
              startIcon={<AddIcon />}
              size="medium"
              onClick={() => openModal('room', null, floor)}
              sx={{ fontSize: '1rem' }}
            >
              Thêm phòng
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
      <Header 
        title="Quản lý Tầng và Phòng" 
        subtitle="Quản lý bố cục nhà của bạn và các thiết bị kết nối" 
      />
      
      <Box display="flex" justifyContent="flex-end" mb={3}>
        <Button
          variant="contained"
          color="secondary"
          startIcon={<AddIcon />}
          onClick={() => openModal('floor')}
          size="large"
          sx={{ fontSize: '1.1rem', py: 1 }}
        >
          Thêm tầng
        </Button>
      </Box>
      
      {/* Loading state */}
      {loading ? (
        <Typography variant="h5" textAlign="center" my={4}>
          Loading floors and rooms...
        </Typography>
      ) : floors.length === 0 ? (
        <Typography variant="h5" textAlign="center" my={4}>
          Không có tầng nào hiện có. Hãy thêm một tầng mới.
        </Typography>
      ) : (
        /* Floor List */
        <Box display="grid" gap={3} sx={{ gridTemplateColumns: "1fr" }}>
          {floors.map(renderFloor)}
        </Box>
      )}
      
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
              openModal('floor', menuState.item);
            } else if (menuState.type === 'room') {
              openModal('room', menuState.item.room, menuState.item.floor);
            }
          }}
          sx={{ fontSize: '1.1rem', py: 1.5 }}
        >
          <EditIcon fontSize="medium" sx={{ mr: 1 }} /> Sửa
        </MenuItem>
        <MenuItem 
          onClick={() => openDeleteConfirmation(menuState.type, menuState.item)}
          sx={{ fontSize: '1.1rem', py: 1.5 }}
        >
          <DeleteIcon fontSize="medium" sx={{ mr: 1 }} /> Xóa
        </MenuItem>
      </Menu>
      
      {/* Modal */}
      <Modal
        open={modalState.open}
        onClose={closeModal}
        aria-labelledby="modal-title"
      >
        <Box sx={modalStyle}>
          <Typography id="modal-title" variant="h4" sx={{ mb: 3, fontSize: "22px" }}>
            {modalState.isEditing 
              ? `Chỉnh sửa ${modalState.type === 'floor' ? 'Tầng' : 'Phòng'}` 
              : `Thêm ${modalState.type === 'floor' ? 'Tầng' : 'Phòng'}`}
          </Typography>
          
          <TextField
            autoFocus
            margin="normal"
            label={`Tên ${modalState.type === 'floor' ? 'Tầng' : 'Phòng'} `}
            fullWidth
            variant="outlined"
            value={modalState.name}
            onChange={handleNameChange}
            sx={{
              "& .MuiOutlinedInput-root": {
                fontSize: "16px",
              },
              "& .MuiInputLabel-root.Mui-focused": { color: colors.primary[100] },
            }}
          />
          
          {/* Action buttons */}
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3, gap: 1 }}>
            <Button 
              onClick={closeModal} 
              sx={{ fontSize: "16px", color: colors.primary[100] }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveItem}
              color="secondary"
              variant="contained"
              disabled={!modalState.name.trim()}
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
        aria-labelledby="delete-confirm-title"
      >
        <Box sx={modalStyle}>
          <Typography id="delete-confirm-title" variant="h4" sx={{ mb: 3, fontSize: "22px" }}>
            Xác nhận xóa
          </Typography>
          
          <Typography variant="body1" sx={{ mb: 3, fontSize: "16px" }}>
            {confirmDelete.type === 'floor'
              ? `Bạn có chắc chắn muốn xóa tầng "${confirmDelete.item?.name}"? Điều này cũng sẽ xóa tất cả các phòng trong tầng này.`
              : `Bạn có chắc chắn muốn xóa phòng "${confirmDelete.item?.room?.name}"?`}
          </Typography>

          {/* Action buttons */}
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3, gap: 1 }}>
            <Button 
              onClick={closeDeleteConfirmation} 
              sx={{ fontSize: "16px", color: colors.primary[100] }}
            >
              Hủy
            </Button>
            <Button
              onClick={confirmDeleteItem}
              color="error"
              variant="contained"
              sx={{ fontSize: "16px" }}
            >
              Xóa
            </Button>
          </Box>
        </Box>
      </Modal>
    </Box>
  );
};

export default FloorRoomManagement;