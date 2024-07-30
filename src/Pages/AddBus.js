import React, { useState, useEffect } from 'react';

function BusList() {
  const [buses, setBuses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBuses = async () => {
      try {
        const response = await fetch('http://127.0.0.1:8000/search_buses', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from_location: '',  // or provide default values or remove if optional
            destination: '',   // or provide default values or remove if optional
            date: '',           // or provide default values or remove if optional
          }),
        });

        if (response.ok) {
          const data = await response.json();
          setBuses(data);
        } else {
          const error = await response.json();
          alert(error.detail);
        }
      } catch (error) {
        console.error('Failed to fetch', error);
        alert('Failed to fetch buses');
      } finally {
        setLoading(false);
      }
    };

    fetchBuses();
  }, []);

  if (loading) {
    return <p>Loading buses...</p>;
  }

  return (
    <div>
      <h1>Available Buses</h1>
      {buses.length === 0 ? (
        <p>No buses available.</p>
      ) : (
        <ul>
          {buses.map((bus, index) => (
            <li key={index}>
              {bus.bus_name} - {bus.departure} to {bus.destination} on {bus.travel_date}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default BusList;
