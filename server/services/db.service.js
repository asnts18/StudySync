// server/services/db.service.js
const db = require('../config/db.config');

class DatabaseService {
  constructor(tableName, primaryKey = 'id') {
    this.tableName = tableName;
    this.primaryKey = primaryKey;
  }

  // Basic CRUD operations
  async findAll(conditions = {}) {
    try {
      let query = `SELECT * FROM ${this.tableName}`;
      const params = [];
      
      // Add WHERE conditions if any
      const whereConditions = Object.entries(conditions);
      if (whereConditions.length > 0) {
        query += ' WHERE ' + whereConditions.map(([key]) => `${key} = ?`).join(' AND ');
        params.push(...whereConditions.map(([_, value]) => value));
      }
      
      return await db.query(query, params);
    } catch (error) {
      throw error;
    }
  }

  async findById(id) {
    try {
      const rows = await db.query(
        `SELECT * FROM ${this.tableName} WHERE ${this.primaryKey} = ?`, 
        [id]
      );
      return rows[0];
    } catch (error) {
      throw error;
    }
  }

  async findOne(conditions) {
    try {
      const results = await this.findAll(conditions);
      return results[0];
    } catch (error) {
      throw error;
    }
  }

  async create(data) {
    try {
      const columns = Object.keys(data).join(', ');
      const placeholders = Object.keys(data).map(() => '?').join(', ');
      const values = Object.values(data);
      
      const result = await db.query(
        `INSERT INTO ${this.tableName} (${columns}) VALUES (${placeholders})`,
        values
      );
      
      return { 
        [this.primaryKey]: result.insertId,
        ...data 
      };
    } catch (error) {
      throw error;
    }
  }

  async update(id, data) {
    try {
      const setClause = Object.keys(data).map(key => `${key} = ?`).join(', ');
      const values = [...Object.values(data), id];
      
      const result = await db.query(
        `UPDATE ${this.tableName} SET ${setClause} WHERE ${this.primaryKey} = ?`,
        values
      );
      
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  async delete(id) {
    try {
      const result = await db.query(
        `DELETE FROM ${this.tableName} WHERE ${this.primaryKey} = ?`,
        [id]
      );
      
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  // Advanced query methods
  async executeRawQuery(sql, params = []) {
    try {
      return await db.query(sql, params);
    } catch (error) {
      throw error;
    }
  }

  async callStoredProcedure(procedure, params = []) {
    try {
      return await db.callProcedure(procedure, params);
    } catch (error) {
      throw error;
    }
  }
}

module.exports = DatabaseService;