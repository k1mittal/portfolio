console.log("IT’S ALIVE!");

function $$(selector, context = document) {
  return Array.from(context.querySelectorAll(selector));
}

let pages = [
  { url: "", title: "Home" },
  { url: "projects/", title: "Projects" },
  { url: "contact/", title: "Contact" },
  { url: "resume/", title: "Resume" },
  { url: "https://github.com/k1mittal", title: "GitHub" },
];

const BASE_PATH =
  location.hostname === "localhost" || location.hostname === "127.0.0.1"
    ? "/" // Local server
    : "/portfolio/"; // GitHub Pages repo name

let nav = document.createElement("nav");
document.body.prepend(nav);

for (let p of pages) {
  let url = p.url;
  let title = p.title;
  url = !url.startsWith("http") ? BASE_PATH + url : url;
  let a = document.createElement("a");
  a.href = url;
  a.textContent = title;
  if (a.host === location.host) {
    let aPath = a.pathname.replace(/\/$/, "").replace(/\/index\.html$/, "");
    let locPath = location.pathname
      .replace(/\/$/, "")
      .replace(/\/index\.html$/, "");
    if (aPath === locPath) {
      a.classList.add("current");
    }
  }
  if (a.host !== location.host) {
    a.target = "_blank";
  }
  nav.append(a);
}

document.body.insertAdjacentHTML(
  "afterbegin",
  `
      <label class="color-scheme">
          Theme:
          <select>
              <option value="light dark">Automatic</option>
              <option value="light">Light</option>
              <option value="dark">Dark</option>
          </select>
      </label>`
);

const select = document.querySelector("select");

if ("colorScheme" in localStorage) {
  const savedScheme = localStorage.colorScheme;
  document.documentElement.style.setProperty("color-scheme", savedScheme);
  select.value = savedScheme; // update dropdown to match
}

select.addEventListener("input", function (event) {
  const value = event.target.value;
  console.log("color scheme changed to", event.target.value);
  document.documentElement.style.setProperty("color-scheme", value);
  localStorage.colorScheme = value;
});

const form = document.querySelector("form");

form?.addEventListener("submit", function (event) {
  event.preventDefault();
  const data = new FormData(form);
  let params = [];
  for (let [name, value] of data) {
    console.log(name, value);
    params.push(`${name}=${encodeURIComponent(value)}`);
  }
  const url = `${form.action}?${params.join("&")}`;
  location.href = url;
});

export async function fetchJSON(url) {
  try {
    // Fetch the JSON file from the given URL
    const response = await fetch(url);
    console.log(response);
    if (!response.ok) {
      throw new Error(`Failed to fetch projects: ${response.statusText}`);
    }
    const data = await response.json();
    console.log(response);
    return data;
  } catch (error) {
    console.error("Error fetching or parsing JSON data:", error);
  }
}

export function renderProjects(project, containerElement, headingLevel = "h2") {
  // Your code will go here
  if (!(containerElement instanceof HTMLElement)) {
    console.error("Invalid containerElement provided.");
    return;
  }
  const validHeadingLevels = ["h1", "h2", "h3", "h4", "h5", "h6"];
  if (!validHeadingLevels.includes(headingLevel)) {
    headingLevel = "h2";
  }
  containerElement.innerHTML = "";
  project.forEach((proj) => {
    const article = document.createElement("article");
    article.innerHTML = `
      <${headingLevel}>${proj.title}</${headingLevel}>
      <img src="${proj.image}" alt="${proj.title}">
      <p>${proj.description}</p>
      <em>Year: ${proj.year}</em>
    `;
    containerElement.appendChild(article);
  });
}

export async function fetchGitHubData(username) {
  // return statement here
  return fetchJSON(`https://api.github.com/users/${username}`);
}
