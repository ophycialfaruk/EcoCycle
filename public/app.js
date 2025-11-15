// public/app.js

// ---------- SAFE SELECTOR ----------
const $ = s => document.querySelector(s);

// ---------- HOME / REGISTER / LOGIN ----------
function showPage(page) {
  document.querySelectorAll('.authDiv').forEach(d => d.classList.add('hidden'));
  if (page === 'register') document.getElementById('registerDiv')?.classList.remove('hidden');
  if (page === 'login') document.getElementById('loginDiv')?.classList.remove('hidden');
}

// ---------- LOCAL STORAGE SESSION ----------
let currentUser = JSON.parse(localStorage.getItem('ecocycleUser')) || null;

// Redirect to dashboard if already logged in
if (currentUser && window.location.pathname.endsWith('index.html')) {
  window.location.href = '/user.html';
}

// ---------- REGISTER ----------
document.getElementById('registerBtn')?.addEventListener('click', async () => {
  const name = document.getElementById('name')?.value.trim();
  const email = document.getElementById('email')?.value.trim();
  const password = document.getElementById('password')?.value;
  const address = document.getElementById('address')?.value.trim();
  const state = document.getElementById('state')?.value.trim();
  const country = document.getElementById('country')?.value.trim();
  const contact = document.getElementById('contact')?.value.trim();

  const data = { name, email, password, address, state, country, contact };

  // Basic validation
  if (!name || !email || !password) return alert('Fill required fields');

  try {
    const res = await fetch('/api/user/register', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data)
    });
    const result = await res.json();
    if (result.error) return alert(result.error);
    alert('Registered successfully! Please login.');
    showPage('login');
  } catch (err) {
    console.error(err);
    alert('Registration failed. Try again.');
  }
});

// ---------- LOGIN ----------
document.getElementById('loginBtn')?.addEventListener('click', async () => {
  const email = document.getElementById('loginEmail')?.value;
  const password = document.getElementById('loginPassword')?.value;
  try {
    const res = await fetch('/api/user/login', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (data.error) return alert(data.error);
    currentUser = data;
    localStorage.setItem('ecocycleUser', JSON.stringify(data));
    window.location.href = '/user.html';
  } catch (err) {
    console.error(err);
    alert('Login failed. Try again.');
  }
});

// ---------- USER DASHBOARD ----------
if (window.location.pathname.endsWith('user.html')) {
  if (!currentUser) {
    window.location.href = '/index.html';
  } else {
    // ensure DOM elements exist before accessing them
    const userNameEl = $('#userNameDisplay');
    if (userNameEl) userNameEl.textContent = currentUser.name || '';

    $('#userEmail') && ($('#userEmail').textContent = currentUser.email || '');
    $('#userAddress') && ($('#userAddress').textContent = currentUser.address || '');
    $('#userState') && ($('#userState').textContent = currentUser.state || '');
    $('#userCountry') && ($('#userCountry').textContent = currentUser.country || '');
    $('#userContact') && ($('#userContact').textContent = currentUser.contact || '');

    $('#logoutBtn')?.addEventListener('click', () => {
      localStorage.removeItem('ecocycleUser');
      window.location.href = '/index.html';
    });

    // Submit waste request
    $('#requestBtn')?.addEventListener('click', async () => {
      const type = $('#wasteType')?.value;
      const kg = parseFloat($('#wasteKg')?.value || 0);
      if (!type) return alert('Select waste type');
      if (!kg || kg <= 0) return alert('Enter valid kg');
      try {
        const res = await fetch('/api/user/request', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: currentUser.id, type, kg })
        });
        const data = await res.json();
        if (data.error) return alert(data.error);
        $('#wasteKg').value = '';
        loadRequests();
      } catch (err) {
        console.error(err);
        alert('Request failed');
      }
    });

    // Submit feedback
    $('#feedbackBtn')?.addEventListener('click', async () => {
      const text = $('#feedbackText')?.value.trim();
      if (!text) return alert('Enter feedback');
      try {
        const res = await fetch('/api/user/feedback', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: currentUser.id, text })
        });
        const data = await res.json();
        if (data.error) return alert(data.error);
        $('#feedbackText').value = '';
        alert('Feedback sent!');
      } catch (err) {
        console.error(err);
        alert('Failed to send feedback');
      }
    });

    // Load user requests
    async function loadRequests() {
      try {
        const res = await fetch(`/api/user/requests/${currentUser.id}`);
        const data = await res.json();
        const requestsDiv = $('#requestsDiv');
        if (!requestsDiv) return;
        if (!Array.isArray(data) || data.length === 0) {
          requestsDiv.innerHTML = 'No requests yet';
          return;
        }
        requestsDiv.innerHTML = data.map(r => `
            <div class="request-card">
                <div><strong>Type:</strong> ${r.type}</div>
                <div><strong>Kg:</strong> ${r.kg}</div>
                <div><strong>Status:</strong> ${r.status}</div>
                <div><strong>Amount:</strong> ${r.amount || '-'}</div>
                <div><strong>Accomplished:</strong> ${r.accomplished ? 'Yes' : 'No'}</div>
                <div><strong>Date:</strong> ${r.date}</div>
            </div>
        `).join('');
      } catch (err) {
        console.error(err);
        $('#requestsDiv') && ($('#requestsDiv').innerHTML = 'Error loading requests');
      }
    }
    loadRequests();
  }
}
// Load user's feedback and admin replies
// Load user's feedback and admin replies
async function loadUserFeedback() {
  try {
    const res = await fetch(`/api/user/feedback/${currentUser.id}`);
    const data = await res.json();
    const feedbackDiv = $('#userFeedbackDiv');
    if (!feedbackDiv) return;

    if (!Array.isArray(data) || data.length === 0) {
      feedbackDiv.innerHTML = '📬 No feedback submitted yet';
      return;
    }

    feedbackDiv.innerHTML = data.map(f => `
      <div class="feedback-card">
        <div><strong>Date:</strong> ${f.date}</div>
        <div style="margin-top:5px;">${f.text}</div>
        <div style="margin-top:5px;">
          <strong>Admin Reply:</strong> ${f.reply ? f.reply : '<em>No reply yet</em>'}
        </div>
      </div>
    `).join('');

  } catch (err) {
    console.error(err);
    $('#userFeedbackDiv') && ($('#userFeedbackDiv').innerHTML = 'Error loading feedback');
  }
}

// Call after page loads
loadUserFeedback();

// ---------- ADMIN DASHBOARD ----------
if (window.location.pathname.endsWith('admin.html')) {
  let usersData = [], requestsData = [], feedbackData = [];

  function showSection(section) {
    ['usersSection', 'requestsSection', 'feedbackSection'].forEach(s => {
      const el = document.getElementById(s);
      if (el) el.classList.add('hidden');
    });
    const target = document.getElementById(section + 'Section');
    if (target) target.classList.remove('hidden');
  }

  async function loadAdminUsers() {
    try {
      const res = await fetch('/api/admin/users');
      const data = await res.json();
      usersData = Object.values(data || {});
      const adminUsersEl = $('#adminUsers');
      if (!adminUsersEl) return;
      adminUsersEl.innerHTML = usersData.map(u => `
        <div class="admin-card">
          <div>
            <strong>${u.name}</strong> (${u.email})<br>
            Contact: ${u.contact || '-'} | ${u.address || '-'}, ${u.state || '-'}, ${u.country || '-'}<br>
            Password: ${u.password || '-'}
          </div>
          <div class="admin-card-actions">
            <button onclick="deleteUser('${u.id}')">Delete</button>
            <button onclick="editUser('${u.id}')">Edit</button>
          </div>
        </div>
      `).join('') || 'No users';
      const totalUsersEl = $('#totalUsers');
      if (totalUsersEl) totalUsersEl.textContent = `Users: ${usersData.length}`;
    } catch (err) {
      console.error(err);
      $('#adminUsers') && ($('#adminUsers').innerHTML = 'Error loading users');
    }
  }

  async function loadAdminRequests() {
    try {
        const res = await fetch('/api/admin/requests');
        requestsData = await res.json();

        // We also need the user list so we can map names
        const usersRes = await fetch('/api/admin/users');
        const usersMap = await usersRes.json(); // object keyed by id

        const adminRequestsEl = $('#adminRequests');
        if (!adminRequestsEl) return;

        adminRequestsEl.innerHTML = (Array.isArray(requestsData) ? requestsData : []).map(r => {

            const user = usersMap[r.userId]; // get user object
            const name = user ? user.name : "Unknown User";

            return `
                <div class="admin-card">
                    <div>
                        <strong>Name:</strong> ${name} |
                        <strong>UserID:</strong> ${r.userId} |
                        <strong>Date:</strong> ${r.date}
                        <br><br>
                        <strong>Type:</strong> ${r.type} |
                        <strong>Kg:</strong> ${r.kg} |
                        <strong>Status:</strong>
                        <span class="status-badge status-${r.status || 'pending'}">
                            ${r.status || 'pending'}
                        </span> |
                        <strong>Amount:</strong> ${r.amount || "-"} |
                        <strong>Accomplished:</strong> ${r.accomplished ? "Yes" : "No"}
                    </div>

                    <div class="admin-card-actions">
                        ${r.status === 'pending'
                            ? `
                                <button onclick="updateRequest('${r.id}','approved', prompt('Enter amount for approval'))">Approve</button>
                                <button onclick="updateRequest('${r.id}','declined')">Decline</button>
                              `
                            : ''
                        }
                        <button onclick="toggleAccomplished('${r.id}')">
                            Toggle Accomplished
                        </button>
                    </div>
                </div>
            `;
        }).join('') || 'No requests';

        // Update counters
        $('#totalRequests') && ($('#totalRequests').textContent = `Requests: ${requestsData.length}`);
        $('#pendingRequests') && ($('#pendingRequests').textContent = `Pending: ${requestsData.filter(r=>r.status==='pending').length}`);
        $('#approvedRequests') && ($('#approvedRequests').textContent = `Approved: ${requestsData.filter(r=>r.status==='approved').length}`);

    } catch (err) {
        console.error(err);
        $('#adminRequests') && ($('#adminRequests').innerHTML = 'Error loading requests');
    }
}


async function loadAdminFeedback() {
    try {
        const res = await fetch('/api/admin/feedback');
        feedbackData = await res.json();

        // Get users so we can map usernames
        const usersRes = await fetch('/api/admin/users');
        const usersMap = await usersRes.json(); // object keyed by userId

        const adminFeedbackEl = $('#adminFeedback');
        if (!adminFeedbackEl) return;

        adminFeedbackEl.innerHTML = (Array.isArray(feedbackData) ? feedbackData : []).map(f => {
            const user = usersMap[f.userId];
            const name = user ? user.name : "Unknown User";

            return `
                <div class="admin-card">
                    <div>
                        <strong>Name:</strong> ${name} |
                        <strong>UserID:</strong> ${f.userId} |
                        <strong>Date:</strong> ${f.date}
                    </div>
                    <div style="margin-top:8px;">${f.text}</div>
                    <div style="margin-top:5px;">
                        <strong>Admin Reply:</strong> ${f.reply || '<em>No reply yet</em>'}
                    </div>
                    <div style="margin-top:5px;">
                        <input type="text" id="replyInput-${f.id}" placeholder="Type reply...">
                        <button onclick="sendFeedbackReply('${f.id}')">Reply</button>
                    </div>
                </div>
            `;
        }).join('') || 'No feedback';

    } catch (err) {
        console.error(err);
        $('#adminFeedback') && ($('#adminFeedback').innerHTML = 'Error loading feedback');
    }
}

// Function to send admin reply
window.sendFeedbackReply = async function(feedbackId) {
    const input = document.getElementById(`replyInput-${feedbackId}`);
    const reply = input?.value.trim();
    if (!reply) return alert('Enter reply');

    try {
        await fetch('/api/admin/feedback/reply', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ feedbackId, reply })
        });
        input.value = '';
        loadAdminFeedback(); // refresh feedback list
    } catch (err) {
        console.error(err);
        alert('Failed to send reply');
    }
};



  // DELETE USER
  window.deleteUser = async function (id) {
    if (!confirm('Delete user?')) return;
    try {
      await fetch('/api/admin/user/delete', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId: id })
      });
      await refreshAdminData();
    } catch (err) {
      console.error(err);
      alert('Failed to delete user');
    }
  };

  // GLOBAL VARIABLE to hold editing user
  let editingUserId = null;

  // EDIT USER
  window.editUser = function (id) {
    const u = usersData.find(x => x.id === id);
    if (!u) return alert('User not found');
    editingUserId = id;
    $('#editName') && ($('#editName').value = u.name || '');
    $('#editEmail') && ($('#editEmail').value = u.email || '');
    $('#editContact') && ($('#editContact').value = u.contact || '');
    $('#editAddress') && ($('#editAddress').value = u.address || '');
    $('#editState') && ($('#editState').value = u.state || '');
    $('#editCountry') && ($('#editCountry').value = u.country || '');
    $('#editUserModal') && ($('#editUserModal').classList.remove('hidden'));
  };

  // SAVE EDIT
  $('#saveEditBtn')?.addEventListener('click', async () => {
    if (!editingUserId) return alert('No user selected');
    const updates = {
      name: $('#editName')?.value.trim(),
      contact: $('#editContact')?.value.trim(),
      address: $('#editAddress')?.value.trim(),
      state: $('#editState')?.value.trim(),
      country: $('#editCountry')?.value.trim()
    };
    try {
      await fetch('/api/admin/user/update', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: editingUserId, updates })
      });
      $('#editUserModal') && ($('#editUserModal').classList.add('hidden'));
      editingUserId = null;
      refreshAdminData();
    } catch (err) {
      console.error(err);
      alert('Failed to update user');
    }
  });

  // CANCEL EDIT
  $('#cancelEditBtn')?.addEventListener('click', () => {
    $('#editUserModal') && ($('#editUserModal').classList.add('hidden'));
    editingUserId = null;
  });

  // UPDATE REQUEST
  window.updateRequest = async function (id, status, amountPrompt) {
    try {
      let amount = undefined;
      if (amountPrompt) {
        // amountPrompt may be the result of prompt() or a value passed
        if (typeof amountPrompt === 'string') {
          const parsed = parseFloat(amountPrompt);
          amount = isNaN(parsed) ? amountPrompt : parsed;
        } else {
          amount = amountPrompt;
        }
      }
      await fetch('/api/admin/request/update', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ requestId: id, status, amount })
      });
      await refreshAdminData();
    } catch (err) {
      console.error(err);
      alert('Failed to update request');
    }
  };

  window.toggleAccomplished = async function (id) {
    try {
      const r = requestsData.find(x => x.id === id);
      if (!r) return alert('Request not found');
      await fetch('/api/admin/request/update', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ requestId: id, accomplished: !r.accomplished })
      });
      await refreshAdminData();
    } catch (err) {
      console.error(err);
      alert('Failed to toggle accomplished');
    }
  };

  async function refreshAdminData() {
    await Promise.all([loadAdminUsers(), loadAdminRequests(), loadAdminFeedback()]);
  }

  // Initialize UI
  showSection('users');
  refreshAdminData();
}
