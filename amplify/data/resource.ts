// amplify/data/resource.ts
import { type ClientSchema, a, defineData } from '@aws-amplify/backend';

const schema = a.schema({
  Scene: a.model({
    id: a.id().required(),
    image: a.string().required(),
    audio: a.string().required(),
    actions_available: a.string().required().array(),
    primary_text: a.string().required(),
    scene_description: a.string().required(),
    time: a.string().required(),
    previous_scene: a.string().required(),
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
    player_inventory: a.string().required().array(),
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
