import { Routes, Route, Navigate } from "react-router-dom";
import Sidebar from "../Sidebar/Sidebar";
import Welcome from "../Welcome/Welcome";
import Tickets from "../Tickets/Tickets";
import AddTicket from "../Tickets/AddTicket";

function Home({ setIsLoggedIn }) {
  return (
    <div className="flex h-screen">
      <Sidebar setIsLoggedIn={setIsLoggedIn} />
      <main className="flex-1 p-6 bg-gray-100 overflow-auto">
        <Routes>
          <Route index element={<Navigate to="welcome" />} />
          <Route path="welcome" element={<Welcome />} />
          <Route path="add-ticket" element={<AddTicket />} />
          <Route path="tickets" element={<Tickets />} />
          <Route path="*" element={<Navigate to="welcome" />} />
        </Routes>
      </main>
    </div>
  );
}

export default Home;
