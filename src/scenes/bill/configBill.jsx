import { useState, useEffect } from "react";
import { Box, Button, TextField, Typography, useTheme, 
  Card, CardContent, IconButton, Divider, FormControl,
  Modal, useMediaQuery, RadioGroup, Radio, FormControlLabel } from "@mui/material";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { tokens } from "../../theme";
import Header from "../../components/Header";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import SaveIcon from "@mui/icons-material/Save";
import CloseIcon from "@mui/icons-material/Close";
import configBillApi from "../../services/configBill";

const ConfigBill = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  
  // Responsive breakpoints
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [loading, setLoading] = useState(false);
  
  // Add state for billing cycle start date
  const [billingStartDate, setBillingStartDate] = useState(1);

  // Configuration type
  const [selectedConfigType, setSelectedConfigType] = useState("tiered");

  // Price tiers state - initialize as empty array since we'll fetch from API
  const [priceTiers, setPriceTiers] = useState([]);

  // Single price state
  const [singlePrice, setSinglePrice] = useState(2000);
  const [onePriceId, setOnePriceId] = useState(null);

  // Percentage-based price state
  const [percentagePrices, setPercentagePrices] = useState([]);

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
      const nextStep = priceTiers.length > 0 ? Math.max(...priceTiers.map(t => t.step)) + 1 : 1;
      const lastTier = priceTiers.length > 0 ? 
        priceTiers.reduce((max, tier) => tier.step > max.step ? tier : max, priceTiers[0]) : 
        { max: 0 };
      
      setNewTier({
        min: lastTier.max !== null ? lastTier.max + 1 : 0,
        max: null,
        price: 0,
        name: `Tier ${nextStep}`,
        step: nextStep
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
      
      // Format data for API
      const step = editingTier ? editingTier.step || priceTiers.length + 1 : priceTiers.length + 1;
      const minKwh = parseInt(newTier.min);
      const maxKwh = newTier.max === '' ? null : (newTier.max === null ? null : parseInt(newTier.max));
      const price = parseInt(newTier.price);
      
      let response;
      
      if (editingTier) {
        // Update existing tier
        response = await configBillApi.editStairPriceConfig(
          editingTier.id,
          step,
          minKwh,
          maxKwh,
          price
        );
      } else {
        // Add new tier
        response = await configBillApi.createStairPriceConfig(
          step,
          minKwh,
          maxKwh,
          price
        );
      }
      
      // // Check for data or message indicating success
      // if (response.data) {
        // Fetch updated list
        fetchStairPriceConfig();
        setTierModalOpen(false);
        showAlert(editingTier ? 
          "Tier updated successfully!" : 
          "New tier added successfully!"
        );
      // } else {
      //   throw new Error(response.message || "Unknown error");
      // }
      
    } catch (error) {
      console.error('Error saving tier:', error);
      showAlert('Failed to save tier. Please try again.', "error");
    } finally {
      setLoading(false);
    }
  };

  // Save percentage price with API call
  const handleSavePercentage = async () => {
    try {
      setLoading(true);
      
      // Format data for API
      const name = newPercentage.name;
      const price = parseInt(newPercentage.price);
      const percent = parseInt(newPercentage.percentage);
      
      let response;
      
      if (editingPercentage) {
        // Update existing percentage
        response = await configBillApi.editPercentPriceConfig(
          editingPercentage.id,
          name,
          price,
          percent
        );
      } else {
        // Add new percentage
        response = await configBillApi.createPercentPriceConfig(
          name,
          price,
          percent
        );
      }
      
      // if (response.data) {
        // Fetch updated list
        fetchPercentPriceConfig();
        setPercentageModalOpen(false);
        showAlert(response.message || (editingPercentage ? 
          "Percentage price updated successfully!" : 
          "New percentage price added successfully!")
        );
      // } else {
      //   throw new Error(response.message || "Unknown error");
      // }
      
    } catch (error) {
      console.error('Error saving percentage price:', error);
      showAlert('Failed to save percentage price. Please try again.', "error");
    } finally {
      setLoading(false);
    }
  };

  // Save single price with API call
  const handleSaveSinglePrice = async () => {
    try {
      setLoading(true);
      const response = await configBillApi.editOnePriceConfig(Number(singlePrice));
      
      // if (response.data) {
        showAlert(response.message || "Single price updated successfully!");
        // Update local state if needed
        setSinglePrice(response.data.price);
        setOnePriceId(response.data.id);
      // } else {
      //   throw new Error(response.message || "Unknown error");
      // }
    } catch (error) {
      console.error('Error saving single price:', error);
      showAlert('Lỗi khi lưu giá điện theo bậc', "error");
    } finally {
      setLoading(false);
    }
  };

  // Function to map API priceType to component values
  const mapApiToComponentType = (apiType) => {
    const mapping = {
      'one_price': 'single',
      'stair_price': 'tiered',
      'percent_price': 'percentage'
    };
    return mapping[apiType] || 'tiered'; // Default to tiered if unknown
  };

  // Function to map component values to API values
  const mapComponentToApiType = (componentType) => {
    const mapping = {
      'single': 'one_price',
      'tiered': 'stair_price',
      'percentage': 'percent_price'
    };
    return mapping[componentType];
  };

  // Fetch configuration type from API
  const fetchConfigType = async () => {
    try {
      setLoading(true);
      const response = await configBillApi.getPriceConfig();
      
      if (response.data && response.data.priceType) {
        const componentType = mapApiToComponentType(response.data.priceType);
        setSelectedConfigType(componentType);
      } else {
        throw new Error(response.message || "Failed to fetch configuration type");
      }
    } catch (error) {
      console.error("Error fetching configuration type:", error);
      // showAlert("Failed to load configuration type", "error");
    } finally {
      setLoading(false);
    }
  };

  // Save configuration type with API call - updated to use the API
  const handleSaveConfigType = async () => {
    try {
      setLoading(true);
      const apiType = mapComponentToApiType(selectedConfigType);
      const response = await configBillApi.editPriceConfig(apiType);
      
      if (response.message) {
        showAlert(response.message || "Configuration type updated successfully!");
      } else {
        throw new Error(response.message || "Unknown error");
      }
    } catch (error) {
      console.error('Error saving configuration type:', error);
      showAlert('Failed to save configuration type. Please try again.', "error");
    } finally {
      setLoading(false);
    }
  };

  // Delete tier
  const handleDeleteTier = async (tierId) => {
    try {
      setLoading(true);
      const response = await configBillApi.deleteStairPriceConfig(tierId);
      
      if (response.message) {
        setPriceTiers(priceTiers.filter(tier => tier.id !== tierId));
        showAlert(response.message || "Tier deleted successfully!");
      } else {
        throw new Error(response.message || "Unknown error");
      }
    } catch (error) {
      console.error('Error deleting tier:', error);
      showAlert('Failed to delete tier. Please try again.', "error");
    } finally {
      setLoading(false);
    }
  };

  // Delete percentage price
  const handleDeletePercentage = async (percentageId) => {
    try {
      setLoading(true);
      const response = await configBillApi.deletePercentPriceConfig(percentageId);
      
      if (response.message) {
        setPercentagePrices(percentagePrices.filter(item => item.id !== percentageId));
        showAlert(response.message || "Percentage price deleted successfully!");
      } else {
        throw new Error(response.message || "Unknown error");
      }
    } catch (error) {
      console.error('Error deleting percentage price:', error);
      showAlert('Failed to delete percentage price. Please try again.', "error");
    } finally {
      setLoading(false);
    }
  };

  // Helper function to fetch stair price config
  const fetchStairPriceConfig = async () => {
    try {
      setLoading(true);
      const response = await configBillApi.getStairPriceConfig();
      
      // if (response.data) {
        // Transform API data to match component state structure
        const formattedData = response.data?.map(item => ({
          id: item.id,
          min: item.minKwh,
          max: item.maxKwh || null,
          price: item.price,
          name: `Tier ${item.step} (${item.minKwh}-${item.maxKwh || 'Vô cùng'} kWh)`,
          step: item.step
        })) || [];
        
        // Sort tiers by step number
        formattedData.sort((a, b) => a.step - b.step);
        setPriceTiers(formattedData);
      // } else {
      //   throw new Error(response.message || "Failed to fetch tier data");
      // }
    } catch (error) {
      console.error("Error fetching stair price config:", error);
      showAlert("Lỗi khi tải cấu hình giá theo bậc", "error");
    } finally {
      setLoading(false);
    }
  };

  // Helper function to fetch percentage price config
  const fetchPercentPriceConfig = async () => {
    try {
      setLoading(true);
      const response = await configBillApi.getPercentPriceConfig();
      
      // if (response.data) {
        // Transform API data to match component state structure
        const formattedData = response.data?.map(item => ({
          id: item.id,
          name: item.name,
          price: item.price,
          percentage: item.percent
        })) || [];
        
        setPercentagePrices(formattedData);
      // } else {
      //   throw new Error(response.message || "Failed to fetch percentage price data");
      // }
    } catch (error) {
      console.error("Error fetching percentage price config:", error);
      showAlert("Failed to load percentage price configuration", "error");
    } finally {
      setLoading(false);
    }
  };

  // Function to fetch billing start date
  const fetchBillingStartDate = async () => {
    try {
      setLoading(true);
      const response = await configBillApi.getStartBillingDate();
      // if (response.data) {
        setBillingStartDate(response.data?.billingCycleStartDay);
      // } else {
      //   throw new Error(response.message || "Failed to fetch billing start date");
      // }
    } catch (error) {
      console.error("Error fetching billing start date:", error);
      // showAlert("Failed to load billing start date", "error");
    } finally {
      setLoading(false);
    }
  };

  // Function to save billing start date
  const handleSaveBillingStartDate = async () => {
    try {
      setLoading(true);
      const response = await configBillApi.editStartBillingDate(Number(billingStartDate));
      
      if (response.message) {
        showAlert(response.message || "Billing start date updated successfully!");
      } else {
        throw new Error(response.message || "Unknown error");
      }
    } catch (error) {
      console.error('Error saving billing start date:', error);
      showAlert('Failed to save billing start date. Please try again.', "error");
    } finally {
      setLoading(false);
    }
  };

  // Handle billing start date input change
  const handleBillingStartDateChange = (e) => {
    const value = e.target.value.replace(/[^0-9]/g, '');
    const numValue = value === '' ? 1 : parseInt(value, 10);
    
    // Make sure the value is between 1 and 28
    if (numValue >= 1 && numValue <= 28) {
      setBillingStartDate(numValue);
    }
  };

  // Fetch initial pricing data - updated to include config type
  useEffect(() => {
    const fetchInitialData = async () => {
      await fetchConfigType();
      await fetchBillingStartDate(); // Add this line
      await fetchOnePriceConfig();
      await fetchPercentPriceConfig();
      await fetchStairPriceConfig();
    };

    fetchInitialData();
  }, []);

  // Single price config fetch
  const fetchOnePriceConfig = async () => {
    try {
      setLoading(true);
      const response = await configBillApi.getOnePriceConfig();
      // if (response.data) {
        setSinglePrice(response.data.price);
        setOnePriceId(response.data.id);
      // } else {
      //   throw new Error(response.message || "Failed to fetch single price data");
      // }
    } catch (error) {
      console.error("Error fetching one price config:", error);
      showAlert("Failed to load single price configuration", "error");
    } finally {
      setLoading(false);
    }
  };

  // toastify
  const showAlert = (message, severity = "success") => {
    if (severity === "error") {
      toast.error(message);
    } else if (severity === "warning") {
      toast.warning(message);
    } else if (severity === "info") {
      toast.info(message);
    } else {
      toast.success(message);
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
        title="Cấu hình giá điện" 
        subtitle="Thiết lập các mức giá" 
      />
      
      {/* Add ToastContainer to render toasts */}
      <ToastContainer />
      
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
                Cách tính giá điện
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
                      label="Giá điện theo bậc" 
                    />
                    <FormControlLabel 
                      value="single" 
                      control={<Radio sx={{ '&.Mui-checked': {color: colors.primary[100]} }}/>} 
                      label="Giá điện theo mức đơn" 
                    />
                    <FormControlLabel 
                      value="percentage" 
                      control={<Radio sx={{ '&.Mui-checked': {color: colors.primary[100]} }}/>} 
                      label="Giá điện theo phần trăm" 
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
                  sx={{
                    fontSize: "14px",
                  }}
                >
                  Lưu
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Box>

        {/* Billing Cycle Start Date Box - Add this new section */}
        <Box gridColumn={{ xs: "span 12", md: "span 12" }}>
          <Card sx={{ backgroundColor: colors.primary[400], boxShadow: 3, mb: { xs: 2, sm: 3 } }}>
            <CardContent sx={{ p: { xs: 1.5, sm: 3 } }}>
              <Typography 
                variant={isMobile ? "h5" : "h4"} 
                color={colors.grey[100]} 
                fontWeight="bold"
                mb={2}
              >
                Cấu hình ngày bắt đầu chu kỳ
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
                  label="Ngày bắt đầu tính tiền điện (1-28)"
                  value={billingStartDate}
                  onChange={handleBillingStartDateChange}
                  size={isMobile ? "small" : "medium"}
                  disabled={loading}
                  type="number"
                  inputProps={{ min: 1, max: 28 }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      fontSize: "16px",
                    },
                    "& .MuiInputLabel-root.Mui-focused": { color: colors.primary[100] },
                  }}
                />
                <Button
                  variant="contained"
                  color="secondary"
                  startIcon={<SaveIcon />}
                  onClick={handleSaveBillingStartDate}
                  disabled={loading}
                  size={isMobile ? "small" : "medium"}
                  sx={{
                    fontSize: "14px",
                  }}
                >
                  {loading ? "Lưu..." : "Lưu"}
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
                Giá điện theo mức đơn
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
                  label="Giá (VND/kWh)"
                  value={singlePrice}
                  onChange={handleSinglePriceChange}
                  size={isMobile ? "small" : "medium"}
                  disabled={loading}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      fontSize: "16px",
                    },
                    "& .MuiInputLabel-root.Mui-focused": { color: colors.primary[100] },
                  }}
                />
                <Button
                  variant="contained"
                  color="secondary"
                  startIcon={<SaveIcon />}
                  onClick={handleSaveSinglePrice}
                  disabled={loading}
                  size={isMobile ? "small" : "medium"}
                  sx={{
                    fontSize: "14px",
                  }}
                >
                  {loading ? "Lưu..." : "Lưu"}
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
                  Giá điện theo bậc
                </Typography>
                <Button
                  variant="contained"
                  color="secondary"
                  startIcon={<AddIcon />}
                  onClick={() => openTierModal()}
                  size={isMobile ? "small" : "medium"}
                  sx={{
                    fontSize: "14px",
                  }}
                >
                  Thêm
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
                    <Typography variant={isMobile ? "body2" : "body1"} mr={1}>Khoảng:</Typography>
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
                    <Typography variant={isMobile ? "body2" : "body1"} mr={1}>Giá:</Typography>
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
                  Giá điện theo phần trăm
                </Typography>
                <Button
                  variant="contained"
                  color="secondary"
                  startIcon={<AddIcon />}
                  onClick={() => openPercentageModal()}
                  size={isMobile ? "small" : "medium"}
                  sx={{
                    fontSize: "14px",
                  }}
                >
                  Thêm
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
                    <Typography variant={isMobile ? "body2" : "body1"} mr={1}>Phần trăm:</Typography>
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
                    <Typography variant={isMobile ? "body2" : "body1"} mr={1}>Giá:</Typography>
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
              label="Tên bậc giá"
              name="name"
              value={newTier.name}
              onChange={handleTierInputChange}
              fullWidth
              margin="normal"
              size={isMobile ? "small" : "medium"}
              sx={{ 
                mt: { xs: 1, sm: 2 },
                "& .MuiOutlinedInput-root": {
                      fontSize: "16px",
                    },
                "& .MuiInputLabel-root.Mui-focused": { color: colors.primary[100] }
              }}
            />
            <TextField
              label="kWh cận dưới"
              name="min"
              value={newTier.min}
              onChange={handleTierInputChange}
              fullWidth
              margin="normal"
              size={isMobile ? "small" : "medium"}
              sx={{ 
                "& .MuiOutlinedInput-root": {
                      fontSize: "16px",
                    },
                "& .MuiInputLabel-root.Mui-focused": { color: colors.primary[100] }
              }}
            />
            <TextField
              label="kWh cận trên (để trống nếu không giới hạn)"
              name="max"
              value={newTier.max === null ? "" : newTier.max}
              onChange={handleTierInputChange}
              fullWidth
              margin="normal"
              helperText="Để trống nếu không giới hạn"
              size={isMobile ? "small" : "medium"}
              sx={{
                "& .MuiOutlinedInput-root": {
                  fontSize: "16px",
                },
                "& .MuiInputLabel-root.Mui-focused": { color: colors.primary[100] }
              }}
            />
            <TextField
              label="Giá (VND/kWh)"
              name="price"
              value={newTier.price}
              onChange={handleTierInputChange}
              fullWidth
              margin="normal"
              size={isMobile ? "small" : "medium"}
              sx={{ 
                "& .MuiOutlinedInput-root": {
                      fontSize: "16px",
                    },
                "& .MuiInputLabel-root.Mui-focused": { color: colors.primary[100] }
              }}
            />
          </Box>
          
          {/* Modal actions */}
          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
            <Button 
              onClick={() => setTierModalOpen(false)} 
              disabled={loading}
              size={isMobile ? "small" : "medium"}
              sx={{ 
                color: colors.grey[100], 
              }}
            >
              Hủy
            </Button>
            <Button 
              onClick={handleSaveTier}
              variant="contained" 
              color="secondary"
              disabled={loading}
              size={isMobile ? "small" : "medium"}
              sx={{
                fontSize: "14px",
              }}
            >
              {loading ? "Lưu..." : "Lưu"}
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
              label="Tên loại giá"
              name="name"
              value={newPercentage.name}
              onChange={handlePercentageInputChange}
              fullWidth
              margin="normal"
              size={isMobile ? "small" : "medium"}
              sx={{
                mt: { xs: 1, sm: 2 },
                "& .MuiOutlinedInput-root": {
                      fontSize: "16px",
                    },
                "& .MuiInputLabel-root.Mui-focused": { color: colors.primary[100] }
              }}
            />
            <TextField
              label="Phần trăm (%)"
              name="percentage"
              value={newPercentage.percentage}
              onChange={handlePercentageInputChange}
              fullWidth
              margin="normal"
              size={isMobile ? "small" : "medium"}
              sx={{
                "& .MuiOutlinedInput-root": {
                  fontSize: "16px",
                },
                "& .MuiInputLabel-root.Mui-focused": { color: colors.primary[100] }
              }}
            />
            <TextField
              label="Giá (VND/kWh)"
              name="price"
              value={newPercentage.price}
              onChange={handlePercentageInputChange}
              fullWidth
              margin="normal"
              size={isMobile ? "small" : "medium"}
              sx={{
                "& .MuiOutlinedInput-root": {
                  fontSize: "16px",
                },
                "& .MuiInputLabel-root.Mui-focused": { color: colors.primary[100] }
              }}
            />
          </Box>
          
          {/* Modal actions */}
          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
            <Button 
              onClick={() => setPercentageModalOpen(false)} 
              disabled={loading}
              size={isMobile ? "small" : "medium"}
              sx={{ 
                color: colors.grey[100], 
              }}
            >
              Hủy
            </Button>
            <Button 
              onClick={handleSavePercentage}
              variant="contained" 
              color="secondary"
              disabled={loading}
              size={isMobile ? "small" : "medium"}
              sx={{
                fontSize: "14px",
              }}
            >
              {loading ? "Lưu..." : "Lưu"}
            </Button>
          </Box>
        </Box>
      </Modal>
    </Box>
  );
};

export default ConfigBill;