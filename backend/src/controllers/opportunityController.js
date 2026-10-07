const { pool } = require('../config/db');

async function createOpportunity(req, res, next) {
  try {
    const {
      title,
      description,
      research_area,
      faculty_name,
      department,
      required_skills,
      positions_available,
      application_deadline,
      status,
    } = req.body;

    const [result] = await pool.query(
      `INSERT INTO opportunities
        (title, description, research_area, faculty_name, department,
         required_skills, positions_available, application_deadline, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        title.trim(),
        description.trim(),
        research_area.trim(),
        faculty_name.trim(),
        department.trim(),
        required_skills.trim(),
        Number(positions_available),
        application_deadline,
        status || 'Open',
      ]
    );

    const [rows] = await pool.query('SELECT * FROM opportunities WHERE id = ?', [
      result.insertId,
    ]);

    res.status(201).json(rows[0]);
  } catch (err) {
    next(err);
  }
}

const UPDATABLE_FIELDS = [
  'title',
  'description',
  'research_area',
  'faculty_name',
  'department',
  'required_skills',
  'positions_available',
  'application_deadline',
  'status',
];

async function updateOpportunity(req, res, next) {
  try {
    const { id } = req.params;

    const [existing] = await pool.query('SELECT id FROM opportunities WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ error: 'Opportunity not found' });
    }

    const sets = [];
    const values = [];
    for (const field of UPDATABLE_FIELDS) {
      if (!Object.prototype.hasOwnProperty.call(req.body, field)) continue;
      sets.push(`${field} = ?`);
      let value = req.body[field];
      if (field === 'positions_available') value = Number(value);
      else if (typeof value === 'string') value = value.trim();
      values.push(value);
    }

    values.push(id);
    await pool.query(`UPDATE opportunities SET ${sets.join(', ')} WHERE id = ?`, values);

    const [rows] = await pool.query('SELECT * FROM opportunities WHERE id = ?', [id]);
    return res.status(200).json(rows[0]);
  } catch (err) {
    return next(err);
  }
}

async function getAllOpportunities(req, res, next) {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM opportunities ORDER BY created_at DESC'
    );
    res.status(200).json(rows);
  } catch (err) {
    next(err);
  }
}

async function getOpportunityById(req, res, next) {
  try {
    const [rows] = await pool.query('SELECT * FROM opportunities WHERE id = ?', [
      req.params.id,
    ]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Opportunity not found' });
    }
    return res.status(200).json(rows[0]);
  } catch (err) {
    return next(err);
  }
}

module.exports = {
  createOpportunity,
  getAllOpportunities,
  getOpportunityById,
  updateOpportunity,
};
