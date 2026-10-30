// Site content. Everything in [brackets] is a placeholder for Felipe's real content.
// Later this comes from the database (uploads, articles, tracks, episodes).

import { img, PHOTOS } from "./photos.js";
export { PHOTOS };

/* Hero slides. `mask` (or null to skip the effect) is a cut-out of the photo's subject (horses, towers,
 * ridge, flowers) that sits in front of the headline. `pos` is the
 * object-position used for both the photo and its mask so they line up.
 * `cutFrom` is how far down the giant word the cut-out starts (0 = from the
 * top, so the sunset clouds can drift over whole letters; default 0.22).
 * `zoom`/`origin` enlarge a photo (and its cut-out) so its subject reaches the word. */
export const SLIDES = [
  { id: "sunset", word: "the canyons", caption: "Sunset over the Sierra Tarahumara · Chihuahua", src: img("sunset.webp"), mask: img("sunset-clouds-mask.png"), cutFrom: 0.05, pos: "50% 55%", alt: "Sun breaking through clouds over layered desert mountains at sunset" },
  { id: "horses", word: "the plains", caption: "Wild horses on the plains · Chihuahua", src: img("horses.webp"), mask: img("horses-mask.png"), pos: "50% 60%", zoom: 1.45, origin: "52% 80%", alt: "Wild horses walking through golden desert scrubland" },
  { id: "cathedral", word: "the plaza", caption: "The cathedral at dusk · Chihuahua City", src: img("cathedral.webp"), mask: img("cathedral-mask.png"), pos: "50% 40%", alt: "A lit cathedral with two bell towers at dusk" },
  { id: "adobe", word: "the hills", caption: "Adobe in the hills · Casas Grandes, Chihuahua", src: img("adobe.webp"), mask: img("adobe-mask.png"), pos: "50% 45%", alt: "An adobe house below rocky desert hills under a deep blue sky" },
  { id: "cactus", word: "the desert", caption: "Desert bloom · Chihuahuan Desert", src: img("cactus.webp"), mask: img("cactus-mask.png"), pos: "50% 45%", alt: "Red flowers blooming on a desert cactus" },
];


export { FEATURED_VIDEO, VIDEOS, ALL_VIDEOS, VIDEO_FILTERS, videoBySlug, TRACKS, PLAYLISTS, GENRES, DEDICATIONS, EPISODES, episodeBySlug } from "./media.js";

export const NEWS_FILTERS = ["All", "Local", "Music", "Culture", "Nature", "Faith"];

/* Sample stories for the demo, written as if Felipe had posted them.
 * Towns and papers are made up; real articles replace these later. */
export const LEAD_STORY = {
  id: "lead",
  slug: "mercado-nocturno-plaza-de-armas",
  category: "Local",
  ago: "3h ago",
  read: "6 min read",
  title: "The night market is back in the Plaza de Armas after four years, and the whole city came out",
  summary: "Forty stalls lined the Plaza de Armas in front of the cathedral on Saturday as the night market returned, with food, music and crafts until midnight. Organizers say it will run every second Saturday through spring.",
  source: "The Valley Courier",
  take: "I walked the whole square twice. The tamale lady from the old days is still there, same cart, same smile. This is what a town looks like when it remembers itself. Go, and bring your grandchildren.",
  takeAgo: "2h ago",
  comments: 24,
  photo: PHOTOS.cathedral,
  pos: "50% 40%",
  alt: "A lit cathedral with two bell towers at dusk, with food stalls in the plaza",
  body: [
    "For the first time in four years, the cathedral square filled with lanterns, smoke from the grills and the sound of a brass band tuning up. The night market, once a fixture of the town calendar, returned on Saturday with forty stalls and a crowd that organizers put at nearly three thousand.",
    "Vendors sold tamales, roasted corn, hand-woven blankets and pottery. A local trio played rancheras from the cathedral steps until the last stall closed at midnight.",
    "The market will now run every second Saturday through the end of spring, weather permitting.",
  ],
  thread: [
    { name: "Rosa M.", ago: "1h ago", text: "Don Felipe, I saw you by the band! The tamale lady is my tía, she said thank you for the kind words." },
    { name: "Felipe Lerma", host: true, ago: "50m ago", text: "Tell her the green chile ones are still the best in the state. I'll be back for more." },
    { name: "Tomás R.", ago: "40m ago", text: "Took my kids for the first time. They didn't want to leave." },
  ],
};

export const ARTICLES = [
  {
    id: "a1", slug: "guitarrero-de-delicias", body: ["In a small workshop in Delicias, between the smell of cedar and glue, a luthier who has built guitars for fifty years now spends his mornings teaching.", "Every year he takes four apprentices, free of charge. They learn to choose the wood, bend the sides with heat and set the frets by hand. Each one finishes the year with a guitar of their own.", "“A guitar is not finished when it is built,” he says. “It is finished when somebody plays it at a wedding.”"],
    category: "Music", ago: "5h ago", read: "4 min read", source: "High Desert Weekly",
    title: "A 78-year-old guitar maker is teaching his craft to the next generation",
    summary: "In a small workshop in Delicias, a luthier who has built guitars for half a century now takes four apprentices a year, free of charge.",
    take: "Wood remembers the hands that shaped it. So do people. Bless this man.",
    longTake: "I've played one of his guitars. The sound is warm like a kitchen at Christmas. What he's doing for these young people is worth more than any record deal. Wood remembers the hands that shaped it. So do people.",
    photo: PHOTOS.cactus, pos: "50% 40%", comments: 11,
    thread: [
      { name: "Daniel P.", ago: "3h ago", text: "I was one of his apprentices in 2019. He's the real thing." },
      { name: "Felipe Lerma", host: true, ago: "2h ago", text: "Then you carry his voice too, Daniel. Send me a recording, I'd love to play it on the show." },
    ],
  },
  {
    id: "a2", slug: "casas-de-adobe-casas-grandes", body: ["Every Saturday and Sunday morning, families in Casas Grandes gather on the town's oldest street with buckets, shovels and piles of straw.", "They mix mud, straw and water by hand and press it into wooden molds to make new adobe bricks, the same way the houses were built a hundred years ago.", "So far they have repaired four of the eleven houses. Anyone can help: the work starts at eight and there is always coffee."],
    category: "Culture", ago: "8h ago", read: "5 min read", source: "The Valley Courier",
    title: "Families are restoring a row of 100-year-old adobe homes, brick by brick",
    summary: "Volunteers mix mud, straw and water by hand each weekend to repair the oldest street in Casas Grandes, using the same methods their great-grandparents did.",
    take: "Mud, straw and patience. The recipe hasn't changed in a hundred years, and neither has the love.",
    longTake: "My father built with adobe. He used to say a house made of the land keeps you cool because it knows the sun. It moves me to see young families with their sleeves rolled up. Mud, straw and patience. The recipe hasn't changed.",
    photo: PHOTOS.adobe, pos: "40% 55%", comments: 7,
    thread: [
      { name: "Lucía G.", ago: "6h ago", text: "We're out there every Sunday at 8. Anyone can come help!" },
      { name: "Felipe Lerma", host: true, ago: "5h ago", text: "Save me a shovel, Lucía. My back is old but my hands still work." },
    ],
  },
  {
    id: "a3", slug: "caballos-salvajes", body: ["Rangers counted 212 wild horses across the plains of northern Chihuahua this spring, the largest number in ten years.", "Thirty-one of them were foals born this year. Two wet winters in a row brought back the grass and filled the watering holes.", "Rangers remind visitors to watch the herds from a distance and never feed them."],
    category: "Nature", ago: "1d ago", read: "3 min read", source: "Range & Sky Journal",
    title: "Wild horse herd grows to its largest count in a decade",
    summary: "Rangers counted 212 horses across the plains of northern Chihuahua this spring, including 31 foals, after two wet winters brought back the grass.",
    take: "Thirty-one foals. Some good news from the plains for once, and I'll take it with my coffee.",
    longTake: "When I was a boy you could see them from the road at sunset. Then for years, almost nothing. Thirty-one foals. Rain does what speeches can't. Some good news from the plains for once, and I'll take it with my coffee.",
    photo: PHOTOS.horses, pos: "55% 55%", comments: 19,
    thread: [
      { name: "Marisol V.", ago: "20h ago", text: "Saw a group of them near the dry lake last week. Beautiful." },
      { name: "Felipe Lerma", host: true, ago: "18h ago", text: "Keep your distance and your camera ready, mija. That's the right way to love them." },
    ],
  },
  {
    id: "a4", slug: "desierto-en-flor", body: ["After the wettest winter in years, the Chihuahuan Desert is in full bloom.", "Cactus flowers, poppies and desert marigolds are covering the hills in red, orange and yellow. Botanists say the bloom should last until the first heat of summer.", "Visitors are asked to stay on the trails and not pick the flowers, so the seeds can fall for next year."],
    category: "Nature", ago: "2d ago", read: "4 min read", source: "Range & Sky Journal",
    title: "After a wet winter, the desert is in full bloom for the first time in years",
    summary: "Cactus flowers, poppies and desert marigolds are covering the hills of the Chihuahuan Desert in color, and visitors are asked to stay on the trails.",
    take: "The desert is never empty. It's only waiting. Go see it before the heat comes.",
    longTake: "People who don't know the desert think it's empty. It's not empty, it's patient. Give it one good winter and look what it does. Go early in the morning, stay on the trail, and take somebody you love.",
    photo: PHOTOS.sunset, pos: "60% 60%", comments: 9,
    thread: [
      { name: "Javier O.", ago: "1d ago", text: "The hills by the reservoir are completely orange right now." },
    ],
  },
  {
    id: "a5", slug: "conciertos-en-el-rialto", body: ["The old Rialto theater in downtown Chihuahua will open its doors every Sunday afternoon this summer for free concerts.", "Local bands, mariachi groups and school orchestras will take turns on the stage, which was restored last year with its original red curtains.", "No ticket is needed. Doors open at five, and the first rows fill up fast."],
    category: "Music", ago: "3d ago", read: "5 min read", source: "High Desert Weekly",
    title: "The old Rialto theater will host free Sunday concerts all summer",
    summary: "The 1930s theater in downtown Chihuahua reopens its doors for local bands, mariachi groups and school orchestras, with no ticket needed.",
    take: "I had my first dance at the Rialto. I'll be in row five, if anybody wants to say hello.",
    longTake: "I had my first dance at the Rialto, 1968, with a girl in a yellow dress who later became my wife. Music should be free on a Sunday. I'll be in row five, if anybody wants to say hello.",
    photo: PHOTOS.cathedral, pos: "50% 25%", comments: 31,
    thread: [
      { name: "Elena S.", ago: "2d ago", text: "This is the sweetest thing I've read all week ❤️" },
      { name: "Felipe Lerma", host: true, ago: "2d ago", text: "She'd have liked you, Elena. Come to the show." },
    ],
  },
  {
    id: "a6", slug: "panaderia-de-parral", body: ["The oldest bakery in Parral is turning seventy-five, and the same family is still running it.", "Three generations bake conchas, bolillos and orejas before sunrise in the original brick oven. The grandmother, now ninety, still checks the dough every morning.", "To celebrate, there is free coffee all week for everyone who comes in."],
    category: "Local", ago: "4d ago", read: "2 min read", source: "The Valley Courier",
    title: "The oldest bakery in Parral is turning 75",
    summary: "Three generations of the same family still bake conchas and bolillos before sunrise, and they're celebrating with free coffee all week.",
    take: "They still know your name and ask about your mother. Seventy-five years of good manners.",
    longTake: "They still know your name and ask about your mother. You can't download that. Stop by this week, have the free coffee, and buy an extra concha for your neighbor.",
    photo: PHOTOS.adobe, pos: "70% 50%", comments: 14,
    thread: [
      { name: "Ray C.", ago: "3d ago", text: "Been buying my bread there since '82. Best people in Parral." },
    ],
  },
  {
    id: "a7", slug: "campana-de-la-sierra", category: "Faith", ago: "5d ago", read: "3 min read", source: "The Valley Courier",
    title: "A small chapel in the Sierra rings its restored bell again after 40 years",
    summary: "Families in a mountain village near Creel raised money for two years to recast the bronze bell that cracked in a winter storm in the 1980s.",
    take: "When that bell rang, half the village cried. The other half was already crying.",
    longTake: "Some sounds belong to a place. My grandmother used to say the bell called the people and the people answered. Forty years of silence, and now it calls again. When it rang, half the village cried. The other half was already crying.",
    body: [
      "On Sunday morning, the bell of the small chapel above the village rang for the first time in four decades. It had cracked during a hard winter in the 1980s and had been silent ever since.",
      "Families started a collection two years ago: tamale sales, raffles, a little from every paycheck. The bronze was recast in a foundry in the city and carried back up the mountain road in the back of a pickup truck.",
      "The priest blessed it before the first mass, and the children were allowed to pull the rope.",
    ],
    photo: PHOTOS.cathedral, pos: "50% 12%", comments: 22,
    thread: [
      { name: "Guadalupe T.", ago: "5d ago", text: "My mother was baptized in that chapel. Thank you for sharing it, Don Felipe." },
      { name: "Felipe Lerma", host: true, ago: "5d ago", text: "Then the bell rang for her too, Guadalupe. God bless your family." },
    ],
  },
  {
    id: "a8", slug: "escuela-de-acordeon", category: "Music", ago: "5d ago", read: "3 min read", source: "High Desert Weekly",
    title: "An accordion school for kids opens in Cuauhtémoc",
    summary: "A retired norteño musician is teaching twenty children to play the accordion on Saturday mornings, with instruments donated by local families.",
    take: "Twenty little accordions. The neighbors are going to need patience, and they're going to love it.",
    longTake: "The accordion is the heart of the music up here. It cries and it dances in the same song. Twenty children learning it on a Saturday morning is the best news I've read this month. The neighbors are going to need patience, and they're going to love it.",
    body: [
      "Every Saturday at nine, a retired norteño musician opens the doors of an old garage in Cuauhtémoc and twenty children come in carrying accordions almost as big as they are.",
      "Most of the instruments were donated by families who had one sitting in a closet. The lessons are free; parents bring coffee and pan dulce.",
      "The students will give their first concert in the town square at the end of the year.",
    ],
    photo: PHOTOS.cactus, pos: "30% 50%", comments: 16,
    thread: [
      { name: "Héctor A.", ago: "4d ago", text: "My son is in that class! He practices every night." },
      { name: "Felipe Lerma", host: true, ago: "4d ago", text: "Tell him to play me a redova when he's ready. I'll put it on the radio." },
    ],
  },
  {
    id: "a9", slug: "arboles-rio-chuviscar", category: "Nature", ago: "6d ago", read: "3 min read", source: "Range & Sky Journal",
    title: "Volunteers plant two thousand trees along the Chuvíscar River",
    summary: "Neighbors, students and retirees spent the weekend planting willows and cottonwoods along the riverbank that runs through Chihuahua City.",
    take: "Old men plant trees whose shade they'll never sit in. That's the whole idea of a good life.",
    longTake: "There's an old saying: a people grows great when old men plant trees whose shade they know they'll never sit in. I saw young and old with shovels on Saturday. In twenty years somebody's grandchild will read under those willows.",
    body: [
      "Over two days, more than three hundred volunteers planted willows and cottonwoods along the banks of the Chuvíscar, the river that crosses Chihuahua City.",
      "Organizers said the trees will give shade to the walking path, hold the soil when the summer rains come, and bring birds back to the river.",
      "Each tree has a small wooden tag with the name of the person or the class that planted it.",
    ],
    photo: PHOTOS.horses, pos: "75% 40%", comments: 12,
    thread: [
      { name: "Sofía R.", ago: "5d ago", text: "Our class planted forty of them! The kids named every one." },
    ],
  },
  {
    id: "a10", slug: "estacion-de-creel", category: "Local", ago: "7d ago", read: "2 min read", source: "The Valley Courier",
    title: "The old train station in Creel gets a fresh coat of paint",
    summary: "The station where the mountain train stops on its way through the Copper Canyon has been repainted in its original colors, ochre and cream.",
    take: "Ochre and cream. Somebody up there has good taste. Now let's ride that train again.",
    longTake: "I took that train with my father when I was eleven. I remember the tunnels, the cold air and the bread he bought from a lady at the window. Ochre and cream, just like I remember it. Now let's ride that train again.",
    body: [
      "The train station in Creel, where the mountain train stops on its way through the Copper Canyon, has been repainted in its original colors: ochre walls and cream window frames.",
      "The work took three weeks and was done by local painters, who also repaired the wooden benches on the platform.",
      "Visitors and neighbors say the station looks the way it did fifty years ago.",
    ],
    photo: PHOTOS.adobe, pos: "20% 60%", comments: 27,
    thread: [
      { name: "Andrés M.", ago: "6d ago", text: "I work at the station. Come visit, Don Felipe, the coffee is on me." },
      { name: "Felipe Lerma", host: true, ago: "6d ago", text: "Careful, Andrés. I'll hold you to that." },
    ],
  },
  {
    id: "a11", slug: "coro-de-parral", category: "Faith", ago: "8d ago", read: "3 min read", source: "High Desert Weekly",
    title: "A children's choir from Parral will sing at Christmas Eve mass",
    summary: "Forty children from Parral's public schools have been rehearsing villancicos every afternoon since September for the Christmas Eve mass at the old church downtown.",
    take: "Forty little voices singing villancicos. Bring a handkerchief, you'll need it.",
    longTake: "Nothing sounds like Christmas the way children singing in an old church does. I still know every word of “Los peces en el río.” Forty little voices this year. Bring a handkerchief, you'll need it.",
    body: [
      "Every afternoon since September, forty children from public schools in Parral have stayed after class to rehearse traditional villancicos.",
      "Their teacher says the children chose the songs themselves, starting with the ones their grandparents taught them.",
      "They will sing at the Christmas Eve mass at the old church downtown. Families are asked to arrive early: last year there was standing room only.",
    ],
    photo: PHOTOS.cathedral, pos: "50% 65%", comments: 18,
    thread: [
      { name: "Patricia L.", ago: "7d ago", text: "My granddaughter is in the choir, she sings in the front row!" },
      { name: "Felipe Lerma", host: true, ago: "7d ago", text: "Then I'll be looking at the front row, Patricia." },
    ],
  },
];

/* Every story, newest first, and lookup by its web address. */
export const ALL_STORIES = [LEAD_STORY, ...ARTICLES];
export const storyBySlug = slug => ALL_STORIES.find(a => a.slug === slug);


/* "From Felipe's desk": his latest activity, newest first.
 * NEXT_POST appears live a few seconds after the section scrolls into view. */
export const DESK = [
  { id: "d1", kind: "shared", ago: "2h ago", text: "Shared the night market story with his take.", link: "lead" },
  { id: "d2", kind: "note", ago: "6h ago", text: "Up before sunrise again. The light on the hills this morning looked like honey. Some days I don't need the radio." },
  { id: "d3", kind: "music", ago: "Yesterday", text: "Added a new song to the playlist. Play it loud with the windows down.", meta: "[Track title] · [Artist]" },
  { id: "d4", kind: "podcast", ago: "2d ago", text: "Recorded episode 13 today with a guest who has walked the old trail on foot. Out on Friday.", meta: "Voices of the world · Ep. 13" },
  { id: "d5", kind: "photo", ago: "3d ago", text: "The hills behind the old adobe, after the rain.", photo: PHOTOS.adobe, pos: "50% 45%" },
];

export const NEXT_POST = {
  id: "d0", kind: "note", ago: "Just now",
  text: "Reading your comments with my coffee. Thank you for being here, all of you. Tomorrow I'll share a story about the old Rialto that I've never told anyone.",
};

export const HOST = {
  name: "Felipe Lerma",
  initials: "FL",
  photo: img("felipe.webp"),
  face: img("felipe-face.webp"), // close crop for small round avatars
  welcome: "[A one-line welcome from Felipe, in his own words.]",
  bio: "Felipe was born and raised in Chihuahua, Mexico, and he's the voice behind everything here. He loves music, and he loves to share what's going on in the world: he picks the news and adds his take, writes the articles and notes, chooses the music and hosts the podcast.",
  roles: ["Articles & notes", "News commentary", "Music picks", "The podcast"],
  social: "[@social handle]",
};

export const NAV = [
  { href: "/videos", label: "Watch" },
  { href: "/musica", label: "Listen" },
  { href: "/felipe", label: "Felipe" },
  { href: "/versiculo", label: "Verse" },
  { href: "/podcast", label: "Podcast" },
  { href: "/noticias", label: "News" },
]
