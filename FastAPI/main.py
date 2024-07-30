from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import mysql.connector
from typing import List

app = FastAPI()

# Allow CORS for all origins (you can restrict this in production)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class Database:
    def __init__(self) -> None:
        self.conn = mysql.connector.connect(
            host="localhost",
            user="Don",
            password="password",
            database="bus_ticket_booking",
        )

    def __enter__(self):
        self.cursor = self.conn.cursor(dictionary=True)
        return self.cursor

    def __exit__(self, exc_type, exc_value, exc_traceback) -> None:
        if exc_type:
            self.conn.rollback()
        else:
            self.conn.commit()
        self.cursor.close()
        if self.conn.unread_result:
            self.conn.get_records()
        self.conn.close()

class Bus(BaseModel):
    name: str
    departure: str
    destination: str
    travel_date: str
    fare: float

class BusQuery(BaseModel):
    from_location: str
    destination: str
    date: str

class BookSeatRequest(BaseModel):
    bus_id: int
    seat_number: str


@app.post("/add_bus")
async def add_bus(bus: Bus):
    try:
        with Database() as cursor:
            query = """
                INSERT INTO buses (bus_name, departure, destination, travel_date, fare)
                VALUES (%s, %s, %s, %s, %s)
            """
            cursor.execute(query, (bus.name, bus.departure, bus.destination, bus.travel_date, bus.fare))
            bus_id = cursor.lastrowid

            seat_query = "INSERT INTO seats (bus_id, seat_number, is_booked) VALUES (%s, %s, %s)"
            for seat_number in range(1, bus.seats + 1):
                cursor.execute(seat_query, (bus_id, seat_number, False))
                
        return {"message": "Bus and seats added successfully"}
    except mysql.connector.Error as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/search_buses")
async def search_buses(query: BusQuery):
    try:
        with Database() as cursor:
            query_string = """
                SELECT bus_id, bus_name, departure, destination, travel_date, fare
                FROM buses 
                WHERE departure = %s AND destination = %s AND travel_date = %s
            """
            cursor.execute(query_string, (query.from_location, query.destination, query.date))
            buses = cursor.fetchall()
            if not buses:
                raise HTTPException(status_code=404, detail="No buses found")
            return buses
    except mysql.connector.Error as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/seats_available/{bus_id}")
async def get_seats_available(bus_id: int):
    try:
        with Database() as cursor:
            query = "SELECT seat_id, seat_number FROM seats WHERE bus_id = %s AND is_booked = FALSE"
            cursor.execute(query, (bus_id,))
            seats = cursor.fetchall()
            if not seats:
                return {"seats": []}
            return {"seats": seats}
    except mysql.connector.Error as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/book_seat")
async def book_seat(book_request: BookSeatRequest):
    try:
        with Database() as cursor:
            # Check if the seat is already booked
            query = "SELECT is_booked FROM seats WHERE bus_id = %s AND seat_number = %s"
            cursor.execute(query, (book_request.bus_id, book_request.seat_number))
            seat = cursor.fetchone()
            if not seat:
                raise HTTPException(status_code=404, detail="Seat not found")
            if seat["is_booked"]:
                raise HTTPException(status_code=400, detail="Seat already booked")

            # Mark the seat as booked
            update_query = "UPDATE seats SET is_booked = TRUE WHERE bus_id = %s AND seat_number = %s"
            cursor.execute(update_query, (book_request.bus_id, book_request.seat_number))

            # Fetch fare information
            fare_query = "SELECT fare FROM buses WHERE bus_id = %s"
            cursor.execute(fare_query, (book_request.bus_id,))
            bus = cursor.fetchone()
            if not bus:
                raise HTTPException(status_code=404, detail="Bus not found")

        return {
            "message": "Seat booked successfully",
            "bus_id": book_request.bus_id,
            "seat_number": book_request.seat_number,
            "fare": bus["fare"]
        }
    except mysql.connector.Error as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)
