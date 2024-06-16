import { type ClientSchema, a, defineData } from '@aws-amplify/backend';

const schema = a.schema({
  Action: a.customType({
    direction: a.string().required(),
    command_text: a.string().required(),
    transition_text: a.string().required(),
  }),
  Inventory: a.customType({
    item: a.string().required(),
    amount: a.string().required(),
  }),
  Scene: a.model({
    id: a.id().required(),
    image: a.string().required(),
    audio: a.string().required(),
    actions_available: a.ref('Action').array().required(),
    primary_text: a.string().required(),
    scene_description: a.string().required(),
    time: a.string().required(),
    previous_scene: a.string(),
    story_id: a.string().required(),
    story: a.belongsTo('Story', 'story_id'),
  }).authorization(allow => [
    allow.owner(),
  ]),
  Story: a.model({
    id: a.id().required(),
    owner: a.string().required(),
    author: a.string().required(),
    artist: a.string().required(),
    current_scene: a.string().required(),
    player_health: a.integer().required(),
    player_inventory: a.ref('Inventory').array().required(),
    primary_ai: a.string().required(),
    audio_ai: a.string().required(),
    image_ai: a.string().required(),
    scenes: a.hasMany('Scene', 'story_id'), // Reflects that a Story has many Scenes
  }).authorization(allow => [
    allow.owner(),
  ]),
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
});
