import { ModelInit, MutableModel, PersistentModelConstructor } from "@aws-amplify/datastore";





type TestMetaData = {
  readOnlyFields: 'createdAt' | 'updatedAt';
}

export declare class Test {
  readonly id: string;
  readonly name?: string;
  readonly createdAt?: string;
  readonly updatedAt?: string;
  constructor(init: ModelInit<Test, TestMetaData>);
  static copyOf(source: Test, mutator: (draft: MutableModel<Test, TestMetaData>) => MutableModel<Test, TestMetaData> | void): Test;
}