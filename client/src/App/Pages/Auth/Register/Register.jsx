import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

function Register() {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        confirmPassword: ""
    });

    const [errors, setErrors] = useState({
        name: false,
        email: false,
        password: false,
        confirmPassword: false
    });

    const navigate = useNavigate();

    const handleChange = e => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        setErrors(prev => ({ ...prev, [name]: false }));
    };

    const handleSubmit = async e => {
        e.preventDefault();

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailRegex.test(formData.email)) {
            setErrors(prev => ({ ...prev, email: true }));
            Swal.fire({
                icon: "warning",
                title: "Invalid email",
                text: "Please enter a valid email address."
            });
            return;
        }

        const newErrors = {
            name: formData.name.trim() === "",
            email: formData.email.trim() === "",
            password: formData.password.trim() === "",
            confirmPassword: formData.confirmPassword.trim() === ""
        };

        setErrors(newErrors);

        if (Object.values(newErrors).some(Boolean)) {
            Swal.fire({
                icon: "warning",
                title: "Missing fields",
                text: "Please fill in all fields."
            });
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            setErrors(prev => ({
                ...prev,
                password: true,
                confirmPassword: true
            }));
            Swal.fire({
                icon: "warning",
                title: "Passwords do not match",
                text: "Please confirm your password correctly."
            });
            return;
        }

        try {
            const res = await fetch("/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData)
            });

            const data = await res.json();

            if (res.ok) {
                Swal.fire({
                icon: "success",
                title: "Registration successful!",
                showConfirmButton: false,
                timer: 1500
                });
                navigate("/login");
            } else {
                Swal.fire({
                icon: "error",
                title: "Registration failed",
                text: data.error || "Unable to create account"
                });
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
                <h2 className="text-2xl mb-4">Register</h2>
                <input
                    type="text"
                    name="name"
                    placeholder="Name"
                    className={`w-full p-2 mb-3 border ${errors.name ? "border-red-500" : "border"}`}
                    onChange={handleChange}
                />
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
                <input
                    type="password"
                    name="confirmPassword"
                    placeholder="Confirm password"
                    className={`w-full p-2 mb-3 border ${errors.confirmPassword ? "border-red-500" : "border"}`}
                    onChange={handleChange}
                />
                <button type="submit" className="bg-blue-500 text-white p-2 w-full">
                    Register
                </button>

                <button
                    type="button"
                    onClick={() => navigate("/login")}
                    className="mt-3 w-full text-blue-600 underline text-sm"
                >
                    Already have an account? Go to Login
                </button>
            </form>
        </div>
    );
}

export default Register;
