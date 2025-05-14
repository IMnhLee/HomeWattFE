import { useState } from "react";
import {
  Box,
  Typography,
  useTheme,
  Modal,
  Button,
  Alert,
  Snackbar,
  Chip,
  LinearProgress,
  Divider,
  Stack,
  Avatar,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import {
  DataGrid,
  GridActionsCellItem,
  GridToolbar,
} from "@mui/x-data-grid";
import {
  Person,
  Visibility,
  LockOpen,
  Lock,
  Delete,
  PhoneAndroid,
  LocationOn,
  Email,
} from "@mui/icons-material";
import { tokens } from "../../theme";
import Header from "../../components/Header";

// Mock data
const mockUsers = [
  {
    id: 1,
    username: "johndoe",
    email: "john.doe@example.com",
    phoneNumber: "0901234567",
    address: "123 Nguyễn Văn A, Quận 1, TP.HCM",
    role: "user",
    isLocked: false,
  },
  {
    id: 2,
    username: "janedoe",
    email: "jane.doe@example.com",
    phoneNumber: "0909876543",
    address: "456 Lê Lợi, Quận 3, TP.HCM",
    role: "admin",
    isLocked: false,
  },
  {
    id: 3,
    username: "robertsmith",
    email: "robert.smith@example.com",
    phoneNumber: "0908765432",
    address: "789 Trần Hưng Đạo, Quận 5, TP.HCM",
    role: "user",
    isLocked: true,
  },
  {
    id: 4,
    username: "sarahjones",
    email: "sarah.jones@example.com",
    phoneNumber: "0907654321",
    address: "101 Nguyễn Huệ, Quận 1, TP.HCM",
    role: "user",
    isLocked: false,
  },
  {
    id: 5,
    username: "michaelbrown",
    email: "michael.brown@example.com",
    phoneNumber: "0906543210",
    address: "202 Lý Tự Trọng, Quận 1, TP.HCM",
    role: "manager",
    isLocked: false,
  },
];

// Mock devices data
const mockDevices = {
  1: [
    { id: 101, name: "Smart Meter XYZ", location: "Phòng khách", status: "active" },
    { id: 102, name: "Power Monitor 2000", location: "Phòng ngủ", status: "active" },
  ],
  2: [
    { id: 201, name: "EnergyTracker Pro", location: "Văn phòng", status: "inactive" },
  ],
  3: [
    { id: 301, name: "SmartPlug v3", location: "Nhà bếp", status: "active" },
    { id: 302, name: "PowerSave 5", location: "Phòng tắm", status: "active" },
    { id: 303, name: "EcoMonitor", location: "Ban công", status: "active" },
  ],
  4: [],
  5: [
    { id: 501, name: "EnergyHub XL", location: "Phòng làm việc", status: "active" },
  ],
};

const ManageUser = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  
  // Thêm index vào dữ liệu
  const [users, setUsers] = useState(() => 
    mockUsers.map((user, index) => ({
      ...user,
      index: index + 1 // Thêm STT trực tiếp vào dữ liệu
    }))
  );
  const [loading, setLoading] = useState(false);
  
  // State cho modal
  const [modalState, setModalState] = useState({
    type: null, // 'detail', 'lock', 'delete'
    open: false,
    userId: null,
    userData: null,
    devices: [],
    loadingDevices: false,
    username: "",
    currentStatus: false
  });
  
  // State thông báo
  const [notification, setNotification] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const showNotification = (message, severity = "success") => {
    setNotification({ open: true, message, severity });
  };

  const closeNotification = () => {
    setNotification((prev) => ({ ...prev, open: false }));
  };

  const closeModal = () => {
    setModalState(prev => ({ ...prev, open: false, type: null }));
  };

  // Xử lý xem chi tiết người dùng
  const handleViewDetail = (userId) => {
    const user = users.find(user => user.id === userId);
    setModalState({
      type: 'detail',
      open: true,
      userId,
      userData: user,
      devices: [],
      loadingDevices: true
    });

    // Giả lập lấy dữ liệu thiết bị
    setTimeout(() => {
      const userDevices = mockDevices[userId] || [];
      setModalState(prev => ({
        ...prev,
        devices: userDevices,
        loadingDevices: false
      }));
    }, 700);
  };

  // Xử lý khóa/mở khóa tài khoản
  const handleLockToggle = (userId, username, isLocked) => {
    setModalState({
      type: 'lock',
      open: true,
      userId,
      username,
      currentStatus: isLocked
    });
  };

  const confirmLockToggle = () => {
    // Giả lập API call
    const updatedUsers = users.map(user =>
      user.id === modalState.userId
        ? { ...user, isLocked: !modalState.currentStatus }
        : user
    );
    
    setUsers(updatedUsers);

    const message = modalState.currentStatus
      ? "Mở khóa tài khoản thành công"
      : "Khóa tài khoản thành công";
    
    showNotification(message);
    closeModal();
  };

  // Xử lý xóa tài khoản
  const handleDelete = (userId) => {
    setModalState({
      type: 'delete',
      open: true,
      userId
    });
  };

  const confirmDelete = () => {
    // Giả lập API call
    const filteredUsers = users
      .filter(user => user.id !== modalState.userId)
      .map((user, index) => ({ ...user, index: index + 1 })); // Cập nhật lại STT
      
    setUsers(filteredUsers);
    showNotification("Xóa tài khoản thành công");
    closeModal();
  };

  // Định nghĩa cột
  const columns = [
    {
      field: "index",
      headerName: "STT",
      width: 60,
      sortable: false,
    },
    {
      field: "username",
      headerName: "Tên người dùng",
      minWidth: 150,
      flex: 1,
    },
    {
      field: "email",
      headerName: "Email",
      minWidth: 200,
      flex: 1,
    },
    {
      field: "phoneNumber",
      headerName: "Số điện thoại",
      minWidth: 120,
      flex: 1,
      renderCell: (params) => params.value || "—"
    },
    {
      field: "address",
      headerName: "Địa chỉ",
      minWidth: 200,
      flex: 1,
      renderCell: (params) => params.value || "—"
    },
    {
      field: "role",
      headerName: "Vai trò",
      width: 120,
      renderCell: (params) => {
        const role = params.value;
        let color;
        switch (role) {
          case "admin":
            color = colors.redAccent[500];
            break;
          case "manager":
            color = colors.blueAccent[500];
            break;
          default:
            color = colors.greenAccent[600];
        }
        return (
          <Chip
            label={role.toUpperCase()}
            size="small"
            sx={{
              bgcolor: color,
              color: "#fff",
              fontWeight: "bold",
            }}
          />
        );
      },
    },
    {
      field: "isLocked",
      headerName: "Trạng thái",
      width: 120,
      renderCell: (params) => {
        const isLocked = params.value;
        return (
          <Chip
            label={isLocked ? "KHÓA" : "HOẠT ĐỘNG"}
            size="small"
            color={isLocked ? "error" : "success"}
          />
        );
      },
    },
    {
      field: "actions",
      type: "actions",
      headerName: "Hành động",
      width: 120,
      getActions: (params) => [
        <GridActionsCellItem
          icon={<Visibility />}
          label="Chi tiết"
          onClick={() => handleViewDetail(params.row.id)}
          sx={{ color: colors.blueAccent[300] }}
        />,
        <GridActionsCellItem
          icon={params.row.isLocked ? <LockOpen /> : <Lock />}
          label={params.row.isLocked ? "Mở khóa" : "Khóa"}
          onClick={() => handleLockToggle(params.row.id, params.row.username, params.row.isLocked)}
          sx={{ color: params.row.isLocked ? colors.greenAccent[400] : colors.redAccent[300] }}
        />,
        <GridActionsCellItem
          icon={<Delete />}
          label="Xóa"
          onClick={() => handleDelete(params.row.id)}
          sx={{ color: colors.redAccent[500] }}
        />,
      ],
    },
  ];
  
  // Style modal
  const modalStyle = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 500,
    bgcolor: colors.primary[400],
    border: `1px solid ${colors.primary[500]}`,
    boxShadow: 24,
    p: 4,
    borderRadius: 1,
    maxHeight: '80vh',
    overflow: 'auto',
  };

  // Render modal chi tiết người dùng
  const renderDetailModal = () => (
    <Modal open={modalState.open} onClose={closeModal}>
      <Box sx={modalStyle}>
        <Typography variant="h3" component="h2" mb={2}>
          Chi tiết người dùng
        </Typography>
        
        {modalState.userData && (
          <>
            <Stack 
              direction="row" 
              spacing={2} 
              alignItems="center" 
              mb={3}
              pb={2}
              sx={{ borderBottom: `1px solid ${colors.primary[300]}` }}
            >
              <Avatar 
                sx={{ 
                  width: 64, 
                  height: 64, 
                  bgcolor: colors.greenAccent[600],
                  color: colors.grey[100]
                }}
              >
                <Person fontSize="large" />
              </Avatar>
            <Box>
              <Typography variant="h4" fontWeight="bold">
                {modalState.userData.username}
              </Typography>
              <Chip
                label={modalState.userData.role.toUpperCase()}
                size="small"
                sx={{
                  bgcolor: modalState.userData.role === "admin" 
                    ? colors.redAccent[500] 
                    : modalState.userData.role === "manager" 
                      ? colors.blueAccent[500] 
                      : colors.greenAccent[600],
                  color: "#fff",
                  fontWeight: "bold",
                  mt: 1
                }}
              />
            </Box>
          </Stack>

          {/* <Paper 
            elevation={0} 
            sx={{ 
              backgroundColor: colors.primary[500], 
              p: 2, 
              mb: 3,
              borderRadius: 1
            }}
          > */}
            <List sx={{ width: '100%', p: 0 }}>
              <ListItem sx={{ px: 0 }}>
                <ListItemText
                  primary="ID người dùng"
                  secondary={modalState.userData.id}
                />
              </ListItem>
              <Divider component="li" sx={{ borderColor: colors.primary[400] }} />
              
              <ListItem sx={{ px: 0 }}>
                <ListItemIcon sx={{ minWidth: 36 }}>
                  <Email fontSize="small" sx={{ color: colors.grey[300] }} />
                </ListItemIcon>
                <ListItemText 
                  primary={modalState.userData.email}
                />
              </ListItem>
              <Divider component="li" sx={{ borderColor: colors.primary[400] }} />
              
              <ListItem sx={{ px: 0 }}>
                <ListItemIcon sx={{ minWidth: 36 }}>
                  <PhoneAndroid fontSize="small" sx={{ color: colors.grey[300] }} />
                </ListItemIcon>
                <ListItemText 
                  primary={modalState.userData.phoneNumber}
                />
              </ListItem>
              <Divider component="li" sx={{ borderColor: colors.primary[400] }} />
              
              <ListItem sx={{ px: 0 }}>
                <ListItemIcon sx={{ minWidth: 36 }}>
                  <LocationOn fontSize="small" sx={{ color: colors.grey[300] }} />
                </ListItemIcon>
                <ListItemText 
                  primary={modalState.userData.address}
                />
              </ListItem>
              <Divider component="li" sx={{ borderColor: colors.primary[400] }} />
              
              <ListItem sx={{ px: 0 }}>
                <ListItemText
                  primary="Trạng thái"
                  secondary={
                    <Chip
                      label={modalState.userData.isLocked ? "TÀI KHOẢN BỊ KHÓA" : "ĐANG HOẠT ĐỘNG"}
                      size="small"
                      color={modalState.userData.isLocked ? "error" : "success"}
                    />
                  }
                />
              </ListItem>
            </List>
          {/* </Paper> */}

            <Typography variant="h5" mb={2}>
              Danh sách thiết bị
            </Typography>
            
            {modalState.loadingDevices ? (
              <LinearProgress sx={{ mb: 2 }} />
            ) : modalState.devices.length > 0 ? (
              <Box sx={{ maxHeight: '200px', overflowY: 'auto' }}>
                {modalState.devices.map((device) => (
                  <Box
                    key={device.id}
                    sx={{
                      p: 2,
                      mb: 1,
                      bgcolor: colors.primary[700],
                      borderRadius: 1,
                    }}
                  >
                    <Typography variant="body1" fontWeight="bold">
                      {device.name}
                    </Typography>
                    <Typography variant="body2" color={colors.grey[300]}>
                      Vị trí: {device.location}
                    </Typography>
                    <Typography variant="body2">
                      Trạng thái: 
                      <Chip
                        label={device.status === "active" ? "HOẠT ĐỘNG" : "KHÔNG HOẠT ĐỘNG"}
                        size="small"
                        color={device.status === "active" ? "success" : "error"}
                        sx={{ ml: 1 }}
                      />
                    </Typography>
                  </Box>
                ))}
              </Box>
            ) : (
              <Typography variant="body1" color={colors.grey[300]}>
                Người dùng không có thiết bị nào.
              </Typography>
            )}
          </>
        )}

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
          <Button onClick={closeModal} variant="contained" color="primary">
            Đóng
          </Button>
        </Box>
      </Box>
    </Modal>
  );

  // Render modal khóa/mở khóa tài khoản
  const renderLockModal = () => (
    <Modal open={modalState.open} onClose={closeModal}>
      <Box sx={modalStyle}>
        <Typography variant="h4" mb={2}>
          {modalState.currentStatus ? "Mở khóa tài khoản" : "Khóa tài khoản"}
        </Typography>
        <Typography variant="body1" mb={3}>
          {`Bạn có chắc chắn muốn ${modalState.currentStatus ? "mở khóa" : "khóa"} tài khoản của người dùng "${modalState.username}" không?`}
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
          <Button onClick={closeModal} color="inherit">
            Hủy
          </Button>
          <Button
            onClick={confirmLockToggle}
            color={modalState.currentStatus ? "success" : "error"}
            variant="contained"
            autoFocus
          >
            {modalState.currentStatus ? "Mở khóa" : "Khóa"}
          </Button>
        </Box>
      </Box>
    </Modal>
  );

  // Render modal xóa tài khoản
  const renderDeleteModal = () => (
    <Modal open={modalState.open} onClose={closeModal}>
      <Box sx={modalStyle}>
        <Typography variant="h4" mb={2}>
          Xóa tài khoản
        </Typography>
        <Typography variant="body1" mb={3}>
          Bạn có chắc chắn muốn xóa tài khoản người dùng này không? Hành động này không thể hoàn tác.
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
          <Button onClick={closeModal} color="inherit">
            Hủy
          </Button>
          <Button 
            onClick={confirmDelete} 
            color="error" 
            variant="contained" 
            autoFocus
          >
            Xóa
          </Button>
        </Box>
      </Box>
    </Modal>
  );

  // Render modal dựa vào loại
  const renderModal = () => {
    switch (modalState.type) {
      case 'detail':
        return renderDetailModal();
      case 'lock':
        return renderLockModal();
      case 'delete':
        return renderDeleteModal();
      default:
        return null;
    }
  };

  return (
    <Box m="20px">
      <Header title="QUẢN LÝ NGƯỜI DÙNG" subtitle="Danh sách và quản lý tài khoản người dùng" />

      <Box
        display="grid"
        gridTemplateColumns="repeat(12, 1fr)"
        gap="10px"
      >
        <Box
          gridColumn="span 12"
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
            rows={users}
            columns={columns}
            loading={loading}
            disableColumnMenu
            disableRowSelectionOnClick
            pagination
            pageSizeOptions={[5, 10, 25]}
            initialState={{
              pagination: { paginationModel: { pageSize: 10 } },
            }}
            // getRowHeight={() => 'auto'}
            slots={{ toolbar: GridToolbar }}
            slotProps={{
              toolbar: {
                showQuickFilter: true,
                quickFilterProps: { debounceMs: 500 },
              },
            }}
            
          />
        </Box>
        
      </Box>

      {renderModal()}

      <Snackbar
        open={notification.open}
        autoHideDuration={3000}
        onClose={closeNotification}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert
          onClose={closeNotification}
          severity={notification.severity}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ManageUser;