import React, { useState } from 'react';

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

function Bus() {
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
          {/* Assume SelectSeats is defined elsewhere and calls handleSeatBooking when a seat is booked */}
         
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

export default Bus;
