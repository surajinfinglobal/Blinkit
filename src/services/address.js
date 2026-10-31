
export const addAddressAPI = async (addressData) => {
  const token = localStorage.getItem('token');
   if (!token) {
    throw new Error('Please login first. Authentication token nahi mila.');
  }

  const response = await fetch('http://localhost:5000/api/addresses', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(addressData),
  });
    const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || 'Address save nahi ho paya');
  }
  return data;
};

// GET: logged-in user ke saved addresses fetch kar

export const getAddressesAPI = async () => {
  const token = localStorage.getItem('token');

  if (!token) {
    throw new Error('Please login first');
  }

  const response = await fetch('http://localhost:5000/api/addresses', {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || 'Addresses fetch nahi ho paye');
  }

  return data.addresses || [];
};

export const deleteAddressAPI = async (addressId)=>{
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('Please login first. Authentication token nahi mila.');
  }
  const response = await fetch(`http://localhost:5000/api/addresses/${addressId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || 'Address delete nahi hua');
  return data;
}