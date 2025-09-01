function createShapeSVG(shape, color, size = 200) {
  const center = size / 2;
  const r = Math.min(100, size * 0.45);
  let strokeColor = color;
  let strokeWidth = shape === "ring" ? 12 : 6;
  let fillColor = shape === "ring" ? "none" : color;

  let inner = "";

  if (shape === "square") {
    const s = r * 1.4;
    inner = `<rect x="${center - s / 2}" y="${
      center - s / 2
    }" width="${s}" height="${s}" rx="12" fill="${fillColor}" stroke="${strokeColor}" stroke-width="${strokeWidth}"/>`;
  } else if (shape === "ring") {
    inner = `<circle cx="${center}" cy="${center}" r="${r}" fill="none" stroke="${strokeColor}" stroke-width="${strokeWidth}"/>`;
  } else if (shape === "circle") {
    inner = `<circle cx="${center}" cy="${center}" r="${r}" fill="${fillColor}" stroke="${strokeColor}" stroke-width="${strokeWidth}"/>`;
  } else if (shape === "triangle") {
    const p1 = `${center},${center - r}`;
    const p2 = `${center - r},${center + r}`;
    const p3 = `${center + r},${center + r}`;
    inner = `<polygon points="${p1} ${p2} ${p3}" fill="${fillColor}" stroke="${strokeColor}" stroke-width="${strokeWidth}"/>`;
  } else if (shape === "star") {
    const points = [];
    for (let i = 0; i < 5; i++) {
      const ang = Math.PI / 2 + (i * 2 * Math.PI) / 5;
      const x = center + Math.cos(ang) * r;
      const y = center - Math.sin(ang) * r;
      points.push(`${x},${y}`);
      const ang2 = ang + Math.PI / 5;
      const x2 = center + Math.cos(ang2) * (r * 0.45);
      const y2 = center - Math.sin(ang2) * (r * 0.45);
      points.push(`${x2},${y2}`);
    }
    inner = `<polygon points="${points.join(
      " "
    )}" fill="${fillColor}" stroke="${strokeColor}" stroke-width="${
      strokeWidth * 0.75
    }"/>`;
  }

  return (
    "data:image/svg+xml;utf8," +
    encodeURIComponent(
      `<svg xmlns='http://www.w3.org/2000/svg' width='${size}' height='${size}' viewBox='0 0 ${size} ${size}'>${inner}</svg>`
    )
  );
}
