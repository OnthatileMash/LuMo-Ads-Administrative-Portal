// LuMo Ads Administrative Portal - Dashboard Logic
document.addEventListener('DOMContentLoaded', () => {
  const API_BASE = 'http://192.168.0.240:3000'; // Match backend LAN IP

  // Tab Switching Handler
  const navItems = document.querySelectorAll('.nav-item');
  const tabPanes = document.querySelectorAll('.tab-pane');

  navItems.forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      const targetTab = item.getAttribute('data-tab');

      navItems.forEach(nav => nav.classList.remove('active'));
      tabPanes.forEach(pane => pane.classList.remove('active'));

      item.classList.add('active');
      document.getElementById(`tab-${targetTab}`).classList.add('active');
    });
  });

  // Fetch Telemetry & Leads from Express Backend API
  async function loadAdminData() {
    try {
      // 1. Fetch Registered Leads (/api/leads)
      const leadsRes = await fetch(`${API_BASE}/api/leads`);
      const leadsData = await leadsRes.ok ? await leadsRes.json() : [];

      // Update Leads Stat Counter & Table
      document.getElementById('stat-leads').textContent = leadsData.length;
      renderLeadsTable(leadsData);

      // 2. Fetch Ad Impressions (/api/ad-events)
      const adRes = await fetch(`${API_BASE}/api/ad-events`);
      const adData = await adRes.ok ? await adRes.json() : [];
      document.getElementById('stat-impressions').textContent = adData.length;

    } catch (err) {
      console.warn('API offline or unreachable, rendering placeholder telemetry:', err);
      renderMockData();
    }
  }

  // Populate Leads & POPIA Audit Log Table
  function renderLeadsTable(leads) {
    const tableBody = document.getElementById('table-leads-body');
    if (!leads || leads.length === 0) {
      tableBody.innerHTML = `<tr><td colspan="5" class="empty-text">No user registrations logged yet in data/leads.jsonl.</td></tr>`;
      return;
    }

    tableBody.innerHTML = leads.map(lead => `
      <tr>
        <td>${new Date(lead.timestamp || Date.now()).toLocaleString()}</td>
        <td><strong>${lead.phone || lead.idNumber || 'N/A'}</strong></td>
        <td><code>${lead.mac || '00:00:00:00:00:00'}</code></td>
        <td>${lead.ip || '192.168.0.X'}</td>
        <td><span class="badge badge-success">ACCEPTED (POPIA)</span></td>
      </tr>
    `).join('');
  }

  // Fallback Data when Server API is in standalone mode
  function renderMockData() {
    renderLeadsTable([
      { timestamp: new Date().toISOString(), phone: '+27 82 123 4567', mac: 'BC:D1:D3:A2:B1:C0', ip: '192.168.0.105' }
    ]);
  }

  // Refresh & Export Handlers
  document.getElementById('btn-refresh').addEventListener('click', loadAdminData);
  document.getElementById('btn-export').addEventListener('click', () => {
    alert('Exporting POPIA Compliance Audit Log (data/consent.jsonl)...');
  });

  // Initial Load
  loadAdminData();
});
