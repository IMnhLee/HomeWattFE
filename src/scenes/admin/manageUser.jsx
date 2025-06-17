import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  useTheme,
  Modal,
  Button,
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
import adminApi from "../../services/admin";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const ManageUser = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  
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

  // Fetch users data
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const response = await adminApi.getUsersWithMonitoring();
        const formattedUsers = response.data.map((item, index) => ({
          ...item.user,
          index: index + 1,
          monitoring: item.monitoring
        }));
        setUsers(formattedUsers);
      } catch (error) {
        console.error("Error fetching users:", error);
        toast.error("Lỗi khi tải dữ liệu người dùng");
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

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
      devices: user.monitoring || [],
      loadingDevices: false
    });
  };

  // Xử lý khóa/mở khóa tài khoản
  const handleLockToggle = (userId, username, isActive) => {
    setModalState({
      type: 'lock',
      open: true,
      userId,
      username,
      currentStatus: isActive
    });
  };

  const confirmLockToggle = async () => {
    try {
      setLoading(true);
      const newActiveStatus = !modalState.currentStatus;
      const response = await adminApi.manageUserActive(modalState.userId, newActiveStatus);
      
      if (response.data) {
        // Update the user in the local state
        const updatedUsers = users.map(user =>
          user.id === modalState.userId
            ? { ...user, active: response.data.active }
            : user
        );
        
        setUsers(updatedUsers);
        
        const message = response.message || 
          (response.data.active ? "Kích hoạt tài khoản thành công" : "Khóa tài khoản thành công");
        
        toast.success(message);
        closeModal();
      } else {
        throw new Error(response.message || "Unknown error");
      }
    } catch (error) {
      console.error('Error updating user status:', error);
      toast.error(error.response.data.message || 'Lỗi khi cập nhật trạng thái tài khoản');
    } finally {
      setLoading(false);
    }
  };

  // Xử lý xóa tài khoản
  const handleDelete = (userId) => {
    setModalState({
      type: 'delete',
      open: true,
      userId
    });
  };

  const confirmDelete = async () => {
    try {
      setLoading(true);
      const response = await adminApi.deleteUser(modalState.userId);
      
      if (response.message) {
        // Remove user from local state and update indices
        const filteredUsers = users
          .filter(user => user.id !== modalState.userId)
          .map((user, index) => ({ ...user, index: index + 1 }));
          
        setUsers(filteredUsers);
        toast.success(response.message);
        closeModal();
      } else {
        throw new Error("Unknown error occurred");
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error(error.response.data.message || 'Lỗi khi xóa tài khoản');
    } finally {
      setLoading(false);
    }
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
      renderCell: (params) => params.value || "—"
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
      field: "active",
      headerName: "Trạng thái",
      width: 120,
      renderCell: (params) => {
        const isActive = params.value;
        return (
          <Chip
            label={isActive ? "HOẠT ĐỘNG" : "KHÓA"}
            size="small"
            color={isActive ? "success" : "error"}
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
          icon={params.row.active ? <Lock /> : <LockOpen />}
          label={params.row.active ? "Khóa" : "Mở khóa"}
          onClick={() => handleLockToggle(params.row.id, params.row.username, params.row.active)}
          sx={{ color: params.row.active ? colors.redAccent[300] : colors.greenAccent[400] }}
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
                />
                <Chip
                  label={modalState.userData.active ? "ĐANG HOẠT ĐỘNG" : "TÀI KHOẢN BỊ KHÓA"}
                  size="small"
                  color={modalState.userData.active ? "success" : "error"}
                />
              </ListItem>
            </List>

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
                      bgcolor: colors.primary[500],
                      borderRadius: 1,
                    }}
                  >
                    <Typography variant="body1" fontWeight="bold">
                      Mã thiết bị: {device.code}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="body2">
                        Trạng thái:
                      </Typography>
                      <Chip
                        label={device.active ? "HOẠT ĐỘNG" : "KHÔNG HOẠT ĐỘNG"}
                        size="small"
                        color={device.active ? "success" : "error"}
                      />
                    </Box>
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
          <Button onClick={closeModal} variant="contained" color="secondary">
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
          {modalState.currentStatus ? "Khóa tài khoản" : "Kích hoạt tài khoản"}
        </Typography>
        <Typography variant="body1" mb={3}>
          {`Bạn có chắc chắn muốn ${modalState.currentStatus ? "khóa" : "kích hoạt"} tài khoản của người dùng "${modalState.username}" không?`}
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
          <Button onClick={closeModal} color="inherit">
            Hủy
          </Button>
          <Button
            onClick={confirmLockToggle}
            color={modalState.currentStatus ? "error" : "success"}
            variant="contained"
            autoFocus
            disabled={loading}
          >
            {modalState.currentStatus ? "Khóa" : "Kích hoạt"}
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
          <Button onClick={closeModal} color="inherit" disabled={loading}>
            Hủy
          </Button>
          <Button 
            onClick={confirmDelete} 
            color="error" 
            variant="contained" 
            autoFocus
            disabled={loading}
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
      <ToastContainer />
    </Box>
  );
};

export default ManageUser;