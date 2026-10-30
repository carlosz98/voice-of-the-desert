// Photos used across the site. Paths respect the site's base folder.
export const img = name => `${import.meta.env.BASE_URL}img/${name}`;

export const PHOTOS = {
  sunset: img("sunset.webp"),
  horses: img("horses.webp"),
  cathedral: img("cathedral.webp"),
  adobe: img("adobe.webp"),
  cactus: img("cactus.webp"),
};
