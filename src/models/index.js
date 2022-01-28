// @ts-check
import { initSchema } from '@aws-amplify/datastore';
import { schema } from './schema';

const QuestionType = {
  "SCALE": "Scale",
  "MULTIPLE_CHOICE": "MultipleChoice",
  "FREE_RESPONSE": "FreeResponse"
};

const { User, Survey, Question, Answer } = initSchema(schema);

export {
  User,
  Survey,
  Question,
  Answer,
  QuestionType
};