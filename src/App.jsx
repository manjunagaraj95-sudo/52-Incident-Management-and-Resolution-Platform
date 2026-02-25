
import React, { useState, useEffect } from 'react';

// Centralized ROLES and Permissions
const ROLES = {
  ADMIN: {
    can: ['manage_users', 'view_all_incidents', 'edit_all_incidents', 'resolve_incident', 'approve_incident', 'report_incident'],
  },
  SUPPORT_MANAGER: {
    can: ['view_all_incidents', 'assign_incident', 'resolve_incident', 'approve_incident', 'report_incident', 'monitor_dashboards'],
  },
  SUPPORT_AGENT: {
    can: ['view_assigned_incidents', 'edit_assigned_incidents', 'resolve_incident', 'report_incident'],
  },
  OPERATIONS_MANAGER: {
    can: ['view_all_incidents', 'monitor_dashboards', 'export_data'],
  },
  EMPLOYEE: {
    can: ['view_my_incidents', 'report_incident', 'view_my_incident_details'],
  },
};

// Standardized Status Mapping for UI
const INCIDENT_STATUS_MAP = {
  NEW: { label: 'New', colorVar: 'var(--status-new)' },
  ASSIGNED: { label: 'Assigned', colorVar: 'var(--status-assigned)' },
  IN_PROGRESS: { label: 'In Progress', colorVar: 'var(--status-in-progress)' },
  PENDING_APPROVAL: { label: 'Pending Approval', colorVar: 'var(--status-pending-approval)' },
  RESOLVED: { label: 'Resolved', colorVar: 'var(--status-resolved)' },
  REJECTED: { label: 'Rejected', colorVar: 'var(--status-danger)' }, // Using danger for rejected
  CLOSED: { label: 'Closed', colorVar: 'var(--status-closed)' },
};

const PRIORITY_MAP = {
  LOW: { label: 'Low', colorVar: 'var(--priority-low)' },
  MEDIUM: { label: 'Medium', colorVar: 'var(--priority-medium)' },
  HIGH: { label: 'High', colorVar: 'var(--priority-high)' },
  URGENT: { label: 'Urgent', colorVar: 'var(--priority-urgent)' },
};

const SEVERITY_MAP = {
  MINOR: { label: 'Minor', colorVar: 'var(--color-info)' },
  MAJOR: { label: 'Major', colorVar: 'var(--color-warning)' },
  CRITICAL: { label: 'Critical', colorVar: 'var(--color-danger)' },
};

const SLA_STATUS_MAP = {
  ON_TRACK: { label: 'On Track', colorVar: 'var(--sla-on-track)' },
  AT_RISK: { label: 'At Risk', colorVar: 'var(--sla-at-risk)' },
  BREACHED: { label: 'Breached', colorVar: 'var(--sla-breached)' },
};

// Helper to check permissions
const canAccess = (userRole, action) => ROLES[userRole]?.can?.includes(action) || false;

// Dummy Data Generation
const generateDummyData = (currentUser) => {
  const users = [
    { id: 'usr-1', name: 'Alice Smith', role: 'ADMIN', email: 'alice@example.com' },
    { id: 'usr-2', name: 'Bob Johnson', role: 'SUPPORT_MANAGER', email: 'bob@example.com' },
    { id: 'usr-3', name: 'Charlie Brown', role: 'SUPPORT_AGENT', email: 'charlie@example.com' },
    { id: 'usr-4', name: 'Diana Prince', role: 'SUPPORT_AGENT', email: 'diana@example.com' },
    { id: 'usr-5', name: 'Eve Adams', role: 'EMPLOYEE', email: 'eve@example.com' },
    { id: 'usr-6', name: 'Frank White', role: 'OPERATIONS_MANAGER', email: 'frank@example.com' },
  ];

  const now = new Date();
  const incidents = [
    {
      id: 'inc-001', title: 'Network Outage in Data Center A', description: 'Critical network outage affecting core services. All systems in Data Center A are down.',
      reporter: users[4].id, assignee: users[2].id, priority: 'URGENT', severity: 'CRITICAL', status: 'IN_PROGRESS',
      createdAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString(), updatedAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      attachments: [{ name: 'network_diagram.pdf', url: '#' }], workflowStage: 'Investigated', slaStatus: 'AT_RISK',
      auditLog: [
        { id: 'aud-1', timestamp: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString(), user: users[4].name, action: 'Incident Reported' },
        { id: 'aud-2', timestamp: new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000).toISOString(), user: users[1].name, action: 'Assigned to Charlie Brown' },
        { id: 'aud-3', timestamp: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(), user: users[2].name, action: 'Status updated to In Progress' },
      ],
    },
    {
      id: 'inc-002', title: 'Software Bug in CRM Module', description: 'Users unable to save customer data in CRM module after recent update.',
      reporter: users[0].id, assignee: users[3].id, priority: 'HIGH', severity: 'MAJOR', status: 'PENDING_APPROVAL',
      createdAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString(), updatedAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      attachments: [], workflowStage: 'Investigated', slaStatus: 'ON_TRACK',
      auditLog: [
        { id: 'aud-4', timestamp: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString(), user: users[0].name, action: 'Incident Reported' },
        { id: 'aud-5', timestamp: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(), user: users[1].name, action: 'Assigned to Diana Prince' },
        { id: 'aud-6', timestamp: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString(), user: users[3].name, action: 'Resolution Proposed, pending approval' },
      ],
    },
    {
      id: 'inc-003', title: 'Printer in HR Department Malfunctioning', description: 'Network printer in HR department prints blank pages intermittently.',
      reporter: users[5].id, assignee: null, priority: 'MEDIUM', severity: 'MINOR', status: 'NEW',
      createdAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString(), updatedAt: new Date().toISOString(),
      attachments: [], workflowStage: 'Reported', slaStatus: 'ON_TRACK',
      auditLog: [
        { id: 'aud-7', timestamp: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString(), user: users[5].name, action: 'Incident Reported' },
      ],
    },
    {
      id: 'inc-004', title: 'Email Service Interruption (External)', description: 'Intermittent issues sending external emails. Internal emails are unaffected.',
      reporter: users[4].id, assignee: users[2].id, priority: 'HIGH', severity: 'MAJOR', status: 'RESOLVED',
      createdAt: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString(), updatedAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      attachments: [], workflowStage: 'Resolved', slaStatus: 'ON_TRACK',
      auditLog: [
        { id: 'aud-8', timestamp: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString(), user: users[4].name, action: 'Incident Reported' },
        { id: 'aud-9', timestamp: new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000).toISOString(), user: users[1].name, action: 'Assigned to Charlie Brown' },
        { id: 'aud-10', timestamp: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString(), user: users[2].name, action: 'Status updated to Resolved' },
      ],
    },
    {
      id: 'inc-005', title: 'Login Page Redirect Loop', description: 'Some users experiencing an infinite redirect loop when trying to log in to the HR portal.',
      reporter: users[0].id, assignee: users[3].id, priority: 'URGENT', severity: 'MAJOR', status: 'REJECTED',
      createdAt: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000).toISOString(), updatedAt: new Date(now.getTime() - 8 * 24 * 60 * 60 * 1000).toISOString(),
      attachments: [], workflowStage: 'Reported', slaStatus: 'BREACHED',
      auditLog: [
        { id: 'aud-11', timestamp: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000).toISOString(), user: users[0].name, action: 'Incident Reported' },
        { id: 'aud-12', timestamp: new Date(now.getTime() - 9 * 24 * 60 * 60 * 1000).toISOString(), user: users[1].name, action: 'Assigned to Diana Prince' },
        { id: 'aud-13', timestamp: new Date(now.getTime() - 8 * 24 * 60 * 60 * 1000).toISOString(), user: users[1].name, action: 'Incident Rejected (duplicate of INC-004)' },
      ],
    },
    {
      id: 'inc-006', title: 'New Employee Onboarding System Error', description: 'System fails to create accounts for new hires, causing delays in onboarding process.',
      reporter: users[1].id, assignee: null, priority: 'HIGH', severity: 'MAJOR', status: 'NEW',
      createdAt: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(), updatedAt: new Date().toISOString(),
      attachments: [], workflowStage: 'Reported', slaStatus: 'ON_TRACK',
      auditLog: [
        { id: 'aud-14', timestamp: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(), user: users[1].name, action: 'Incident Reported' },
      ],
    },
    {
      id: 'inc-007', title: 'Slow Performance on Financial Reporting Portal', description: 'Reports taking an unusually long time to generate, impacting month-end close.',
      reporter: users[5].id, assignee: users[2].id, priority: 'HIGH', severity: 'MAJOR', status: 'IN_PROGRESS',
      createdAt: new Date(now.getTime() - 1 * 60 * 60 * 1000).toISOString(), updatedAt: new Date().toISOString(),
      attachments: [], workflowStage: 'Assigned', slaStatus: 'ON_TRACK',
      auditLog: [
        { id: 'aud-15', timestamp: new Date(now.getTime() - 1 * 60 * 60 * 1000).toISOString(), user: users[5].name, action: 'Incident Reported' },
        { id: 'aud-16', timestamp: new Date().toISOString(), user: users[1].name, action: 'Assigned to Charlie Brown' },
      ],
    },
  ];

  return { users, incidents };
};

const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
  return new Date(dateString).toLocaleDateString('en-US', options);
};

const getRoleName = (userId, users) => {
  const user = users.find(u => u.id === userId);
  return user?.name || 'N/A';
};

function App() {
  const [view, setView] = useState({ screen: 'DASHBOARD', params: {} });
  const [currentUser, setCurrentUser] = useState({ id: 'usr-2', name: 'Bob Johnson', role: 'SUPPORT_MANAGER' }); // Default user is Support Manager

  const [users, setUsers] = useState([]);
  const [incidents, setIncidents] = useState([]);
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    const { users: dummyUsers, incidents: dummyIncidents } = generateDummyData(currentUser);
    setUsers(dummyUsers);
    setIncidents(dummyIncidents);
  }, [currentUser]);

  const navigate = (screen, params = {}) => {
    setView({ screen, params });
    setFormErrors({}); // Clear errors on navigation
  };

  const currentScreenTitle = () => {
    switch (view.screen) {
      case 'DASHBOARD': return 'Dashboard';
      case 'INCIDENT_LIST': return 'Incident List';
      case 'INCIDENT_DETAIL': return 'Incident Details';
      case 'REPORT_INCIDENT': return 'Report New Incident';
      case 'USER_MANAGEMENT': return 'User Management';
      case 'USER_DETAIL': return 'User Details';
      default: return 'Home';
    }
  };

  const getBreadcrumbs = () => {
    const crumbs = [{ label: 'Home', screen: 'DASHBOARD' }];
    if (view.screen === 'INCIDENT_LIST') {
      crumbs.push({ label: 'Incident List', screen: 'INCIDENT_LIST' });
    } else if (view.screen === 'INCIDENT_DETAIL') {
      crumbs.push({ label: 'Incident List', screen: 'INCIDENT_LIST' });
      const incident = incidents.find(i => i.id === view.params?.incidentId);
      crumbs.push({ label: incident?.title || 'Loading...', screen: 'INCIDENT_DETAIL', params: view.params });
    } else if (view.screen === 'REPORT_INCIDENT') {
      crumbs.push({ label: 'Incident List', screen: 'INCIDENT_LIST' });
      crumbs.push({ label: 'Report Incident', screen: 'REPORT_INCIDENT' });
    } else if (view.screen === 'USER_MANAGEMENT') {
      crumbs.push({ label: 'User Management', screen: 'USER_MANAGEMENT' });
    } else if (view.screen === 'USER_DETAIL') {
      crumbs.push({ label: 'User Management', screen: 'USER_MANAGEMENT' });
      const user = users.find(u => u.id === view.params?.userId);
      crumbs.push({ label: user?.name || 'Loading...', screen: 'USER_DETAIL', params: view.params });
    }
    return crumbs;
  };

  // Handlers for actions (simplified for this example)
  const handleReportIncidentSubmit = (formData) => {
    const errors = {};
    if (!formData.title) errors.title = 'Title is required.';
    if (!formData.description) errors.description = 'Description is required.';
    if (!formData.priority) errors.priority = 'Priority is required.';
    if (!formData.severity) errors.severity = 'Severity is required.';

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    const newIncident = {
      id: `inc-${incidents.length + 1}`,
      title: formData.title,
      description: formData.description,
      reporter: currentUser.id,
      assignee: null,
      priority: formData.priority,
      severity: formData.severity,
      status: 'NEW',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      attachments: formData.attachments || [],
      workflowStage: 'Reported',
      slaStatus: 'ON_TRACK',
      auditLog: [
        { id: `aud-${incidents.length * 10 + 1}`, timestamp: new Date().toISOString(), user: currentUser.name, action: 'Incident Reported' },
      ],
    };

    setIncidents(prevIncidents => [...prevIncidents, newIncident]);
    navigate('INCIDENT_DETAIL', { incidentId: newIncident.id });
  };

  const handleIncidentAction = (incidentId, actionType, payload = {}) => {
    setIncidents(prevIncidents => prevIncidents.map(incident => {
      if (incident.id === incidentId) {
        let newStatus = incident.status;
        let newWorkflowStage = incident.workflowStage;
        let newAssignee = incident.assignee;
        let auditEntry = {
          id: `aud-${incident.auditLog.length + 1}`,
          timestamp: new Date().toISOString(),
          user: currentUser.name,
          action: '',
        };

        switch (actionType) {
          case 'assign':
            newAssignee = payload.assigneeId;
            newStatus = 'ASSIGNED';
            newWorkflowStage = 'Assigned';
            auditEntry.action = `Assigned to ${getRoleName(payload.assigneeId, users)}`;
            break;
          case 'resolve':
            newStatus = 'RESOLVED';
            newWorkflowStage = 'Resolved';
            auditEntry.action = 'Incident Resolved';
            break;
          case 'approve':
            newStatus = 'RESOLVED'; // Assuming approval means resolved
            newWorkflowStage = 'Approved';
            auditEntry.action = 'Incident Approved';
            break;
          case 'reject':
            newStatus = 'REJECTED';
            newWorkflowStage = 'Rejected';
            auditEntry.action = 'Incident Rejected';
            break;
          case 'start_progress':
            newStatus = 'IN_PROGRESS';
            newWorkflowStage = 'Investigated';
            auditEntry.action = 'Started Investigation';
            break;
          default:
            break;
        }

        return {
          ...incident,
          status: newStatus,
          assignee: newAssignee,
          workflowStage: newWorkflowStage,
          updatedAt: new Date().toISOString(),
          auditLog: [...(incident.auditLog || []), auditEntry],
        };
      }
      return incident;
    }));
  };

  // Generic Card Component for Incidents and Users
  const Card = ({ item, type, onClick, actions, currentUserRole }) => {
    let title, description, statusLabel, statusColor, footerLeft, footerRight, detailButtonLabel;
    let slaColor;

    if (type === 'incident') {
      const incident = item;
      title = incident.title;
      description = `Priority: ${PRIORITY_MAP[incident.priority]?.label || incident.priority} | Severity: ${SEVERITY_MAP[incident.severity]?.label || incident.severity}`;
      statusLabel = INCIDENT_STATUS_MAP[incident.status]?.label || incident.status;
      statusColor = INCIDENT_STATUS_MAP[incident.status]?.colorVar || 'var(--color-secondary)';
      slaColor = SLA_STATUS_MAP[incident.slaStatus]?.colorVar || 'var(--color-secondary)';
      footerLeft = incident.assignee ? `Assigned to: ${getRoleName(incident.assignee, users)}` : 'Unassigned';
      footerRight = `Created: ${formatDate(incident.createdAt)}`;
      detailButtonLabel = 'View Details';
    } else if (type === 'user') {
      const user = item;
      title = user.name;
      description = `Role: ${user.role.replace('_', ' ')}`;
      statusLabel = user.email; // Using email as status for users
      statusColor = 'var(--color-info)'; // Default color for user status
      footerLeft = '';
      footerRight = '';
      detailButtonLabel = 'View Profile';
    }

    return (
      <li key={item.id} className="card" onClick={onClick}>
        <div className="card-header">
          <div>
            <h3 className="card-title">{title}</h3>
            <p className="card-meta">{description}</p>
          </div>
          {type === 'incident' && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 'var(--spacing-xs)' }}>
              <span className="card-status-badge" style={{ backgroundColor: statusColor }}>
                {statusLabel}
              </span>
              <span className="card-status-badge" style={{ backgroundColor: slaColor }}>
                SLA: {SLA_STATUS_MAP[item.slaStatus]?.label || item.slaStatus}
              </span>
            </div>
          )}
          {type === 'user' && (
            <span className="card-status-badge" style={{ backgroundColor: statusColor }}>
              {statusLabel}
            </span>
          )}
        </div>
        <div className="card-body">
          {type === 'incident' && (
            <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-dark)' }}>
              Reporter: {getRoleName(item.reporter, users)}
            </p>
          )}
        </div>
        <div className="card-footer">
          <div>{footerLeft}</div>
          <div className="card-quick-actions">
            {actions?.map((action, index) => (
              (canAccess(currentUserRole, action.permission) || action.permission === undefined) && (
                <button
                  key={index}
                  className={`button button-${action.style}`}
                  onClick={(e) => { e.stopPropagation(); action.handler(item.id); }}
                >
                  {action.label}
                </button>
              )
            ))}
          </div>
          <div>{footerRight}</div>
        </div>
      </li>
    );
  };

  // Screens
  const DashboardScreen = () => {
    const totalIncidents = incidents.length;
    const openIncidents = incidents.filter(i => i.status !== 'RESOLVED' && i.status !== 'CLOSED' && i.status !== 'REJECTED').length;
    const resolvedIncidents = incidents.filter(i => i.status === 'RESOLVED' || i.status === 'CLOSED').length;
    const slaBreaches = incidents.filter(i => i.slaStatus === 'BREACHED').length;

    const myOpenIncidents = incidents.filter(i =>
      i.reporter === currentUser.id && i.status !== 'RESOLVED' && i.status !== 'CLOSED' && i.status !== 'REJECTED'
    );
    const assignedToMeIncidents = incidents.filter(i =>
      i.assignee === currentUser.id && i.status !== 'RESOLVED' && i.status !== 'CLOSED' && i.status !== 'REJECTED'
    );
    const incidentsAwaitingApproval = incidents.filter(i => i.status === 'PENDING_APPROVAL');

    const recentActivities = incidents.flatMap(inc =>
      inc.auditLog.map(log => ({
        ...log,
        incidentTitle: inc.title,
        incidentId: inc.id,
      }))
    ).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).slice(0, 5);

    return (
      <div style={{ flexGrow: 1 }}>
        <h2 style={{ marginBottom: 'var(--spacing-lg)' }}>Dashboard Overview</h2>

        <div className="dashboard-grid">
          <div className="dashboard-kpi-card">
            <p className="dashboard-kpi-card-title">Total Incidents</p>
            <div className="dashboard-kpi-card-value">{totalIncidents} <span className="live-indicator"></span></div>
          </div>
          <div className="dashboard-kpi-card">
            <p className="dashboard-kpi-card-title">Open Incidents</p>
            <div className="dashboard-kpi-card-value" style={{ color: 'var(--color-warning)' }}>{openIncidents}</div>
          </div>
          <div className="dashboard-kpi-card">
            <p className="dashboard-kpi-card-title">Resolved Incidents</p>
            <div className="dashboard-kpi-card-value" style={{ color: 'var(--color-accent)' }}>{resolvedIncidents}</div>
          </div>
          <div className="dashboard-kpi-card">
            <p className="dashboard-kpi-card-title">SLA Breaches</p>
            <div className="dashboard-kpi-card-value" style={{ color: 'var(--color-danger)' }}>{slaBreaches}</div>
          </div>

          {(canAccess(currentUser.role, 'monitor_dashboards') || canAccess(currentUser.role, 'view_all_incidents')) && (
            <div className="dashboard-charts">
              <h3>Real-time Incident Metrics</h3>
              <div className="dashboard-charts-grid">
                <div className="chart-placeholder">Bar Chart: Incidents by Priority</div>
                <div className="chart-placeholder">Donut Chart: Incidents by Status</div>
                <div className="chart-placeholder">Line Chart: Resolution Trends</div>
                <div className="chart-placeholder">Gauge Chart: Open Incidents (SLA)</div>
              </div>
              <div style={{ display: 'flex', gap: 'var(--spacing-sm)', marginTop: 'var(--spacing-md)' }}>
                <button className="button button-outline">Export to PDF</button>
                <button className="button button-outline">Export to Excel</button>
              </div>
            </div>
          )}

          <div className="dashboard-recent-activities">
            <h3>Recent Activities</h3>
            <div>
              {recentActivities.map(activity => (
                <div key={activity.id} className="recent-activity-item" onClick={() => navigate('INCIDENT_DETAIL', { incidentId: activity.incidentId })}>
                  <div className="activity-icon">i</div>
                  <div className="activity-content">
                    <p>
                      <strong>{activity.user}</strong> {activity.action} on Incident <a href="#" onClick={(e) => e.preventDefault()}>{activity.incidentTitle}</a>
                    </p>
                    <span>{formatDate(activity.timestamp)}</span>
                  </div>
                </div>
              ))}
              {recentActivities.length === 0 && <p style={{ color: 'var(--color-secondary)' }}>No recent activities.</p>}
            </div>
          </div>
        </div>

        <h3>My Open Incidents</h3>
        {myOpenIncidents.length > 0 ? (
          <ul className="card-list">
            {myOpenIncidents.map(incident => (
              <Card
                key={incident.id}
                item={incident}
                type="incident"
                onClick={() => navigate('INCIDENT_DETAIL', { incidentId: incident.id })}
                currentUserRole={currentUser.role}
              />
            ))}
          </ul>
        ) : (
          <div className="empty-state">
            <p>No open incidents reported by you.</p>
            {canAccess(currentUser.role, 'report_incident') && (
              <button className="button button-primary" onClick={() => navigate('REPORT_INCIDENT')}>Report New Incident</button>
            )}
          </div>
        )}

        {(canAccess(currentUser.role, 'SUPPORT_AGENT') || canAccess(currentUser.role, 'SUPPORT_MANAGER')) && (
          <>
            <h3 style={{ marginTop: 'var(--spacing-lg)' }}>Incidents Assigned to Me</h3>
            {assignedToMeIncidents.length > 0 ? (
              <ul className="card-list">
                {assignedToMeIncidents.map(incident => (
                  <Card
                    key={incident.id}
                    item={incident}
                    type="incident"
                    onClick={() => navigate('INCIDENT_DETAIL', { incidentId: incident.id })}
                    currentUserRole={currentUser.role}
                  />
                ))}
              </ul>
            ) : (
              <div className="empty-state">
                <p>No incidents currently assigned to you.</p>
              </div>
            )}
          </>
        )}

        {canAccess(currentUser.role, 'approve_incident') && (
          <>
            <h3 style={{ marginTop: 'var(--spacing-lg)' }}>Incidents Awaiting Approval</h3>
            {incidentsAwaitingApproval.length > 0 ? (
              <ul className="card-list">
                {incidentsAwaitingApproval.map(incident => (
                  <Card
                    key={incident.id}
                    item={incident}
                    type="incident"
                    onClick={() => navigate('INCIDENT_DETAIL', { incidentId: incident.id })}
                    currentUserRole={currentUser.role}
                  />
                ))}
              </ul>
            ) : (
              <div className="empty-state">
                <p>No incidents currently awaiting your approval.</p>
              </div>
            )}
          </>
        )}
      </div>
    );
  };

  const IncidentListScreen = () => {
    const filteredIncidents = incidents.filter(incident => {
      if (canAccess(currentUser.role, 'view_all_incidents')) return true;
      if (canAccess(currentUser.role, 'view_my_incidents') && incident.reporter === currentUser.id) return true;
      if (canAccess(currentUser.role, 'view_assigned_incidents') && incident.assignee === currentUser.id) return true;
      return false;
    });

    // Dummy search/filter/sort UI - no actual functionality implemented here for brevity
    const handleSearch = () => alert('Search functionality not implemented in this demo.');
    const handleFilter = () => alert('Filter functionality not implemented in this demo.');
    const handleSort = () => alert('Sort functionality not implemented in this demo.');
    const handleBulkAction = () => alert('Bulk actions functionality not implemented in this demo.');
    const handleExport = () => alert('Export functionality not implemented in this demo.');
    const handleSavedView = () => alert('Saved views functionality not implemented in this demo.');

    return (
      <div style={{ flexGrow: 1 }}>
        <h2 style={{ marginBottom: 'var(--spacing-lg)' }}>Incident List</h2>

        <div style={{ display: 'flex', gap: 'var(--spacing-md)', marginBottom: 'var(--spacing-md)', flexWrap: 'wrap', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', gap: 'var(--spacing-md)' }}>
            <input type="text" placeholder="Search incidents..." className="input-field" style={{ width: '200px' }} />
            <button className="button button-secondary" onClick={handleSearch}>Search</button>
            <button className="button button-outline" onClick={handleFilter}>Filter</button>
            <button className="button button-outline" onClick={handleSort}>Sort</button>
            <button className="button button-outline" onClick={handleSavedView}>Saved Views</button>
          </div>
          <div style={{ display: 'flex', gap: 'var(--spacing-md)' }}>
            {(canAccess(currentUser.role, 'admin') || canAccess(currentUser.role, 'export_data')) && (
              <button className="button button-outline" onClick={handleExport}>Export</button>
            )}
            {canAccess(currentUser.role, 'edit_all_incidents') && (
              <button className="button button-secondary" onClick={handleBulkAction}>Bulk Actions</button>
            )}
            {canAccess(currentUser.role, 'report_incident') && (
              <button className="button button-primary" onClick={() => navigate('REPORT_INCIDENT')}>
                Report New Incident
              </button>
            )}
          </div>
        </div>

        {filteredIncidents.length > 0 ? (
          <ul className="card-list">
            {filteredIncidents.map(incident => (
              <Card
                key={incident.id}
                item={incident}
                type="incident"
                onClick={() => navigate('INCIDENT_DETAIL', { incidentId: incident.id })}
                actions={[
                  (canAccess(currentUser.role, 'assign_incident') && incident.status === 'NEW') && {
                    label: 'Assign', style: 'secondary', permission: 'assign_incident',
                    handler: (id) => handleIncidentAction(id, 'assign', { assigneeId: currentUser.id })
                  },
                  (canAccess(currentUser.role, 'resolve_incident') && incident.assignee === currentUser.id && incident.status === 'IN_PROGRESS') && {
                    label: 'Resolve', style: 'accent', permission: 'resolve_incident',
                    handler: (id) => handleIncidentAction(id, 'resolve')
                  },
                  (canAccess(currentUser.role, 'approve_incident') && incident.status === 'PENDING_APPROVAL') && {
                    label: 'Approve', style: 'accent', permission: 'approve_incident',
                    handler: (id) => handleIncidentAction(id, 'approve')
                  },
                ].filter(Boolean)} // Filter out false values
                currentUserRole={currentUser.role}
              />
            ))}
          </ul>
        ) : (
          <div className="empty-state" style={{ textAlign: 'center', padding: 'var(--spacing-xxl)', border: '2px dashed var(--color-border)', borderRadius: 'var(--border-radius-md)', marginTop: 'var(--spacing-lg)' }}>
            <p style={{ fontSize: 'var(--font-size-lg)', color: 'var(--color-secondary)' }}>No incidents match your criteria.</p>
            <p>It looks like there are no incidents to display at the moment, or your filters are too restrictive.</p>
            {canAccess(currentUser.role, 'report_incident') && (
              <button className="button button-primary" onClick={() => navigate('REPORT_INCIDENT')} style={{ marginTop: 'var(--spacing-md)' }}>
                Report New Incident
              </button>
            )}
          </div>
        )}
      </div>
    );
  };

  const IncidentDetailScreen = () => {
    const incidentId = view.params?.incidentId;
    const incident = incidents.find(i => i.id === incidentId);

    if (!incident) {
      return <div className="detail-page">Incident not found.</div>;
    }

    const reporter = users.find(u => u.id === incident.reporter);
    const assignee = users.find(u => u.id === incident.assignee);

    const workflowStages = ['Reported', 'Assigned', 'Investigated', 'Pending Approval', 'Resolved', 'Closed'];
    const currentStageIndex = workflowStages.findIndex(s => s.toLowerCase().includes(incident.workflowStage.toLowerCase()));

    const showAuditLogs = canAccess(currentUser.role, 'view_all_incidents') || incident.reporter === currentUser.id || incident.assignee === currentUser.id;

    const canEdit = canAccess(currentUser.role, 'edit_all_incidents') || (canAccess(currentUser.role, 'edit_assigned_incidents') && incident.assignee === currentUser.id);

    return (
      <div className="detail-page">
        <div className="detail-header">
          <div>
            <h2 className="detail-title">{incident.title}</h2>
            <p style={{ color: 'var(--color-secondary)' }}>Reported by {reporter?.name || 'N/A'} on {formatDate(incident.createdAt)}</p>
          </div>
          <div className="detail-actions">
            {canEdit && incident.status === 'NEW' && (
              <button
                className="button button-primary"
                onClick={() => handleIncidentAction(incident.id, 'assign', { assigneeId: currentUser.id })}
                disabled={!canAccess(currentUser.role, 'assign_incident')}
              >
                Assign to Me
              </button>
            )}
            {canEdit && incident.status === 'ASSIGNED' && incident.assignee === currentUser.id && (
              <button
                className="button button-primary"
                onClick={() => handleIncidentAction(incident.id, 'start_progress')}
                disabled={!canAccess(currentUser.role, 'edit_assigned_incidents')}
              >
                Start Progress
              </button>
            )}
            {canEdit && incident.status === 'IN_PROGRESS' && incident.assignee === currentUser.id && (
              <button
                className="button button-accent"
                onClick={() => handleIncidentAction(incident.id, 'resolve')}
                disabled={!canAccess(currentUser.role, 'resolve_incident')}
              >
                Resolve Incident
              </button>
            )}
            {canAccess(currentUser.role, 'approve_incident') && incident.status === 'PENDING_APPROVAL' && (
              <>
                <button
                  className="button button-accent"
                  onClick={() => handleIncidentAction(incident.id, 'approve')}
                  disabled={!canAccess(currentUser.role, 'approve_incident')}
                >
                  Approve
                </button>
                <button
                  className="button button-danger"
                  onClick={() => handleIncidentAction(incident.id, 'reject')}
                  disabled={!canAccess(currentUser.role, 'approve_incident')}
                >
                  Reject
                </button>
              </>
            )}
          </div>
        </div>

        <div className="detail-section">
          <h3>Workflow Status</h3>
          <div className="workflow-tracker">
            {workflowStages.map((stage, index) => (
              <div
                key={index}
                className={`workflow-stage ${index <= currentStageIndex ? 'completed' : ''} ${index === currentStageIndex ? 'current' : ''}`}
              >
                <div className="workflow-stage-dot"></div>
                <span className="workflow-stage-label">{stage}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="detail-section">
          <h3>Incident Details</h3>
          <div className="detail-grid">
            <div className="detail-item">
              <strong>ID</strong>
              <span>{incident.id}</span>
            </div>
            <div className="detail-item">
              <strong>Status</strong>
              <span style={{ color: INCIDENT_STATUS_MAP[incident.status]?.colorVar || 'inherit', fontWeight: 'var(--font-weight-semibold)' }}>
                {INCIDENT_STATUS_MAP[incident.status]?.label || incident.status}
              </span>
            </div>
            <div className="detail-item">
              <strong>Priority</strong>
              <span style={{ color: PRIORITY_MAP[incident.priority]?.colorVar || 'inherit', fontWeight: 'var(--font-weight-semibold)' }}>
                {PRIORITY_MAP[incident.priority]?.label || incident.priority}
              </span>
            </div>
            <div className="detail-item">
              <strong>Severity</strong>
              <span style={{ color: SEVERITY_MAP[incident.severity]?.colorVar || 'inherit', fontWeight: 'var(--font-weight-semibold)' }}>
                {SEVERITY_MAP[incident.severity]?.label || incident.severity}
              </span>
            </div>
            <div className="detail-item">
              <strong>Reporter</strong>
              <span>{reporter?.name || 'N/A'} ({reporter?.role.replace('_', ' ')})</span>
            </div>
            <div className="detail-item">
              <strong>Assignee</strong>
              <span>{assignee?.name || 'Unassigned'}</span>
            </div>
            <div className="detail-item">
              <strong>Created At</strong>
              <span>{formatDate(incident.createdAt)}</span>
            </div>
            <div className="detail-item">
              <strong>Last Updated</strong>
              <span>{formatDate(incident.updatedAt)}</span>
            </div>
            <div className="detail-item">
              <strong>SLA Status</strong>
              <span style={{ color: SLA_STATUS_MAP[incident.slaStatus]?.colorVar || 'inherit', fontWeight: 'var(--font-weight-semibold)' }}>
                {SLA_STATUS_MAP[incident.slaStatus]?.label || incident.slaStatus}
              </span>
            </div>
          </div>
        </div>

        <div className="detail-section">
          <h3>Description</h3>
          <p>{incident.description}</p>
        </div>

        {(incident.attachments && incident.attachments.length > 0) && (
          <div className="detail-section">
            <h3>Attachments</h3>
            <ul>
              {incident.attachments.map((file, index) => (
                <li key={index} style={{ marginBottom: 'var(--spacing-xs)' }}>
                  <a href={file.url} target="_blank" rel="noopener noreferrer">
                    {file.name} (Preview)
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}

        {showAuditLogs && (
          <div className="detail-section">
            <h3>Audit Log (Immutable)</h3>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {incident.auditLog?.map(log => (
                <li key={log.id} style={{ marginBottom: 'var(--spacing-sm)', paddingBottom: 'var(--spacing-sm)', borderBottom: '1px solid var(--color-border)' }}>
                  <p style={{ margin: 0, fontSize: 'var(--font-size-md)' }}>
                    <strong>{log.user}</strong> {log.action}
                  </p>
                  <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-secondary)' }}>{formatDate(log.timestamp)}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  };

  const ReportIncidentScreen = () => {
    const [formData, setFormData] = useState({
      title: '',
      description: '',
      priority: '',
      severity: '',
      attachments: [],
    });

    const handleChange = (e) => {
      const { name, value, files } = e.target;
      if (name === 'attachments' && files) {
        // This is a simplified representation, in a real app you'd upload files to a server
        const newAttachments = Array.from(files).map(file => ({
          name: file.name,
          url: URL.createObjectURL(file), // Dummy URL
          type: file.type,
          size: file.size,
        }));
        setFormData(prev => ({ ...prev, attachments: [...(prev.attachments || []), ...newAttachments] }));
      } else {
        setFormData(prev => ({ ...prev, [name]: value }));
      }
      setFormErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    };

    const handleSubmit = (e) => {
      e.preventDefault();
      handleReportIncidentSubmit(formData);
    };

    return (
      <div className="form-container">
        <h2>Report New Incident</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="title">Incident Title <span style={{ color: 'var(--color-danger)' }}>*</span></label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="input-field"
              required
            />
            {formErrors.title && <p className="error-message">{formErrors.title}</p>}
          </div>

          <div className="form-group">
            <label htmlFor="description">Description <span style={{ color: 'var(--color-danger)' }}>*</span></label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="textarea-field"
              required
            ></textarea>
            {formErrors.description && <p className="error-message">{formErrors.description}</p>}
          </div>

          <div className="form-group">
            <label htmlFor="priority">Priority <span style={{ color: 'var(--color-danger)' }}>*</span></label>
            <select
              id="priority"
              name="priority"
              value={formData.priority}
              onChange={handleChange}
              className="select-field"
              required
            >
              <option value="">Select Priority</option>
              {Object.keys(PRIORITY_MAP).map(key => (
                <option key={key} value={key}>{PRIORITY_MAP[key].label}</option>
              ))}
            </select>
            {formErrors.priority && <p className="error-message">{formErrors.priority}</p>}
          </div>

          <div className="form-group">
            <label htmlFor="severity">Severity <span style={{ color: 'var(--color-danger)' }}>*</span></label>
            <select
              id="severity"
              name="severity"
              value={formData.severity}
              onChange={handleChange}
              className="select-field"
              required
            >
              <option value="">Select Severity</option>
              {Object.keys(SEVERITY_MAP).map(key => (
                <option key={key} value={key}>{SEVERITY_MAP[key].label}</option>
              ))}
            </select>
            {formErrors.severity && <p className="error-message">{formErrors.severity}</p>}
          </div>

          <div className="form-group">
            <label htmlFor="attachments">Attachments</label>
            <input
              type="file"
              id="attachments"
              name="attachments"
              multiple
              onChange={handleChange}
              className="input-field"
              style={{ padding: 'var(--spacing-xs)' }}
            />
            {formData.attachments && formData.attachments.length > 0 && (
              <div style={{ marginTop: 'var(--spacing-sm)' }}>
                <p style={{ marginBottom: 'var(--spacing-xs)', fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)' }}>Uploaded Files:</p>
                <ul style={{ listStyle: 'none', padding: 0 }}>
                  {formData.attachments.map((file, index) => (
                    <li key={index} style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-dark)' }}>- {file.name}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="form-actions">
            <button type="button" className="button button-secondary" onClick={() => navigate('INCIDENT_LIST')}>
              Cancel
            </button>
            <button type="submit" className="button button-primary">
              Submit Incident
            </button>
          </div>
        </form>
      </div>
    );
  };

  const UserManagementScreen = () => {
    if (!canAccess(currentUser.role, 'manage_users')) {
      return <div className="main-content"><h2>Access Denied</h2><p>You do not have permission to view user management.</p></div>;
    }

    const handleAddUser = () => alert('Add User functionality not implemented.');
    const handleSearchUsers = () => alert('Search Users functionality not implemented.');

    return (
      <div style={{ flexGrow: 1 }}>
        <h2 style={{ marginBottom: 'var(--spacing-lg)' }}>User Management</h2>
        <div style={{ display: 'flex', gap: 'var(--spacing-md)', marginBottom: 'var(--spacing-md)', flexWrap: 'wrap', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', gap: 'var(--spacing-md)' }}>
            <input type="text" placeholder="Search users..." className="input-field" style={{ width: '200px' }} />
            <button className="button button-secondary" onClick={handleSearchUsers}>Search</button>
          </div>
          <button className="button button-primary" onClick={handleAddUser}>Add New User</button>
        </div>

        {users.length > 0 ? (
          <ul className="card-list">
            {users.map(user => (
              <Card
                key={user.id}
                item={user}
                type="user"
                onClick={() => navigate('USER_DETAIL', { userId: user.id })}
                currentUserRole={currentUser.role}
              />
            ))}
          </ul>
        ) : (
          <div className="empty-state" style={{ textAlign: 'center', padding: 'var(--spacing-xxl)', border: '2px dashed var(--color-border)', borderRadius: 'var(--border-radius-md)', marginTop: 'var(--spacing-lg)' }}>
            <p style={{ fontSize: 'var(--font-size-lg)', color: 'var(--color-secondary)' }}>No users found.</p>
            <p>It looks like there are no user accounts to manage.</p>
            <button className="button button-primary" onClick={handleAddUser} style={{ marginTop: 'var(--spacing-md)' }}>
              Add New User
            </button>
          </div>
        )}
      </div>
    );
  };

  const UserDetailScreen = () => {
    if (!canAccess(currentUser.role, 'manage_users')) {
      return <div className="main-content"><h2>Access Denied</h2><p>You do not have permission to view user details.</p></div>;
    }

    const userId = view.params?.userId;
    const user = users.find(u => u.id === userId);

    if (!user) {
      return <div className="detail-page">User not found.</div>;
    }

    const handleEditUser = () => alert(`Editing user: ${user.name}`);

    return (
      <div className="detail-page">
        <div className="detail-header">
          <div>
            <h2 className="detail-title">{user.name}</h2>
            <p style={{ color: 'var(--color-secondary)' }}>Role: {user.role.replace('_', ' ')}</p>
          </div>
          <div className="detail-actions">
            {canAccess(currentUser.role, 'manage_users') && (
              <button className="button button-primary" onClick={handleEditUser}>Edit User</button>
            )}
          </div>
        </div>

        <div className="detail-section">
          <h3>User Information</h3>
          <div className="detail-grid">
            <div className="detail-item">
              <strong>User ID</strong>
              <span>{user.id}</span>
            </div>
            <div className="detail-item">
              <strong>Email</strong>
              <span>{user.email}</span>
            </div>
            <div className="detail-item">
              <strong>Role</strong>
              <span>{user.role.replace('_', ' ')}</span>
            </div>
          </div>
        </div>

        {/* Example: User's reported incidents (if applicable) */}
        {canAccess(currentUser.role, 'view_all_incidents') && (
          <div className="detail-section">
            <h3>Reported Incidents by {user.name}</h3>
            {incidents.filter(i => i.reporter === user.id).length > 0 ? (
              <ul className="card-list">
                {incidents.filter(i => i.reporter === user.id).map(incident => (
                  <Card
                    key={incident.id}
                    item={incident}
                    type="incident"
                    onClick={() => navigate('INCIDENT_DETAIL', { incidentId: incident.id })}
                    currentUserRole={currentUser.role}
                  />
                ))}
              </ul>
            ) : (
              <p style={{ color: 'var(--color-secondary)' }}>No incidents reported by this user.</p>
            )}
          </div>
        )}
      </div>
    );
  };

  const handleLogout = () => {
    // In a real app, this would clear authentication tokens
    alert('Logging out...');
    setCurrentUser({ id: 'guest', name: 'Guest', role: 'EMPLOYEE' }); // Revert to a guest/employee role for demo
    navigate('DASHBOARD');
  };

  return (
    <div className="app-container">
      <header className="header">
        <div className="header-left">
          <div className="logo" onClick={() => navigate('DASHBOARD')}>Incident Pro</div>
          <nav className="breadcrumbs">
            {getBreadcrumbs().map((crumb, index, arr) => (
              <React.Fragment key={crumb.screen}>
                <a
                  href="#"
                  onClick={(e) => { e.preventDefault(); navigate(crumb.screen, crumb.params); }}
                  style={{ fontWeight: index === arr.length - 1 ? 'var(--font-weight-bold)' : 'var(--font-weight-normal)' }}
                >
                  {crumb.label}
                </a>
                {index < arr.length - 1 && <span>/</span>}
              </React.Fragment>
            ))}
          </nav>
        </div>
        <div className="header-right">
          <input type="text" placeholder="Global search..." className="input-field" style={{ width: '200px' }} />
          <div className="user-menu">
            <div className="user-avatar">{currentUser.name.charAt(0)}</div>
            <div>
              <span style={{ fontSize: 'var(--font-size-md)', fontWeight: 'var(--font-weight-medium)' }}>{currentUser.name}</span><br />
              <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-secondary)' }}>{currentUser.role.replace('_', ' ')}</span>
            </div>
            <button className="button button-icon" onClick={handleLogout}>🚪</button> {/* Logout Icon */}
          </div>
        </div>
      </header>

      <div className="main-content">
        <nav style={{ marginBottom: 'var(--spacing-md)', display: 'flex', gap: 'var(--spacing-md)', flexWrap: 'wrap' }}>
          <button className="button button-outline" onClick={() => navigate('DASHBOARD')}>Dashboard</button>
          <button className="button button-outline" onClick={() => navigate('INCIDENT_LIST')}>Incidents</button>
          {canAccess(currentUser.role, 'manage_users') && (
            <button className="button button-outline" onClick={() => navigate('USER_MANAGEMENT')}>Users</button>
          )}
          {canAccess(currentUser.role, 'report_incident') && (
            <button className="button button-primary" onClick={() => navigate('REPORT_INCIDENT')}>Report Incident</button>
          )}
        </nav>

        {(() => {
          switch (view.screen) {
            case 'DASHBOARD':
              return <DashboardScreen />;
            case 'INCIDENT_LIST':
              return <IncidentListScreen />;
            case 'INCIDENT_DETAIL':
              return <IncidentDetailScreen />;
            case 'REPORT_INCIDENT':
              return <ReportIncidentScreen />;
            case 'USER_MANAGEMENT':
              return <UserManagementScreen />;
            case 'USER_DETAIL':
              return <UserDetailScreen />;
            default:
              return <DashboardScreen />;
          }
        })()}
      </div>
    </div>
  );
}

export default App;