import axiosInstance from './axiosConfig';

export const forgotPassword = async (email) => {
  // Using the axios instance that points to https://localhost:7111/api
  return await axiosInstance.post('/Auth/forgot-password', { email });
};

export const resetPassword = async (resetData) => {
  // resetData: { email, token, newPassword }
  return await axiosInstance.post('/Auth/reset-password', resetData);
};
