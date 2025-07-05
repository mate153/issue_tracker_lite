import { useState } from "react";
import Swal from "sweetalert2";
import { useAuth } from "@/Hooks/useAuth";
import { Brain, Ellipsis } from "lucide-react";

function AddTicket() {
    const { userId } = useAuth();
    const [form, setForm] = useState({
        title: "",
        description: "",
        status: "Open",
    });
    const statuses = ["Open", "In Progress", "Resolved", "Closed"];
    const [isGenerating, setIsGenerating] = useState(false);

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
            const res = await fetch("/api/tickets/add-ticket", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...form, userId }),
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

    const generateTitle = async () => {
        setIsGenerating(true);
        try {
            const res = await fetch("/api/title_generator/generate_title", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ description: form.description }),
            });
            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                throw new Error(err.error || "AI service error");
            }
            const { title: aiTitle } = await res.json();
            setForm(f => ({ ...f, title: aiTitle }));
        } catch (err) {
            console.error(err);
            Swal.fire({
                icon: "error",
                title: "AI Error",
                text: err.message || "Could not generate title."
            });
        } finally {
            setIsGenerating(false);
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
                <div className="flex space-x-2">
                    <input
                        type="text"
                        name="title"
                        placeholder="Ticket title"
                        className="flex-1 p-2 border rounded"
                        value={form.title}
                        onChange={handleChange}
                    />
                    <button
                        type="button"
                        title="Ai generate title"
                        onClick={generateTitle}
                        disabled={!form.description.trim() || isGenerating}
                        className={`px-3 py-2 rounded border ${
                        form.description.trim() && !isGenerating
                            ? "bg-blue-500 text-white hover:bg-blue-600"
                            : "bg-gray-200 text-gray-500 cursor-not-allowed"
                        } transition-colors duration-200`}
                    >
                        {isGenerating ? <Ellipsis size={20} /> : <Brain size={20} />}
                    </button>
                </div>
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
