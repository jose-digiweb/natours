/*eslint-disable*/
import '@babel/polyfill';
import axios from 'axios';
import { showAlert } from './alerts';

// TYPE IS EITHER "PASSWORD" OR "DATA"
export const updateSettings = async (data, type) => {
  try {
    const passUrl = '/api/v1/users/updateMyPassword';
    const dataUrl = '/api/v1/users/updateMe';
    const url = type === 'password' ? passUrl : dataUrl;

    const res = await axios({
      method: 'PATCH',
      url,
      data,
    });

    console.log(res.data.status);
    if (res.data.status === 'success') {
      showAlert('success', `Your "${type.toUpperCase()}" has been successfully updated!`);
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};
