// @ts-check
import { initSchema } from '@aws-amplify/datastore';
import { schema } from './schema';



const { User, Survey, Question, Answer } = initSchema(schema);

export {
  User,
  Survey,
  Question,
  Answer
};