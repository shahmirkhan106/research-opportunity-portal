const STRING_FIELDS = [
  'title',
  'description',
  'research_area',
  'faculty_name',
  'department',
  'required_skills',
];

const ALLOWED_FIELDS = [...STRING_FIELDS, 'positions_available', 'application_deadline', 'status'];

function isNonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function isValidDeadline(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

function isValidPositions(value) {
  if (typeof value === 'number') return Number.isInteger(value) && value >= 1;
  if (typeof value === 'string' && /^\s*\d+\s*$/.test(value)) {
    return Number(value) >= 1;
  }
  return false;
}

function validateStatus(value) {
  return value === 'Open' || value === 'Closed';
}

function validateFields(body, { partial }) {
  const details = [];

  if (partial) {
    const suppliedKnown = ALLOWED_FIELDS.filter((field) =>
      Object.prototype.hasOwnProperty.call(body, field)
    );
    if (suppliedKnown.length === 0) {
      details.push('request body must contain at least one field to update');
      return details;
    }
  }

  for (const field of STRING_FIELDS) {
    const supplied = Object.prototype.hasOwnProperty.call(body, field);
    if (!supplied) {
      if (!partial) details.push(`${field} is required`);
      continue;
    }
    if (!isNonEmptyString(body[field])) {
      details.push(`${field} must be a non-empty string`);
    }
  }

  if (Object.prototype.hasOwnProperty.call(body, 'positions_available')) {
    if (!isValidPositions(body.positions_available)) {
      details.push('positions_available must be an integer greater than or equal to 1');
    }
  } else if (!partial) {
    details.push('positions_available is required');
  }

  if (Object.prototype.hasOwnProperty.call(body, 'application_deadline')) {
    if (!isValidDeadline(body.application_deadline)) {
      details.push('application_deadline must be a valid date in YYYY-MM-DD format');
    }
  } else if (!partial) {
    details.push('application_deadline is required');
  }

  if (
    Object.prototype.hasOwnProperty.call(body, 'status') &&
    !validateStatus(body.status)
  ) {
    details.push("status must be either 'Open' or 'Closed'");
  }

  return details;
}

function validateCreate(req, res, next) {
  const details = validateFields(req.body || {}, { partial: false });
  if (details.length > 0) {
    return res.status(400).json({ error: 'Validation failed', details });
  }
  return next();
}

function validateUpdate(req, res, next) {
  const body = req.body || {};
  if (Object.keys(body).length === 0) {
    return res.status(400).json({
      error: 'Validation failed',
      details: ['request body must contain at least one field to update'],
    });
  }
  const details = validateFields(body, { partial: true });
  if (details.length > 0) {
    return res.status(400).json({ error: 'Validation failed', details });
  }
  return next();
}

function validateId(req, res, next) {
  const { id } = req.params;
  if (!/^\d+$/.test(id) || Number(id) < 1) {
    return res.status(400).json({
      error: 'Validation failed',
      details: ['id must be a positive integer'],
    });
  }
  return next();
}

module.exports = { validateCreate, validateUpdate, validateId };
