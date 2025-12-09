import { useSelector, useDispatch } from "react-redux";
import { loginUser, logout } from "../store/slices/authSlice";
import { useNavigate } from "react-router-dom";

export const useAuth = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { user, token, isAuthenticated, isLoading, error } = useSelector(
    (state) => state.auth
  );

  const login = async (credentials) => {
    const resultAction = await dispatch(loginUser(credentials));
    if (loginUser.fulfilled.match(resultAction)) {
      navigate("/dashboard");
      return true;
    }
    return false;
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  return {
    user,
    token,
    isAuthenticated,
    isLoading,
    error,
    login,
    logout: handleLogout,
  };
};
