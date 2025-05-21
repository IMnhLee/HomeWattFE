import { Navigate, useLocation } from "react-router-dom";

const PrivateRoute = ({ roles, children }) => {
  const location = useLocation();
  const userItem = localStorage.getItem("user");
  const access_token = localStorage.getItem("access_token");
  let user = null;

  try {
    user = JSON.parse(userItem);
  } catch (error) {
    console.error("Error parsing user data from local storage:", error);
  }

  if (!user || !roles.includes(user.role)) {
    return <Navigate to="/login" state={{ from: location }} />;
  }

  return children;
};

export default PrivateRoute;
