// @/app/play/genreSettings.ts

interface GenreSettings {
    author: string;
    writer: string;
    weather: number;
    time: string;
    artist: string;
    artMedium: string;
    starting_scene_description: string;
    genre: string;
    year: number;
    geography: string;
  }
  
  const genreSettings: { [key: string]: GenreSettings } = {
    "gothic horror": {
      author: "Edgar Allan Poe",
      writer: "Edgar Allan Poe",
      weather: 6,
      time: "12:00 PM",
      artist: "A Pulitzer prize-winning photographer using photographic equipment of the era",
      starting_scene_description: "The Inner Harbor.",
      genre: "gothic horror",
      artMedium: "Daguerreotype photograph",
      year: 1849,
      geography: "Baltimore"
    },
    "science fiction": {
      author: "Isaac Asimov",
      writer: "Isaac Asimov",
      weather: 1,
      time: "08:00 AM",
      artist: "A futuristic digital artist",
      starting_scene_description: "A bustling spaceport.",
      genre: "science fiction",
      artMedium: "90's Cyberpunk graphic novel image",
      year: 2054,
      geography: "Earth"
    },
    "western": {
      author: "Louis L'Amour",
      writer: "Louis L'Amour",
      weather: 4,
      time: "03:00 PM",
      artist: "A classic western landscape painter",
      starting_scene_description: "A mining town.",
      genre: "western",
      artMedium: "Oil painting",
      year: 1880,
      geography: "The Colorado Western Slope"
    }
  };
  
  export default genreSettings;
  