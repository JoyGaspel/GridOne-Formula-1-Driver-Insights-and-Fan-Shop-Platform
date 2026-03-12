const OFFICIAL_F1_NEWS_URL = "https://www.formula1.com/en/latest";

function toAbsoluteUrl(path) {
  if (!path) {
    return "";
  }

  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }

  return `https://www.formula1.com${path}`;
}

function pickBestImageSource(image) {
  if (!image) {
    return "";
  }

  const srcSet = image.getAttribute("srcset")
    || image.getAttribute("data-srcset")
    || image.getAttribute("data-cfsrcset")
    || "";

  if (srcSet) {
    const candidates = srcSet
      .split(",")
      .map((entry) => entry.trim())
      .map((entry) => {
        const parts = entry.split(/\s+/).filter(Boolean);
        const url = parts[0] || "";
        const descriptor = parts[1] || "";
        const width = descriptor.endsWith("w") ? Number.parseInt(descriptor, 10) : 0;

        return {
          url: toAbsoluteUrl(url),
          width: Number.isFinite(width) ? width : 0,
        };
      })
      .filter((candidate) => candidate.url);

    if (candidates.length > 0) {
      candidates.sort((a, b) => b.width - a.width);
      return candidates[0].url;
    }
  }

  return toAbsoluteUrl(
    image.getAttribute("src")
      || image.getAttribute("data-src")
      || image.getAttribute("data-cfsrc")
      || "",
  );
}

function parseLatestNewsHtml(html) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");
  const links = Array.from(doc.querySelectorAll('a[href^="/en/latest/article/"]'));
  const seen = new Set();

  return links
    .map((link) => {
      const href = link.getAttribute("href") || "";
      const title = link.textContent?.trim() || "";

      if (!href || !title || seen.has(href)) {
        return null;
      }

      seen.add(href);

      const articleCard = link.closest('[class*="ArticleListCard-module_articlecard"]');
      const image = articleCard?.querySelector("img");

      return {
        title,
        url: toAbsoluteUrl(href),
        image: pickBestImageSource(image),
        source: "Official F1",
      };
    })
    .filter(Boolean);
}

export async function fetchOfficialLatestNews(limit = 3) {
  const response = await fetch("/f1-news/en/latest");

  if (!response.ok) {
    throw new Error(`Official F1 news request failed (${response.status})`);
  }

  const html = await response.text();
  return parseLatestNewsHtml(html).slice(0, limit);
}

export { OFFICIAL_F1_NEWS_URL };
