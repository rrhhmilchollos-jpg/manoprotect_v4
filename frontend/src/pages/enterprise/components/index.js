/**
 * Enterprise Portal Components Index
 * Exports all reusable components for the Enterprise Portal
 */

// UI Components
export { default as StatCard } from './StatCard';
export { default as SOSAlertCard } from './SOSAlertCard';

// Section Components
export { default as EmployeesSection } from './EmployeesSection';
export { default as AlertsSection } from './AlertsSection';
export { default as AuditSection } from './AuditSection';
export { default as SOSSection } from './SOSSection';

// Chart helper functions
export const mergeChartData = (alerts, sos) => {
  const dateMap = new Map();
  
  if (alerts && alerts.length > 0) {
    alerts.forEach(a => {
      if (a.date) {
        dateMap.set(a.date, { 
          ...(dateMap.get(a.date) || {}), 
          date: a.date, 
          alerts: a.count || 0 
        });
      }
    });
  }
  
  if (sos && sos.length > 0) {
    sos.forEach(s => {
      if (s.date) {
        dateMap.set(s.date, { 
          ...(dateMap.get(s.date) || {}), 
          date: s.date, 
          sos: s.count || 0 
        });
      }
    });
  }
  
  return Array.from(dateMap.values())
    .map(item => ({
      date: item.date,
      alerts: item.alerts || 0,
      sos: item.sos || 0
    }))
    .sort((a, b) => a.date.localeCompare(b.date));
};
