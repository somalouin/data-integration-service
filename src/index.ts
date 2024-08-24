import axios, { AxiosInstance } from 'axios';

interface DataSource {
  id: string;
  name: string;
  type: "database" | "api" | "file";
  connectionDetails: any;
}

interface DataTransformationRule {
  id: string;
  name: string;
  sourceField: string;
  targetField: string;
  transformationFunction: (value: any) => any;
}

export class EnterpriseDataIntegrationService {
  private httpClient: AxiosInstance;

  constructor(baseURL: string = '') {
    this.httpClient = this.createHttpClient(baseURL);
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
    const response = await this.httpClient.get(`/api/data-sources/${dataSource.id}/data`);
    return response.data;
  }

  private async fetchFromApi(dataSource: DataSource): Promise<any[]> {
    const response = await this.httpClient.get(dataSource.connectionDetails.url);
    return response.data;
  }

  private async fetchFromFile(dataSource: DataSource): Promise<any[]> {
    const response = await this.httpClient.get(`/api/data-sources/${dataSource.id}/file`);
    return response.data;
  }

  private async loadToDatabase(dataSource: DataSource, data: any[]): Promise<boolean> {
    const response = await this.httpClient.post(`/api/data-sources/${dataSource.id}/data`, data);
    return response.data.success;
  }

  private async loadToApi(dataSource: DataSource, data: any[]): Promise<boolean> {
    const response = await this.httpClient.post(dataSource.connectionDetails.url, data);
    return response.data.success;
  }

  private async loadToFile(dataSource: DataSource, data: any[]): Promise<boolean> {
    const response = await this.httpClient.post(`/api/data-sources/${dataSource.id}/file`, data);
    return response.data.success;
  }

  private createHttpClient(baseURL: string): AxiosInstance {
    return axios.create({
      baseURL,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}
