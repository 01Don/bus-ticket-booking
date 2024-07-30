import React, { useState } from 'react';
import "./AddBus.css"

function AddBus() {
  const [busData, setBusData] = useState({
    name: '',
    departure: '',
    destination: '',
    travel_date: '',
    fare: '',
    seats: '', // Add seats to the state
  });

  const handleChange = (e) => {
    setBusData({ ...busData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://127.0.0.1:8000/add_bus', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(busData),
      });

      if (response.ok) {
        alert('Bus added successfully');
        // Reset form fields
        setBusData({
          name: '',
          departure: '',
          destination: '',
          travel_date: '',
          fare: '',
          seats: '',
        });
      } else {
        const error = await response.json();
        alert(error.detail);
      }
    } catch (error) {
      console.error("Failed to fetch", error);
      alert("Failed to add bus");
    }
  };

  return (
    <form onSubmit={handleSubmit} className='form'>
      <h1>Add New Bus</h1>
      <input
        type="text"
        name="name"
        placeholder="Bus Name"
        value={busData.name}
        onChange={handleChange}
      />
      <input
        type="text"
        name="departure"
        placeholder="Departure"
        value={busData.departure}
        onChange={handleChange}
      />
      <input
        type="text"
        name="destination"
        placeholder="Destination"
        value={busData.destination}
        onChange={handleChange}
      />
      <input
        type="date"
        name="travel_date"
        placeholder="Travel Date"
        value={busData.travel_date}
        onChange={handleChange}
      />
      <input
        type="number"
        name="fare"
        placeholder="Fare"
        value={busData.fare}
        onChange={handleChange}
      />
      <input
        type="number"
        name="seats"
        placeholder="Seats Available"
        value={busData.seats}
        onChange={handleChange}
      />
      <button type="submit">Add Bus</button>
    </form>
  );
}

export default AddBus;
