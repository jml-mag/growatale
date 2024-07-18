// @/app/play/genreSettings.ts

interface GenreSettings {
    author: string;
    writer: string;
    weather: number;
    time: string;
    artist: string;
    starting_scene_description: string;
    genre: string;
    
  }
  
  const genreSettings: { [key: string]: GenreSettings } = {
    "gothic horror": {
      author: "Edgar Allan Poe",
      writer: "Edgar Allan Poe",
      weather: 6,
      time: "12:00 PM",
      artist: "A Pulitzer prize-winning photographer using photographic equipment of the era",
      starting_scene_description: "The inner harbor of Baltimore, Maryland, in the year 1849. The site in Baltimore is the Inner Harbor.",
      genre: "gothic horror"
    },
    "science fiction": {
      author: "Isaac Asimov",
      writer: "Isaac Asimov",
      weather: 1,
      time: "08:00 AM",
      artist: "A futuristic digital artist",
      starting_scene_description: "A bustling spaceport on a distant planet in the year 3024.",
      genre: "science fiction"
    },
    "western": {
      author: "Louis L'Amour",
      writer: "Louis L'Amour",
      weather: 4,
      time: "03:00 PM",
      artist: "A classic western landscape painter",
      starting_scene_description: "A dusty frontier town in the American West during the late 1800s.",
      genre: "western"
    }
  };
  
  export default genreSettings;
  