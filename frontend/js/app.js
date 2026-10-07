const listBody = document.getElementById('opportunity-list');
const emptyState = document.getElementById('empty-state');
const listWrapper = document.getElementById('list-wrapper');
const recordCount = document.getElementById('record-count');
const detailsModalEl = document.getElementById('details-modal');
const deleteModalEl = document.getElementById('delete-modal');

let currentOpportunities = [];
let opportunityBeingDeleted = null;

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

    if (opportunity.status === 'Open') {
      const editBtn = document.createElement('button');
      editBtn.type = 'button';
      editBtn.className = 'btn btn-sm btn-outline-secondary me-1';
      editBtn.textContent = 'Edit';
      editBtn.dataset.action = 'edit';
      editBtn.dataset.id = opportunity.id;
      actions.appendChild(editBtn);

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
    default:
      break;
  }
});

document.addEventListener('DOMContentLoaded', loadOpportunities);
