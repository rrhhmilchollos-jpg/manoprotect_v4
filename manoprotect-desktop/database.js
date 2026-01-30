const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');
const path = require('path');

class LocalDatabase {
  constructor(dbPath = './manoprotect.db') {
    this.db = new Database(dbPath);
    this.initTables();
    this.seedDefaultData();
  }

  initTables() {
    // Employees table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS employees (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        employee_id TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role TEXT DEFAULT 'agent',
        branch TEXT DEFAULT 'central',
        phone TEXT,
        avatar TEXT,
        status TEXT DEFAULT 'active',
        last_login TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Clients table (synced from main server)
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS clients (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        client_id TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        email TEXT,
        phone TEXT,
        plan TEXT DEFAULT 'free',
        subscription_status TEXT DEFAULT 'active',
        threats_detected INTEGER DEFAULT 0,
        last_activity TEXT,
        notes TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Threats/Alerts table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS threats (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        threat_id TEXT UNIQUE NOT NULL,
        type TEXT NOT NULL,
        severity TEXT DEFAULT 'medium',
        title TEXT NOT NULL,
        description TEXT,
        source TEXT,
        status TEXT DEFAULT 'pending',
        assigned_to TEXT,
        client_id TEXT,
        resolved_by TEXT,
        resolved_at TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (assigned_to) REFERENCES employees(employee_id),
        FOREIGN KEY (client_id) REFERENCES clients(client_id)
      )
    `);

    // Support tickets table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS tickets (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        ticket_id TEXT UNIQUE NOT NULL,
        subject TEXT NOT NULL,
        description TEXT,
        priority TEXT DEFAULT 'medium',
        status TEXT DEFAULT 'open',
        client_id TEXT,
        assigned_to TEXT,
        created_by TEXT,
        resolved_at TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (assigned_to) REFERENCES employees(employee_id),
        FOREIGN KEY (client_id) REFERENCES clients(client_id)
      )
    `);

    // Ticket messages table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS ticket_messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        ticket_id TEXT NOT NULL,
        sender_id TEXT NOT NULL,
        sender_type TEXT DEFAULT 'employee',
        message TEXT NOT NULL,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (ticket_id) REFERENCES tickets(ticket_id)
      )
    `);

    // Internal chat messages
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS chat_messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        from_employee TEXT NOT NULL,
        to_employee TEXT,
        channel TEXT DEFAULT 'general',
        message TEXT NOT NULL,
        read INTEGER DEFAULT 0,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Activity log
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS activity_log (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        employee_id TEXT NOT NULL,
        action TEXT NOT NULL,
        details TEXT,
        ip_address TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Verified scams database
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS verified_scams (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        scam_id TEXT UNIQUE NOT NULL,
        type TEXT NOT NULL,
        content TEXT,
        url TEXT,
        phone TEXT,
        email TEXT,
        description TEXT,
        risk_level TEXT DEFAULT 'high',
        reported_by TEXT,
        verified_by TEXT,
        verified_at TEXT,
        reports_count INTEGER DEFAULT 1,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Daily stats
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS daily_stats (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        date TEXT UNIQUE NOT NULL,
        threats_detected INTEGER DEFAULT 0,
        threats_resolved INTEGER DEFAULT 0,
        tickets_created INTEGER DEFAULT 0,
        tickets_resolved INTEGER DEFAULT 0,
        new_clients INTEGER DEFAULT 0,
        scams_verified INTEGER DEFAULT 0
      )
    `);
  }

  seedDefaultData() {
    // Check if admin exists
    const admin = this.db.prepare('SELECT * FROM employees WHERE email = ?').get('admin@manoprotect.com');
    
    if (!admin) {
      const hashedPassword = bcrypt.hashSync('Admin2024!', 10);
      
      // Insert default admin
      this.db.prepare(`
        INSERT INTO employees (employee_id, name, email, password, role, branch)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run('EMP001', 'Administrador', 'admin@manoprotect.com', hashedPassword, 'admin', 'central');

      // Insert sample employees
      const sampleEmployees = [
        ['EMP002', 'María García', 'maria@manoprotect.com', 'supervisor', 'central'],
        ['EMP003', 'Carlos López', 'carlos@manoprotect.com', 'agent', 'madrid'],
        ['EMP004', 'Ana Martínez', 'ana@manoprotect.com', 'agent', 'barcelona'],
        ['EMP005', 'Pedro Sánchez', 'pedro@manoprotect.com', 'agent', 'valencia']
      ];

      const insertEmployee = this.db.prepare(`
        INSERT INTO employees (employee_id, name, email, password, role, branch)
        VALUES (?, ?, ?, ?, ?, ?)
      `);

      const defaultPassword = bcrypt.hashSync('Mano2024!', 10);
      sampleEmployees.forEach(emp => {
        insertEmployee.run(emp[0], emp[1], emp[2], defaultPassword, emp[3], emp[4]);
      });

      // Insert sample threats
      const sampleThreats = [
        ['THR001', 'phishing', 'high', 'Phishing Banco Santander', 'Correo falso solicitando datos bancarios', 'email', 'pending'],
        ['THR002', 'smishing', 'critical', 'SMS Correos falso', 'SMS con enlace malicioso haciéndose pasar por Correos', 'sms', 'investigating'],
        ['THR003', 'vishing', 'medium', 'Llamada Microsoft falsa', 'Llamada haciéndose pasar por soporte técnico de Microsoft', 'phone', 'resolved']
      ];

      const insertThreat = this.db.prepare(`
        INSERT INTO threats (threat_id, type, severity, title, description, source, status)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `);

      sampleThreats.forEach(threat => {
        insertThreat.run(...threat);
      });

      // Insert today's stats
      const today = new Date().toISOString().split('T')[0];
      this.db.prepare(`
        INSERT OR REPLACE INTO daily_stats (date, threats_detected, threats_resolved, tickets_created, tickets_resolved, new_clients, scams_verified)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(today, 15, 12, 8, 6, 23, 5);
    }
  }

  // Employee methods
  authenticateEmployee(email, password) {
    const employee = this.db.prepare('SELECT * FROM employees WHERE email = ? AND status = ?').get(email, 'active');
    if (employee && bcrypt.compareSync(password, employee.password)) {
      this.db.prepare('UPDATE employees SET last_login = ? WHERE id = ?').run(new Date().toISOString(), employee.id);
      const { password: _, ...employeeData } = employee;
      return employeeData;
    }
    return null;
  }

  getEmployees() {
    return this.db.prepare('SELECT id, employee_id, name, email, role, branch, phone, status, last_login, created_at FROM employees').all();
  }

  getEmployeeById(employeeId) {
    return this.db.prepare('SELECT id, employee_id, name, email, role, branch, phone, status, last_login, created_at FROM employees WHERE employee_id = ?').get(employeeId);
  }

  // Threat methods
  getThreats(status = null, limit = 50) {
    if (status) {
      return this.db.prepare('SELECT * FROM threats WHERE status = ? ORDER BY created_at DESC LIMIT ?').all(status, limit);
    }
    return this.db.prepare('SELECT * FROM threats ORDER BY created_at DESC LIMIT ?').all(limit);
  }

  getThreatById(threatId) {
    return this.db.prepare('SELECT * FROM threats WHERE threat_id = ?').get(threatId);
  }

  updateThreatStatus(threatId, status, resolvedBy = null) {
    if (status === 'resolved') {
      return this.db.prepare('UPDATE threats SET status = ?, resolved_by = ?, resolved_at = ? WHERE threat_id = ?')
        .run(status, resolvedBy, new Date().toISOString(), threatId);
    }
    return this.db.prepare('UPDATE threats SET status = ? WHERE threat_id = ?').run(status, threatId);
  }

  assignThreat(threatId, employeeId) {
    return this.db.prepare('UPDATE threats SET assigned_to = ?, status = ? WHERE threat_id = ?')
      .run(employeeId, 'investigating', threatId);
  }

  addThreat(threat) {
    const threatId = 'THR' + Date.now();
    return this.db.prepare(`
      INSERT INTO threats (threat_id, type, severity, title, description, source, status, client_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(threatId, threat.type, threat.severity, threat.title, threat.description, threat.source, 'pending', threat.clientId || null);
  }

  // Client methods
  getClients(limit = 100) {
    return this.db.prepare('SELECT * FROM clients ORDER BY created_at DESC LIMIT ?').all(limit);
  }

  searchClients(query) {
    const searchTerm = `%${query}%`;
    return this.db.prepare(`
      SELECT * FROM clients 
      WHERE name LIKE ? OR email LIKE ? OR phone LIKE ? OR client_id LIKE ?
      LIMIT 50
    `).all(searchTerm, searchTerm, searchTerm, searchTerm);
  }

  getClientById(clientId) {
    return this.db.prepare('SELECT * FROM clients WHERE client_id = ?').get(clientId);
  }

  updateClientNotes(clientId, notes) {
    return this.db.prepare('UPDATE clients SET notes = ? WHERE client_id = ?').run(notes, clientId);
  }

  // Ticket methods
  getTickets(status = null, limit = 50) {
    if (status) {
      return this.db.prepare('SELECT * FROM tickets WHERE status = ? ORDER BY created_at DESC LIMIT ?').all(status, limit);
    }
    return this.db.prepare('SELECT * FROM tickets ORDER BY created_at DESC LIMIT ?').all(limit);
  }

  createTicket(ticket) {
    const ticketId = 'TKT' + Date.now();
    return this.db.prepare(`
      INSERT INTO tickets (ticket_id, subject, description, priority, status, client_id, created_by)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(ticketId, ticket.subject, ticket.description, ticket.priority, 'open', ticket.clientId, ticket.createdBy);
  }

  // Stats methods
  getDailyStats(date = null) {
    const targetDate = date || new Date().toISOString().split('T')[0];
    return this.db.prepare('SELECT * FROM daily_stats WHERE date = ?').get(targetDate);
  }

  getWeeklyStats() {
    return this.db.prepare(`
      SELECT * FROM daily_stats 
      WHERE date >= date('now', '-7 days')
      ORDER BY date ASC
    `).all();
  }

  // Verified scams methods
  getVerifiedScams(limit = 100) {
    return this.db.prepare('SELECT * FROM verified_scams ORDER BY created_at DESC LIMIT ?').all(limit);
  }

  addVerifiedScam(scam) {
    const scamId = 'SCM' + Date.now();
    return this.db.prepare(`
      INSERT INTO verified_scams (scam_id, type, content, url, phone, email, description, risk_level, reported_by)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(scamId, scam.type, scam.content, scam.url, scam.phone, scam.email, scam.description, scam.riskLevel, scam.reportedBy);
  }

  // Activity log
  logActivity(employeeId, action, details = null) {
    return this.db.prepare(`
      INSERT INTO activity_log (employee_id, action, details)
      VALUES (?, ?, ?)
    `).run(employeeId, action, details);
  }

  getActivityLog(employeeId = null, limit = 100) {
    if (employeeId) {
      return this.db.prepare('SELECT * FROM activity_log WHERE employee_id = ? ORDER BY created_at DESC LIMIT ?').all(employeeId, limit);
    }
    return this.db.prepare('SELECT * FROM activity_log ORDER BY created_at DESC LIMIT ?').all(limit);
  }

  // Dashboard summary
  getDashboardSummary() {
    const threats = this.db.prepare('SELECT COUNT(*) as total, status FROM threats GROUP BY status').all();
    const tickets = this.db.prepare('SELECT COUNT(*) as total, status FROM tickets GROUP BY status').all();
    const clients = this.db.prepare('SELECT COUNT(*) as total FROM clients').get();
    const todayStats = this.getDailyStats();
    
    return {
      threats: threats.reduce((acc, t) => { acc[t.status] = t.total; return acc; }, {}),
      tickets: tickets.reduce((acc, t) => { acc[t.status] = t.total; return acc; }, {}),
      totalClients: clients.total,
      todayStats
    };
  }
}

module.exports = LocalDatabase;
