const listBody = document.getElementById('opportunity-list');
const emptyState = document.getElementById('empty-state');
const listWrapper = document.getElementById('list-wrapper');
const recordCount = document.getElementById('record-count');
const detailsModalEl = document.getElementById('details-modal');
const deleteModalEl = document.getElementById('delete-modal');
const formModalEl = document.getElementById('opportunity-modal');
const opportunityForm = document.getElementById('opportunity-form');
const submitButton = document.getElementById('btn-submit-opportunity');
const formModalTitle = document.getElementById('form-modal-title');

const STRING_FORM_FIELDS = [
  'title',
  'description',
  'research_area',
  'faculty_name',
  'department',
  'required_skills',
];
const ALL_FORM_FIELDS = [
  ...STRING_FORM_FIELDS,
  'positions_available',
  'application_deadline',
  'status',
];

let currentOpportunities = [];
let opportunityBeingDeleted = null;
let editingOpportunityId = null;

function getFormElement(field) {
  return document.getElementById(`field-${field}`);
}

function setFieldError(field, message) {
  const input = getFormElement(field);
  input.classList.toggle('is-invalid', Boolean(message));
  const feedback = input.parentElement.querySelector('.invalid-feedback');
  if (feedback) feedback.textContent = message || '';
}

function clearFormErrors() {
  ALL_FORM_FIELDS.forEach((field) => setFieldError(field, ''));
}

function resetForm() {
  opportunityForm.reset();
  clearFormErrors();
  editingOpportunityId = null;
  formModalTitle.textContent = 'Add Opportunity';
  submitButton.textContent = 'Save';
  submitButton.disabled = false;
}

function readFormValues() {
  const values = {};
  for (const field of ALL_FORM_FIELDS) {
    const input = getFormElement(field);
    values[field] = typeof input.value === 'string' ? input.value.trim() : input.value;
  }
  return values;
}

function validateOpportunityForm() {
  const values = readFormValues();
  const errors = {};

  for (const field of STRING_FORM_FIELDS) {
    if (!values[field]) errors[field] = 'This field is required.';
  }

  const positions = Number(values.positions_available);
  if (!values.positions_available || !Number.isInteger(positions) || positions < 1) {
    errors.positions_available = 'Positions must be a whole number of at least 1.';
  }

  if (!values.application_deadline) {
    errors.application_deadline = 'Please choose a deadline.';
  }

  clearFormErrors();
  for (const [field, message] of Object.entries(errors)) {
    setFieldError(field, message);
  }

  return { ok: Object.keys(errors).length === 0, values };
}

function formatError(err) {
  if (err.details && err.details.length > 0) {
    return `${err.message}: ${err.details.join(' ')}`;
  }
  return err.message;
}

function openCreateForm() {
  resetForm();
  bootstrap.Modal.getOrCreateInstance(formModalEl).show();
}

function openEditForm(opportunity) {
  resetForm();
  editingOpportunityId = opportunity.id;
  formModalTitle.textContent = 'Edit Opportunity';
  submitButton.textContent = 'Save changes';

  for (const field of ALL_FORM_FIELDS) {
    const input = getFormElement(field);
    if (opportunity[field] != null) input.value = opportunity[field];
  }

  bootstrap.Modal.getOrCreateInstance(formModalEl).show();
}

function findById(id) {
  return currentOpportunities.find((opportunity) => opportunity.id === id);
}

async function closeOpportunity(id, button) {
  button.disabled = true;
  try {
    await OpportunityAPI.update(id, { status: 'Closed' });
    showAlert('success', 'Opportunity closed.');
    await loadOpportunities();
  } catch (err) {
    showAlert('danger', formatError(err));
    if (err.status === 404) await loadOpportunities();
  } finally {
    button.disabled = false;
  }
}

function requestDelete(opportunity) {
  opportunityBeingDeleted = opportunity;
  document.getElementById('delete-target-title').textContent = opportunity.title;
  bootstrap.Modal.getOrCreateInstance(deleteModalEl).show();
}

async function confirmDelete() {
  if (!opportunityBeingDeleted) return;

  const confirmButton = document.getElementById('btn-confirm-delete');
  confirmButton.disabled = true;
  try {
    await OpportunityAPI.remove(opportunityBeingDeleted.id);
    bootstrap.Modal.getOrCreateInstance(deleteModalEl).hide();
    showAlert('success', 'Opportunity deleted successfully.');
    opportunityBeingDeleted = null;
    await loadOpportunities();
  } catch (err) {
    showAlert('danger', formatError(err));
    if (err.status === 404) await loadOpportunities();
  } finally {
    confirmButton.disabled = false;
  }
}

document.getElementById('btn-confirm-delete').addEventListener('click', confirmDelete);

deleteModalEl.addEventListener('hidden.bs.modal', () => {
  opportunityBeingDeleted = null;
});

opportunityForm.addEventListener('submit', async (event) => {
  event.preventDefault();

  const { ok, values } = validateOpportunityForm();
  if (!ok) return;

  submitButton.disabled = true;
  try {
    if (editingOpportunityId != null) {
      await OpportunityAPI.update(editingOpportunityId, values);
      showAlert('success', 'Opportunity updated successfully.');
    } else {
      await OpportunityAPI.create(values);
      showAlert('success', 'Opportunity created successfully.');
    }
    bootstrap.Modal.getOrCreateInstance(formModalEl).hide();
    resetForm();
    await loadOpportunities();
  } catch (err) {
    showAlert('danger', formatError(err));
    if (err.status === 404) {
      bootstrap.Modal.getOrCreateInstance(formModalEl).hide();
      resetForm();
      await loadOpportunities();
    }
  } finally {
    submitButton.disabled = false;
  }
});

formModalEl.addEventListener('hidden.bs.modal', resetForm);

document.getElementById('btn-add-opportunity').addEventListener('click', openCreateForm);

function createTextCell(text, className) {
  const td = document.createElement('td');
  if (className) td.className = className;
  td.textContent = text == null ? '' : String(text);
  return td;
}

function createStatusBadge(status) {
  const td = document.createElement('td');
  td.className = 'text-center';
  const badge = document.createElement('span');
  badge.className = `badge badge-status-${status === 'Open' ? 'open' : 'closed'}`;
  badge.textContent = status;
  td.appendChild(badge);
  return td;
}

function renderList(opportunities) {
  listBody.textContent = '';

  const hasRows = opportunities.length > 0;
  emptyState.classList.toggle('d-none', hasRows);
  listWrapper.classList.toggle('d-none', !hasRows);
  recordCount.textContent = hasRows
    ? `${opportunities.length} record${opportunities.length === 1 ? '' : 's'}`
    : '';

  for (const opportunity of opportunities) {
    const row = document.createElement('tr');

    row.appendChild(createTextCell(opportunity.title, 'cell-title'));
    row.appendChild(createTextCell(opportunity.research_area));
    row.appendChild(createTextCell(opportunity.faculty_name));
    row.appendChild(createTextCell(opportunity.department));
    row.appendChild(createTextCell(opportunity.positions_available, 'text-center'));
    row.appendChild(createTextCell(opportunity.application_deadline));
    row.appendChild(createStatusBadge(opportunity.status));

    const actions = document.createElement('td');
    actions.className = 'text-end actions-nowrap';

    const viewBtn = document.createElement('button');
    viewBtn.type = 'button';
    viewBtn.className = 'btn btn-sm btn-outline-primary me-1';
    viewBtn.textContent = 'View';
    viewBtn.dataset.action = 'view';
    viewBtn.dataset.id = opportunity.id;
    actions.appendChild(viewBtn);

    const editBtn = document.createElement('button');
    editBtn.type = 'button';
    editBtn.className = 'btn btn-sm btn-outline-secondary me-1';
    editBtn.textContent = 'Edit';
    editBtn.dataset.action = 'edit';
    editBtn.dataset.id = opportunity.id;
    actions.appendChild(editBtn);

    if (opportunity.status === 'Open') {
      const closeBtn = document.createElement('button');
      closeBtn.type = 'button';
      closeBtn.className = 'btn btn-sm btn-outline-warning me-1';
      closeBtn.textContent = 'Close';
      closeBtn.dataset.action = 'close';
      closeBtn.dataset.id = opportunity.id;
      actions.appendChild(closeBtn);
    }

    const deleteBtn = document.createElement('button');
    deleteBtn.type = 'button';
    deleteBtn.className = 'btn btn-sm btn-outline-danger';
    deleteBtn.textContent = 'Delete';
    deleteBtn.dataset.action = 'delete';
    deleteBtn.dataset.id = opportunity.id;
    actions.appendChild(deleteBtn);

    row.appendChild(actions);
    listBody.appendChild(row);
  }
}

async function loadOpportunities() {
  try {
    currentOpportunities = await OpportunityAPI.getAll();
    renderList(currentOpportunities);
  } catch (err) {
    showAlert('danger', err.message);
  }
}

function appendDetail(grid, label, value) {
  const dt = document.createElement('dt');
  dt.textContent = label;
  const dd = document.createElement('dd');
  dd.textContent = value == null || value === '' ? '—' : String(value);
  grid.appendChild(dt);
  grid.appendChild(dd);
}

async function openDetails(id) {
  try {
    const opportunity = await OpportunityAPI.getOne(id);
    const body = document.getElementById('details-body');
    body.textContent = '';

    const grid = document.createElement('dl');
    grid.className = 'details-grid';
    appendDetail(grid, 'Title', opportunity.title);
    appendDetail(grid, 'Description', opportunity.description);
    appendDetail(grid, 'Research Area', opportunity.research_area);
    appendDetail(grid, 'Faculty Name', opportunity.faculty_name);
    appendDetail(grid, 'Department', opportunity.department);
    appendDetail(grid, 'Required Skills', opportunity.required_skills);
    appendDetail(grid, 'Positions Available', opportunity.positions_available);
    appendDetail(grid, 'Application Deadline', opportunity.application_deadline);
    appendDetail(grid, 'Status', opportunity.status);
    appendDetail(grid, 'Created At', opportunity.created_at);
    appendDetail(grid, 'Updated At', opportunity.updated_at);
    body.appendChild(grid);

    bootstrap.Modal.getOrCreateInstance(detailsModalEl).show();
  } catch (err) {
    showAlert('danger', err.message);
    if (err.status === 404) await loadOpportunities();
  }
}

listBody.addEventListener('click', (event) => {
  const button = event.target.closest('button[data-action]');
  if (!button) return;
  const id = Number(button.dataset.id);

  switch (button.dataset.action) {
    case 'view':
      openDetails(id);
      break;
    case 'edit': {
      const opportunity = findById(id);
      if (opportunity) openEditForm(opportunity);
      break;
    }
    case 'close':
      closeOpportunity(id, button);
      break;
    case 'delete': {
      const opportunity = findById(id);
      if (opportunity) requestDelete(opportunity);
      break;
    }
    default:
      break;
  }
});

document.addEventListener('DOMContentLoaded', loadOpportunities);
