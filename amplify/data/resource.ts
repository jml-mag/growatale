import { a, defineData, type ClientSchema } from '@aws-amplify/backend';

// Define the schema for DataStore models
const schema = a.schema({
  User: a.model({
    id: a.id().required(),
    username: a.string().required(),
    email: a.string().required(),
    stories: a.hasMany('Story', 'userId'), // Bi-directional relationship
  }).authorization(allow => [
    allow.owner(),
    allow.authenticated().to(['read']),
  ]),
  Story: a.model({
    id: a.id().required(),
    userId: a.id().required(), // Define userId as a scalar field
    user: a.belongsTo('User', 'userId'), // Match with hasMany in User
    title: a.string().required(),
    createdAt: a.datetime().required(),
    updatedAt: a.datetime(),
    scenes: a.hasMany('Scene', 'storyId'), // Bi-directional relationship
    currentSceneId: a.id(),
  }).authorization(allow => [
    allow.owner(),
    allow.authenticated().to(['read']),
  ]),
  Scene: a.model({
    id: a.id().required(),
    storyId: a.id().required(), // Define storyId as a scalar field
    story: a.belongsTo('Story', 'storyId'), // Match with hasMany in Story
    description: a.string().required(),
    image: a.string().required(),
    audio: a.string().required(),
    interactions: a.hasMany('Interaction', 'sceneId'), // Bi-directional relationship
    previousSceneId: a.id(),
  }).authorization(allow => [
    allow.owner(),
    allow.authenticated().to(['read']),
  ]),
  Interaction: a.model({
    id: a.id().required(),
    sceneId: a.id().required(), // Define sceneId as a scalar field
    scene: a.belongsTo('Scene', 'sceneId'), // Match with hasMany in Scene
    type: a.string().required(),
    description: a.string().required(),
    effect: a.string().required(),
  }).authorization(allow => [
    allow.owner(),
    allow.authenticated().to(['read']),
  ]),
  InteractionType: a.enum(['CONFLICT', 'OPPORTUNITY']),
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
});
