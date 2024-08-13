import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import "./bus.css";

function Bus() {
  const location = useLocation();
  const { buses } = location.state || { buses: [] };
  const [ticketData, setTicketData] = useState(null);
  const [busId, setBusId] = useState(null);
  const [seatNumber, setSeatNumber] = useState(null);

  const handleSeatBooking = (busId, seatNumber) => {
    setBusId(busId);
    setSeatNumber(seatNumber);
  };

  const handleCompleteBooking = (data) => {
    setTicketData(data);
  };

  return (
    <div>
      <h1>Available Buses</h1>
      {!ticketData ? (
        <>
          {buses.length === 0 ? (
            <p>No buses available for the selected route and date.</p>
          ) : (
            <ul>
              {buses.map((bus, index) => (
                <li key={index}>
                  {bus.bus_name} - {bus.departure} to {bus.destination} on {bus.travel_date}
                  <SelectSeats busId={bus.bus_id} onSeatBooked={handleSeatBooking} />
                </li>
              ))}
            </ul>
          )}
          {busId && seatNumber && (
            <BookingForm busId={busId} seatNumber={seatNumber} onComplete={handleCompleteBooking} />
          )}
        </>
      ) : (
        <Ticket ticketData={ticketData} />
      )}
    </div>
  );
}

function SelectSeats({ busId, onSeatBooked }) {
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

  const handleSeatBooking = () => {
    if (selectedSeat) {
      onSeatBooked(busId, selectedSeat.seat_number);
    } else {
      alert('Please select a seat to book.');
    }
  };

  const renderSeatRows = () => {
    const rows = [];
    const seatsPerRow = 4;

    for (let i = 0; i < seats.length; i += seatsPerRow) {
      const rowSeats = seats.slice(i, i + seatsPerRow);
      rows.push(
        <div className="seat-row" key={`row-${i}`}>
          {rowSeats.map((seat) => (
            <div
              key={seat.seat_id}
              className={`seat ${selectedSeat && selectedSeat.seat_id === seat.seat_id ? 'selected' : ''}`}
              onClick={() => handleSeatSelection(seat)}
            >
              {seat.seat_number}
            </div>
          ))}
        </div>
      );
    }

    return rows;
  };

  return (
    <div>
      <h2>Select Seats</h2>
      {seats.length === 0 ? (
        <p>No seats available for this bus.</p>
      ) : (
        <div className="seat-container">
          {renderSeatRows()}
        </div>
      )}
      {selectedSeat && (
        <div className="selected-seat">
          <p>Selected Seat: {selectedSeat.seat_number}</p>
          <button onClick={handleSeatBooking}>Book Seat</button>
        </div>
      )}
    </div>
  );
}

function BookingForm({ busId, seatNumber, onComplete }) {
  const [name, setName] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name || !paymentMethod) {
      alert('Please fill in all details');
      return;
    }

    try {
      const response = await fetch('http://127.0.0.1:8000/complete_booking', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          bus_id: busId,
          seat_number: seatNumber,
          name: name,
          payment_method: paymentMethod,
        }),
      });

      if (response.ok) {
        const ticketData = await response.json();
        onComplete(ticketData);
      } else {
        const error = await response.json();
        alert(error.detail);
      }
    } catch (error) {
      console.error('Failed to complete booking', error);
      alert('Failed to complete booking');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Complete Your Booking</h2>
      <div>
        <label htmlFor="name">Name:</label>
        <input
          type="text"
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>
      <div>
        <label htmlFor="paymentMethod">Payment Method:</label>
        <select
          id="paymentMethod"
          value={paymentMethod}
          onChange={(e) => setPaymentMethod(e.target.value)}
        >
          <option value="">Select</option>
          <option value="credit_card">Credit Card</option>
          <option value="paypal">PayPal</option>
          <option value="mobile_money">Mobile Money</option>
        </select>
      </div>
      <button type="submit">Confirm and Generate Ticket</button>
    </form>
  );
}

function Ticket({ ticketData }) {
  return (
    <div>
      <h2>Your Ticket</h2>
      <p>Bus: {ticketData.bus_name}</p>
      <p>Seat: {ticketData.seat_number}</p>
      <p>Name: {ticketData.name}</p>
      <p>Date: {ticketData.travel_date}</p>
      <p>Payment Method: {ticketData.payment_method}</p>
      <button onClick={() => window.print()}>Print Ticket</button>
    </div>
  );
}

export default Bus;
