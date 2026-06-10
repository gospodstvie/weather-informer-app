const weatherIcons = (() => {
  let uid = 0;

  function nextId(prefix) {
    uid += 1;
    return `wi-${prefix}-${uid}`;
  }

  function palette(variant) {
    if (variant === "night") {
      return {
        sun: null,
        moon: ["#F4F4F5", "#C7C7CC"],
        moonGlow: "rgba(148, 163, 184, 0.45)",
        cloud: ["#9CA3AF", "#6B7280"],
        cloudHighlight: "#D1D5DB",
        cloudShadow: "rgba(15, 23, 42, 0.28)",
        rain: "rgba(203, 213, 225, 0.65)",
        bolt: "#FDE68A",
        snow: "#E5E7EB",
        star: "#F8FAFC",
        fog: "rgba(203, 213, 225, 0.55)"
      };
    }

    return {
      sun: ["#FFE8A3", "#FFBA4A"],
      sunCore: "#FFD978",
      moon: null,
      cloud: ["#FFFFFF", "#E2E8F0"],
      cloudHighlight: "#FFFFFF",
      cloudShadow: "rgba(100, 116, 139, 0.18)",
      rain: "rgba(100, 116, 139, 0.5)",
      bolt: "#FCD34D",
      snow: "#F8FAFC",
      star: null,
      fog: "rgba(148, 163, 184, 0.45)"
    };
  }

  function defs(p) {
    const sunGrad = nextId("sun");
    const cloudGrad = nextId("cloud");
    const moonGrad = nextId("moon");
    const glow = nextId("glow");

    let defsBlock = `
      <defs>
        <linearGradient id="${cloudGrad}" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="${p.cloudHighlight || p.cloud[0]}"/>
          <stop offset="100%" stop-color="${p.cloud[1]}"/>
        </linearGradient>
        <filter id="${glow}" x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="2.4" result="blur"/>
          <feMerge>
            <feMergeNode in="blur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
    `;

    if (p.sun) {
      defsBlock += `
        <radialGradient id="${sunGrad}" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="${p.sunCore || p.sun[0]}"/>
          <stop offset="72%" stop-color="${p.sun[0]}"/>
          <stop offset="100%" stop-color="${p.sun[1]}"/>
        </radialGradient>
      `;
    }

    if (p.moon) {
      defsBlock += `
        <linearGradient id="${moonGrad}" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${p.moon[0]}"/>
          <stop offset="100%" stop-color="${p.moon[1]}"/>
        </linearGradient>
      `;
    }

    defsBlock += "</defs>";

    return { defsBlock, sunGrad, cloudGrad, moonGrad, glow };
  }

  function cloudPath(cx, cy, scale) {
    const s = scale;
    return `
      M ${cx - 26 * s} ${cy + 4 * s}
      C ${cx - 34 * s} ${cy + 4 * s}, ${cx - 34 * s} ${cy - 8 * s}, ${cx - 22 * s} ${cy - 10 * s}
      C ${cx - 20 * s} ${cy - 22 * s}, ${cx - 4 * s} ${cy - 24 * s}, ${cx + 4 * s} ${cy - 14 * s}
      C ${cx + 14 * s} ${cy - 22 * s}, ${cx + 28 * s} ${cy - 16 * s}, ${cx + 28 * s} ${cy - 4 * s}
      C ${cx + 38 * s} ${cy - 2 * s}, ${cx + 38 * s} ${cy + 10 * s}, ${cx + 26 * s} ${cy + 12 * s}
      C ${cx + 22 * s} ${cy + 22 * s}, ${cx + 6 * s} ${cy + 22 * s}, ${cx} ${cy + 14 * s}
      C ${cx - 10 * s} ${cy + 22 * s}, ${cx - 24 * s} ${cy + 18 * s}, ${cx - 26 * s} ${cy + 4 * s}
      Z
    `;
  }

  function cloudGroup(cx, cy, scale, cloudGrad, shadowColor) {
    return `
      <ellipse cx="${cx}" cy="${cy + 18 * scale}" rx="${30 * scale}" ry="${5 * scale}" fill="${shadowColor}" opacity="0.55"/>
      <path d="${cloudPath(cx, cy, scale)}" fill="url(#${cloudGrad})"/>
    `;
  }

  function sunDisc(cx, cy, r, sunGrad) {
    return `
      <circle cx="${cx}" cy="${cy}" r="${r * 1.35}" fill="url(#${sunGrad})" opacity="0.14"/>
      <circle cx="${cx}" cy="${cy}" r="${r}" fill="url(#${sunGrad})"/>
    `;
  }

  function moonCrescent(cx, cy, r, moonGrad, glowId) {
    return `
      <circle cx="${cx}" cy="${cy}" r="${r * 1.6}" fill="rgba(148,163,184,0.22)" filter="url(#${glowId})"/>
      <path
        d="M ${cx + 6} ${cy - r}
           A ${r} ${r} 0 1 0 ${cx + 6} ${cy + r}
           A ${r * 0.78} ${r * 0.78} 0 1 1 ${cx + 6} ${cy - r}
           Z"
        fill="url(#${moonGrad})"
      />
    `;
  }

  function stars(p) {
    if (!p.star) return "";
    const points = [
      [72, 24, 1.4],
      [82, 38, 1],
      [66, 44, 0.8]
    ];
    return points
      .map(
        ([x, y, r]) =>
          `<circle cx="${x}" cy="${y}" r="${r}" fill="${p.star}" opacity="0.85"/>
           <circle cx="${x}" cy="${y}" r="${r * 2.2}" fill="${p.star}" opacity="0.12"/>`
      )
      .join("");
  }

  function rainLines(x, y, count, color) {
    let lines = "";
    for (let i = 0; i < count; i += 1) {
      const px = x + i * 8;
      lines += `<line x1="${px}" y1="${y}" x2="${px - 1.5}" y2="${y + 9}" stroke="${color}" stroke-width="1.6" stroke-linecap="round"/>`;
    }
    return lines;
  }

  function svg(content, size, className) {
    return `<svg class="weather-symbol ${className}" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="${size}" height="${size}" aria-hidden="true">${content}</svg>`;
  }

  function draw(iconKey, size, variant) {
    const p = palette(variant);
    const { defsBlock, sunGrad, cloudGrad, moonGrad, glow } = defs(p);
    const isNight = variant === "night";
    const key = isNight && (iconKey === "clear" || iconKey === "night") ? "night" : iconKey;

    let body = "";

    switch (key) {
      case "clear":
        body = sunDisc(50, 46, 20, sunGrad);
        break;

      case "night":
        body = `${stars(p)}${moonCrescent(58, 48, 16, moonGrad, glow)}`;
        break;

      case "partly-clear":
        if (isNight) {
          body = `${stars(p)}${moonCrescent(72, 30, 11, moonGrad, glow)}${cloudGroup(46, 58, 0.95, cloudGrad, p.cloudShadow)}`;
        } else {
          body = `${sunDisc(74, 30, 12, sunGrad)}${cloudGroup(46, 58, 0.95, cloudGrad, p.cloudShadow)}`;
        }
        break;

      case "partly-cloudy":
        if (isNight) {
          body = `${stars(p)}${moonCrescent(30, 34, 10, moonGrad, glow)}${cloudGroup(54, 56, 1, cloudGrad, p.cloudShadow)}`;
        } else {
          body = `${sunDisc(30, 34, 10, sunGrad)}${cloudGroup(54, 56, 1, cloudGrad, p.cloudShadow)}`;
        }
        break;

      case "overcast":
        body = `
          ${cloudGroup(42, 48, 0.82, cloudGrad, p.cloudShadow)}
          ${cloudGroup(58, 54, 0.9, cloudGrad, p.cloudShadow)}
        `;
        break;

      case "fog":
        body = [34, 44, 54].map((y, i) => {
          const width = 56 - i * 6;
          const x = 50 - width / 2;
          return `<line x1="${x}" y1="${y}" x2="${x + width}" y2="${y}" stroke="${p.fog}" stroke-width="3.2" stroke-linecap="round"/>`;
        }).join("");
        break;

      case "drizzle":
        body = `
          ${cloudGroup(50, 36, 1, cloudGrad, p.cloudShadow)}
          ${rainLines(36, 58, 4, p.rain)}
        `;
        break;

      case "rain":
        body = `
          ${cloudGroup(50, 34, 1.05, cloudGrad, p.cloudShadow)}
          ${rainLines(34, 58, 5, p.rain)}
        `;
        break;

      case "heavy-rain":
        body = `
          ${cloudGroup(50, 30, 1.12, cloudGrad, p.cloudShadow)}
          ${rainLines(30, 56, 6, p.rain)}
          ${rainLines(36, 64, 5, p.rain)}
        `;
        break;

      case "thunder":
        body = `
          ${cloudGroup(50, 32, 1.05, cloudGrad, p.cloudShadow)}
          <path d="M 46 54 L 42 66 L 47 66 L 44 78 L 56 60 L 51 60 L 54 54 Z" fill="${p.bolt}" opacity="0.95"/>
          ${rainLines(58, 66, 2, p.rain)}
        `;
        break;

      case "snow":
        body = `
          ${cloudGroup(50, 34, 1, cloudGrad, p.cloudShadow)}
          <circle cx="38" cy="64" r="2.2" fill="${p.snow}" opacity="0.9"/>
          <circle cx="50" cy="70" r="2.4" fill="${p.snow}" opacity="0.9"/>
          <circle cx="62" cy="64" r="2.2" fill="${p.snow}" opacity="0.9"/>
        `;
        break;

      default:
        body = isNight
          ? `${stars(p)}${moonCrescent(54, 48, 12, moonGrad, glow)}${cloudGroup(50, 58, 0.9, cloudGrad, p.cloudShadow)}`
          : `${sunDisc(30, 34, 10, sunGrad)}${cloudGroup(54, 56, 1, cloudGrad, p.cloudShadow)}`;
    }

    return svg(`${defsBlock}${body}`, size, `weather-symbol--${key}`);
  }

  function normalizeOptions(sizeOrOptions, variantFallback) {
    if (typeof sizeOrOptions === "number") {
      return { size: sizeOrOptions, variant: variantFallback || "day" };
    }
    return {
      size: sizeOrOptions?.size ?? 48,
      variant: sizeOrOptions?.variant ?? variantFallback ?? "day"
    };
  }

  function render(iconKey, description, sizeOrOptions = 48) {
    const { size, variant } = normalizeOptions(sizeOrOptions);
    const resolvedKey = iconKey || "partly-cloudy";
    return draw(resolvedKey, size, variant);
  }

  return { render };
})();

window.weatherIcons = weatherIcons;
