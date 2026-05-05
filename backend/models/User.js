const bcrypt = require('bcryptjs');
const { query } = require('../config/db');

function mapRowToUser(row) {
  if (!row) return null;
  return {
    id: row.id,
    _id: String(row.id),
    username: row.username,
    passwordHash: row.password_hash,
    role: row.role,
    name: row.name,
    email: row.email,
    createdAt: row.created_at
  };
}

class User {
  constructor({ username, role = 'customer', name = null, email = null } = {}) {
    this.id = null;
    this._id = null;
    this.username = username;
    this.passwordHash = null;
    this.role = role;
    this.name = name;
    this.email = email;
    this.createdAt = null;
  }

  static async findOne(filters = {}) {
    const clauses = [];
    const values = [];

    if (filters.username !== undefined) {
      clauses.push('username = ?');
      values.push(filters.username);
    }
    if (filters.email !== undefined) {
      clauses.push('email = ?');
      values.push(filters.email);
    }
    if (filters.id !== undefined) {
      clauses.push('id = ?');
      values.push(Number(filters.id));
    }

    if (clauses.length === 0) {
      return null;
    }

    const rows = await query(
      `SELECT id, username, password_hash, role, name, email, created_at FROM users WHERE ${clauses.join(' AND ')} LIMIT 1`,
      values
    );
    const mapped = mapRowToUser(rows[0]);
    return mapped ? Object.assign(new User(mapped), mapped) : null;
  }

  static async findById(id) {
    const rows = await query(
      'SELECT id, username, password_hash, role, name, email, created_at FROM users WHERE id = ? LIMIT 1',
      [Number(id)]
    );
    const mapped = mapRowToUser(rows[0]);
    return mapped ? Object.assign(new User(mapped), mapped) : null;
  }

  static async find(filters = {}) {
    const clauses = [];
    const values = [];

    if (filters.role !== undefined) {
      clauses.push('role = ?');
      values.push(filters.role);
    }

    const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';
    const rows = await query(
      `SELECT id, username, password_hash, role, name, email, created_at FROM users ${where} ORDER BY id DESC`,
      values
    );

    return rows.map((row) => mapRowToUser(row));
  }

  async setPassword(password) {
    const salt = await bcrypt.genSalt(10);
    this.passwordHash = await bcrypt.hash(password, salt);
  }

  async validatePassword(password) {
    return bcrypt.compare(password, this.passwordHash);
  }

  async save() {
    if (this.id) {
      await query(
        'UPDATE users SET username = ?, password_hash = ?, role = ?, name = ?, email = ? WHERE id = ?',
        [this.username, this.passwordHash, this.role, this.name, this.email, this.id]
      );
      return this;
    }

    const result = await query(
      'INSERT INTO users (username, password_hash, role, name, email) VALUES (?, ?, ?, ?, ?)',
      [this.username, this.passwordHash, this.role, this.name, this.email]
    );

    const inserted = await User.findById(result.insertId);
    Object.assign(this, inserted);
    return this;
  }
}

module.exports = User;
