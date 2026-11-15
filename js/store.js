const Store = (() => {
  const KEY = "risemed.v1";

  function empty() {
    return {
      users: [],
      sessionId: null,
      memberships: [],
      posts: [],
      applications: [],
      offers: [],
      threads: [],
      rsvps: [],
      interests: [],
      useful: [],
      lessons: []
    };
  }

  function load() {
    try {
      const raw = JSON.parse(localStorage.getItem(KEY));
      if (!raw || !Array.isArray(raw.users)) return empty();
      return Object.assign(empty(), raw);
    } catch (e) {
      return empty();
    }
  }

  let state = load();

  function persist() {
    localStorage.setItem(KEY, JSON.stringify(state));
  }

  function uid() {
    if (window.crypto && crypto.randomUUID) return crypto.randomUUID();
    return "id-" + Math.random().toString(36).slice(2) + Date.now().toString(36);
  }

  function blankUser(fields) {
    return Object.assign({
      id: uid(),
      name: "",
      email: "",
      password: "",
      role: "",
      town: "",
      languages: [],
      stage: "",
      goal: "",
      projectName: "",
      projectAbout: "",
      experiences: [{ title: "", where: "", year: "" }],
      cvName: "",
      offersHelp: [],
      focus: "",
      beforeMeeting: "",
      step: 0,
      formError: "",
      onboarded: false,
      created: Date.now()
    }, fields);
  }

  return {
    uid,
    current() {
      return state.users.find((user) => user.id === state.sessionId) || null;
    },
    userById(id) {
      return state.users.find((user) => user.id === id) || null;
    },
    signup(fields) {
      const email = fields.email.trim().toLowerCase();
      if (state.users.some((user) => user.email.toLowerCase() === email)) {
        return { error: "That email already has an account." };
      }
      const user = blankUser(fields);
      user.email = email;
      state.users.push(user);
      state.sessionId = user.id;
      persist();
      return { user };
    },
    adopt(fields) {
      let user = state.users.find((item) => item.id === fields.id);
      if (!user && fields.email) {
        user = state.users.find((item) => item.email.toLowerCase() === String(fields.email).toLowerCase());
      }
      if (!user) {
        user = blankUser(fields);
        user.password = "";
        state.users.push(user);
      } else {
        Object.assign(user, fields, { password: "" });
      }
      state.sessionId = user.id;
      persist();
      return user;
    },
    login(email, password) {
      const user = state.users.find((item) => item.email.toLowerCase() === email.trim().toLowerCase());
      if (!user) return { error: "No account uses that email." };
      if (user.password !== password) return { error: "Wrong password." };
      state.sessionId = user.id;
      persist();
      return { user };
    },
    logout() {
      state.sessionId = null;
      persist();
    },
    patch(partial) {
      const user = this.current();
      if (!user) return;
      Object.assign(user, partial);
      persist();
    },
    rows(key) {
      return state[key];
    },
    add(key, record) {
      const row = Object.assign({
        id: uid(),
        created: Date.now(),
        userId: this.current() ? this.current().id : null
      }, record);
      state[key].push(row);
      persist();
      return row;
    },
    mine(key, field, value) {
      const id = this.current() && this.current().id;
      return state[key].some((row) => row.userId === id && row[field] === value);
    },
    flip(key, field, value) {
      const id = this.current().id;
      const index = state[key].findIndex((row) => row.userId === id && row[field] === value);
      if (index >= 0) state[key].splice(index, 1);
      else {
        const row = { userId: id, created: Date.now() };
        row[field] = value;
        state[key].push(row);
      }
      persist();
    }
  };
})();
