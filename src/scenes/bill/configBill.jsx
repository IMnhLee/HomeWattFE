import { useState } from "react";
import { Box, Button, TextField, Typography, useTheme, 
  Card, CardContent, IconButton, Divider, Switch,
  FormControlLabel, Modal, useMediaQuery } from "@mui/material";
import { tokens } from "../../theme";
import Header from "../../components/Header";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import SaveIcon from "@mui/icons-material/Save";
import CloseIcon from "@mui/icons-material/Close";
import axios from "axios";

const ConfigBill = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  
  // Responsive breakpoints
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  const isLargeScreen = useMediaQuery(theme.breakpoints.up('lg'));

  const [loading, setLoading] = useState(false);

  // Price tiers state
  const [priceTiers, setPriceTiers] = useState([
    { id: 1, min: 0, max: 50, price: 1678, name: "Tier 1 (0-50 kWh)" },
    { id: 2, min: 51, max: 100, price: 1734, name: "Tier 2 (51-100 kWh)" },
    { id: 3, min: 101, max: 200, price: 2014, name: "Tier 3 (101-200 kWh)" },
    { id: 4, min: 201, max: 300, price: 2536, name: "Tier 4 (201-300 kWh)" },
    { id: 5, min: 301, max: 400, price: 2834, name: "Tier 5 (301-400 kWh)" },
    { id: 6, min: 401, max: null, price: 2927, name: "Tier 6 (>400 kWh)" },
  ]);

  // Notifications settings
  const [notifications, setNotifications] = useState({
    emailEnabled: true,
    highUsageAlert: true,
    highUsageThreshold: 300
  });

  // Modal states
  const [tierModalOpen, setTierModalOpen] = useState(false);
  const [editingTier, setEditingTier] = useState(null);
  const [newTier, setNewTier] = useState({
    min: 0,
    max: 0,
    price: 0,
    name: ""
  });

  // Handle notification settings changes
  const handleNotificationChange = (e) => {
    const { name, value, checked, type } = e.target;
    setNotifications({
      ...notifications,
      [name]: type === "checkbox" ? checked : value
    });
  };

  // Open tier modal
  const openTierModal = (tier = null) => {
    if (tier) {
      setEditingTier(tier);
      setNewTier({ ...tier });
    } else {
      setEditingTier(null);
      setNewTier({
        min: Math.max(...priceTiers.map(t => t.max || 0)) + 1,
        max: null,
        price: 0,
        name: `Tier ${priceTiers.length + 1}`
      });
    }
    setTierModalOpen(true);
  };

  // Handle tier form input - CHỈ CHO PHÉP NHẬP SỐ
  const handleTierInputChange = (e) => {
    const { name, value } = e.target;
    
    // Xử lý các trường dữ liệu khác nhau
    if (name === "min" || name === "price") {
      // Chỉ cho phép nhập số
      const numericValue = value.replace(/[^0-9]/g, '');
      
      setNewTier({
        ...newTier,
        [name]: numericValue === '' ? 0 : parseInt(numericValue, 10)
      });
    } 
    else if (name === "max") {
      // Xử lý trường max đặc biệt - cho phép để trống (vô cùng)
      if (value === '' || value === 'null') {
        setNewTier({
          ...newTier,
          max: null
        });
      } else {
        // Chỉ cho phép nhập số
        const numericValue = value.replace(/[^0-9]/g, '');
        
        setNewTier({
          ...newTier,
          max: numericValue === '' ? null : parseInt(numericValue, 10)
        });
      }
    }
    else {
      // Trường name - không giới hạn kiểu dữ liệu
      setNewTier({
        ...newTier,
        [name]: value
      });
    }
  };

  // Save tier với API call
  const handleSaveTier = async () => {
    try {
      setLoading(true);
      
      // Chuẩn bị dữ liệu để gửi API
      const tierData = {
        min: parseInt(newTier.min),
        max: newTier.max === '' ? null : (newTier.max === null ? null : parseInt(newTier.max)),
        price: parseInt(newTier.price),
        name: newTier.name
      };
      
      if (editingTier) {
        // Cập nhật tier hiện có
        // await axios.put(`/api/tiers/${editingTier.id}`, tierData);
        console.log('API call: Update tier', tierData);
        
        // Cập nhật state sau khi API thành công
        setPriceTiers(
          priceTiers.map(tier => 
            tier.id === editingTier.id ? { ...tierData, id: tier.id } : tier
          )
        );
      } else {
        // Thêm tier mới
        const newId = Math.max(0, ...priceTiers.map(t => t.id)) + 1;
        // const response = await axios.post('/api/tiers', { ...tierData, id: newId });
        console.log('API call: Add new tier', { ...tierData, id: newId });
        
        // Cập nhật state sau khi API thành công
        setPriceTiers([...priceTiers, { ...tierData, id: newId }]);
      }
      
      setTierModalOpen(false);
      alert(editingTier ? "Tier updated successfully!" : "New tier added successfully!");
      
    } catch (error) {
      console.error('Error saving tier:', error);
      alert('Failed to save tier. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Delete tier
  const handleDeleteTier = async (tierId) => {
    try {
      setLoading(true);
      
      // Gọi API xóa
      // await axios.delete(`/api/tiers/${tierId}`);
      console.log('API call: Delete tier', tierId);
      
      // Sau khi xóa thành công, cập nhật state
      setPriceTiers(priceTiers.filter(tier => tier.id !== tierId));
      alert("Tier deleted successfully!");
      
    } catch (error) {
      console.error('Error deleting tier:', error);
      alert('Failed to delete tier. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Save notifications settings
  const handleSaveNotifications = async () => {
    try {
      setLoading(true);
      
      // Gọi API lưu thông báo
      // await axios.post('/api/notifications/settings', notifications);
      console.log("Saving notification settings...", notifications);
      
      alert("Notification settings saved successfully!");
    } catch (error) {
      console.error('Error saving notifications:', error);
      alert('Failed to save notification settings. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Modal style configuration
  const modalStyle = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: isMobile ? '90%' : '500px',
    maxHeight: '90vh',
    overflow: 'auto',
    bgcolor: colors.primary[400],
    border: `1px solid ${colors.grey[800]}`,
    boxShadow: 24,
    borderRadius: 1,
    p: isMobile ? 2 : 3,
  };

  return (
    <Box m={{ xs: "10px", sm: "20px" }}>
      <Header 
        title="ELECTRICITY BILL CONFIGURATION" 
        subtitle="Set up pricing tiers and notification parameters" 
      />
      
      <Box
        display="grid"
        gridTemplateColumns={{ xs: "1fr", md: "repeat(12, 1fr)" }}
        gap={{ xs: "15px", sm: "20px" }}
      >
        {/* Price Tiers */}
        <Box gridColumn={{ xs: "span 12", md: "span 8" }}>
          <Card sx={{ backgroundColor: colors.primary[400], boxShadow: 3, mb: { xs: 1, sm: 2 } }}>
            <CardContent sx={{ p: { xs: 1.5, sm: 3 } }}>
              <Box 
                display="flex" 
                flexDirection={{ xs: "column", sm: "row" }}
                justifyContent="space-between" 
                alignItems={{ xs: "stretch", sm: "center" }}
                mb={2}
                gap={1}
              >
                <Typography 
                  variant={isMobile ? "h5" : "h4"} 
                  color={colors.grey[100]} 
                  fontWeight="bold"
                >
                  Price Tiers
                </Typography>
                <Button
                  variant="contained"
                  color="secondary"
                  startIcon={<AddIcon />}
                  onClick={() => openTierModal()}
                  size={isMobile ? "small" : "medium"}
                  sx={{ alignSelf: { xs: "stretch", sm: "auto" } }}
                >
                  Add Tier
                </Button>
              </Box>
              
              <Divider sx={{ mb: 2, borderColor: colors.grey[700] }} />
              
              {priceTiers.map((tier) => (
                <Box 
                  key={tier.id}
                  display="grid" 
                  gridTemplateColumns={{ 
                    xs: "1fr", 
                    sm: "2fr 2fr", 
                    md: "2fr 2fr 2fr 1fr" 
                  }}
                  gap={{ xs: 1, sm: 2 }}
                  alignItems="center"
                  sx={{
                    p: { xs: 1.5, sm: 2 }, 
                    mb: { xs: 1, sm: 1.5 }, 
                    borderRadius: 1,
                    backgroundColor: colors.primary[400],
                    border: `1px solid ${colors.grey[800]}`,
                  }}
                >
                  <Typography 
                    variant={isMobile ? "body1" : "h5"} 
                    fontWeight="bold"
                    sx={{ gridColumn: { sm: isMobile ? "span 1" : "span 2", md: "span 1" } }}
                  >
                    {tier.name}
                  </Typography>
                  
                  <Box 
                    display="flex" 
                    alignItems="center"
                    sx={{ 
                      mt: { xs: 0.5, sm: 0 },
                      gridColumn: { xs: "span 1", sm: "span 1", md: "span 1" } 
                    }}
                  >
                    <Typography variant={isMobile ? "body2" : "body1"} mr={1}>Range:</Typography>
                    <Typography variant={isMobile ? "body2" : "body1"} fontWeight="medium">
                      {tier.min} - {tier.max === null ? "vô cùng" : tier.max} kWh
                    </Typography>
                  </Box>
                  
                  <Box 
                    display="flex" 
                    alignItems="center"
                    sx={{ 
                      mt: { xs: 0.5, sm: 0 },
                      gridColumn: { xs: "span 1", sm: "span 1", md: "span 1" } 
                    }}
                  >
                    <Typography variant={isMobile ? "body2" : "body1"} mr={1}>Price:</Typography>
                    <Typography 
                      variant={isMobile ? "body2" : "body1"} 
                      fontWeight="medium" 
                      color={colors.greenAccent[400]}
                    >
                      {tier.price.toLocaleString()} VND/kWh
                    </Typography>
                  </Box>
                  
                  <Box 
                    display="flex" 
                    justifyContent={{ xs: "flex-start", md: "flex-end" }}
                    sx={{ 
                      mt: { xs: 1, sm: 0 },
                      gridColumn: { 
                        xs: "span 1", 
                        sm: isMobile ? "span 2" : "span 1", 
                        md: "span 1" 
                      } 
                    }}
                  >
                    <IconButton 
                      onClick={() => openTierModal(tier)} 
                      sx={{ 
                        color: colors.blueAccent[400],
                        padding: isMobile ? 0.5 : 1
                      }}
                      size={isMobile ? "small" : "medium"}
                    >
                      <EditIcon fontSize={isMobile ? "small" : "medium"} />
                    </IconButton>
                    <IconButton 
                      onClick={() => handleDeleteTier(tier.id)} 
                      sx={{ 
                        color: colors.redAccent[400],
                        padding: isMobile ? 0.5 : 1
                      }}
                      size={isMobile ? "small" : "medium"}
                    >
                      <DeleteIcon fontSize={isMobile ? "small" : "medium"} />
                    </IconButton>
                  </Box>
                </Box>
              ))}
            </CardContent>
          </Card>
        </Box>
        
        {/* Notifications card */}
        <Box gridColumn={{ xs: "span 12", md: "span 4" }}>
          <Card sx={{ backgroundColor: colors.primary[400], boxShadow: 3, mb: { xs: 1, sm: 2 } }}>
            <CardContent sx={{ p: { xs: 1.5, sm: 2.5 } }}>
              <Typography 
                variant={isMobile ? "h5" : "h4"} 
                color={colors.grey[100]} 
                fontWeight="bold" 
                mb={2}
              >
                Notification Settings
              </Typography>
              
              <Box display="flex" flexDirection="column" gap={1.5}>
                <FormControlLabel 
                  control={
                    <Switch 
                      checked={notifications.emailEnabled}
                      onChange={handleNotificationChange}
                      name="emailEnabled"
                      color="secondary"
                      size={isMobile ? "small" : "medium"}
                    />
                  } 
                  label="Email Notifications"
                  sx={{ 
                    '& .MuiFormControlLabel-label': { 
                      fontSize: isMobile ? '0.875rem' : '1rem' 
                    } 
                  }}
                />
                
                <FormControlLabel 
                  control={
                    <Switch 
                      checked={notifications.highUsageAlert}
                      onChange={handleNotificationChange}
                      name="highUsageAlert"
                      color="secondary"
                      size={isMobile ? "small" : "medium"}
                    />
                  } 
                  label="High Usage Alerts"
                  sx={{ 
                    '& .MuiFormControlLabel-label': { 
                      fontSize: isMobile ? '0.875rem' : '1rem' 
                    } 
                  }}
                />
                
                <TextField
                  label="High Usage Threshold (kWh)"
                  name="highUsageThreshold"
                  type="number"
                  value={notifications.highUsageThreshold}
                  onChange={handleNotificationChange}
                  fullWidth
                  disabled={!notifications.highUsageAlert}
                  InputProps={{ 
                    inputProps: { min: 0 },
                    endAdornment: <Typography variant={isMobile ? "body2" : "body1"}>kWh</Typography>
                  }}
                  size={isMobile ? "small" : "medium"}
                  sx={{ mt: 1, mb: 2 }}
                />
                
                {/* Save Notification Settings button */}
                <Button
                  variant="contained"
                  color="secondary"
                  startIcon={<SaveIcon />}
                  onClick={handleSaveNotifications}
                  fullWidth
                  size={isMobile ? "small" : "medium"}
                  sx={{ mt: { xs: 1, sm: 2 } }}
                >
                  Save Settings
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Box>
      </Box>
      
      {/* Price Tier Modal */}
      <Modal 
        open={tierModalOpen} 
        onClose={() => setTierModalOpen(false)}
        aria-labelledby="modal-tier-title"
        aria-describedby="modal-tier-description"
      >
        <Box sx={modalStyle}>
          {/* Modal header */}
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography id="modal-tier-title" variant="h4" component="h2">
              {editingTier ? "Edit Price Tier" : "Add New Price Tier"}
            </Typography>
            <IconButton 
              aria-label="close" 
              onClick={() => setTierModalOpen(false)}
              sx={{ color: colors.grey[300] }}
            >
              <CloseIcon />
            </IconButton>
          </Box>
          
          <Divider sx={{ mb: 2, borderColor: colors.grey[700] }} />
          
          {/* Modal content */}
          <Box id="modal-tier-description" sx={{ mt: 2 }}>
            <TextField
              label="Tier Name"
              name="name"
              value={newTier.name}
              onChange={handleTierInputChange}
              fullWidth
              margin="normal"
              size={isMobile ? "small" : "medium"}
              sx={{ mt: { xs: 1, sm: 2 } }}
            />
            <TextField
              label="Minimum kWh"
              name="min"
              value={newTier.min}
              onChange={handleTierInputChange}
              fullWidth
              margin="normal"
              inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
              size={isMobile ? "small" : "medium"}
            />
            <TextField
              label="Maximum kWh (leave empty for unlimited)"
              name="max"
              value={newTier.max === null ? "" : newTier.max}
              onChange={handleTierInputChange}
              fullWidth
              margin="normal"
              inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
              helperText="Leave empty for unlimited"
              size={isMobile ? "small" : "medium"}
            />
            <TextField
              label="Price (VND/kWh)"
              name="price"
              value={newTier.price}
              onChange={handleTierInputChange}
              fullWidth
              margin="normal"
              inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
              size={isMobile ? "small" : "medium"}
            />
          </Box>
          
          {/* Modal actions */}
          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
            <Button 
              onClick={() => setTierModalOpen(false)} 
              disabled={loading}
              size={isMobile ? "small" : "medium"}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSaveTier}
              variant="contained" 
              color="secondary"
              disabled={loading}
              size={isMobile ? "small" : "medium"}
            >
              {loading ? "Saving..." : "Save"}
            </Button>
          </Box>
        </Box>
      </Modal>
    </Box>
  );
};

export default ConfigBill;