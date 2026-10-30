const API_URL = 'http://localhost:5000/api'


export async function registerUser(userData) {
    console.log(userData);
  const response = await fetch(`${API_URL}/auth/send-otp`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(userData),
  })
   const data = await response.json()

  if (!response.ok) {
    throw new Error(data.message || 'Registration failed')
  }

  return data
}

export const addAddressAPI = async (addressData) => {
  const token = localStorage.getItem('token');
  const response = await fetch('http://localhost:5000/api/addresses', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(addressData),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Address save nahi ho paya');
  }
  return response.json();
};