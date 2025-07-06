const { connect } = require('../Database/connect/dbConnect');

// Create ticket
exports.createTicket = async ({ title, description, status, priority, category }, userId) => {
  if (!title?.trim() || !description?.trim() || !status) {
    throw new Error('Title, description and status are required.');
  }

  const client = await connect();
  try {
    const result = await client.query(
      `INSERT INTO tickets (user_id, title, description, status, priority, category)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, user_id AS "userId", title, description, status, priority, category, created_at`,
      [userId, title.trim(), description.trim(), status, priority, category]
    );
    return result.rows[0];
  } finally {
    client.release();
  }
};

// Get ticket
exports.getAllTickets = async () => {
  const client = await connect();
  try {
    const result = await client.query(
      `
      SELECT
        t.id,
        t.title,
        t.user_id AS creator_id,
        uc.name AS creator_name,
        uc.email AS creator_email,
        t.description,
        t.status,
        t.priority,
        t.category,
        t.created_at,
        t.updated_at,
        COALESCE(
          json_agg(
            json_build_object(
              'id', c.id,
              'comment', c.comment,
              'created_at', c.created_at,
              'user', json_build_object(
                'id', cu.id,
                'name', cu.name,
                'email', cu.email
              )
            )
          ) FILTER (WHERE c.id IS NOT NULL),
          '[]'
        ) AS comments
      FROM tickets t
      LEFT JOIN users uc  ON uc.id = t.user_id
      LEFT JOIN ticket_comments c ON c.ticket_id = t.id
      LEFT JOIN users cu ON cu.id = c.user_id
      GROUP BY
        t.id,
        uc.id
      ORDER BY t.created_at DESC
      `
    );

    return result.rows.map(row => ({
      id: row.id,
      title: row.title,
      creator: {
        id: row.creator_id,
        name: row.creator_name,
        email: row.creator_email
      },
      description: row.description,
      status: row.status,
      priority: row.priority,
      category: row.category,
      created_at: row.created_at,
      updated_at: row.updated_at,
      comments: row.comments
    }));
  } finally {
    client.release();
  }
};

// Delete ticket
exports.deleteTicket = async (ticketId, userId) => {
  const client = await connect();
  try {
    const { rows } = await client.query(
      `SELECT user_id FROM tickets WHERE id = $1`,
      [ticketId]
    );
    if (rows.length === 0) {
      throw new Error('Ticket not found.');
    }
    if (rows[0].user_id !== userId) {
      throw new Error('Not authorized to delete this ticket.');
    }

    await client.query(
      `DELETE FROM tickets WHERE id = $1`,
      [ticketId]
    );
  } finally {
    client.release();
  }
};

// Edit ticket
exports.editTicket = async (ticketId, userId, fields) => {
  const client = await connect();
  try {
    const { rows: checkRows } = await client.query(
      `SELECT user_id FROM tickets WHERE id = $1`,
      [ticketId]
    );
    if (checkRows.length === 0) {
      const err = new Error('Ticket not found.');
      err.statusCode = 404;
      throw err;
    }
    if (checkRows[0].user_id !== userId) {
      const err = new Error('Not authorized to edit this ticket.');
      err.statusCode = 403;
      throw err;
    }

    const result = await client.query(
      `
      UPDATE tickets
         SET title = $1,
             description = $2,
             status = $3,
             priority = $4,
             category = $5,
             updated_at = NOW()
       WHERE id = $6
       RETURNING
         id,
         title,
         description,
         status,
         priority,
         category,
         created_at,
         updated_at
      `,
      [
        fields.title,
        fields.description,
        fields.status,
        fields.priority,
        fields.category,
        ticketId
      ]
    );

    return result.rows[0];
  } finally {
    client.release();
  }
};

// Add comment to ticket
exports.addCommentToTicket = async (ticketId, userId, text) => {
  const client = await connect();
  try {
    const ticketRes = await client.query(
      `SELECT id FROM tickets WHERE id = $1`,
      [ticketId]
    );
    if (ticketRes.rowCount === 0) {
      const err = new Error('Ticket not found.');
      err.statusCode = 404;
      throw err;
    }

    const insertRes = await client.query(
      `INSERT INTO ticket_comments (ticket_id, user_id, comment)
       VALUES ($1, $2, $3)
       RETURNING id, comment, created_at`,
      [ticketId, userId, text]
    );
    const row = insertRes.rows[0];

    const userRes = await client.query(
      `SELECT id, name, email FROM users WHERE id = $1`,
      [userId]
    );
    const user = userRes.rows[0];

    return {
      id: row.id,
      comment: row.comment,
      created_at: row.created_at,
      user: { id: user.id, name: user.name, email: user.email }
    };
  } finally {
    client.release();
  }
};