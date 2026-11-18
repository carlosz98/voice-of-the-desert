import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  BookOpen, ChevronDown, ChevronRight, Clapperboard, FileText, Flame, Inbox, LifeBuoy, Lightbulb, MessageCircle, Mic, Music,
  NotebookPen, ShieldCheck, Sparkles,
} from "lucide-react";
import { useLang } from "../../lib/i18n.jsx";

/* ============================================================
 *  The guide in Felipe's panel ("Guía"): every tool, step by step,
 *  in plain words. Written in both languages right here (es / en)
 *  because it's long, instead of in the dictionary files.
 *
 *  To add a tool: add one object to TOPICS.
 *    go    → which panel section the "Take me there" button opens
 *    steps → short, one action each
 *    tip   → one good thing to know (optional)
 * ============================================================ */
const TOPICS = [
  {
    id: "now", icon: Flame, go: "home",
    title: { es: "Lo que está pasando hoy", en: "What's happening today" },
    what: { es: "En Inicio, arriba, ve las noticias más importantes del momento. Son ideas para escribir.", en: "At the top of Overview you see today's biggest news. They're ideas to write about." },
    steps: {
      es: ["Escoja una pestaña: México hoy, El mundo, Chihuahua o Fe.", "Si una noticia le interesa, toque «Leerla» para ver la original.", "Toque «Escribir sobre esto». Se abre «Escribir noticia» con el título, el periódico y el enlace ya puestos.", "Escriba su opinión y publique."],
      en: ["Pick a tab: Mexico today, The world, Chihuahua or Faith.", "If a story interests you, tap “Read it” to see the original.", "Tap “Write about this”. “Write news” opens with the title, newspaper and link already filled in.", "Write your opinion and publish."],
    },
    tip: { es: "Toque «Actualizar» para ver lo más nuevo.", en: "Tap “Refresh” to see the newest." },
  },
  {
    id: "news", icon: FileText, go: "article",
    title: { es: "Escribir una noticia (y buscarla en internet)", en: "Write news (and find it on the web)" },
    what: { es: "Comparta una noticia con su opinión, o escriba un artículo suyo.", en: "Share a news story with your opinion, or write an article of your own." },
    steps: {
      es: ["Vaya a «Escribir noticia».", "En «Buscar noticias en internet» escriba de qué se trata, como lo diría. Por ejemplo: gobierno pide a la gente prepararse.", "Toque «Buscar». Salen las noticias más recientes.", "Toque «Usar esta» en la que quiera. El título, el periódico y el enlace se llenan solos.", "Escriba su opinión (o use «Ayúdame a escribir», abajo).", "Escoja una foto y toque «Publicar»."],
      en: ["Go to “Write news”.", "In “Find news on the web”, write what it's about, the way you'd say it. For example: government asks people to prepare.", "Tap “Search”. The newest stories show up.", "Tap “Use this one”. The title, newspaper and link fill in by themselves.", "Write your opinion (or use “Help me write”, below).", "Choose a photo and tap “Publish”."],
    },
    tip: { es: "Solo se copia el título y el enlace, nunca la noticia completa. Sus lectores leen la original en el periódico, y en su sitio leen su opinión.", en: "Only the headline and link are copied, never the whole story. Readers read the original on the newspaper's site, and your opinion on yours." },
  },
  {
    id: "helper", icon: Sparkles, go: "article",
    title: { es: "Ayúdame a escribir (el ayudante)", en: "Help me write (the helper)" },
    what: { es: "Usted dice las cosas con sus palabras, aunque sea desordenado, y el ayudante le escribe un borrador bonito. Está en cada formulario.", en: "You say it in your own words, even messy, and the helper writes a clean draft. It's in every form." },
    steps: {
      es: ["En el cuadro verde «Ayúdame a escribir», escriba sus ideas. Por ejemplo: escribe que el gobierno pide prepararse para el frío, y que yo creo que hay que cuidar a los vecinos mayores.", "Toque «Escríbelo por mí». En unos segundos el borrador aparece en el formulario.", "Léalo con calma y cambie lo que quiera. Si ve palabras entre [corchetes], llénelas usted (por ejemplo [fecha]).", "¿No le gustó? Toque «Deshacer» y vuelve lo que tenía.", "Cuando esté contento, toque «Publicar»."],
      en: ["In the green “Help me write” box, write your ideas. For example: write that the government asks us to get ready for the cold, and that I think we should look after older neighbors.", "Tap “Write it for me”. In a few seconds the draft shows in the form.", "Read it calmly and change anything. If you see words in [brackets], fill them in (for example [date]).", "Didn't like it? Tap “Undo” and you get back what you had.", "When you're happy, tap “Publish”."],
    },
    tip: {
      es: "El ayudante nunca publica solo: siempre lo revisa usted. Tiene orden de no inventar datos, pero puede equivocarse, así que revise nombres y números. Sus notas van a Google (Gemini) para escribir el borrador: no ponga ahí cosas privadas.",
      en: "The helper never publishes by itself: you always check it first. It's told not to make up facts, but it can still be wrong, so check names and numbers. Your notes go to Google (Gemini) to write the draft: don't put private things there.",
    },
  },
  {
    id: "song", icon: Music, go: "song",
    title: { es: "Subir una canción", en: "Upload a song" },
    what: { es: "Agregue una canción a la página de música y a sus listas.", en: "Add a song to the music page and your playlists." },
    steps: {
      es: ["Vaya a «Subir canción».", "En «Buscar la canción» escriba el nombre o el artista y toque «Buscar».", "Toque la canción correcta. El nombre, el artista, el álbum, la portada y la duración se llenan solos.", "Agregue el archivo de la canción (MP3).", "Escoja sus listas y toque «Publicar»."],
      en: ["Go to “Upload song”.", "In “Find the song”, write the name or artist and tap “Search”.", "Tap the right song. The name, artist, album, cover and length fill in by themselves.", "Add the song file (MP3).", "Pick your playlists and tap “Publish”."],
    },
    tip: { es: "La búsqueda solo trae los datos. El archivo de música lo pone usted.", en: "The search only brings the details. You add the music file." },
  },
  {
    id: "video", icon: Clapperboard, go: "video",
    title: { es: "Compartir un video (de YouTube o suyo)", en: "Share a video (from YouTube or your own)" },
    what: { es: "Ponga en su sitio un video de YouTube con solo pegar el enlace, o suba uno suyo.", en: "Put a YouTube video on your site by pasting its link, or upload your own." },
    steps: {
      es: ["En YouTube, abajo del video, toque «Compartir» y luego «Copiar».", "En su panel vaya a «Subir video» y pegue el enlace en «Compartir un video de YouTube».", "Toque «Traerlo». El título y la foto se llenan solos.", "Escriba su nota: por qué lo comparte (o use «Ayúdame a escribir»).", "Toque «Publicar». El video se ve en su sitio."],
      en: ["On YouTube, under the video, tap “Share”, then “Copy”.", "In your panel go to “Upload video” and paste the link in “Share a YouTube video”.", "Tap “Bring it”. The title and picture fill in by themselves.", "Write your note: why you share it (or use “Help me write”).", "Tap “Publish”. The video shows on your site."],
    },
    tip: { es: "Para un video suyo, use «O subir un archivo de video» en lugar del enlace.", en: "For your own video, use “Or upload a video file” instead of the link." },
  },
  {
    id: "podcast", icon: Mic, go: "podcast",
    title: { es: "Episodio del pódcast", en: "Podcast episode" },
    what: { es: "Suba la grabación, diga quién es su invitado y marque los capítulos.", en: "Upload the recording, say who your guest is and mark the chapters." },
    steps: {
      es: ["Vaya a «Episodio del pódcast» y agregue el audio o video.", "Escriba el título y el nombre del invitado.", "Use «Ayúdame a escribir» para el resumen, si quiere.", "En «Capítulos» ponga el minuto y el tema (por ejemplo 12:30 · La guitarra de su abuelo).", "Toque «Publicar»."],
      en: ["Go to “Podcast episode” and add the audio or video.", "Write the title and the guest's name.", "Use “Help me write” for the summary, if you like.", "In “Chapters” put the minute and the topic (for example 12:30 · His grandfather's guitar).", "Tap “Publish”."],
    },
  },
  {
    id: "verse", icon: BookOpen, go: "verse",
    title: { es: "Versículo del día", en: "Verse of the day" },
    what: { es: "Escoja el versículo que todos ven en la mañana, con unas palabras suyas.", en: "Choose the verse everyone sees in the morning, with a few words of your own." },
    steps: {
      es: ["Vaya a «Versículo del día».", "Escriba la cita (Salmos 23:1) y copie el texto de su Biblia.", "Escriba su reflexión, o use «Ayúdame a escribir».", "Escoja «Ahora» o «Mañana temprano» y toque «Publicar» o «Programar»."],
      en: ["Go to “Verse of the day”.", "Write the reference (Psalms 23:1) and copy the text from your Bible.", "Write your reflection, or use “Help me write”.", "Choose “Now” or “Tomorrow morning” and tap “Publish” or “Schedule”."],
    },
    tip: { es: "Los días que no escoja uno, el sitio pone un versículo solo. En la página del Versículo sus lectores también pueden leer toda la Biblia.", en: "On days you don't pick one, the site chooses a verse by itself. On the Verse page your readers can also read the whole Bible." },
  },
  {
    id: "note", icon: NotebookPen, go: "note",
    title: { es: "Nota rápida", en: "Quick note" },
    what: { es: "Unas palabras para sus lectores, como un saludo de la mañana. Sale en «Desde el escritorio de Felipe».", en: "A few words for your readers, like a morning hello. It shows in “From Felipe's desk”." },
    steps: {
      es: ["Vaya a «Nota rápida».", "Escriba su nota y, si quiere, agregue una foto.", "Toque «Publicar»."],
      en: ["Go to “Quick note”.", "Write your note and add a photo if you like.", "Tap “Publish”."],
    },
  },
  {
    id: "comments", icon: MessageCircle, go: "comments",
    title: { es: "Comentarios: responder, quitar y quitar fotos", en: "Comments: answer, remove and remove pictures" },
    what: { es: "Aquí ve lo que escriben sus lectores en todo el sitio.", en: "Here you see what your readers write all over the site." },
    steps: {
      es: ["Vaya a «Comentarios».", "Para responder: escriba en «Escriba su respuesta» y toque «Contestar». Su respuesta sale con su foto y la marca de Felipe.", "Para quitar un comentario que no va: toque «Quitar». Se borra del sitio.", "Si alguien puso una foto de perfil que no va: toque «Quitar foto». Su foto se quita y salen sus iniciales."],
      en: ["Go to “Comments”.", "To answer: write in “Write your answer” and tap “Answer”. It shows with your photo and Felipe's badge.", "To remove a comment that doesn't belong: tap “Remove”. It's deleted from the site.", "If someone's profile picture doesn't belong: tap “Remove picture”. It's taken off and their initials show instead."],
    },
    tip: { es: "El sitio ya bloquea solo las groserías y palabras de odio, en comentarios, dedicatorias y envíos.", en: "The site already blocks swear words and hateful words by itself, in comments, dedications and submissions." },
  },
  {
    id: "submissions", icon: Inbox, go: "submissions",
    title: { es: "Envíos de sus lectores", en: "Your readers' submissions" },
    what: { es: "Videos, canciones y noticias que sus lectores le mandan desde «Subir».", en: "Videos, songs and news your readers send you from “Upload”." },
    steps: {
      es: ["Cuando hay envíos nuevos, sale un aviso dorado en Inicio.", "Vaya a «Envíos» y abra cada uno.", "Toque «Aprobar» para publicarlo, o «Esta vez no» si no va."],
      en: ["When there are new ones, a gold notice shows on Overview.", "Go to “Submissions” and open each one.", "Tap “Approve” to publish it, or “Not this time” if it doesn't belong."],
    },
  },
  {
    id: "safety", icon: ShieldCheck, go: null,
    title: { es: "Su cuenta y su seguridad", en: "Your account and your safety" },
    what: { es: "Unas reglas sencillas para que nadie entre a su panel.", en: "A few simple rules so nobody gets into your panel." },
    steps: {
      es: ["Su contraseña son cuatro palabras y un número. Nadie del sitio se la va a pedir, nunca.", "No la escriba en mensajes ni correos. Si la apunta, guárdela en un lugar seguro de su casa.", "Si usa una computadora que no es suya, toque «Salir» al terminar.", "Si alguien se equivoca 5 veces con su contraseña, el sitio espera 15 minutos antes de dejar intentar otra vez."],
      en: ["Your password is four words and a number. Nobody from the site will ever ask you for it.", "Don't write it in messages or emails. If you write it down, keep it somewhere safe at home.", "If you use a computer that isn't yours, tap “Sign out” when you finish.", "If someone gets your password wrong 5 times, the site waits 15 minutes before letting them try again."],
    },
    tip: { es: "Si cree que alguien sabe su contraseña, avísele a Carlos para cambiarla.", en: "If you think someone knows your password, tell Carlos so he can change it." },
  },
];

export default function Guide({ go }) {
  const { t, lang } = useLang();
  const L = x => x?.[lang] ?? x?.en;
  const [open, setOpen] = useState(TOPICS[0].id);
  const show = id => {
    setOpen(id);
    setTimeout(() => document.getElementById(`guide-${id}`)?.scrollIntoView({ behavior: "smooth", block: "start" }), 60);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start gap-4">
        <span className="grid h-14 w-14 flex-none place-items-center rounded-full bg-gold text-umber"><LifeBuoy aria-hidden className="h-7 w-7" /></span>
        <div>
          <h1 className="h-display text-[clamp(28px,3.4vw,42px)]">{t("Guide")}</h1>
          <p className="mt-1 text-lg text-loam">{t("How each part of your panel works, step by step. Tap a topic to open it.")}</p>
        </div>
      </div>

      {/* quick list of topics */}
      <nav aria-label={t("Guide")} className="flex flex-wrap gap-2">
        {TOPICS.map(tp => (
          <button key={tp.id} type="button" onClick={() => show(tp.id)} className={`flex min-h-[44px] items-center gap-2 rounded-full border px-4 text-[15px] font-semibold transition-colors ${open === tp.id ? "border-umber bg-umber text-bone" : "border-dune bg-cream hover:border-umber"}`}>
            <tp.icon aria-hidden className="h-4 w-4" /> {L(tp.title).split(/ \(|:/)[0]}
          </button>
        ))}
      </nav>

      <ul className="flex flex-col gap-3">
        {TOPICS.map(tp => {
          const isOpen = open === tp.id;
          return (
            <li key={tp.id} id={`guide-${tp.id}`} className="scroll-mt-28 overflow-hidden rounded-[20px] bg-bone ring-1 ring-dune">
              <h2>
                <button type="button" aria-expanded={isOpen} aria-controls={`guide-${tp.id}-body`} onClick={() => setOpen(isOpen ? "" : tp.id)} className="flex min-h-[72px] w-full items-center gap-4 px-5 py-3 text-left">
                  <span className="grid h-11 w-11 flex-none place-items-center rounded-full bg-gold/20 text-ochre"><tp.icon aria-hidden className="h-5 w-5" /></span>
                  <span className="flex-1">
                    <span className="block font-display text-xl font-semibold">{L(tp.title)}</span>
                    <span className="block text-[15px] text-loam">{L(tp.what)}</span>
                  </span>
                  <ChevronDown aria-hidden className={`h-6 w-6 flex-none text-bark transition-transform ${isOpen ? "rotate-180" : ""}`} />
                </button>
              </h2>
              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div id={`guide-${tp.id}-body`} initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3 }}>
                    <div className="flex flex-col gap-4 border-t border-dune px-5 pb-5 pt-4">
                      <ol className="flex flex-col gap-3">
                        {L(tp.steps).map((step, i) => (
                          <li key={i} className="flex gap-3">
                            <span className="grid h-8 w-8 flex-none place-items-center rounded-full bg-umber font-display text-[15px] font-semibold text-gold">{i + 1}</span>
                            <span className="pt-0.5 text-[17px] leading-relaxed">{step}</span>
                          </li>
                        ))}
                      </ol>
                      {tp.tip && (
                        <p className="flex items-start gap-3 rounded-xl bg-gold/15 px-4 py-3 text-[16px] leading-relaxed">
                          <Lightbulb aria-hidden className="mt-0.5 h-5 w-5 flex-none text-ochre" /> <span>{L(tp.tip)}</span>
                        </p>
                      )}
                      {tp.go && (
                        <button type="button" onClick={() => go(tp.go)} className="pill-dark min-h-[52px] w-fit px-6 text-[17px]">
                          {t("Take me there")} <ChevronRight aria-hidden className="h-5 w-5" />
                        </button>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
