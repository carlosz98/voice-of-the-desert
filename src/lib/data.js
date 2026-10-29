// Site content. Everything in [brackets] is a placeholder for Felipe's real content.
// Later this comes from the database (uploads, articles, tracks, episodes).

const img = name => `${import.meta.env.BASE_URL}img/${name}`;

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

export const PHOTOS = {
  sunset: img("sunset.webp"),
  horses: img("horses.webp"),
  cathedral: img("cathedral.webp"),
  adobe: img("adobe.webp"),
  cactus: img("cactus.webp"),
};

export const FEATURED_VIDEO = {
  title: "[Featured video title]",
  length: "24:10",
  photo: PHOTOS.adobe,
  pos: "50% 55%",
};

export const VIDEOS = [
  { id: "v1", title: "[Video title]", creator: "[Creator]", views: "12K views", length: "8:40", photo: PHOTOS.cathedral, pos: "50% 32%" },
  { id: "v2", title: "[Video title]", creator: "[Creator]", views: "4.6K views", length: "31:02", photo: PHOTOS.cactus, pos: "50% 45%" },
  { id: "v3", title: "[Video title]", creator: "[Creator]", views: "27K views", length: "5:15", photo: PHOTOS.sunset, pos: "60% 55%" },
];

// lengths in seconds
export const TRACKS = [
  { id: "t1", title: "[Track title]", artist: "[Artist name]", album: "[Album]", length: 246, photo: PHOTOS.cactus, pos: "78% 48%" },
  { id: "t2", title: "[Second track]", artist: "[Artist]", album: "[Album]", length: 221, photo: PHOTOS.sunset, pos: "60% 55%" },
  { id: "t3", title: "[Third track]", artist: "[Artist]", album: "[Album]", length: 178, photo: PHOTOS.horses, pos: "50% 55%" },
  { id: "t4", title: "[Fourth track]", artist: "[Artist]", album: "[Album]", length: 260, photo: PHOTOS.adobe, pos: "50% 50%" },
  { id: "t5", title: "[Fifth track]", artist: "[Artist]", album: "[Album]", length: 195, photo: PHOTOS.cathedral, pos: "50% 30%" },
];

export const EPISODES = [
  { id: "e12", number: 12, title: "[Episode title, with the guest's name]", length: "52:10" },
  { id: "e11", number: 11, title: "[Episode title]", length: "47:02" },
  { id: "e10", number: 10, title: "[Episode title]", length: "55:40" },
  { id: "e9", number: 9, title: "[Episode title]", length: "41:18" },
];

export const NEWS_FILTERS = ["All", "Local", "Music", "Culture", "Nature"];

/* Sample stories for the demo, written as if Felipe had posted them.
 * Towns and papers are made up; real articles replace these later. */
export const LEAD_STORY = {
  id: "lead",
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
    id: "a1", category: "Music", ago: "5h ago", read: "4 min read", source: "High Desert Weekly",
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
    id: "a2", category: "Culture", ago: "8h ago", read: "5 min read", source: "The Valley Courier",
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
    id: "a3", category: "Nature", ago: "1d ago", read: "3 min read", source: "Range & Sky Journal",
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
    id: "a4", category: "Nature", ago: "2d ago", read: "4 min read", source: "Range & Sky Journal",
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
    id: "a5", category: "Music", ago: "3d ago", read: "5 min read", source: "High Desert Weekly",
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
    id: "a6", category: "Local", ago: "4d ago", read: "2 min read", source: "The Valley Courier",
    title: "The oldest bakery in Parral is turning 75",
    summary: "Three generations of the same family still bake conchas and bolillos before sunrise, and they're celebrating with free coffee all week.",
    take: "They still know your name and ask about your mother. Seventy-five years of good manners.",
    longTake: "They still know your name and ask about your mother. You can't download that. Stop by this week, have the free coffee, and buy an extra concha for your neighbor.",
    photo: PHOTOS.adobe, pos: "70% 50%", comments: 14,
    thread: [
      { name: "Ray C.", ago: "3d ago", text: "Been buying my bread there since '82. Best people in Parral." },
    ],
  },
];

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
  { href: "#watch", label: "Watch" },
  { href: "#listen", label: "Listen" },
  { href: "#host", label: "Felipe" },
  { href: "#verse", label: "Verse" },
  { href: "#podcast", label: "Podcast" },
  { href: "#news", label: "News" },
];
