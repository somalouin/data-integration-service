interface DataSource {
  id: string;
  name: string;
  type: "database" | "api" | "file";
  connectionDetails: any;
}