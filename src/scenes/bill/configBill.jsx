import { useState } from "react";
import { Box, Button, TextField, Typography, useTheme, 
  Card, CardContent, IconButton, Divider, Switch,
  FormControlLabel, Dialog, DialogActions, DialogContent, DialogTitle } from "@mui/material";
import { tokens } from "../../theme";
import Header from "../../components/Header";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import SaveIcon from "@mui/icons-material/Save";
import axios from "axios";

const ConfigBill = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

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

  // Dialog states
  const [tierDialogOpen, setTierDialogOpen] = useState(false);
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

  // Open tier dialog
  const openTierDialog = (tier = null) => {
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
    setTierDialogOpen(true);
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
      
      setTierDialogOpen(false);
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

  return (
    <Box m="20px">
      <Header 
        title="ELECTRICITY BILL CONFIGURATION" 
        subtitle="Set up pricing tiers and notification parameters" 
      />
      
      <Box
        display="grid"
        gridTemplateColumns="repeat(12, 1fr)"
        gap="20px"
      >
        {/* Price Tiers */}
        <Box gridColumn="span 8">
          <Card sx={{ backgroundColor: colors.primary[400], boxShadow: 3, mb: 2 }}>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h4" color={colors.grey[100]} fontWeight="bold">
                  Price Tiers
                </Typography>
                <Button
                  variant="contained"
                  color="secondary"
                  startIcon={<AddIcon />}
                  onClick={() => openTierDialog()}
                >
                  Add Tier
                </Button>
              </Box>
              
              <Divider sx={{ mb: 2, borderColor: colors.grey[700] }} />
              
              {priceTiers.map((tier) => (
                <Box 
                  key={tier.id}
                  display="grid" 
                  gridTemplateColumns="1fr 2fr 2fr 2fr 1fr" 
                  gap={2}
                  alignItems="center"
                  sx={{
                    p: 2, 
                    mb: 1, 
                    borderRadius: 1,
                    backgroundColor: colors.primary[400],
                  }}
                >
                  <Typography variant="h5" fontWeight="bold">
                    {tier.name}
                  </Typography>
                  
                  <Box display="flex" alignItems="center">
                    <Typography mr={1}>Range:</Typography>
                    <Typography fontWeight="medium">
                      {tier.min} - {tier.max === null ? "vô cùng" : tier.max} kWh
                    </Typography>
                  </Box>
                  
                  <Box display="flex" alignItems="center">
                    <Typography mr={1}>Price:</Typography>
                    <Typography fontWeight="medium" color={colors.greenAccent[400]}>
                      {tier.price.toLocaleString()} VND/kWh
                    </Typography>
                  </Box>
                  
                  <Box></Box> {/* Spacer */}
                  
                  <Box display="flex" justifyContent="flex-end">
                    <IconButton onClick={() => openTierDialog(tier)} sx={{ color: colors.blueAccent[400] }}>
                      <EditIcon />
                    </IconButton>
                    <IconButton onClick={() => handleDeleteTier(tier.id)} sx={{ color: colors.redAccent[400] }}>
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </Box>
              ))}
            </CardContent>
          </Card>
        </Box>
        
        {/* Notifications card */}
        <Box gridColumn="span 4">
          <Card sx={{ backgroundColor: colors.primary[400], boxShadow: 3, mb: 2 }}>
            <CardContent>
              <Typography variant="h4" color={colors.grey[100]} fontWeight="bold" mb={2}>
                Notification Settings
              </Typography>
              
              <Box display="flex" flexDirection="column" gap={2}>
                <FormControlLabel 
                  control={
                    <Switch 
                      checked={notifications.emailEnabled}
                      onChange={handleNotificationChange}
                      name="emailEnabled"
                      color="secondary"
                    />
                  } 
                  label="Email Notifications"
                />
                
                <FormControlLabel 
                  control={
                    <Switch 
                      checked={notifications.highUsageAlert}
                      onChange={handleNotificationChange}
                      name="highUsageAlert"
                      color="secondary"
                    />
                  } 
                  label="High Usage Alerts"
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
                    endAdornment: <Typography>kWh</Typography>
                  }}
                  sx={{ mt: 1, mb: 2 }}
                />
                
                {/* Save Notification Settings button */}
                <Button
                  variant="contained"
                  color="secondary"
                  startIcon={<SaveIcon />}
                  onClick={handleSaveNotifications}
                  fullWidth
                  sx={{ mt: 2 }}
                >
                  Save Settings
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Box>
      </Box>
      
      {/* Price Tier Dialog - Cập nhật để chỉ nhập số */}
      <Dialog open={tierDialogOpen} onClose={() => setTierDialogOpen(false)}>
        <DialogTitle>
          {editingTier ? "Edit Price Tier" : "Add New Price Tier"}
        </DialogTitle>
        <DialogContent>
          <TextField
            label="Tier Name"
            name="name"
            value={newTier.name}
            onChange={handleTierInputChange}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Minimum kWh"
            name="min"
            value={newTier.min}
            onChange={handleTierInputChange}
            fullWidth
            margin="normal"
            inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
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
          />
          <TextField
            label="Price (VND/kWh)"
            name="price"
            value={newTier.price}
            onChange={handleTierInputChange}
            fullWidth
            margin="normal"
            inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTierDialogOpen(false)} disabled={loading}>Cancel</Button>
          <Button 
            onClick={handleSaveTier}
            variant="contained" 
            color="secondary"
            disabled={loading}
          >
            {loading ? "Saving..." : "Save"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ConfigBill;