const LANGS = [
  ["ar", "Arabic"],
  ["fr", "French"],
  ["en", "English"],
  ["tn", "Tunisian Arabic"]
];

const STAGES = [
  ["none", "I don't have a project yet"],
  ["idea", "I have an idea"],
  ["tried", "I've tried it with people"],
  ["running", "It's already running"]
];

const HELPS = [
  ["grant", "A grant"],
  ["loan", "A loan"],
  ["mentoring", "Mentoring"],
  ["intro", "Introductions"],
  ["space", "A place to work"]
];

const NAV = [
  ["home", "Home"],
  ["communities", "Communities"],
  ["courses", "Courses"],
  ["funding", "Funding"],
  ["offers", "Offers"],
  ["forums", "Forums"],
  ["live", "In person"],
  ["share", "Share"]
];

function esc(value) {
  return String(value ?? "").replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "\"": "&quot;",
    "'": "&#39;"
  }[char]));
}

function when(ts) {
  return new Date(ts).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

function roleLabel(role) {
  if (role === "investor") return "Investor";
  if (role === "youth") return "Youth";
  return "Account";
}

function stageLabel(stage) {
  const found = STAGES.find((item) => item[0] === stage);
  return found ? found[1] : "";
}

function langList(user) {
  const names = (user.languages || []).map((code) => {
    const found = LANGS.find((item) => item[0] === code);
    return found ? found[1] : code;
  });
  return names.length ? names.join(", ") : "No language picked";
}

function author(record) {
  if (record.example) return "Example";
  const user = Store.userById(record.userId);
  return user ? user.name : "Member";
}

function brand(href) {
  return `<a class="brand" href="${href}"><img src="images/logo.png" alt=""><span>RISE <em>MED</em></span></a>`;
}

let remote = null;

function client() {
  if (!keysOn() || !window.supabase) return null;
  if (!remote) {
    remote = window.supabase.createClient(window.RISE_CONFIG.supabaseUrl, window.RISE_CONFIG.supabaseAnonKey, {
      auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true, flowType: "pkce" }
    });
  }
  return remote;
}

function profileFromAuth(user) {
  const meta = user.user_metadata || {};
  const experiences = Array.isArray(meta.experiences) && meta.experiences.length
    ? meta.experiences
    : [{ title: "", where: "", year: "" }];
  return {
    id: user.id,
    name: meta.full_name || meta.name || "",
    email: user.email || "",
    password: "",
    role: meta.role || "",
    town: meta.town || "",
    languages: meta.languages || [],
    stage: meta.stage || "",
    goal: meta.goal || "",
    projectName: meta.project_name || "",
    projectAbout: meta.project_about || "",
    experiences,
    cvName: meta.cv_name || "",
    offersHelp: meta.offers_help || [],
    focus: meta.focus || "",
    beforeMeeting: meta.before_meeting || "",
    step: Number(meta.step || 0),
    formError: "",
    onboarded: Boolean(meta.onboarded),
    created: Date.parse(user.created_at) || Date.now()
  };
}

function metaFromUser(user) {
  return {
    full_name: user.name,
    role: user.role,
    town: user.town,
    languages: user.languages,
    stage: user.stage,
    goal: user.goal,
    project_name: user.projectName,
    project_about: user.projectAbout,
    experiences: user.experiences,
    cv_name: user.cvName,
    offers_help: user.offersHelp,
    focus: user.focus,
    before_meeting: user.beforeMeeting,
    step: user.step,
    onboarded: user.onboarded
  };
}

async function pushProfile() {
  const sb = client();
  const user = Store.current();
  if (!sb || !user) return "";
  const { error } = await sb.auth.updateUser({ data: metaFromUser(user) });
  return error ? error.message : "";
}

function authError(error) {
  const msg = (error && error.message) || "The account service didn't answer.";
  if (/invalid login/i.test(msg)) return "That email and password don't match.";
  if (/already registered/i.test(msg)) return "That email already has an account. Sign in.";
  if (/not confirmed/i.test(msg)) return "Confirm the email first, then sign in.";
  return msg;
}

function parseRoute() {
  const parts = (location.hash || "").replace(/^#\/?/, "").split("/").filter(Boolean);
  return { name: parts[0] || "", id: parts[1] || "" };
}

function keysOn() {
  const config = window.RISE_CONFIG || {};
  return Boolean(config.supabaseUrl && config.supabaseAnonKey);
}

function allThreads() {
  return SAMPLE.threads.concat(Store.rows("threads"));
}

function allOffers() {
  return SAMPLE.offers.concat(Store.rows("offers"));
}

function allPosts() {
  return SAMPLE.posts.concat(Store.rows("posts"));
}

function threadById(id) {
  return allThreads().find((thread) => thread.id === id);
}

function courseById(id) {
  return SAMPLE.courses.find((course) => course.id === id);
}

function communityById(id) {
  return SAMPLE.communities.find((item) => item.id === id);
}

function readDraft(form) {
  if (!form) return {};
  const patch = {};
  form.querySelectorAll("[data-field]").forEach((el) => {
    patch[el.dataset.field] = el.value.trim();
  });
  if (form.querySelector("[data-lang]")) {
    patch.languages = [...form.querySelectorAll("[data-lang]:checked")].map((el) => el.dataset.lang);
  }
  if (form.querySelector("[data-help]")) {
    patch.offersHelp = [...form.querySelectorAll("[data-help]:checked")].map((el) => el.dataset.help);
  }
  if (form.querySelector("[data-exp]")) {
    const map = new Map();
    form.querySelectorAll("[data-exp]").forEach((el) => {
      if (!map.has(el.dataset.exp)) map.set(el.dataset.exp, { title: "", where: "", year: "" });
      map.get(el.dataset.exp)[el.dataset.key] = el.value.trim();
    });
    patch.experiences = [...map.values()];
  }
  return patch;
}

function validateStep(user, patch) {
  const next = Object.assign({}, user, patch);
  const step = user.step || 0;
  if (step === 0 && !next.role) return "Choose youth or investor.";
  if (next.role === "youth" && step === 1) {
    if (!next.town) return "Add the town or region you live in.";
    if (!next.languages || !next.languages.length) return "Pick at least one language.";
    if (!next.stage) return "Say where the project stands.";
  }
  if (next.role === "youth" && step === 2) {
    if (!next.goal) return "Write what you want to be true in six months.";
    if (next.stage !== "none" && !next.projectName) return "Name the project, even if the name is temporary.";
  }
  if (next.role === "investor" && step === 1) {
    if (!next.town) return "Add where you're based.";
    if (!next.languages || !next.languages.length) return "Pick at least one language you can read.";
  }
  if (next.role === "investor" && step === 2) {
    if (!next.offersHelp || !next.offersHelp.length) return "Pick what you usually offer.";
    if (!next.focus) return "Say which problems you care about.";
  }
  if (next.role === "investor" && step === 3 && !next.beforeMeeting) {
    return "Say what you need to see before you take a meeting.";
  }
  return "";
}

function choiceChecks(items, attr, selected) {
  const set = new Set(selected || []);
  return `<div class="checks">${items.map(([id, label]) =>
    `<label class="check"><input type="checkbox" data-${attr}="${id}" ${set.has(id) ? "checked" : ""}> ${esc(label)}</label>`
  ).join("")}</div>`;
}

function expEditor(user) {
  const rows = user.experiences && user.experiences.length ? user.experiences : [{ title: "", where: "", year: "" }];
  return rows.map((row, index) => `<div class="exp">
      <input data-exp="${index}" data-key="title" placeholder="What you did" value="${esc(row.title)}">
      <input data-exp="${index}" data-key="where" placeholder="Where" value="${esc(row.where)}">
      <input data-exp="${index}" data-key="year" placeholder="Year" value="${esc(row.year)}">
      <button class="btn ghost small" type="button" data-act="remove-exp" data-i="${index}">Remove</button>
    </div>`).join("") + `<button class="btn ghost small" type="button" data-act="add-exp">Add another</button>`;
}

function cvField(user) {
  const note = user.cvName
    ? `${esc(user.cvName)}. The name is saved on the account. The file itself needs storage, which isn't switched on yet.`
    : "PDF or Word, optional, up to 8 MB.";
  return `<div>
    <label>CV or one-pager<input type="file" data-cv accept=".pdf,.doc,.docx,application/pdf"></label>
    <p class="quiet">${note}</p>
  </div>`;
}

function authView(mode) {
  const signup = mode === "signup";
  return `<div class="auth">
    <aside class="auth-aside">
      ${brand("index.html")}
      <div>
        <h1>The account is where the project lives after the training day.</h1>
        <p>Youth keep lessons, a CV, and the work they're building. Investors read that and answer funding requests.</p>
      </div>
        <p>Sign-in is handled by Supabase. Open the confirmation mail before the first sign-in if one arrives.</p>
    </aside>
    <div class="auth-main">
      <form class="sheet" data-form="${mode}">
        <h2>${signup ? "Create an account" : "Sign in"}</h2>
        <p class="hint">${signup ? "Youth or investor comes on the next screen." : "Use the email and password from the account you created."}</p>
        <div class="stack">
          ${signup ? `<div><label for="name">Name</label><input id="name" name="name" autocomplete="name" placeholder="Your name"></div>` : ""}
          <div><label for="email">Email</label><input id="email" name="email" type="email" autocomplete="email" placeholder="you@email.com"></div>
          <div><label for="password">Password</label><input id="password" name="password" type="password" autocomplete="${signup ? "new-password" : "current-password"}" placeholder="${signup ? "At least 8 characters" : "Password"}"></div>
          <p class="form-error" data-error hidden></p>
          <button class="btn full" type="submit">${signup ? "Continue" : "Sign in"}</button>
        </div>
        <p class="switch">${signup ? "Already have one? <a href=\"#/login\">Sign in</a>" : "New here? <a href=\"#/signup\">Create an account</a>"}</p>
      </form>
    </div>
  </div>`;
}

function roleStep(user) {
  return `<h2>Who is this account for?</h2>
    <p class="hint">One role on this preview. Pick the work you actually came to do.</p>
    <button type="button" class="choice ${user.role === "youth" ? "on" : ""}" data-act="pick-role" data-role="youth">
      <strong>Youth</strong>
      <span>You're building something, or you want to start, and the training is for you.</span>
    </button>
    <button type="button" class="choice ${user.role === "investor" ? "on" : ""}" data-act="pick-role" data-role="investor">
      <strong>Investor</strong>
      <span>You fund, advise, or read early projects. Sometimes that's a grant, sometimes an hour.</span>
    </button>`;
}

function youthStep(user, step) {
  if (step === 1) {
    return `<h2>Where you live, and the languages you want to work in.</h2>
      <p class="hint">Lessons are written to run in Arabic, French, and English. Tunisian Arabic is a fair answer too.</p>
      <div class="stack">
        <label>Town or region<input data-field="town" value="${esc(user.town)}" placeholder="Kasserine, Le Kef, a village name"></label>
        <div><label>Languages</label>${choiceChecks(LANGS, "lang", user.languages)}</div>
        <label>The project
          <select data-field="stage">
            <option value="">Where it stands</option>
            ${STAGES.map(([id, label]) => `<option value="${id}" ${user.stage === id ? "selected" : ""}>${esc(label)}</option>`).join("")}
          </select>
        </label>
      </div>`;
  }
  if (step === 2) {
    return `<h2>The goal, and the project if you have one.</h2>
      <p class="hint">Six months is long enough to be concrete and short enough that you can tell if it happened.</p>
      <div class="stack">
        <label>What do you want to be true in six months?<textarea data-field="goal" placeholder="A sentence or two, in the language you think in.">${esc(user.goal)}</textarea></label>
        <label>Project name<input data-field="projectName" value="${esc(user.projectName)}" placeholder="Skip this if you don't have one yet"></label>
        <label>What it is<textarea data-field="projectAbout" placeholder="Who it's for, and what you've already tried.">${esc(user.projectAbout)}</textarea></label>
      </div>`;
  }
  return `<h2>What you've already done.</h2>
    <p class="hint">A job, a market day, a school project, a season on the family land. Blank rows are fine.</p>
    ${expEditor(user)}
    <div style="margin-top:16px">${cvField(user)}</div>`;
}

function investorStep(user, step) {
  if (step === 1) {
    return `<h2>Where you read from, and which languages you can take a project in.</h2>
      <div class="stack">
        <label>Based in<input data-field="town" value="${esc(user.town)}" placeholder="City, or 'remote'"></label>
        <div><label>Languages you can read</label>${choiceChecks(LANGS, "lang", user.languages)}</div>
      </div>`;
  }
  if (step === 2) {
    return `<h2>What you actually put on the table.</h2>
      <p class="hint">Pick the kinds of support you've given before, not the ones that sound generous.</p>
      <div class="stack">
        <div><label>You usually offer</label>${choiceChecks(HELPS, "help", user.offersHelp)}</div>
        <label>Problems or sectors you care about<textarea data-field="focus" placeholder="Food, repair, first jobs, something narrower.">${esc(user.focus)}</textarea></label>
      </div>`;
  }
  return `<h2>What you need before a meeting.</h2>
    <p class="hint">Founders will see this. Write it the way you'd say it on a call.</p>
    <div class="stack">
      <label>Before I meet someone, I need<textarea data-field="beforeMeeting" placeholder="A page on costs, a photo from a real trial, a person in the town who tried it.">${esc(user.beforeMeeting)}</textarea></label>
      ${cvField(user)}
    </div>`;
}

function onboardView() {
  const user = Store.current();
  const step = user.step || 0;
  const body = step === 0 ? roleStep(user) : user.role === "investor" ? investorStep(user, step) : youthStep(user, step);
  return `<div class="onboard">
    <div class="onboard-bar">
      ${brand("index.html")}
      <span class="step-label">${step + 1} / 4</span>
      <button class="btn ghost small" type="button" data-act="logout">Sign out</button>
    </div>
    <form class="onboard-card" data-form="onboarding">
      ${body}
      ${user.formError ? `<p class="form-error" style="margin-top:14px">${esc(user.formError)}</p>` : ""}
      <div class="form-actions">
        ${step > 0 ? `<button class="btn ghost" type="button" data-act="back-step">Back</button>` : ""}
        <button class="btn" type="submit">${step === 3 ? "Enter the account" : "Continue"}</button>
      </div>
    </form>
  </div>`;
}

function shell(name, inner) {
  const user = Store.current();
  const initials = user.name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join("").toUpperCase() || "R";
  const links = NAV.map(([id, label]) => `<a class="navlink ${name === id ? "on" : ""}" href="#/${id}">${label}</a>`).join("");
  const bannerText = keysOn()
    ? "Your sign-in is saved in Supabase. Posts, funding requests, and RSVPs still stay in this browser."
    : "Preview on this browser. Live accounts start when Supabase is connected.";
  const banner = sessionStorage.getItem("rise-banner")
    ? ""
    : `<div class="banner"><span>${bannerText}</span><button type="button" data-act="dismiss-banner">Hide</button></div>`;
  return `<div class="app">
    <aside class="side" id="side">
      ${brand("#/home")}
      <nav aria-label="Account">${links}</nav>
      <a class="me" href="#/profile">
        <span class="avatar">${esc(initials)}</span>
        <span><strong>${esc(user.name)}</strong><small>${esc(roleLabel(user.role))} · ${esc(user.town || "No town yet")}</small></span>
      </a>
    </aside>
    <button class="scrim" type="button" data-act="close-menu"></button>
    <div class="main">
      <div class="mobile-bar">
        <button class="btn ghost small" type="button" data-act="open-menu">Menu</button>
        ${brand("#/home")}
      </div>
      ${banner}
      <div class="content">${inner}</div>
    </div>
  </div>`;
}

function nextLesson(user) {
  for (const course of SAMPLE.courses) {
    for (const lesson of course.lessons) {
      if (!Store.mine("lessons", "lessonId", lesson.id)) return { course, lesson };
    }
  }
  return null;
}

function viewHome() {
  const user = Store.current();
  if (user.role === "investor") return investorHome(user);
  const upcoming = nextLesson(user);
  const near = SAMPLE.sessions.find((session) => user.town && session.place.toLowerCase().indexOf(user.town.toLowerCase()) !== -1) || SAMPLE.sessions[0];
  const groups = SAMPLE.communities.filter((item) => !Store.mine("memberships", "communityId", item.id)).slice(0, 2);
  return `<h1 class="home-title">${esc(user.name)}</h1>
    <p class="quiet">${esc(user.town || "Town not set")} · ${esc(langList(user))}</p>
    <div class="home-grid">
      <div>
        <section class="panel">
          <p class="kicker">Project</p>
          <h2>${esc(user.projectName || "No project name yet")}</h2>
          <p class="quiet">${esc(user.projectAbout || user.goal || "Add a goal from your profile when you have the words.")}</p>
          ${user.stage ? `<p class="quiet">${esc(stageLabel(user.stage))}</p>` : ""}
        </section>
        <section class="panel">
          <p class="kicker">Lesson</p>
          ${upcoming ? `<h2>${esc(upcoming.course.title)}</h2><p class="quiet">${esc(upcoming.lesson.title)} · ${esc(upcoming.course.language)}</p><a class="btn small" style="margin-top:12px" href="#/courses/${upcoming.course.id}">Open</a>` : `<p>You've opened the example lessons. Live courses come with the database.</p>`}
        </section>
      </div>
      <aside class="stack-panels">
        <section class="panel">
          <p class="kicker">In person <span class="tag ex">Example</span></p>
          <h2>${esc(near.title)}</h2>
          <p class="quiet">${esc(near.place)}</p>
          <a class="btn ghost small" style="margin-top:12px" href="#/live">Sessions</a>
        </section>
        <section class="panel">
          <p class="kicker">Not joined yet</p>
          ${groups.length ? groups.map((item) => `<p style="margin-top:8px"><a href="#/communities/${item.id}">${esc(item.name)}</a></p>`).join("") : `<p class="quiet">You're in the example groups.</p>`}
        </section>
      </aside>
    </div>`;
}

function investorHome(user) {
  const youth = Store.rows("users").filter((item) => item.role === "youth" && item.onboarded && item.id !== user.id);
  const mine = Store.rows("offers").filter((offer) => offer.userId === user.id);
  const asks = Store.rows("applications");
  return `<h1 class="home-title">${esc(user.name)}</h1>
    <p class="quiet">${esc(user.town || "Base not set")} · you read ${esc(langList(user))}</p>
    <div class="home-grid">
      <section class="panel">
        <p class="kicker">Projects on this browser</p>
        ${youth.length ? youth.map((person) => `<article class="entry">
          <h2>${esc(person.projectName || person.name)}</h2>
          <p>${esc(person.projectAbout || person.goal || "No project note yet.")}</p>
          <p>${esc(person.town)} · ${esc(stageLabel(person.stage))}</p>
        </article>`).join("") : `<p class="quiet" style="margin-top:8px">No youth project is stored here yet. A second account, signed up as youth on this browser, will show up.</p>`}
      </section>
      <aside class="stack-panels">
        <section class="panel">
          <p class="kicker">Funding requests</p>
          <p>${asks.length ? asks.length + " on this browser." : "None yet."}</p>
          <a class="btn ghost small" style="margin-top:12px" href="#/funding">Open the list</a>
        </section>
        <section class="panel">
          <p class="kicker">Your offers</p>
          <p>${mine.length ? mine.length + " posted." : "You haven't posted one."}</p>
          <a class="btn ghost small" style="margin-top:12px" href="#/offers">Offers</a>
        </section>
      </aside>
    </div>`;
}

function viewCommunities() {
  return `<header class="page-head"><h1>Communities</h1><p>Groups tied to a place or a kind of work. Join one, then write in it.</p></header>
    ${SAMPLE.communities.map((item) => {
      const joined = Store.mine("memberships", "communityId", item.id);
      return `<div class="row">
        <div>
          <h2><a href="#/communities/${item.id}">${esc(item.name)}</a></h2>
          <p>${esc(item.blurb)}</p>
          <p><span class="tag ex">Example</span> ${esc(item.place)}</p>
        </div>
        <button class="btn ${joined ? "ghost" : ""} small" type="button" data-act="join" data-id="${item.id}">${joined ? "Leave" : "Join"}</button>
      </div>`;
    }).join("")}`;
}

function viewCommunity(id) {
  const group = communityById(id);
  if (!group) return `<h1>That group isn't here.</h1>`;
  const joined = Store.mine("memberships", "communityId", id);
  const posts = allPosts().filter((post) => post.communityId === id && !post.parentId);
  return `<header class="page-head">
      <p class="kicker"><a href="#/communities">Communities</a></p>
      <h1>${esc(group.name)}</h1>
      <p>${esc(group.blurb)} <span class="tag ex">Example</span></p>
    </header>
    <div class="row-actions" style="margin-bottom:8px">
      <button class="btn ${joined ? "ghost" : ""} small" type="button" data-act="join" data-id="${id}">${joined ? "Leave" : "Join"}</button>
    </div>
    ${joined ? `<form class="panel" data-form="community-post" data-id="${id}">
      <label>Write to the group<textarea name="body" placeholder="What you tried, or what you need from Saturday."></textarea></label>
      <p class="form-error" data-error hidden></p>
      <button class="btn small" style="margin-top:10px" type="submit">Post</button>
    </form>` : `<p class="quiet">Join the group to post. You can still read.</p>`}
    ${posts.map(postBlock).join("") || `<p class="quiet" style="margin-top:16px">Nothing posted yet.</p>`}`;
}

function viewCourses() {
  const user = Store.current();
  return `<header class="page-head"><h1>Courses</h1><p>Short lessons for the days between sessions. The ones on this page are examples, so you can open a lesson and see the shape.</p></header>
    ${SAMPLE.courses.map((course) => `<div class="row">
      <div>
        <h2><a href="#/courses/${course.id}">${esc(course.title)}</a></h2>
        <p>${esc(course.summary)}</p>
        <p><span class="tag ex">Example</span> <span class="tag">${esc(course.language)}</span> <span class="tag">${esc(course.level)}</span>
        ${(user.languages || []).includes(course.language === "Arabic" ? "ar" : course.language === "French" ? "fr" : course.language === "Tunisian Arabic" ? "tn" : "en") ? `<span class="tag">Matches a language you picked</span>` : ""}</p>
      </div>
    </div>`).join("")}`;
}

function viewCourse(id) {
  const course = courseById(id);
  if (!course) return `<h1>That course isn't here.</h1>`;
  return `<header class="page-head">
      <p class="kicker"><a href="#/courses">Courses</a></p>
      <h1>${esc(course.title)}</h1>
      <p>${esc(course.summary)} <span class="tag ex">Example</span></p>
    </header>
    ${course.lessons.map((lesson) => {
      const open = Store.mine("lessons", "lessonId", lesson.id);
      return `<article class="lesson">
        <h2>${esc(lesson.title)}</h2>
        <p>${esc(lesson.body)}</p>
        <button class="btn ${open ? "ghost" : ""} small" style="margin-top:8px" type="button" data-act="open-lesson" data-id="${lesson.id}">${open ? "Opened" : "Mark opened"}</button>
      </article>`;
    }).join("")}`;
}

function viewFunding() {
  const user = Store.current();
  const rows = user.role === "investor"
    ? Store.rows("applications")
    : Store.rows("applications").filter((item) => item.userId === user.id);
  const table = rows.length ? `<table>
      <thead><tr><th>Project</th><th>What the money is for</th><th>TND</th><th>From</th></tr></thead>
      <tbody>${rows.map((item) => {
        const person = Store.userById(item.userId);
        return `<tr><td>${esc(item.projectName)}</td><td>${esc(item.purpose)}</td><td>${esc(item.amount || "—")}</td><td>${esc(person ? person.name : "Member")}<br><span class="quiet">${esc(person ? person.town : "")}</span></td></tr>`;
      }).join("")}</tbody>
    </table>` : `<p class="quiet">No requests yet.</p>`;
  if (user.role === "investor") {
    return `<header class="page-head"><h1>Funding</h1><p>Requests from youth accounts on this browser. You answer them by posting an offer or writing in the thread they came from.</p></header>
      <section class="panel">${table}</section>`;
  }
  return `<header class="page-head"><h1>Funding</h1><p>Say what the money buys. A round number in dinars is enough; don't dress it up.</p></header>
    <div class="split-page">
      <form class="panel stack" data-form="apply">
        <label>Project<input name="projectName" value="${esc(user.projectName)}" placeholder="Project name"></label>
        <label>What the money is for<textarea name="purpose" placeholder="Materials, two market days, a machine repair."></textarea></label>
        <label>Amount in TND<input name="amount" inputmode="decimal" placeholder="4000"></label>
        <label>If this doesn't come through<input name="ifNot" placeholder="What you do anyway."></label>
        <p class="form-error" data-error hidden></p>
        <button class="btn" type="submit">Submit request</button>
      </form>
      <section class="panel">
        <p class="kicker">Your requests</p>
        ${table}
      </section>
    </div>`;
}

function viewOffers() {
  const user = Store.current();
  const list = allOffers().map((offer) => {
    const on = Store.mine("interests", "offerId", offer.id);
    return `<article class="entry">
      <div class="entry-meta">${offer.example ? `<span class="tag ex">Example</span>` : `<span>${esc(author(offer))}</span><span>${when(offer.created)}</span>`}</div>
      <h2>${esc(offer.title)}</h2>
      <p>${esc(offer.detail)}</p>
      <p>${esc(offer.whoFor || "")}${offer.until ? " · " + esc(offer.until) : ""}</p>
      ${user.role === "youth" ? `<button class="btn ${on ? "ghost" : ""} small" style="margin-top:8px" type="button" data-act="interest" data-id="${esc(offer.id)}">${on ? "Interested" : "I'm interested"}</button>` : ""}
    </article>`;
  }).join("");
  const form = user.role === "investor" ? `<form class="panel stack" data-form="offer">
      <label>Title<input name="title" placeholder="What you're offering"></label>
      <label>Detail<textarea name="detail" placeholder="How much, or how much time, and what you need to see."></textarea></label>
      <label>Who it's for<input name="whoFor" placeholder="First projects outside the coast, food, repair…"></label>
      <label>Until<input name="until" placeholder="End of March, or leave open"></label>
      <p class="form-error" data-error hidden></p>
      <button class="btn" type="submit">Post offer</button>
    </form>` : "";
  return `<header class="page-head"><h1>Offers</h1><p>${user.role === "investor" ? "Post what you'll actually do. Example offers stay labelled so nobody treats them as open." : "Read what investors have put up. Example offers are not live calls."}</p></header>
    ${form}
    ${list}`;
}

function viewForums() {
  const threads = allThreads();
  return `<header class="page-head"><h1>Forums</h1><p>Questions that don't belong to one town. Example threads are marked.</p></header>
    <form class="panel stack" data-form="thread">
      <label>Title<input name="title" placeholder="The question, in one line"></label>
      <label>Detail<textarea name="body" placeholder="What you already tried."></textarea></label>
      <p class="form-error" data-error hidden></p>
      <button class="btn" type="submit">Post thread</button>
    </form>
    ${threads.map((thread) => `<div class="row">
      <div>
        <h2><a href="#/forums/${thread.id}">${esc(thread.title)}</a></h2>
        <p>${esc(thread.body)}</p>
        ${thread.example ? `<p><span class="tag ex">Example</span></p>` : ""}
      </div>
    </div>`).join("")}`;
}

function viewThread(id) {
  const thread = threadById(id);
  if (!thread) return `<h1>That thread isn't here.</h1>`;
  const replies = Store.rows("posts").filter((post) => post.threadId === id);
  return `<header class="page-head">
      <p class="kicker"><a href="#/forums">Forums</a></p>
      <h1>${esc(thread.title)}</h1>
    </header>
    <article class="entry">
      <div class="entry-meta">${thread.example ? `<span class="tag ex">Example</span>` : `<span>${esc(author(thread))}</span>`}</div>
      <p>${esc(thread.body)}</p>
    </article>
    ${replies.map((post) => `<article class="reply"><div class="entry-meta"><span>${esc(author(post))}</span><span>${when(post.created)}</span></div><p>${esc(post.body)}</p></article>`).join("")}
    <form class="panel stack" style="margin-top:16px" data-form="thread-reply" data-id="${esc(id)}">
      <label>Reply<textarea name="body" placeholder="What worked where you are."></textarea></label>
      <p class="form-error" data-error hidden></p>
      <button class="btn small" type="submit">Reply</button>
    </form>`;
}

function viewLive() {
  const user = Store.current();
  return `<header class="page-head"><h1>In person</h1><p>The meeting is the point. These sessions are examples, so you can mark that you'd go. A town sets the real day.</p></header>
    ${SAMPLE.sessions.map((session) => {
      const going = Store.mine("rsvps", "sessionId", session.id);
      const near = user.town && session.place.toLowerCase().indexOf(user.town.toLowerCase()) !== -1;
      return `<article class="entry">
        <div class="entry-meta"><span class="tag ex">Example</span>${near ? `<span class="tag">Near ${esc(user.town)}</span>` : ""}</div>
        <h2>${esc(session.title)}</h2>
        <p>${esc(session.place)} · ${esc(session.when)}</p>
        <p>${esc(session.detail)}</p>
        <button class="btn ${going ? "ghost" : ""} small" style="margin-top:8px" type="button" data-act="rsvp" data-id="${session.id}">${going ? "You're going" : "I'll go"}</button>
      </article>`;
    }).join("")}`;
}

function viewShare() {
  const posts = allPosts().filter((post) => post.kind === "share" && !post.parentId);
  return `<header class="page-head"><h1>Share</h1><p>Something you tried, including the part that didn't work.</p></header>
    <form class="panel" data-form="share">
      <label>Note<textarea name="body" placeholder="Where you were, what you did, what happened."></textarea></label>
      <p class="form-error" data-error hidden></p>
      <button class="btn small" style="margin-top:10px" type="submit">Share</button>
    </form>
    ${posts.map(postBlock).join("")}`;
}

function postBlock(post) {
  const replies = allPosts().filter((item) => item.parentId === post.id);
  const count = Store.rows("useful").filter((mark) => mark.postId === post.id).length;
  const mine = Store.mine("useful", "postId", post.id);
  return `<article class="entry">
    <div class="entry-meta"><span>${esc(author(post))}</span>${post.example ? `<span class="tag ex">Example</span>` : `<span>${when(post.created)}</span>`}</div>
    <p>${esc(post.body)}</p>
    <div class="row-actions">
      <button class="btn ghost small" type="button" data-act="useful" data-id="${esc(post.id)}">${mine ? "Marked useful" : "Useful"}${count ? " · " + count : ""}</button>
      <button class="btn ghost small" type="button" data-act="show-reply" data-id="${esc(post.id)}">Reply</button>
    </div>
    ${replies.map((reply) => `<div class="reply"><div class="entry-meta"><span>${esc(author(reply))}</span></div><p>${esc(reply.body)}</p></div>`).join("")}
    <form data-form="post-reply" data-parent="${esc(post.id)}" hidden>
      <textarea name="body" placeholder="Reply"></textarea>
      <button class="btn small" style="margin-top:8px" type="submit">Post reply</button>
    </form>
  </article>`;
}

function viewProfile() {
  const user = Store.current();
  const help = (user.offersHelp || []).map((id) => {
    const found = HELPS.find((item) => item[0] === id);
    return found ? found[1] : id;
  }).join(", ");
  return `<header class="page-head"><h1>Profile</h1><p>${esc(roleLabel(user.role))}. ${user.cvName ? "CV on file: " + esc(user.cvName) + "." : "No CV file name yet."}</p></header>
    <form class="panel stack" data-form="profile">
      <label>Town<input data-field="town" value="${esc(user.town)}"></label>
      <div><label>Languages</label>${choiceChecks(LANGS, "lang", user.languages)}</div>
      ${user.role === "youth" ? `
        <label>Goal<textarea data-field="goal">${esc(user.goal)}</textarea></label>
        <label>Project name<input data-field="projectName" value="${esc(user.projectName)}"></label>
        <label>What it is<textarea data-field="projectAbout">${esc(user.projectAbout)}</textarea></label>
        <label>Where it stands
          <select data-field="stage">
            ${STAGES.map(([id, label]) => `<option value="${id}" ${user.stage === id ? "selected" : ""}>${esc(label)}</option>`).join("")}
          </select>
        </label>
        <div><label>Experience</label>${expEditor(user)}</div>
      ` : `
        <p class="quiet">You usually offer: ${esc(help || "nothing picked yet")}.</p>
        <div><label>Update that</label>${choiceChecks(HELPS, "help", user.offersHelp)}</div>
        <label>Focus<textarea data-field="focus">${esc(user.focus)}</textarea></label>
        <label>Before a meeting<textarea data-field="beforeMeeting">${esc(user.beforeMeeting)}</textarea></label>
      `}
      ${cvField(user)}
      ${user.savedNote ? `<p class="quiet">${esc(user.savedNote)}</p>` : ""}
      <p class="form-error" data-error hidden></p>
      <div class="form-actions">
        <button class="btn" type="submit">Save</button>
        <button class="btn ghost" type="button" data-act="logout">Sign out</button>
      </div>
    </form>`;
}

function page(name, route) {
  if (name === "home") return viewHome();
  if (name === "communities") return route.id ? viewCommunity(route.id) : viewCommunities();
  if (name === "courses") return route.id ? viewCourse(route.id) : viewCourses();
  if (name === "funding") return viewFunding();
  if (name === "offers") return viewOffers();
  if (name === "forums") return route.id ? viewThread(route.id) : viewForums();
  if (name === "live") return viewLive();
  if (name === "share") return viewShare();
  if (name === "profile") return viewProfile();
  return viewHome();
}

function resolve(route) {
  const user = Store.current();
  const open = route.name === "login" || route.name === "signup";
  if (!user) return open ? route.name : "login";
  if (!user.onboarded) return "onboarding";
  if (open || route.name === "onboarding" || !route.name) return "home";
  const known = NAV.map((item) => item[0]).concat(["profile"]);
  return known.includes(route.name) ? route.name : "home";
}

function render() {
  const route = parseRoute();
  const name = resolve(route);
  const root = document.getElementById("root");
  const titles = {
    login: "Sign in",
    signup: "Create account",
    onboarding: "Set up your account",
    home: "Home",
    communities: "Communities",
    courses: "Courses",
    funding: "Funding",
    offers: "Offers",
    forums: "Forums",
    live: "In person",
    share: "Share",
    profile: "Profile"
  };
  document.title = (titles[name] || "RISE MED") + " · RISE MED";
  if (name === "login" || name === "signup") root.innerHTML = authView(name);
  else if (name === "onboarding") root.innerHTML = onboardView();
  else root.innerHTML = shell(name, page(name, route));
  window.scrollTo(0, 0);
}

function showError(message) {
  const el = document.querySelector("[data-error]");
  if (!el) return;
  el.hidden = !message;
  el.className = "form-error";
  el.textContent = message || "";
}

function showNote(message) {
  const el = document.querySelector("[data-error]");
  if (!el) return;
  el.hidden = false;
  el.className = "form-note";
  el.textContent = message;
}

async function onSubmit(event) {
  const form = event.target;
  if (!(form instanceof HTMLFormElement) || !form.dataset.form) return;
  event.preventDefault();
  const kind = form.dataset.form;
  const data = new FormData(form);
  const text = (key) => String(data.get(key) || "").trim();

  if (kind === "signup") {
    const name = text("name");
    const email = text("email");
    const password = text("password");
    if (!name) return showError("Add your name.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return showError("That email doesn't look usable.");
    if (password.length < 8) return showError("Use at least 8 characters.");
    const sb = client();
    if (!sb) return showError("The account service didn't load. Refresh and try again.");
    const button = form.querySelector("button[type=submit]");
    if (button) button.disabled = true;
    const { data: created, error } = await sb.auth.signUp({
      email,
      password,
      options: { data: { full_name: name, onboarded: false, step: 0 } }
    });
    if (button) button.disabled = false;
    if (error) return showError(authError(error));
    if (!created.session) return showNote("Account created. Open the confirmation mail, then sign in.");
    Store.adopt(profileFromAuth(created.user));
    location.hash = "#/onboarding";
    return;
  }
  if (kind === "login") {
    const sb = client();
    if (!sb) return showError("The account service didn't load. Refresh and try again.");
    const button = form.querySelector("button[type=submit]");
    if (button) button.disabled = true;
    const { data: signed, error } = await sb.auth.signInWithPassword({
      email: text("email"),
      password: text("password")
    });
    if (button) button.disabled = false;
    if (error) return showError(authError(error));
    const user = Store.adopt(profileFromAuth(signed.user));
    location.hash = user.onboarded ? "#/home" : "#/onboarding";
    return;
  }
  if (kind === "onboarding") {
    const user = Store.current();
    const patch = readDraft(form);
    const error = validateStep(user, patch);
    if (error) {
      Store.patch(Object.assign({}, patch, { formError: error }));
      render();
      return;
    }
    const done = (user.step || 0) >= 3;
    Store.patch(Object.assign({}, patch, {
      formError: "",
      onboarded: done,
      step: done ? user.step : (user.step || 0) + 1
    }));
    const pushed = await pushProfile();
    if (pushed) {
      Store.patch({ formError: pushed, onboarded: false, step: user.step });
      render();
      return;
    }
    if (done) location.hash = "#/home";
    else render();
    return;
  }
  if (kind === "profile") {
    const patch = readDraft(form);
    if (!patch.town) return showError("Add a town, or write remote.");
    patch.savedNote = "Saved to your account.";
    patch.formError = "";
    Store.patch(patch);
    const pushed = await pushProfile();
    if (pushed) return showError(pushed);
    render();
    return;
  }
  if (kind === "apply") {
    if (!text("projectName") || !text("purpose")) return showError("Name the project and say what the money is for.");
    Store.add("applications", {
      projectName: text("projectName"),
      purpose: text("purpose"),
      amount: text("amount"),
      ifNot: text("ifNot")
    });
    render();
    return;
  }
  if (kind === "offer") {
    if (!text("title") || !text("detail")) return showError("Add a title and what you're actually offering.");
    Store.add("offers", { title: text("title"), detail: text("detail"), whoFor: text("whoFor"), until: text("until") });
    render();
    return;
  }
  if (kind === "thread") {
    if (!text("title") || !text("body")) return showError("Add a title and a bit of detail.");
    const thread = Store.add("threads", { title: text("title"), body: text("body") });
    location.hash = "#/forums/" + thread.id;
    return;
  }
  if (kind === "thread-reply") {
    if (!text("body")) return showError("Write the reply before posting it.");
    Store.add("posts", { kind: "reply", threadId: form.dataset.id, body: text("body") });
    render();
    return;
  }
  if (kind === "share") {
    if (!text("body")) return showError("Write the note first.");
    Store.add("posts", { kind: "share", body: text("body") });
    render();
    return;
  }
  if (kind === "community-post") {
    if (!text("body")) return showError("Write something before posting.");
    Store.add("posts", { kind: "community", communityId: form.dataset.id, body: text("body") });
    render();
    return;
  }
  if (kind === "post-reply") {
    if (!text("body")) return showError("Write the reply before posting it.");
    const parent = allPosts().find((post) => post.id === form.dataset.parent);
    Store.add("posts", {
      kind: "reply",
      parentId: form.dataset.parent,
      communityId: parent ? parent.communityId : "",
      body: text("body")
    });
    render();
  }
}

async function onClick(event) {
  const el = event.target.closest("[data-act]");
  if (!el) return;
  const act = el.dataset.act;
  if (act === "open-menu") {
    document.getElementById("side").classList.add("open");
    document.querySelector(".scrim").classList.add("on");
    return;
  }
  if (act === "close-menu") {
    document.getElementById("side").classList.remove("open");
    document.querySelector(".scrim").classList.remove("on");
    return;
  }
  if (act === "dismiss-banner") {
    sessionStorage.setItem("rise-banner", "1");
    render();
    return;
  }
  if (act === "logout") {
    const sb = client();
    if (sb) await sb.auth.signOut();
    Store.logout();
    location.hash = "#/login";
    return;
  }
  if (act === "pick-role") {
    Store.patch({ role: el.dataset.role, formError: "" });
    render();
    return;
  }
  if (act === "back-step" || act === "add-exp" || act === "remove-exp") {
    const form = el.closest("form");
    const patch = readDraft(form);
    const user = Store.current();
    if (act === "back-step") patch.step = Math.max(0, (user.step || 0) - 1);
    if (act === "add-exp") {
      patch.experiences = (patch.experiences || []).concat([{ title: "", where: "", year: "" }]);
    }
    if (act === "remove-exp") {
      const rows = patch.experiences || [];
      rows.splice(Number(el.dataset.i), 1);
      patch.experiences = rows.length ? rows : [{ title: "", where: "", year: "" }];
    }
    patch.formError = "";
    Store.patch(patch);
    render();
    return;
  }
  if (act === "join") Store.flip("memberships", "communityId", el.dataset.id);
  if (act === "rsvp") Store.flip("rsvps", "sessionId", el.dataset.id);
  if (act === "interest") Store.flip("interests", "offerId", el.dataset.id);
  if (act === "useful") Store.flip("useful", "postId", el.dataset.id);
  if (act === "open-lesson") {
    if (!Store.mine("lessons", "lessonId", el.dataset.id)) Store.flip("lessons", "lessonId", el.dataset.id);
  }
  if (act === "show-reply") {
    const form = document.querySelector(`form[data-parent="${CSS.escape(el.dataset.id)}"]`);
    if (form) form.hidden = !form.hidden;
    return;
  }
  if (["join", "rsvp", "interest", "useful", "open-lesson"].includes(act)) render();
}

function onChange(event) {
  const input = event.target;
  if (!input.dataset || !input.dataset.cv) return;
  const file = input.files && input.files[0];
  const form = input.closest("form");
  const patch = readDraft(form);
  if (!file) return;
  if (file.size > 8 * 1024 * 1024) patch.formError = "That file is over 8 MB.";
  else {
    patch.cvName = file.name;
    patch.formError = "";
  }
  Store.patch(patch);
  render();
}

const root = document.getElementById("root");
root.addEventListener("click", onClick);
root.addEventListener("submit", onSubmit);
root.addEventListener("change", onChange);
window.addEventListener("hashchange", render);

async function start() {
  const sb = client();
  if (sb) {
    try {
      const { data } = await sb.auth.getSession();
      if (data.session && data.session.user) Store.adopt(profileFromAuth(data.session.user));
    } catch (e) {
      /* stay on the sign-in screen if the session can't be read */
    }
  }
  if (!location.hash) {
    const user = Store.current();
    location.replace(user ? (user.onboarded ? "#/home" : "#/onboarding") : "#/login");
  } else {
    render();
  }
}

start();
