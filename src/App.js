import './App.css';
import {BrowserRouter,Routes, Route} from "react-router-dom";
import Welcome from './Pages/welcome';
import Bus from './Pages/bus';
import AddBus from './Pages/AddBus';
import BookingForm from "./Pages/BookingForm"

function App() {
  return (
    <div className="App">
      <BrowserRouter>
      <Routes>
        <Route path='/' element={<Welcome/>}/>
        <Route path='bus' element={<Bus/>}/>
        <Route path="/add_bus" element={<AddBus />} />
        <Route path="/booking_form" element={<BookingForm />} />
      </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
