import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Welcome() {
  const [formData, setFormData] = useState({
    from_location: '',
    destination: '',
    date: '',
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    try {
      const response = await fetch('http://127.0.0.1:8000/search_buses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const buses = await response.json();
        navigate('/bus', { state: { buses } });
      } else {
        const error = await response.json();
        alert(error.detail);
      }
    } catch (error) {
      console.error('Failed to fetch', error);
      alert('Failed to fetch data from the server');
    }
    console.log(formData)
  };

  return (
    <div>
      <input
        type="text"
        name="from_location"
        placeholder="From Location"
        value={formData.from_location}
        onChange={handleChange}
      />
      <input
        type="text"
        name="destination"
        placeholder="Destination"
        value={formData.destination}
        onChange={handleChange}
      />
      <input
        type="date"
        name="date"
        placeholder="Travel Date"
        value={formData.date}
        onChange={handleChange}
      />
      <button onClick={handleSubmit}>Submit</button>
    </div>
  );
}

export default Welcome;
