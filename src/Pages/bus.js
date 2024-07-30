import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

function Bus() {
  const location = useLocation();
  const { buses } = location.state || { buses: [] };

  return (
    <div>
      <h1>Available Buses</h1>
      {buses.length === 0 ? (
        <p>No buses available for the selected route and date.</p>
      ) : (
        <ul>
          {buses.map((bus, index) => (
            <li key={index}>
              {bus.bus_name} - {bus.departure} to {bus.destination} on {bus.travel_date}
              <SelectSeats busId={bus.bus_id} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function SelectSeats({ busId }) {
  const [seats, setSeats] = useState([]);
  const [selectedSeat, setSelectedSeat] = useState(null);

  useEffect(() => {
    const fetchSeats = async () => {
      try {
        const response = await fetch(`http://127.0.0.1:8000/seats_available/${busId}`);
        if (response.ok) {
          const seatsData = await response.json();
          setSeats(seatsData.seats);
        } else {
          console.error('Failed to fetch seats');
        }
      } catch (error) {
        console.error('Error fetching seats', error);
      }
    };

    fetchSeats();
  }, [busId]);

  const handleSeatSelection = (seat) => {
    setSelectedSeat(seat);
  };

  const handleSeatBooking = async () => {
    if (!selectedSeat) {
      alert('Please select a seat to book.');
      return;
    }

    try {
      const response = await fetch('http://127.0.0.1:8000/book_seat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          bus_id: busId,
          seat_number: selectedSeat.seat_number,
        }),
      });

      if (response.ok) {
        alert('Seat booked successfully');
        setSeats(seats.filter(seat => seat.seat_number !== selectedSeat.seat_number));
        setSelectedSeat(null);
      } else {
        const error = await response.json();
        alert(error.detail);
      }
    } catch (error) {
      console.error('Failed to book seat', error);
      alert('Failed to book seat');
    }
  };

  return (
    <div>
      <h2>Select Seats</h2>
      {seats.length === 0 ? (
        <p>No seats available for this bus.</p>
      ) : (
        <ul>
          {seats.map((seat) => (
            <li key={seat.seat_id}>
              Seat {seat.seat_number}
              <button onClick={() => handleSeatSelection(seat)}>Select</button>
            </li>
          ))}
        </ul>
      )}
      {selectedSeat && (
        <div>
          <p>Selected Seat: {selectedSeat.seat_number}</p>
          <button onClick={handleSeatBooking}>Book Seat</button>
        </div>
      )}
    </div>
  );
}

export default Bus;
