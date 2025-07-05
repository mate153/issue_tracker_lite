import { useState } from "react";
import Swal from "sweetalert2";

function AddTicket() {
    const [form, setForm] = useState({
        title: "",
        description: "",
        status: "Open",
    });
    const statuses = ["Open", "In Progress", "Resolved", "Closed"];

    const handleChange = e => {
        const { name, value } = e.target;
        setForm(f => ({ ...f, [name]: value }));
    };

    const handleSubmit = async e => {
        e.preventDefault();

        if (!form.title.trim() || !form.description.trim()) {
            Swal.fire({
                icon: "warning",
                title: "Missing fields",
                text: "Please provide both title and description."
            });
            return;
        }

        try {
            const res = await fetch("/api/tickets/add_ticket", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form),
            });
            const data = await res.json();

            if (res.ok) {
                Swal.fire({
                    icon: "success",
                    title: "Ticket created!",
                    text: data.message || "Your ticket has been added."
                });
                setForm({ title: "", description: "", status: "Open" });
            } else {
                Swal.fire({
                    icon: "error",
                    title: "Creation failed",
                    text: data.error || "Could not create ticket."
                });
            }
        } catch (err) {
            console.error(err);
            Swal.fire({
                icon: "error",
                title: "Something went wrong",
                text: "Please try again later."
            });
        }
    };

    return (
        <div className="max-w-md mx-auto">
            <h2 className="text-2xl font-semibold mb-4">
                Add New Ticket
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block mb-1 font-medium">Title</label>
                    <input
                        type="text"
                        name="title"
                        placeholder="Ticket title"
                        className="w-full p-2 border rounded"
                        value={form.title}
                        onChange={handleChange}
                    />
                </div>

                <div>
                    <label className="block mb-1 font-medium">Description</label>
                    <textarea
                        name="description"
                        placeholder="Detailed description"
                        className="w-full p-2 border rounded h-32"
                        value={form.description}
                        onChange={handleChange}
                    />
                </div>

                <div>
                    <label className="block mb-1 font-medium">
                        Status
                    </label>
                    <select
                        name="status"
                        className="w-full p-2 border rounded"
                        value={form.status}
                        onChange={handleChange}
                    >
                        {statuses.map( status => (
                            <option key={status} value={status} >{status}</option>
                        ))}
                    </select>
                </div>

                <button
                    type="submit"
                    className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                >
                    Create Ticket
                </button>
            </form>
        </div>
    );
}

export default AddTicket;
