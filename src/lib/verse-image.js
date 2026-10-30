/* Draws the day's verse as a picture (1080 × 1350, the shape phones and
 * WhatsApp statuses like) and downloads it. Everything happens in the
 * browser with a canvas; nothing is uploaded. */

function wrap(ctx, text, maxWidth) {
  const words = text.split(" ");
  const lines = [];
  let line = "";
  for (const w of words) {
    const test = line ? `${line} ${w}` : w;
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line);
      line = w;
    } else line = test;
  }
  if (line) lines.push(line);
  return lines;
}

export async function saveVerseImage({ text, reference, date, footer, photo }) {
  const W = 1080, H = 1350, PAD = 110;
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");

  // make sure the site's fonts are ready before drawing with them
  try {
    await Promise.all([
      document.fonts.load('italic 600 60px "Cormorant Garamond"'),
      document.fonts.load('600 40px "Fraunces"'),
      document.fonts.load('500 60px "Caveat"'),
    ]);
  } catch {}

  // background: the sunrise photo, darkened in desert browns
  ctx.fillStyle = "#231A15";
  ctx.fillRect(0, 0, W, H);
  if (photo) {
    try {
      const img = new Image();
      img.src = photo;
      await img.decode();
      const scale = Math.max(W / img.width, H / img.height);
      const w = img.width * scale, h = img.height * scale;
      ctx.globalAlpha = 0.45;
      ctx.drawImage(img, (W - w) / 2, (H - h) / 2, w, h);
      ctx.globalAlpha = 1;
    } catch {}
  }
  const shade = ctx.createLinearGradient(0, 0, 0, H);
  shade.addColorStop(0, "rgba(35,26,21,0.55)");
  shade.addColorStop(0.5, "rgba(35,26,21,0.7)");
  shade.addColorStop(1, "rgba(28,20,15,0.95)");
  ctx.fillStyle = shade;
  ctx.fillRect(0, 0, W, H);

  // thin gold frame
  ctx.strokeStyle = "rgba(230,176,74,0.55)";
  ctx.lineWidth = 3;
  ctx.strokeRect(48, 48, W - 96, H - 96);

  ctx.textAlign = "center";

  // date
  ctx.fillStyle = "#F0C463";
  ctx.font = '600 30px "Fraunces", Georgia, serif';
  ctx.fillText(date.toUpperCase().split("").join(String.fromCharCode(8202)), W / 2, 190);

  // verse: pick the largest size that fits
  let size = 76;
  let lines;
  do {
    ctx.font = `italic 600 ${size}px "Cormorant Garamond", Georgia, serif`;
    lines = wrap(ctx, `“${text}”`, W - PAD * 2);
    size -= 4;
  } while (lines.length * size * 1.3 > 720 && size > 40);
  const lh = (size + 4) * 1.3;
  let y = H / 2 - (lines.length * lh) / 2 + lh * 0.6;
  ctx.fillStyle = "#FBF7EF";
  for (const l of lines) {
    ctx.fillText(l, W / 2, y);
    y += lh;
  }

  // reference
  ctx.fillStyle = "#E6B04A";
  ctx.font = '600 42px "Fraunces", Georgia, serif';
  ctx.fillText(`— ${reference}`, W / 2, y + 40);

  // signature and site name
  ctx.fillStyle = "#F0C463";
  ctx.font = '500 58px "Caveat", cursive';
  ctx.fillText("Felipe", W / 2, H - 175);
  ctx.fillStyle = "#C9B9A3";
  ctx.font = '400 28px "Fraunces", Georgia, serif';
  ctx.fillText(footer, W / 2, H - 115);

  const url = canvas.toDataURL("image/png");
  const a = document.createElement("a");
  a.href = url;
  a.download = `versiculo-${reference.replace(/[^\p{L}\p{N}]+/gu, "-").toLowerCase()}.png`;
  document.body.appendChild(a);
  a.click();
  a.remove();
}
