import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { Trash2, Edit2, Eye, MessageSquare } from "lucide-react";
import { useAuth } from "@/Hooks/useAuth";

function Tickets() {
  const { userId } = useAuth();
  const [tickets, setTickets] = useState([]);
  const statuses = ["Open", "In Progress", "Resolved", "Closed"];
  const priorities = ["Low", "Medium", "High"];
  const categories = ["Bug", "Feature", "Task"];
  const statusColors = {
    "Open": 'bg-blue-100 text-blue-800',
    "In Progress": 'bg-yellow-100 text-yellow-800',
    "Resolved": 'bg-green-100 text-green-800',
    "Closed": 'bg-gray-100 text-gray-800'
  };

  const priorityColors = {
    "Low": 'bg-green-100 text-green-800',
    "Medium": 'bg-yellow-100 text-yellow-800',
    "High": 'bg-red-100 text-red-800'
  };

  useEffect(() => {
    fetchTickets();    
  }, []);

  // Get all tickets for user
  const fetchTickets = async () => {
    try {
      const res = await fetch("/api/tickets/get_tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });      

      if (!res.ok) {
        let errMsg = "Could not load tickets.";
        try {
          const errData = await res.json();
          errMsg = errData.error || errMsg;
        } catch {}
        return Swal.fire({
          icon: "error",
          title: "Error",
          text: errMsg
        });
      }

      const data = await res.json();      
      setTickets(data);
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: "error",
        title: "Network Error",
        text: "Unable to reach server. Please try again later."
      });
    }
  };

  // View ticket details
  const handleViewDetails = ticket => {
    const comments = ticket.comments || [];

    Swal.fire({
      title: `<strong>Ticket details</strong><br/><br/>`,
      html:
        `<div style="display:flex; justify-content:space-between; margin-bottom:0.5em;">` +
          `<strong>Title:</strong><span>${ticket.title}</span>` +
        `</div>` +
        `<div style="display:flex; justify-content:space-between; margin-bottom:0.5em;">` +
          `<strong>Status:</strong><span>${ticket.status}</span>` +
        `</div>` +
        `<div style="display:flex; justify-content:space-between; margin-bottom:0.5em;">` +
          `<strong>Priority:</strong><span>${ticket.priority || '—'}</span>` +
        `</div>` +
        `<div style="display:flex; justify-content:space-between; margin-bottom:0.5em;">` +
          `<strong>Category:</strong><span>${ticket.category || '—'}</span>` +
        `</div>` +
        `<div style="display:flex; justify-content:space-between; margin-bottom:0.5em;">` +
          `<strong>Created At:</strong><span>${new Date(ticket.created_at).toLocaleString()}</span>` +
        `</div>` +
        `<div style="display:flex; justify-content:space-between; margin-bottom:0.5em;">` +
          `<strong>Created By:</strong><span>${ticket.creator.name} (${ticket.creator.email})</span>` +
        `</div>` +
        `<br/>` +
        `<div style="text-align:center; margin-bottom:1em;">` +
          `<strong>Description:</strong><br/><br/>${ticket.description.replace(/\n/g, "<br/>")}` +
        `</div>` +
        `<br/>` +
        `<hr/>` +
        `<br/>` +
        `<h4 class="swal2-title"><strong>Comments</strong></h4><br/>` +
        (comments.length
          ? `<ul style="text-align:left; max-height:200px; overflow:auto;">` +
              comments.map( c =>
                `<li>
                  <em>${new Date(c.created_at).toLocaleString()}</em><br/>
                  <strong>${c.user.name}:</strong><br/>
                  ${c.comment.replace(/\n/g, "<br/>")}
                </li><br/>`
              ).join("") +
            `</ul>`
          : `<p>No comments yet.</p>`),
      width: 600,
      confirmButtonText: "Close"
    });
  };

  // Add comments
  const handleComments = async ticket => {
    const comments = ticket.comments || [];

    const { value: newComment } = await Swal.fire({
      title: `Comments for Ticket #${ticket.id}`,
      html:
        (comments.length
          ? `<ul style="text-align:left; max-height:150px; overflow:auto;">` +
            comments
              .map(c =>
                `<li>
                  <strong>${c.user.name}</strong> 
                  <em>${new Date(c.created_at).toLocaleString()}:</em><br/>
                  ${c.comment.replace(/\n/g, "<br/>")}
                </li>`
              ).join("") + `</ul><hr/>`
          : `<p>No comments yet.</p><hr/>`) + `<textarea id="swal-comment" class="swal2-textarea" placeholder="Add a comment..."></textarea>`,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: "Add Comment",
      preConfirm: () => document.getElementById("swal-comment").value
    });

    if (newComment?.trim()) {
      try {
        const res = await fetch("/api/tickets/comments/add_comment", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: userId,
            ticketId: ticket.id,
            text: newComment.trim()
          }),
        });

        if (res.ok) {
          Swal.fire({ icon: "success", title: "Comment added", timer: 1200, showConfirmButton: false });
          fetchTickets();
        } else {
          const err = await res.json().catch(() => ({}));
          Swal.fire({ icon: "error", title: "Error", text: err.error || "Could not add comment." });
        }
      } catch (e) {
        console.error("Error posting comment:", e);
        Swal.fire({ icon: "error", title: "Network Error", text: "Please try again later." });
      }
    }
  };

  // Delete ticket
  const handleDelete = async id => {
    const { isConfirmed } = await Swal.fire({
      icon: "warning",
      title: "Delete ticket?",
      text: "This action cannot be undone.",
      showCancelButton: true,
      confirmButtonText: "Yes, delete",
      cancelButtonText: "Cancel"
    });
    if (!isConfirmed) return;

    try {
      const res = await fetch("/api/tickets/delete_ticket", { 
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: userId, ticketId: id }),
      });

      if (res.ok) {
        setTickets(prev => prev.filter(t => t.id !== id));
        Swal.fire({ icon: "success", title: "Deleted", timer: 1200, showConfirmButton: false });
      } else {
        const { error } = await res.json();
        Swal.fire({ icon: "error", title: "Error", text: error || "Could not delete." });
      }
    } catch (err) {
      console.error(err);
      Swal.fire({ icon: "error", title: "Error", text: "Please try again later." });
    }
  };

  // Edit ticket
  const handleEdit = async ticket => {
    const { value: formValues } = await Swal.fire({
      title: `Edit Ticket #${ticket.id}`,
      html:
        `<input id="swal-title" class="swal2-input" placeholder="Title" value="${ticket.title}">` +
        `<textarea id="swal-desc" class="swal2-textarea" placeholder="Description">${ticket.description}</textarea>` +
        `<select id="swal-status" class="swal2-select">
           ${statuses.map(s => `<option value="${s}" ${ticket.status === s ? "selected" : ""}>${s}</option>`).join("")}
        </select>` +
        `<select id="swal-priority" class="swal2-select">
          <option value="">-- select priority --</option>
          ${priorities.map(p => `<option ${ticket.priority===p?"selected":""}>${p}</option>`).join("")}
        </select>` +
        `<select id="swal-category" class="swal2-select">
          <option value="">-- select category --</option>
          ${categories.map(c => `<option ${ticket.category===c?"selected":""}>${c}</option>`).join("")}
        </select>`,
      focusConfirm: false,
      showCancelButton: true,
      preConfirm: () => ({
        title:       document.getElementById("swal-title").value,
        description: document.getElementById("swal-desc").value,
        status:      document.getElementById("swal-status").value,
        priority:    document.getElementById("swal-priority").value,
        category:    document.getElementById("swal-category").value,
      })
    });

    if (!formValues) return;

    try {
      const res = await fetch("/api/tickets/edit_ticket", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          userId: userId, 
          id: ticket.id, 
          ...formValues 
        }),
      });

      if (res.ok) {
        Swal.fire({
          icon: "success",
          title: "Updated!",
          timer: 1200,
          showConfirmButton: false
        });
        fetchTickets();
      } else {
        const { error } = await res.json();
        Swal.fire({
          icon: "error",
          title: "Error",
          text: error || "Could not update."
        });
      }
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Please try again later."
      });
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">Tickets</h2>
      <table className="w-full table-auto bg-white shadow rounded">
        <thead>
          <tr className="bg-gray-100">
            <th className="px-4 py-2 text-center">#</th>
            <th className="px-4 py-2 text-center">Title</th>
            <th className="px-4 py-2 text-center">Priority</th>
            <th className="px-4 py-2 text-center">Status</th>
            <th className="px-4 py-2 text-center">Created At</th>
            <th className="px-4 py-2 text-center">Actions</th>
          </tr>
        </thead>
        <tbody>
          {tickets.length === 0 ? (
            <tr>
              <td colSpan="5" className="text-center p-4">
                No tickets found.
              </td>
            </tr>
          ) : (
            tickets.map((t, i) => (
              <tr key={t.id} className="border-t">
                <td className="px-4 py-2 text-center">{i + 1}</td>
                <td className="px-4 py-2 text-center">{t.title}</td>
                <td className={`px-4 py-2 text-center text-sm ${priorityColors[t.priority] || 'bg-gray-100 text-gray-800'}`} >
                  {t.priority}
                </td>
                <td className={`px-4 py-2 text-center text-sm ${statusColors[t.status] || 'bg-gray-100 text-gray-800'}`} >
                  {t.status}
                </td>
                <td className="px-4 py-2 text-center">
                  {new Date(t.created_at).toLocaleString()}
                </td>
                <td className="px-4 py-2 text-center flex justify-center space-x-2">
                  <button
                    onClick={() => handleViewDetails(t)}
                    title="View Details"
                    className="text-blue-500 hover:text-blue-700 transition-colors duration-200"
                  >
                    <Eye size={20} />
                  </button>
                  <button
                    onClick={() => handleEdit(t)}
                    title="Edit Ticket"
                    className="text-green-500 hover:text-green-700 transition-colors duration-200"
                  >
                    <Edit2 size={20} />
                  </button>
                  <button
                    onClick={() => handleDelete(t.id)}
                    title="Delete Ticket"
                    className="text-red-500 hover:text-red-700 transition-colors duration-200"
                  >
                    <Trash2 size={20} />
                  </button>
                  <button
                    onClick={() => handleComments(t)}
                    title="Comments"
                    className="text-yellow-500 hover:text-yellow-700 transition-colors duration-200"
                  >
                    <MessageSquare size={20} />
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export default Tickets;
