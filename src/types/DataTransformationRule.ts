interface DataTransformationRule {
  id: string;
  name: string;
  sourceField: string;
  targetField: string;
  transformationFunction: (value: any) => any;
}