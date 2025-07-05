import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { useAuth } from "@/Hooks/useAuth";

function Login({ setIsLoggedIn }) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const [formData, setFormData] = useState({
        email: "",
        password: ""
    });
    const { setUserId } = useAuth();

    const [errors, setErrors] = useState({
        email: false,
        password: false
    });

    const navigate = useNavigate();

    const handleChange = e => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        setErrors(prev => ({ ...prev, [name]: false }));
    };

    const handleSubmit = async e => {
        e.preventDefault();

        const newErrors = {
            email: formData.email.trim() === "",
            password: formData.password.trim() === ""
        };

        setErrors(newErrors);

        if (!emailRegex.test(formData.email)) {
            setErrors(prev => ({ ...prev, email: true }));
            Swal.fire({
                icon: "warning",
                title: "Invalid email",
                text: "Please enter a valid email address."
            });
            return;
        }

        if (newErrors.password) {
            Swal.fire({
                icon: "warning",
                title: "Missing password",
                text: "Please enter your password."
            });
            return;
        }

        try {
            const res = await fetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData)
            });

            const data = await res.json();

            if (res.ok) {
                Swal.fire({
                    icon: "success",
                    title: "Login successful!",
                    showConfirmButton: false,
                    timer: 1500
                });
                setIsLoggedIn(true);
                setUserId(data.user.id);
                navigate("/home");
            } else {
                Swal.fire({
                    icon: "error",
                    title: "Login failed",
                    text: data.error || "Invalid credentials"
                });

                setErrors({ email: true, password: true });
            }
        } catch (error) {
            console.error(error);
            Swal.fire({
                icon: "error",
                title: "Something went wrong",
                text: "Please try again later."
            });
        }
    };

    return (
        <div className="flex justify-center items-center h-screen bg-gray-100">
            <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow-md w-80">
                <h2 className="text-2xl mb-4">Login</h2>
                <input
                    type="text"
                    name="email"
                    placeholder="Email"
                    className={`w-full p-2 mb-3 border ${errors.email ? "border-red-500" : "border"}`}
                    onChange={handleChange}
                />
                <input
                    type="password"
                    name="password"
                    placeholder="Password"
                    className={`w-full p-2 mb-3 border ${errors.password ? "border-red-500" : "border"}`}
                    onChange={handleChange}
                />
                <button type="submit" className="bg-blue-500 text-white p-2 w-full">
                    Login
                </button>

                <button
                    type="button"
                    onClick={() => navigate("/register")}
                    className="mt-3 w-full text-blue-600 underline text-sm"
                >
                    Don't have an account? Register
                </button>
            </form>
        </div>
    );
}

export default Login;
