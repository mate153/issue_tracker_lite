import { NavLink, useNavigate } from "react-router-dom";

function Sidebar({ setIsLoggedIn }) {
    const navigate = useNavigate();
    const linkClass = ({ isActive }) => `block py-2 px-4 rounded hover:bg-gray-200 ${isActive ? "bg-gray-200 font-semibold" : ""}`;

    const handleLogout = () => {
        localStorage.removeItem("isLoggedIn");
        setIsLoggedIn(false);
        navigate("/login");
    };

    return (
        <aside className="w-56 bg-white shadow-md flex flex-col justify-between">
            <nav className="mt-6 space-y-2">
                <NavLink to="/home/welcome" className={linkClass}>
                    Welcome
                </NavLink>
                <NavLink to="/home/add-ticket" className={linkClass}>
                    Add Ticket
                </NavLink>
                <NavLink to="/home/tickets" className={linkClass}>
                    My Tickets
                </NavLink>
            </nav>
            <button
                onClick={handleLogout}
                className="mb-6 ml-4 text-red-600 hover:underline"
            >
                Logout
            </button>
        </aside>
    );
}

export default Sidebar;
