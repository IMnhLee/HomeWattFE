import { useState, useEffect } from "react";
import { Box, Button, TextField, Typography, useTheme, 
  Card, CardContent, IconButton, Divider, FormControl,
  Modal, useMediaQuery, RadioGroup, Radio, FormControlLabel } from "@mui/material";
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

  const [loading, setLoading] = useState(false);

  // Configuration type
  const [selectedConfigType, setSelectedConfigType] = useState("tiered");

  // Price tiers state
  const [priceTiers, setPriceTiers] = useState([
    { id: 1, min: 0, max: 50, price: 1678, name: "Tier 1 (0-50 kWh)" },
    { id: 2, min: 51, max: 100, price: 1734, name: "Tier 2 (51-100 kWh)" },
    { id: 3, min: 101, max: 200, price: 2014, name: "Tier 3 (101-200 kWh)" },
    { id: 4, min: 201, max: 300, price: 2536, name: "Tier 4 (201-300 kWh)" },
    { id: 5, min: 301, max: 400, price: 2834, name: "Tier 5 (301-400 kWh)" },
    { id: 6, min: 401, max: null, price: 2927, name: "Tier 6 (>400 kWh)" },
  ]);

  // Single price state
  const [singlePrice, setSinglePrice] = useState(2000);

  // Percentage-based price state
  const [percentagePrices, setPercentagePrices] = useState([
    { id: 1, percentage: 30, price: 1800, name: "Economy" },
    { id: 2, percentage: 50, price: 2200, name: "Standard" },
    { id: 3, percentage: 20, price: 2500, name: "Premium" }
  ]);

  // Modal states
  const [tierModalOpen, setTierModalOpen] = useState(false);
  const [percentageModalOpen, setPercentageModalOpen] = useState(false);
  const [editingTier, setEditingTier] = useState(null);
  const [editingPercentage, setEditingPercentage] = useState(null);
  const [newTier, setNewTier] = useState({
    min: 0,
    max: 0,
    price: 0,
    name: ""
  });
  const [newPercentage, setNewPercentage] = useState({
    percentage: 0,
    price: 0,
    name: ""
  });

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

  // Open percentage modal
  const openPercentageModal = (percentage = null) => {
    if (percentage) {
      setEditingPercentage(percentage);
      setNewPercentage({ ...percentage });
    } else {
      setEditingPercentage(null);
      setNewPercentage({
        percentage: 0,
        price: 0,
        name: `Price Type ${percentagePrices.length + 1}`
      });
    }
    setPercentageModalOpen(true);
  };

  // Handle tier form input
  const handleTierInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name === "min" || name === "price") {
      const numericValue = value.replace(/[^0-9]/g, '');
      
      setNewTier({
        ...newTier,
        [name]: numericValue === '' ? 0 : parseInt(numericValue, 10)
      });
    } 
    else if (name === "max") {
      if (value === '' || value === 'null') {
        setNewTier({
          ...newTier,
          max: null
        });
      } else {
        const numericValue = value.replace(/[^0-9]/g, '');
        
        setNewTier({
          ...newTier,
          max: numericValue === '' ? null : parseInt(numericValue, 10)
        });
      }
    }
    else {
      setNewTier({
        ...newTier,
        [name]: value
      });
    }
  };

  // Handle percentage form input
  const handlePercentageInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name === "percentage" || name === "price") {
      const numericValue = value.replace(/[^0-9]/g, '');
      
      setNewPercentage({
        ...newPercentage,
        [name]: numericValue === '' ? 0 : parseInt(numericValue, 10)
      });
    } 
    else {
      setNewPercentage({
        ...newPercentage,
        [name]: value
      });
    }
  };

  // Handle single price input
  const handleSinglePriceChange = (e) => {
    const value = e.target.value.replace(/[^0-9]/g, '');
    setSinglePrice(value === '' ? 0 : parseInt(value, 10));
  };

  // Save tier with API call
  const handleSaveTier = async () => {
    try {
      setLoading(true);
      
      const tierData = {
        min: parseInt(newTier.min),
        max: newTier.max === '' ? null : (newTier.max === null ? null : parseInt(newTier.max)),
        price: parseInt(newTier.price),
        name: newTier.name
      };
      
      if (editingTier) {
        // Update existing tier
        console.log('API call: Update tier', tierData);
        
        setPriceTiers(
          priceTiers.map(tier => 
            tier.id === editingTier.id ? { ...tierData, id: tier.id } : tier
          )
        );
      } else {
        // Add new tier
        const newId = Math.max(0, ...priceTiers.map(t => t.id)) + 1;
        console.log('API call: Add new tier', { ...tierData, id: newId });
        
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

  // Save percentage price with API call
  const handleSavePercentage = async () => {
    try {
      setLoading(true);
      
      const percentageData = {
        percentage: parseInt(newPercentage.percentage),
        price: parseInt(newPercentage.price),
        name: newPercentage.name
      };
      
      if (editingPercentage) {
        // Update existing percentage
        console.log('API call: Update percentage price', percentageData);
        
        setPercentagePrices(
          percentagePrices.map(item => 
            item.id === editingPercentage.id ? { ...percentageData, id: item.id } : item
          )
        );
      } else {
        // Add new percentage
        const newId = Math.max(0, ...percentagePrices.map(p => p.id)) + 1;
        console.log('API call: Add new percentage price', { ...percentageData, id: newId });
        
        setPercentagePrices([...percentagePrices, { ...percentageData, id: newId }]);
      }
      
      setPercentageModalOpen(false);
      alert(editingPercentage ? "Percentage price updated successfully!" : "New percentage price added successfully!");
      
    } catch (error) {
      console.error('Error saving percentage price:', error);
      alert('Failed to save percentage price. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Save single price with API call
  const handleSaveSinglePrice = async () => {
    try {
      setLoading(true);
      console.log('API call: Save single price', singlePrice);
      alert("Single price updated successfully!");
    } catch (error) {
      console.error('Error saving single price:', error);
      alert('Failed to save single price. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Save configuration type with API call
  const handleSaveConfigType = async () => {
    try {
      setLoading(true);
      console.log('API call: Save configuration type', selectedConfigType);
      alert(`Configuration type set to: ${selectedConfigType}`);
    } catch (error) {
      console.error('Error saving configuration type:', error);
      alert('Failed to save configuration type. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Delete tier
  const handleDeleteTier = async (tierId) => {
    try {
      setLoading(true);
      console.log('API call: Delete tier', tierId);
      setPriceTiers(priceTiers.filter(tier => tier.id !== tierId));
      alert("Tier deleted successfully!");
    } catch (error) {
      console.error('Error deleting tier:', error);
      alert('Failed to delete tier. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Delete percentage price
  const handleDeletePercentage = async (percentageId) => {
    try {
      setLoading(true);
      console.log('API call: Delete percentage price', percentageId);
      setPercentagePrices(percentagePrices.filter(item => item.id !== percentageId));
      alert("Percentage price deleted successfully!");
    } catch (error) {
      console.error('Error deleting percentage price:', error);
      alert('Failed to delete percentage price. Please try again.');
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
        subtitle="Set up pricing tiers" 
      />
      
      <Box
        display="grid"
        gridTemplateColumns={{ xs: "1fr", md: "repeat(12, 1fr)" }}
        gap={{ xs: "15px", sm: "20px" }}
      >
        {/* Configuration Type Selection Box */}
        <Box gridColumn={{ xs: "span 12", md: "span 12" }}>
          <Card sx={{ backgroundColor: colors.primary[400], boxShadow: 3, mb: { xs: 2, sm: 3 } }}>
            <CardContent sx={{ p: { xs: 1.5, sm: 3 } }}>
              <Typography 
                variant={isMobile ? "h5" : "h4"} 
                color={colors.grey[100]} 
                fontWeight="bold"
                mb={2}
              >
                Active Configuration Selection
              </Typography>
              
              <Divider sx={{ mb: 2, borderColor: colors.grey[700] }} />
              
              <Box 
                display="grid" 
                gridTemplateColumns={{ xs: "1fr", sm: "1fr auto" }}
                alignItems="center"
                gap={2}
              >
                <FormControl component="fieldset">
                  <RadioGroup
                    value={selectedConfigType}
                    onChange={(e) => setSelectedConfigType(e.target.value)}
                    sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}
                  >
                    <FormControlLabel 
                      value="tiered" 
                      control={<Radio sx={{ '&.Mui-checked': {color: colors.primary[100]} }}/>} 
                      label="Tiered Pricing" 
                    />
                    <FormControlLabel 
                      value="single" 
                      control={<Radio sx={{ '&.Mui-checked': {color: colors.primary[100]} }}/>} 
                      label="Single Price" 
                    />
                    <FormControlLabel 
                      value="percentage" 
                      control={<Radio sx={{ '&.Mui-checked': {color: colors.primary[100]} }}/>} 
                      label="Percentage-based Pricing" 
                    />
                  </RadioGroup>
                </FormControl>
                
                <Button
                  variant="contained"
                  color="secondary"
                  startIcon={<SaveIcon />}
                  onClick={handleSaveConfigType}
                  disabled={loading}
                  size={isMobile ? "small" : "medium"}
                >
                  Save Configuration Type
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Box>

        {/* Single Price */}
        <Box gridColumn={{ xs: "span 12", md: "span 12" }}>
          <Card sx={{ backgroundColor: colors.primary[400], boxShadow: 3, mb: { xs: 2, sm: 3 } }}>
            <CardContent sx={{ p: { xs: 1.5, sm: 3 } }}>
              <Typography 
                variant={isMobile ? "h5" : "h4"} 
                color={colors.grey[100]} 
                fontWeight="bold"
                mb={2}
              >
                Single Price Configuration
              </Typography>
              
              <Divider sx={{ mb: 2, borderColor: colors.grey[700] }} />
              
              <Box 
                display="grid" 
                gridTemplateColumns={{ xs: "1fr", sm: "2fr 1fr" }}
                gap={2}
                alignItems="center"
                sx={{
                  p: { xs: 1.5, sm: 2 }, 
                  borderRadius: 1,
                  backgroundColor: colors.primary[400],
                  border: `1px solid ${colors.grey[800]}`,
                }}
              >
                <TextField
                  label="Price (VND/kWh)"
                  value={singlePrice}
                  onChange={handleSinglePriceChange}
                  size={isMobile ? "small" : "medium"}
                />
                <Button
                  variant="contained"
                  color="secondary"
                  startIcon={<SaveIcon />}
                  onClick={handleSaveSinglePrice}
                  disabled={loading}
                  size={isMobile ? "small" : "medium"}
                >
                  Save
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Box>
        
        {/* Price Tiers */}
        <Box gridColumn={{ xs: "span 12", md: "span 12" }}>
          <Card sx={{ backgroundColor: colors.primary[400], boxShadow: 3, mb: { xs: 2, sm: 3 } }}>
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
                  Tiered Pricing
                </Typography>
                <Button
                  variant="contained"
                  color="secondary"
                  startIcon={<AddIcon />}
                  onClick={() => openTierModal()}
                  size={isMobile ? "small" : "medium"}
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

        {/* Percentage-based Pricing */}
        <Box gridColumn={{ xs: "span 12", md: "span 12" }}>
          <Card sx={{ backgroundColor: colors.primary[400], boxShadow: 3 }}>
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
                  Percentage-based Pricing
                </Typography>
                <Button
                  variant="contained"
                  color="secondary"
                  startIcon={<AddIcon />}
                  onClick={() => openPercentageModal()}
                  size={isMobile ? "small" : "medium"}
                >
                  Add Type
                </Button>
              </Box>
              
              <Divider sx={{ mb: 2, borderColor: colors.grey[700] }} />
              
              {percentagePrices.map((item) => (
                <Box 
                  key={item.id}
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
                    {item.name}
                  </Typography>
                  
                  <Box 
                    display="flex" 
                    alignItems="center"
                    sx={{ 
                      mt: { xs: 0.5, sm: 0 },
                      gridColumn: { xs: "span 1", sm: "span 1", md: "span 1" } 
                    }}
                  >
                    <Typography variant={isMobile ? "body2" : "body1"} mr={1}>Percentage:</Typography>
                    <Typography variant={isMobile ? "body2" : "body1"} fontWeight="medium">
                      {item.percentage}%
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
                      {item.price.toLocaleString()} VND/kWh
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
                      onClick={() => openPercentageModal(item)} 
                      sx={{ 
                        color: colors.blueAccent[400],
                        padding: isMobile ? 0.5 : 1
                      }}
                      size={isMobile ? "small" : "medium"}
                    >
                      <EditIcon fontSize={isMobile ? "small" : "medium"} />
                    </IconButton>
                    <IconButton 
                      onClick={() => handleDeletePercentage(item.id)} 
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
              size={isMobile ? "small" : "medium"}
            />
            <TextField
              label="Maximum kWh (leave empty for unlimited)"
              name="max"
              value={newTier.max === null ? "" : newTier.max}
              onChange={handleTierInputChange}
              fullWidth
              margin="normal"
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

      {/* Percentage Price Modal */}
      <Modal 
        open={percentageModalOpen} 
        onClose={() => setPercentageModalOpen(false)}
        aria-labelledby="modal-percentage-title"
        aria-describedby="modal-percentage-description"
      >
        <Box sx={modalStyle}>
          {/* Modal header */}
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography id="modal-percentage-title" variant="h4" component="h2">
              {editingPercentage ? "Edit Percentage Price" : "Add New Percentage Price"}
            </Typography>
            <IconButton 
              aria-label="close" 
              onClick={() => setPercentageModalOpen(false)}
              sx={{ color: colors.grey[300] }}
            >
              <CloseIcon />
            </IconButton>
          </Box>
          
          <Divider sx={{ mb: 2, borderColor: colors.grey[700] }} />
          
          {/* Modal content */}
          <Box id="modal-percentage-description" sx={{ mt: 2 }}>
            <TextField
              label="Price Type Name"
              name="name"
              value={newPercentage.name}
              onChange={handlePercentageInputChange}
              fullWidth
              margin="normal"
              size={isMobile ? "small" : "medium"}
              sx={{ mt: { xs: 1, sm: 2 } }}
            />
            <TextField
              label="Percentage (%)"
              name="percentage"
              value={newPercentage.percentage}
              onChange={handlePercentageInputChange}
              fullWidth
              margin="normal"
              size={isMobile ? "small" : "medium"}
            />
            <TextField
              label="Price (VND/kWh)"
              name="price"
              value={newPercentage.price}
              onChange={handlePercentageInputChange}
              fullWidth
              margin="normal"
              size={isMobile ? "small" : "medium"}
            />
          </Box>
          
          {/* Modal actions */}
          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
            <Button 
              onClick={() => setPercentageModalOpen(false)} 
              disabled={loading}
              size={isMobile ? "small" : "medium"}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSavePercentage}
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