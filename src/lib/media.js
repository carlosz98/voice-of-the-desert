/* Videos, music and the podcast.
 * Everything here is sample content for the demo: the songs, artists,
 * guests and videos are made up. Felipe's real uploads replace them later
 * (they'll come from the database instead of this file). Text is written in
 * English and translated through i18n (see media-es.js). */

import { PHOTOS } from "./photos.js";

/* ───────── Videos ───────── */

export const VIDEO_FILTERS = ["All", "From Felipe", "From the community"];

export const ALL_VIDEOS = [
  {
    id: "v0", slug: "amanecer-en-la-sierra", isNew: true, from: "From Felipe",
    title: "Sunrise over the Sierra, with a cup of coffee",
    creator: "Felipe Lerma", views: "3.1K views", length: "24:10", ago: "1d ago",
    photo: PHOTOS.adobe, pos: "50% 55%",
    description: "Felipe sets up his camera before dawn on a hill near Casas Grandes and lets the sun do the talking. No music, just the wind, the birds and a few words about why he still gets up early.",
    note: "I've watched a thousand sunrises and I'm not tired of them yet. Put this on while you have breakfast.",
    comments: 18,
    thread: [
      { name: "Marisol V.", ago: "20h ago", text: "I watched the whole thing. So peaceful." },
      { name: "Felipe Lerma", host: true, ago: "18h ago", text: "That's the idea, mija. The day can wait twenty minutes." },
    ],
  },
  {
    id: "v1", slug: "mercado-nocturno-en-video", from: "From the community",
    title: "A walk through the night market in the Plaza de Armas",
    creator: "Rosa M.", views: "12K views", length: "8:40", ago: "3d ago",
    photo: PHOTOS.cathedral, pos: "50% 32%",
    description: "Rosa filmed the first night of the market with her phone: the tamale carts, the band on the cathedral steps and a lot of happy faces.",
    note: "Rosa sent me this one. Look at minute five, that's the tamale lady I wrote about.",
    comments: 24,
    thread: [
      { name: "Tomás R.", ago: "2d ago", text: "My kids and I are in the background at 3:12!" },
    ],
  },
  {
    id: "v2", slug: "el-desierto-en-flor", from: "From the community",
    title: "The desert in bloom, filmed from the road",
    creator: "Javier O.", views: "4.6K views", length: "31:02", ago: "4d ago",
    photo: PHOTOS.cactus, pos: "50% 45%",
    description: "Javier drove the back roads south of the city with a camera on the dashboard. Half an hour of red, orange and yellow hills.",
    note: "Turn the sound up, Javier left the radio on. Good music, too.",
    comments: 9,
    thread: [
      { name: "Sofía R.", ago: "3d ago", text: "Where is the road at minute 14? I want to go." },
    ],
  },
  {
    id: "v3", slug: "caballos-al-atardecer", from: "From Felipe",
    title: "Wild horses at dusk",
    creator: "Felipe Lerma", views: "27K views", length: "5:15", ago: "6d ago",
    photo: PHOTOS.horses, pos: "50% 55%",
    description: "Five quiet minutes with a group of wild horses on the plains of northern Chihuahua, filmed from far away so as not to bother them.",
    note: "I waited two hours in the truck for these five minutes. Worth every one.",
    comments: 31,
    thread: [
      { name: "Ana Lucía T.", ago: "5d ago", text: "Thank you for keeping your distance, Don Felipe. That's how it's done." },
      { name: "Felipe Lerma", host: true, ago: "5d ago", text: "I learned from the best. Thank you for the work you do out there." },
    ],
  },
  {
    id: "v4", slug: "una-tarde-en-casas-grandes", from: "From the community",
    title: "An afternoon in Casas Grandes",
    creator: "Lucía G.", views: "2.2K views", length: "12:30", ago: "1w ago",
    photo: PHOTOS.adobe, pos: "20% 60%",
    description: "Lucía shows the street the families are restoring, brick by brick, and talks with the neighbors who started it.",
    note: "Those are the hands that are saving that street. Watch and then go help them.",
    comments: 7,
    thread: [],
  },
  {
    id: "v5", slug: "la-catedral-de-noche", from: "From Felipe",
    title: "The cathedral at night, from the plaza",
    creator: "Felipe Lerma", views: "8.9K views", length: "6:48", ago: "2w ago",
    photo: PHOTOS.cathedral, pos: "50% 60%",
    description: "The lights come on one by one on the cathedral towers while the plaza fills up. Filmed on a warm Saturday evening.",
    note: "My favorite hour in the city. The bells at the end are a gift.",
    comments: 14,
    thread: [],
  },
];

export const FEATURED_VIDEO = ALL_VIDEOS[0];
export const VIDEOS = ALL_VIDEOS.slice(1, 4); // the three under the featured one on the home page
export const videoBySlug = slug => ALL_VIDEOS.find(v => v.slug === slug);

/* ───────── Music ─────────
 * Song titles stay in Spanish in both languages; lengths in seconds. */

export const GENRES = ["All", "Norteño", "Bolero", "Corrido", "Ranchera", "Sacred"];

export const TRACKS = [
  { id: "t1", title: "Viento del norte", artist: "Los Hermanos Durán", album: "Camino Real", genre: "Norteño", length: 246, plays: "18K", photo: PHOTOS.cactus, pos: "78% 48%" },
  { id: "t2", isNew: true, title: "Luna de Parral", artist: "Trío Las Palomas", album: "Serenatas", genre: "Bolero", length: 221, plays: "9.4K", photo: PHOTOS.sunset, pos: "60% 55%" },
  { id: "t3", title: "El caballo bayo", artist: "Conjunto Sierra Alta", album: "Corridos del llano", genre: "Corrido", length: 178, plays: "12K", photo: PHOTOS.horses, pos: "50% 55%" },
  { id: "t4", title: "Adobe y paja", artist: "Rosario Villa", album: "Tierra", genre: "Ranchera", length: 260, plays: "21K", photo: PHOTOS.adobe, pos: "50% 50%" },
  { id: "t5", title: "Campanas de mi pueblo", artist: "Coro Infantil de Parral", album: "Villancicos", genre: "Sacred", length: 204, plays: "6.1K", photo: PHOTOS.cathedral, pos: "50% 30%" },
  { id: "t6", title: "Flor del desierto", artist: "Los Hermanos Durán", album: "Camino Real", genre: "Norteño", length: 195, plays: "15K", photo: PHOTOS.cactus, pos: "30% 50%" },
  { id: "t7", title: "Noche en la Plaza de Armas", artist: "Trío Las Palomas", album: "Serenatas", genre: "Bolero", length: 233, plays: "7.8K", photo: PHOTOS.cathedral, pos: "50% 65%" },
  { id: "t8", title: "Tren de la sierra", artist: "Conjunto Sierra Alta", album: "Corridos del llano", genre: "Corrido", length: 212, plays: "11K", photo: PHOTOS.sunset, pos: "30% 60%" },
  { id: "t9", isNew: true, title: "Redova del sábado", artist: "Escuela de Acordeón de Cuauhtémoc", album: "Primeros pasos", genre: "Norteño", length: 152, plays: "2.4K", photo: PHOTOS.adobe, pos: "75% 45%" },
  { id: "t10", title: "Café de la mañana", artist: "Rosario Villa", album: "Tierra", genre: "Ranchera", length: 189, plays: "16K", photo: PHOTOS.horses, pos: "75% 40%" },
];

export const PLAYLISTS = [
  {
    id: "domingos", title: "Sundays with Felipe", tracks: ["t4", "t2", "t1", "t7", "t10"], photo: PHOTOS.sunset, pos: "50% 60%",
    note: "What I play on Sunday mornings, while the coffee is on and the house is quiet.",
  },
  {
    id: "camino", title: "For the road", tracks: ["t1", "t3", "t8", "t6"], photo: PHOTOS.horses, pos: "50% 55%",
    note: "Windows down, long road ahead. Corridos and norteñas for the highway.",
  },
  {
    id: "serenatas", title: "Serenades", tracks: ["t2", "t7"], photo: PHOTOS.cathedral, pos: "50% 40%",
    note: "For the one you love. Or the one you're still trying to win over.",
  },
  {
    id: "fe", title: "Songs of faith", tracks: ["t5"], photo: PHOTOS.cathedral, pos: "50% 15%",
    note: "Quiet songs for the end of the day, and for the mornings that need a little help.",
  },
];

export const DEDICATIONS = [
  { name: "Elena S.", to: "My husband, Ramiro", song: "t2", text: "Forty years married and you still sing it off key. I love you.", ago: "2h ago" },
  { name: "Tomás R.", to: "My mother in Delicias", song: "t10", text: "For your coffee every morning. We miss you up here.", ago: "Yesterday" },
  { name: "Guadalupe T.", to: "Everyone in the Sierra", song: "t5", text: "For the bell that rings again.", ago: "3d ago" },
];

/* ───────── Podcast ───────── */

export const EPISODES = [
  {
    id: "e12", number: 12, slug: "el-hombre-que-camino-el-camino-real", isNew: true,
    title: "The man who walked the old royal road",
    guest: "Ramón Estrada", guestRole: "Walked from Chihuahua to Santa Fe on foot",
    length: "52:10", ago: "3d ago", photo: PHOTOS.sunset, pos: "50% 55%",
    summary: "Ramón spent four months walking the old Camino Real, sleeping in small towns and listening to strangers. He tells Felipe what the road taught him about patience, kindness and blisters.",
    chapters: [["0:00", "Welcome"], ["2:15", "Why walk it?"], ["14:40", "The kindness of strangers"], ["31:05", "The hardest day"], ["44:30", "What he'd tell his grandchildren"]],
    note: "I've driven that road a hundred times and never really seen it. Ramón saw all of it. Listen to the part about the lady with the water jug.",
    comments: 21,
    thread: [
      { name: "Héctor A.", ago: "2d ago", text: "The story at minute 31 made me cry in the truck." },
      { name: "Felipe Lerma", host: true, ago: "2d ago", text: "Me too, Héctor, and I was sitting right across from him." },
    ],
  },
  {
    id: "e11", number: 11, slug: "cincuenta-anos-de-guitarras",
    title: "Fifty years of guitars",
    guest: "Aurelio Méndez", guestRole: "Guitar maker in Delicias",
    length: "47:02", ago: "1w ago", photo: PHOTOS.cactus, pos: "50% 40%",
    summary: "The luthier from our news story sits down with Felipe in his workshop. They talk about wood, weddings, apprentices and the guitar he'll never sell.",
    chapters: [["0:00", "Welcome"], ["3:30", "The first guitar"], ["17:20", "Choosing the wood"], ["29:45", "The apprentices"], ["40:10", "The guitar he'll never sell"]],
    note: "Recorded in his workshop, so you'll hear a saw now and then. I left it in. That's the real sound of the place.",
    comments: 13,
    thread: [{ name: "Daniel P.", ago: "6d ago", text: "That's my teacher! Thank you, Don Felipe." }],
  },
  {
    id: "e10", number: 10, slug: "las-panaderas-de-parral",
    title: "The bakers of Parral",
    guest: "Carmen Ruiz", guestRole: "Third generation at the oldest bakery in Parral",
    length: "55:40", ago: "2w ago", photo: PHOTOS.adobe, pos: "70% 50%",
    summary: "Carmen gets up at three every morning to light the brick oven her grandfather built. She talks about bread, family and why the recipe for conchas has never been written down.",
    chapters: [["0:00", "Welcome"], ["4:05", "Three in the morning"], ["19:30", "The grandmother's rules"], ["36:15", "The recipe nobody wrote down"], ["49:00", "Seventy-five years"]],
    note: "Don't listen to this one hungry. I warned you.",
    comments: 17,
    thread: [],
  },
  {
    id: "e9", number: 9, slug: "las-canciones-de-mi-madre",
    title: "The songs my mother sang",
    guest: "Rosario Villa", guestRole: "Ranchera singer",
    length: "41:18", ago: "3w ago", photo: PHOTOS.horses, pos: "75% 40%",
    summary: "Rosario learned to sing in her mother's kitchen. She sings three of those songs live for Felipe and tells the story behind each one.",
    chapters: [["0:00", "Welcome"], ["3:10", "Her mother's kitchen"], ["12:00", "First song, live"], ["24:40", "Leaving home to sing"], ["35:20", "Last song, live"]],
    note: "She sang the last one with her eyes closed. So did I.",
    comments: 26,
    thread: [],
  },
  {
    id: "e8", number: 8, slug: "lluvia-caballos-y-llanuras",
    title: "Rain, horses and the plains",
    guest: "Ana Lucía Torres", guestRole: "Park ranger in northern Chihuahua",
    length: "38:45", ago: "1mo ago", photo: PHOTOS.horses, pos: "50% 55%",
    summary: "Ana Lucía counts the wild horses every spring. She explains what two wet winters did for the herd and how to watch them without bothering them.",
    chapters: [["0:00", "Welcome"], ["2:50", "Counting horses"], ["15:10", "What the rain changed"], ["27:30", "How to watch them"]],
    note: "If you've ever stopped your car to watch the horses, this one is for you.",
    comments: 11,
    thread: [],
  },
];

export const episodeBySlug = slug => EPISODES.find(e => e.slug === slug);
