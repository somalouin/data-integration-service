import fs from 'fs/promises';
import { Pool } from 'pg'; // Assuming PostgreSQL for database operations

export class DataIntegrationService {
  private dbPool: Pool;

  constructor() {
    this.dbPool = new Pool({
      // database connection details
    });
  }

  async fetchData(dataSource: DataSource): Promise<any[]> {
    switch (dataSource.type) {
      case "database":
        return this.fetchFromDatabase(dataSource);
      case "api":
        return this.fetchFromApi(dataSource);
      case "file":
        return this.fetchFromFile(dataSource);
      default:
        throw new Error(`Unsupported data source type: ${dataSource.type}`);
    }
  }

  transformData(data: any[], transformationRules: DataTransformationRule[],): any[] {
    return data.map((item) => {
      const transformedItem: any = { ...item };
      transformationRules.forEach((rule) => {
        transformedItem[rule.targetField] = rule.transformationFunction(
          item[rule.sourceField],
        );
      });
      return transformedItem;
    });
  }

  async loadData(dataSource: DataSource, data: any[]): Promise<boolean> {
    switch (dataSource.type) {
      case "database":
        return this.loadToDatabase(dataSource, data);
      case "api":
        return this.loadToApi(dataSource, data);
      case "file":
        return this.loadToFile(dataSource, data);
      default:
        throw new Error(`Unsupported data source type: ${dataSource.type}`);
    }
  }

  private async fetchFromDatabase(dataSource: DataSource): Promise<any[]> {
    const { table, schema = 'public' } = dataSource.connectionDetails;
    const query = `SELECT * FROM ${schema}.${table}`;
    const result = await this.dbPool.query(query);
    return result.rows;
  }

  private async fetchFromApi(dataSource: DataSource): Promise<any[]> {
    const response = await fetch(dataSource.connectionDetails.url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  }

  private async fetchFromFile(dataSource: DataSource): Promise<any[]> {
    const { filePath } = dataSource.connectionDetails;
    const data = await fs.readFile(filePath, 'utf8');
    return JSON.parse(data);
  }

  private async loadToDatabase(dataSource: DataSource, data: any[]): Promise<boolean> {
    const { table, schema = 'public' } = dataSource.connectionDetails;
    const columns = Object.keys(data[0]).join(', ');
    const values = data.map(row => `(${Object.values(row).map(v => `'${v}'`).join(', ')})`).join(', ');
    const query = `INSERT INTO ${schema}.${table} (${columns}) VALUES ${values}`;
    await this.dbPool.query(query);
    return true;
  }

  private async loadToApi(dataSource: DataSource, data: any[]): Promise<boolean> {
    const response = await fetch(dataSource.connectionDetails.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    return response.ok;
  }

  private async loadToFile(dataSource: DataSource, data: any[]): Promise<boolean> {
    const { filePath } = dataSource.connectionDetails;
    await fs.writeFile(filePath, JSON.stringify(data, null, 2));
    return true;
  }
}
