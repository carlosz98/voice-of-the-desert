import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

/* English / Español switch for the whole site.
 * Text is written in English in the components and looked up here by its
 * English wording, so adding a language later is just another dictionary.
 * Anything missing from the dictionary falls back to English. */

const ES = {
  // site
  "Skip to content": "Saltar al contenido",
  "Voice of the Desert": "La Voz del Desierto",
  "Voice of the Desert, home": "La Voz del Desierto, inicio",
  Language: "Idioma",
  Menu: "Menú",
  "Open menu": "Abrir menú",
  Close: "Cerrar",
  Watch: "Ver",
  Listen: "Escuchar",
  Felipe: "Felipe",
  Podcast: "Pódcast",
  News: "Noticias",
  Upload: "Subir",
  Chapter: "Capítulo",
  one: "uno", two: "dos", three: "tres", four: "cuatro", five: "cinco",

  // topic strip
  "Music videos": "Videos musicales",
  "Live sessions": "Sesiones en vivo",
  "Local news": "Noticias locales",
  "The podcast": "El pódcast",
  "New releases": "Estrenos",
  "Felipe's notes": "Las notas de Felipe",
  Creators: "Creadores",

  // hero
  "Featured places": "Lugares destacados",
  "On air now · [Show name]": "Al aire · [Nombre del programa]",
  "Voices from": "Voces de",
  Desert: "Desierto",
  "the canyons": "los cañones",
  "the plains": "las llanuras",
  "the plaza": "la plaza",
  "the hills": "los cerros",
  "the desert": "el desierto",
  "Sunset over the Sierra Tarahumara · Chihuahua": "Atardecer sobre la Sierra Tarahumara · Chihuahua",
  "Wild horses on the plains · Chihuahua": "Caballos salvajes en las llanuras · Chihuahua",
  "The cathedral at dusk · Chihuahua City": "La catedral al anochecer · Ciudad de Chihuahua",
  "Adobe in the hills · Casas Grandes, Chihuahua": "Adobe en los cerros · Casas Grandes, Chihuahua",
  "Desert bloom · Chihuahuan Desert": "El desierto en flor · Desierto Chihuahuense",
  "Videos, music, news and a podcast, all in one place. Press play, or upload your own.":
    "Videos, música, noticias y un pódcast, todo en un solo lugar. Dale play o sube lo tuyo.",
  "Watch now": "Ver ahora",
  "Listen live": "Escuchar en vivo",
  "Your host": "Tu anfitrión",
  "News, notes, music and the podcast, all with his take.": "Noticias, notas, música y el pódcast, todo con su opinión.",
  "Now playing": "Sonando ahora",
  Playing: "Sonando",
  Paused: "En pausa",
  "Pause music": "Pausar música",
  "Play music": "Reproducir música",
  "Previous photo": "Foto anterior",
  "Next photo": "Foto siguiente",
  "Play slideshow": "Reproducir fotos",
  "Pause slideshow": "Pausar fotos",
  Photo: "Foto",
  of: "de",

  // watch
  "Views of the": "Vistas del",
  horizon: "horizonte",
  "All videos →": "Todos los videos →",
  Featured: "Destacado",
  "[Featured video title]": "[Título del video destacado]",
  "[Video title]": "[Título del video]",
  "[Creator]": "[Creador]",

  // listen
  "The sound of": "El sonido de la",
  "open land": "tierra abierta",
  Track: "Pista",
  "Previous track": "Pista anterior",
  "Next track": "Pista siguiente",
  Pause: "Pausar",
  Play: "Reproducir",
  "Up next": "A continuación",
  "Open the full player →": "Abrir el reproductor completo →",
  "Music player": "Reproductor de música",
  "[Track title]": "[Título de la canción]",
  "[Artist name]": "[Nombre del artista]",
  "[Album]": "[Álbum]",
  "[Second track]": "[Segunda canción]",
  "[Third track]": "[Tercera canción]",
  "[Fourth track]": "[Cuarta canción]",
  "[Fifth track]": "[Quinta canción]",
  "[Artist]": "[Artista]",

  // host
  "Meet your host": "Conoce a tu anfitrión",
  "Portrait of Felipe Lerma": "Retrato de Felipe Lerma",
  "Greetings from Chihuahua": "Saludos desde Chihuahua",
  "VOICE OF THE DESERT ✦ STORIES ✦ MUSIC ✦": "LA VOZ DEL DESIERTO ✦ HISTORIAS ✦ MÚSICA ✦",
  "Signed, Felipe": "Firmado, Felipe",
  "[A one-line welcome from Felipe, in his own words.]": "[Una bienvenida corta de Felipe, en sus propias palabras.]",
  "Felipe was born and raised in Chihuahua, Mexico, and he's the voice behind everything here. He loves music, and he loves to share what's going on in the world: he picks the news and adds his take, writes the articles and notes, chooses the music and hosts the podcast.": "Felipe nació y creció en Chihuahua, México, y es la voz detrás de todo lo que hay aquí. Ama la música y le gusta compartir lo que está pasando en el mundo: escoge las noticias y les pone su opinión, escribe los artículos y las notas, elige la música y conduce el pódcast.",
  "Articles & notes": "Artículos y notas",
  "News commentary": "Comentario de noticias",
  "Music picks": "Su música",
  "Hear his podcast": "Escucha su pódcast",
  "Read his takes": "Lee sus opiniones",
  "[@social handle]": "[@usuario]",

  // podcast
  "Voices of the": "Voces del",
  world: "mundo",
  "Conversations with people from everywhere: their stories, their music, and what the news leaves out. Hosted by Felipe Lerma.":
    "Conversaciones con gente de todas partes: sus historias, su música y lo que las noticias no cuentan. Presentado por Felipe Lerma.",
  "[Episode title, with the guest's name]": "[Título del episodio, con el nombre del invitado]",
  "[Episode title]": "[Título del episodio]",
  "All episodes": "Todos los episodios",
  "Watch on video": "Ver en video",
  Subscribe: "Suscribirse",
  "Pause episode": "Pausar episodio",
  "Play episode": "Reproducir episodio",
  "Latest episode": "Último episodio",
  Episode: "Episodio",

  // news
  "News & commentary": "Noticias y comentarios",
  "Echoes of the": "Ecos del",
  road: "camino",
  "What's going on in Chihuahua and the world, with Felipe's own take on every story.": "Lo que está pasando en Chihuahua y en el mundo, con la opinión de Felipe en cada historia.",
  "Lead story": "Historia principal",
  "Source:": "Fuente:",
  "Felipe Lerma's take": "La opinión de Felipe Lerma",
  Added: "Añadido",
  "Read article + full take": "Leer artículo y su opinión completa",
  comments: "comentarios",
  "Read his full take": "Lee su opinión completa",
  "Filter stories": "Filtrar historias",
  All: "Todas",
  Local: "Local",
  Music: "Música",
  Culture: "Cultura",
  Nature: "Naturaleza",
  "No stories here yet.": "Todavía no hay historias aquí.",
  "All articles and commentary →": "Todos los artículos y comentarios →",
  "Read:": "Leer:",
  "Close article": "Cerrar artículo",
  "Sample story for the demo. Originally published by": "Historia de ejemplo para la demo. Publicada originalmente por",
  Comments: "Comentarios",
  Host: "Anfitrión",
  "Add a comment": "Agrega un comentario",
  "Say something kind…": "Di algo bonito…",
  Post: "Publicar",
  "Demo: comments stay on this page only.": "Demo: los comentarios solo se quedan en esta página.",
  You: "Tú",
  "From Felipe's desk": "Desde el escritorio de Felipe",
  "Online now": "En línea",
  "Felipe is writing": "Felipe está escribiendo",
  "Shared an article": "Compartió un artículo",
  "Wrote a note": "Escribió una nota",
  "Added a song": "Agregó una canción",
  "Recorded an episode": "Grabó un episodio",
  "Posted a photo": "Publicó una foto",
  "Read it →": "Leerlo →",
  Yesterday: "Ayer",
  "Just now": "Justo ahora",
  "The Valley Courier": "El Correo del Valle",
  "High Desert Weekly": "Semanario del Alto Desierto",
  "Range & Sky Journal": "Diario Campo y Cielo",

  // lead story
  "The night market is back in the Plaza de Armas after four years, and the whole city came out": "El mercado nocturno regresa a la Plaza de Armas después de cuatro años, y toda la ciudad salió a verlo",
  "Forty stalls lined the Plaza de Armas in front of the cathedral on Saturday as the night market returned, with food, music and crafts until midnight. Organizers say it will run every second Saturday through spring.": "Cuarenta puestos llenaron la Plaza de Armas, frente a la catedral, el sábado con el regreso del mercado nocturno: comida, música y artesanías hasta la medianoche. Los organizadores dicen que habrá uno cada dos sábados hasta la primavera.",
  "I walked the whole square twice. The tamale lady from the old days is still there, same cart, same smile. This is what a town looks like when it remembers itself. Go, and bring your grandchildren.":
    "Recorrí la plaza entera dos veces. La señora de los tamales de antes sigue ahí, el mismo carrito, la misma sonrisa. Así se ve un pueblo cuando se acuerda de sí mismo. Vayan, y lleven a sus nietos.",
  "A lit cathedral with two bell towers at dusk, with food stalls in the plaza": "Una catedral iluminada con dos campanarios al anochecer, con puestos de comida en la plaza",
  "For the first time in four years, the cathedral square filled with lanterns, smoke from the grills and the sound of a brass band tuning up. The night market, once a fixture of the town calendar, returned on Saturday with forty stalls and a crowd that organizers put at nearly three thousand.":
    "Por primera vez en cuatro años, la plaza de la catedral se llenó de faroles, del humo de los asadores y del sonido de una banda afinando. El mercado nocturno, que antes era fijo en el calendario del pueblo, regresó el sábado con cuarenta puestos y casi tres mil personas, según los organizadores.",
  "Vendors sold tamales, roasted corn, hand-woven blankets and pottery. A local trio played rancheras from the cathedral steps until the last stall closed at midnight.":
    "Se vendieron tamales, elotes asados, cobijas tejidas a mano y cerámica. Un trío del pueblo tocó rancheras desde las escaleras de la catedral hasta que cerró el último puesto a medianoche.",
  "The market will now run every second Saturday through the end of spring, weather permitting.":
    "Ahora el mercado se pondrá cada dos sábados hasta que termine la primavera, si el clima lo permite.",
  "Don Felipe, I saw you by the band! The tamale lady is my tía, she said thank you for the kind words.":
    "¡Don Felipe, lo vi junto a la banda! La señora de los tamales es mi tía, le manda las gracias por sus palabras.",
  "Tell her the green chile ones are still the best in the state. I'll be back for more.":
    "Dígale que los de chile verde siguen siendo los mejores del estado. Voy a regresar por más.",
  "Took my kids for the first time. They didn't want to leave.": "Llevé a mis hijos por primera vez. No se querían ir.",

  // articles
  "A 78-year-old guitar maker is teaching his craft to the next generation": "Un guitarrero de 78 años enseña su oficio a la nueva generación",
  "In a small workshop in Delicias, a luthier who has built guitars for half a century now takes four apprentices a year, free of charge.": "En un pequeño taller en Delicias, un laudero que lleva medio siglo haciendo guitarras ahora recibe a cuatro aprendices al año, sin cobrarles nada.",
  "Wood remembers the hands that shaped it. So do people. Bless this man.": "La madera recuerda las manos que la formaron. La gente también. Bendito sea este hombre.",
  "I've played one of his guitars. The sound is warm like a kitchen at Christmas. What he's doing for these young people is worth more than any record deal. Wood remembers the hands that shaped it. So do people.":
    "Yo he tocado una de sus guitarras. Suena cálida como una cocina en Navidad. Lo que hace por estos muchachos vale más que cualquier contrato de disquera. La madera recuerda las manos que la formaron. La gente también.",
  "I was one of his apprentices in 2019. He's the real thing.": "Yo fui uno de sus aprendices en 2019. Es auténtico.",
  "Then you carry his voice too, Daniel. Send me a recording, I'd love to play it on the show.":
    "Entonces tú también llevas su voz, Daniel. Mándame una grabación, me encantaría ponerla en el programa.",

  "Families are restoring a row of 100-year-old adobe homes, brick by brick": "Familias restauran una hilera de casas de adobe de 100 años, ladrillo por ladrillo",
  "Volunteers mix mud, straw and water by hand each weekend to repair the oldest street in Casas Grandes, using the same methods their great-grandparents did.": "Cada fin de semana, voluntarios mezclan a mano lodo, paja y agua para arreglar la calle más antigua de Casas Grandes, con los mismos métodos que usaban sus bisabuelos.",
  "Mud, straw and patience. The recipe hasn't changed in a hundred years, and neither has the love.": "Lodo, paja y paciencia. La receta no ha cambiado en cien años, y el cariño tampoco.",
  "My father built with adobe. He used to say a house made of the land keeps you cool because it knows the sun. It moves me to see young families with their sleeves rolled up. Mud, straw and patience. The recipe hasn't changed.":
    "Mi padre construía con adobe. Decía que una casa hecha de la tierra te mantiene fresco porque conoce el sol. Me conmueve ver a familias jóvenes con las mangas arremangadas. Lodo, paja y paciencia. La receta no ha cambiado.",
  "We're out there every Sunday at 8. Anyone can come help!": "¡Estamos ahí cada domingo a las 8. Cualquiera puede venir a ayudar!",
  "Save me a shovel, Lucía. My back is old but my hands still work.": "Apártame una pala, Lucía. La espalda ya está vieja, pero las manos todavía trabajan.",

  "Wild horse herd grows to its largest count in a decade": "La manada de caballos salvajes llega a su número más alto en una década",
  "Rangers counted 212 horses across the plains of northern Chihuahua this spring, including 31 foals, after two wet winters brought back the grass.": "Los guardabosques contaron 212 caballos en las llanuras del norte de Chihuahua esta primavera, entre ellos 31 potrillos, después de dos inviernos lluviosos que trajeron de vuelta el pasto.",
  "Thirty-one foals. Some good news from the plains for once, and I'll take it with my coffee.": "Treinta y un potrillos. Por fin una buena noticia de las llanuras, y me la tomo con mi café.",
  "When I was a boy you could see them from the road at sunset. Then for years, almost nothing. Thirty-one foals. Rain does what speeches can't. Some good news from the plains for once, and I'll take it with my coffee.":
    "Cuando yo era niño se veían desde la carretera al atardecer. Luego, por años, casi nada. Treinta y un potrillos. La lluvia hace lo que los discursos no pueden. Por fin una buena noticia de las llanuras, y me la tomo con mi café.",
  "Saw a group of them near the dry lake last week. Beautiful.": "Vi un grupo cerca del lago seco la semana pasada. Preciosos.",
  "Keep your distance and your camera ready, mija. That's the right way to love them.": "Guarda tu distancia y ten lista la cámara, mija. Así se les quiere bien.",

  "After a wet winter, the desert is in full bloom for the first time in years": "Después de un invierno lluvioso, el desierto florece por completo por primera vez en años",
  "Cactus flowers, poppies and desert marigolds are covering the hills of the Chihuahuan Desert in color, and visitors are asked to stay on the trails.": "Flores de cactus, amapolas y caléndulas del desierto cubren de color los cerros del desierto chihuahuense, y se pide a los visitantes no salirse de los senderos.",
  "The desert is never empty. It's only waiting. Go see it before the heat comes.": "El desierto nunca está vacío. Solo está esperando. Vayan a verlo antes de que llegue el calor.",
  "People who don't know the desert think it's empty. It's not empty, it's patient. Give it one good winter and look what it does. Go early in the morning, stay on the trail, and take somebody you love.":
    "Quien no conoce el desierto piensa que está vacío. No está vacío, es paciente. Dale un buen invierno y mira lo que hace. Vayan temprano, no se salgan del sendero y lleven a alguien que quieran.",
  "The hills by the reservoir are completely orange right now.": "Los cerros junto a la presa están completamente anaranjados ahorita.",

  "The old Rialto theater will host free Sunday concerts all summer": "El viejo teatro Rialto tendrá conciertos gratis los domingos todo el verano",
  "The 1930s theater in downtown Chihuahua reopens its doors for local bands, mariachi groups and school orchestras, with no ticket needed.": "El teatro de los años treinta, en el centro de Chihuahua, abre otra vez sus puertas a bandas locales, mariachis y orquestas escolares, sin necesidad de boleto.",
  "I had my first dance at the Rialto. I'll be in row five, if anybody wants to say hello.": "Mi primer baile fue en el Rialto. Voy a estar en la quinta fila, por si alguien quiere saludar.",
  "I had my first dance at the Rialto, 1968, with a girl in a yellow dress who later became my wife. Music should be free on a Sunday. I'll be in row five, if anybody wants to say hello.":
    "Mi primer baile fue en el Rialto, en 1968, con una muchacha de vestido amarillo que después fue mi esposa. La música debería ser gratis en domingo. Voy a estar en la quinta fila, por si alguien quiere saludar.",
  "This is the sweetest thing I've read all week ❤️": "Es lo más bonito que he leído en toda la semana ❤️",
  "She'd have liked you, Elena. Come to the show.": "Le habrías caído bien, Elena. Ven al concierto.",

  "The oldest bakery in Parral is turning 75": "La panadería más antigua de Parral cumple 75 años",
  "Three generations of the same family still bake conchas and bolillos before sunrise, and they're celebrating with free coffee all week.": "Tres generaciones de la misma familia siguen horneando conchas y bolillos antes del amanecer, y lo celebran con café gratis toda la semana.",
  "They still know your name and ask about your mother. Seventy-five years of good manners.": "Todavía se saben tu nombre y te preguntan por tu mamá. Setenta y cinco años de buenos modales.",
  "They still know your name and ask about your mother. You can't download that. Stop by this week, have the free coffee, and buy an extra concha for your neighbor.": "Todavía se saben tu nombre y te preguntan por tu mamá. Eso no se descarga de internet. Pasen esta semana, tómense el café gratis y llévenle una concha de más al vecino.",
  "Been buying my bread there since '82. Best people in Parral.": "Compro mi pan ahí desde el 82. La mejor gente de Parral.",

  // desk
  "Shared the night market story with his take.": "Compartió la historia del mercado nocturno con su opinión.",
  "Up before sunrise again. The light on the hills this morning looked like honey. Some days I don't need the radio.":
    "Otra vez despierto antes del amanecer. La luz en los cerros esta mañana parecía miel. Hay días en que no necesito el radio.",
  "Added a new song to the playlist. Play it loud with the windows down.": "Agregué una canción nueva a la lista. Pónganla fuerte con las ventanas abajo.",
  "[Track title] · [Artist]": "[Título de la canción] · [Artista]",
  "Recorded episode 13 today with a guest who has walked the old trail on foot. Out on Friday.":
    "Hoy grabé el episodio 13 con un invitado que ha recorrido a pie el camino viejo. Sale el viernes.",
  "Voices of the world · Ep. 13": "Voces del mundo · Ep. 13",
  "The hills behind the old adobe, after the rain.": "Los cerros detrás del adobe viejo, después de la lluvia.",
  "The hills behind an adobe house": "Los cerros detrás de una casa de adobe",
  "Reading your comments with my coffee. Thank you for being here, all of you. Tomorrow I'll share a story about the old Rialto that I've never told anyone.":
    "Leyendo sus comentarios con mi café. Gracias por estar aquí, a todos. Mañana les cuento una historia del viejo Rialto que nunca le he contado a nadie.",

  // upload
  "Add your": "Suma tu",
  voice: "voz",
  "Upload a video, a song, a podcast episode or a news tip, and get your own creator page.":
    "Sube un video, una canción, un episodio de pódcast o una noticia, y ten tu propia página de creador.",
  Video: "Video",
  "News tip": "Noticia",
  "MP4 or MOV": "MP4 o MOV",
  "MP3 or WAV": "MP3 o WAV",
  "Audio or video episode": "Episodio en audio o video",
  "Text, PDF or a photo": "Texto, PDF o una foto",
  "What are you sending?": "¿Qué nos envías?",
  Title: "Título",
  "Your name": "Tu nombre",
  "Drop a file here or choose one": "Suelta un archivo aquí o elige uno",
  "Choose a file to upload.": "Elige un archivo para subir.",
  "Uploading…": "Subiendo…",
  "Got it, thank you!": "¡Recibido, gracias!",
  "Felipe reviews every upload. You'll hear back by email. (Demo: nothing was sent.)":
    "Felipe revisa todo lo que se sube. Te contestamos por correo. (Demo: no se envió nada.)",
  "Upload another": "Subir otro",
  "THE CARAVAN LETTER, WEEKLY": "LA CARTA DE LA CARAVANA, SEMANAL",
  "First to hear new episodes and Felipe's picks": "Sé el primero en oír los episodios nuevos y lo que recomienda Felipe",
  "You're on the list. See you Friday.": "Ya estás en la lista. Nos vemos el viernes.",
  "Demo: no emails are actually sent.": "Demo: no se envían correos de verdad.",
  Join: "Unirme",
  "Email address": "Correo electrónico",

  // daily verse
  Verse: "Versículo",
  "Every morning": "Cada mañana",
  "A word for": "Una palabra para",
  today: "hoy",
  Today: "Hoy",
  "Loading today's verse…": "Cargando el versículo de hoy…",
  "We couldn't load the verse right now.": "No pudimos cargar el versículo en este momento.",
  "Try again": "Intentar de nuevo",
  "Shared by Felipe": "Compartido por Felipe",
  "Previous day": "Día anterior",
  "Next day": "Día siguiente",
  "Copy verse": "Copiar versículo",
  Copied: "Copiado",
  "Back to today": "Volver a hoy",
  "Reina-Valera 1909": "Reina-Valera 1909",
  "King James Version": "Versión King James",

  // footer
  About: "Acerca de",
  Advertise: "Anúnciate",
  Terms: "Términos",
  Privacy: "Privacidad",
  "Hosted by Felipe Lerma": "Presentado por Felipe Lerma",
  "Website designed & built by": "Sitio web diseñado y creado por",
  Portfolio: "Portafolio",
};

// patterns for times and counts ("5h ago", "4 min read", "12K views")
const ES_PATTERNS = [
  [/^(\d+)m ago$/, "hace $1 min"],
  [/^(\d+)h ago$/, "hace $1 h"],
  [/^(\d+)d ago$/, "hace $1 d"],
  [/^(\d+) min read$/, "$1 min de lectura"],
  [/^(.+) views$/, "$1 vistas"],
];

function translate(lang, s) {
  if (lang !== "es" || typeof s !== "string") return s;
  if (s in ES) return ES[s];
  for (const [re, rep] of ES_PATTERNS) if (re.test(s)) return s.replace(re, rep);
  return s;
}


// The site always opens in Spanish; English is one tap away in the header.
const DEFAULT_LANG = "es";

const LangContext = createContext({ lang: DEFAULT_LANG, setLang: () => {}, t: s => s });


export function LangProvider({ children }) {
  const [lang, setLangState] = useState(DEFAULT_LANG);
  const setLang = useCallback(l => setLangState(l), []);
  useEffect(() => {
    document.documentElement.lang = lang;
    document.title = translate(lang, "Voice of the Desert");
  }, [lang]);
  const t = useCallback(s => translate(lang, s), [lang]);
  const value = useMemo(() => ({ lang, setLang, t }), [lang, setLang, t]);
  return <LangContext.Provider value={value}>{children}</LangContext.Provider>;
}

export const useLang = () => useContext(LangContext);

/* EN | ES switch for the header and the mobile menu. */
export function LangToggle({ className = "" }) {
  const { lang, setLang, t } = useLang();
  return (
    <div role="group" aria-label={t("Language")} className={`inline-flex rounded-full border border-bone/40 bg-earth/35 p-1 backdrop-blur-md ${className}`}>
      {[["en", "EN", "English"], ["es", "ES", "Español"]].map(([code, short, full]) => (
        <button
          key={code}
          type="button"
          lang={code}
          aria-pressed={lang === code}
          aria-label={full}
          title={full}
          onClick={() => setLang(code)}
          className={`grid h-9 min-w-[44px] place-items-center rounded-full px-2.5 text-[13px] font-bold tracking-[0.08em] transition-colors ${
            lang === code ? "bg-gold text-umber" : "text-bone hover:text-gold"
          }`}
        >
          {short}
        </button>
      ))}
    </div>
  );
}
