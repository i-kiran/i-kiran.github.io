"use strict";

const states = [
  { id: "known_known", label: "Known Known", meaning: "The speaker knows the relevant point and recognizes that they know it.", help: "A listener might confirm their reasoning." },
  { id: "known_unknown", label: "Known Unknown", meaning: "The speaker recognizes a specific gap in their knowledge.", help: "A listener might explain the point they are unsure about." },
  { id: "unknown_known", label: "Unknown Known", meaning: "The speaker shows relevant knowledge but does not recognize that they can use it here.", help: "A listener might prompt them to connect this situation to something they already know." },
  { id: "unknown_unknown", label: "Unknown Unknown", meaning: "The speaker is unaware that something relevant is missing from their understanding.", help: "A listener might draw their attention to a consideration they have overlooked." },
  { id: "error", label: "Error", meaning: "The speaker treats an incorrect belief as something they know.", help: "A listener might correct the belief and explain why it matters here." }
];

const studyVersion = "1.0";
const draftKey = "i-kiran.meta-ignorance-study.v1";
const repo = "https://github.com/i-kiran/mappings_of_ignorance";
const responseDir = "responses/meta-ignorance";
const anchors = { 1: "Not at all confident", 4: "Moderately confident", 7: "Extremely confident" };
const esc = value => String(value).replace(/[&<>"']/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char]));

function readDraft() {
  try {
    const draft = JSON.parse(sessionStorage.getItem(draftKey));
    if (draft?.version === studyVersion && typeof draft.name === "string" &&
        typeof draft.id === "string" && Number.isInteger(draft.page) && draft.answers) return draft;
  } catch { /* The study can run in memory when browser storage is unavailable. */ }
  return { version: studyVersion, id: crypto.randomUUID(), page: 0, name: "", answers: {}, finishedAt: null };
}

function persist(draft) {
  try { sessionStorage.setItem(draftKey, JSON.stringify(draft)); } catch { /* In-memory fallback. */ }
}

function guide() {
  return '<dl class="guide">' + states.map(state =>
    '<div><dt>' + state.label + '</dt><dd>' + state.meaning + ' ' + state.help + '</dd></div>'
  ).join("") + '</dl>';
}

function queryBox(item) {
  return '<section class="querybox"><h2>The speaker’s question</h2><p class="query">' +
    esc(item.query) + '</p></section>';
}

function actions(forward, back = true) {
  const previous = back ? '<button class="secondary" type="button" data-back>Back</button>' : "";
  return '<div class="actions' + (back ? '' : ' single') + '">' + previous +
    '<button type="submit">' + forward + '</button></div>';
}

function ratingRow(state, statement, selection) {
  const choice = Array.from({ length: 7 }, (_, index) => {
    const n = index + 1;
    const label = n + (anchors[n] ? ', ' + anchors[n] : '');
    return '<label class="choice"><input type="radio" name="' + state.id + '" value="' + n +
      '" aria-label="' + label + '"' + (selection === n ? ' checked' : '') +
      '><span aria-hidden="true">' + n + '</span></label>';
  }).join("");
  return '<fieldset aria-describedby="quote-' + state.id + '"><legend>' + state.label +
    '</legend><p class="quote" id="quote-' + state.id + '">' + esc(statement) +
    '</p><div class="scale"><div class="choices">' + choice +
    '</div><div class="ticks" aria-hidden="true"><span>' + anchors[1] + '</span><span>' +
    anchors[7] + '</span></div></div></fieldset>';
}

function csvCell(value) {
  // Keep names with punctuation, accents or spreadsheet formula prefixes as text.
  const raw = String(value);
  const safe = /^[=+@\-\t\r\n]/.test(raw) ? "'" + raw : raw;
  return '"' + safe.replace(/"/g, '""') + '"';
}

function csvFor(draft, items) {
  const rows = [["study_version", "response_id", "participant_name", "completed_at_utc",
    "scenario_number", "scenario_id", "query_number", ...states.map(s => s.id)]];
  items.forEach((item, index) => {
    rows.push([studyVersion, draft.id, draft.name, draft.finishedAt, index + 1, item.id,
      item.query_number,
      ...states.map(s => draft.answers[item.id][s.id])]);
  });
  return rows.map(row => row.map(csvCell).join(",")).join("\r\n") + "\r\n";
}

async function start() {
  const response = await fetch("./stimuli.json");
  if (!response.ok) throw new Error("Stimuli unavailable");
  const items = await response.json();
  if (items.length !== 10 || items.some(item => states.some(s => !item.statements[s.id]) || !item.query)) {
    throw new Error("Incomplete stimuli");
  }
  // The first reading introduces the guide. Later readings lead straight to ratings.
  const pages = [{kind: "name"}];
  items.forEach((item, i) => {
    pages.push({kind: "read", i});
    if (!i) pages.push({kind: "guide"});
    pages.push({kind: "rate", i});
  });

  const draft = readDraft();
  draft.page = Math.max(0, Math.min(draft.page, pages.length));
  const position = document.querySelector("#position");
  document.querySelector("#study").replaceChildren();
  const engine = initJsPsych({ display_element: "study", on_finish: finish });
  let view;

  function frame(title, body, location, number) {
    position.textContent = location;
    const progress = number ? '<progress value="' + number + '" max="10" aria-label="Scenario progress"></progress>' : "";
    view.innerHTML = progress + '<article class="page"><h1 tabindex="-1">' + title + '</h1>' + body + '</article>';
    view.querySelector("h1").focus({ preventScroll: true });
    window.scrollTo(0, 0);
  }

  class StudyPage {
    static info = { name: "meta-ignorance-page", version: studyVersion, parameters: {}, data: {} };
    constructor(jsPsych) { this.jsPsych = jsPsych; }
    trial(display) {
      view = display;
      const page = pages[draft.page];
      const item = items[page.i];
      const number = page.i + 1;
      const location = 'Scenario ' + number + ' of ' + items.length;
      const startTime = performance.now();
      let leaving = false;
      const leave = (direction, data = {}) => {
        if (leaving) return;
        leaving = true;
        draft.page += direction;
        if (draft.page === pages.length) draft.finishedAt = new Date().toISOString();
        persist(draft);
        this.jsPsych.finishTrial({ page: page.kind, scenario_id: item?.id, navigation: direction,
          rt: Math.round(performance.now() - startTime), ...data });
      };

      if (page.kind === "name") {
        frame("Scenario rating study",
          '<p class="lead">You’ll read 10 short scenarios and judge how well five different statements fit their proposed labels.</p>' +
          '<p class="small">Your name will be included with your ratings. At the end, you’ll save your CSV to the research team’s private GitHub repository. You’ll need a GitHub account with write access.</p>' +
          '<form class="name-form"><label for="name">Your name</label><input id="name" type="text" autocomplete="name" maxlength="100" required>' +
          actions('Continue', false) + '</form>', "Welcome");
        const name = view.querySelector("#name");
        name.value = draft.name;
        name.oninput = () => name.setCustomValidity("");
        view.querySelector("form").onsubmit = e => {
          e.preventDefault();
          if (!name.value.trim()) {
            name.setCustomValidity("Enter your name to continue."); name.reportValidity(); return;
          }
          draft.name = name.value.trim();
          leave(1);
        };
        return;
      }

      if (page.kind === "guide") {
        frame("Five states of awareness",
          '<p class="lead">Two people can ask the same question and need different kinds of help. These five states describe what a speaker knows about a relevant point and how aware they are of that knowledge or gap.</p>' +
          guide() + '<section class="directions"><h2>How to rate the statements</h2>' +
          '<p>Each scenario has one speaker and one question. Read each of the five labeled statements as a separate version of what the speaker might say. Imagine adding just that statement between the scenario and the question.</p>' +
          '<p>For each version, rate how confident you are that the proposed label fits the speaker’s words. Use 1 for “not at all confident,” 4 for “moderately confident,” and 7 for “extremely confident.” You can give multiple statements the same rating.</p></section>' +
          '<form>' + actions("Rate the first scenario") + '</form>', "Instructions");
      } else if (page.kind === "read") {
        frame("Read the scenario", '<p class="intro">' + esc(item.scenario) + '</p>' + queryBox(item) +
          '<form>' + actions(page.i === 0 ? "Read the instructions" : "Rate the statements") + '</form>',
          location, number);
      } else {
        const answers = draft.answers[item.id] ??= {};
        const rows = states.map(s => ratingRow(s, item.statements[s.id], answers[s.id])).join("");
        frame("Scenario " + number, '<p class="intro">' + esc(item.scenario) + '</p>' +
          '<section class="ratings-header"><h2>How confident are you that each statement fits its label?</h2>' +
          '<p class="small">Read each statement separately with the same scenario and question.</p>' +
          '<details><summary>View the five definitions</summary>' + guide() + '</details></section>' +
          '<form><div class="ratings">' + rows + '</div>' + queryBox(item) +
          '<p class="status" role="alert" id="rating-status"></p>' +
          actions(number === items.length ? "Finish ratings" : "Next scenario") + '</form>', location, number);
        view.querySelector("form").onchange = e => {
          if (!e.target.matches('input[type="radio"]')) return;
          answers[e.target.name] = Number(e.target.value);
          e.target.closest("fieldset").classList.remove("invalid");
          view.querySelector("#rating-status").textContent = "";
          persist(draft);
        };
      }
      view.querySelector("[data-back]").onclick = () => leave(-1);
      view.querySelector("form").onsubmit = e => {
        e.preventDefault();
        if (page.kind === "rate") {
          const missing = Array.from(view.querySelectorAll("fieldset")).filter(row => !row.querySelector("input:checked"));
          if (missing.length) {
            missing.forEach(row => row.classList.add("invalid"));
            view.querySelector("#rating-status").textContent = 'Choose one rating for each statement before continuing.';
            missing[0].querySelector("input").focus();
            missing[0].scrollIntoView({ block: "center" });
            return;
          }
        }
        leave(1, page.kind === "rate" ? { ratings: { ...draft.answers[item.id] } } : {});
      };
    }
  }

  function finish() {
    view = document.querySelector("#study");
    const csv = csvFor(draft, items);
    const filename = 'ratings-' + draft.id + '.csv';
    const editor = new URL(repo + '/new/main/' + responseDir);
    editor.searchParams.set("filename", filename);
    editor.searchParams.set("value", csv);
    frame("Save your ratings",
      '<p>You’ve rated all 50 statements. One step remains to send your responses to the research team.</p>' +
      '<ol class="steps"><li>Open the private GitHub editor below and sign in with the account that has repository access.</li>' +
      '<li>Check that the CSV contains a header and 10 rows. Choose <strong>Commit changes</strong> and confirm the commit on <strong>main</strong>. Your submission is complete when GitHub shows the saved file.</li></ol>' +
      '<div class="export"><a class="button" id="save" target="_blank" rel="noopener noreferrer">Open prefilled CSV in GitHub</a>' +
      '<button type="button" class="secondary" id="download">Download CSV</button></div>' +
      '<details><summary>Trouble saving on GitHub?</summary><p class="small">If the editor is empty, download the CSV, open the response folder’s upload page, and upload the file. If GitHub shows a 404, sign in and check that you have access from Kiran. Keep your download until your file appears in the repository.</p>' +
      '<a id="upload" target="_blank" rel="noopener noreferrer">Upload the downloaded CSV</a></details>', "50 of 50 rated");
    view.querySelector("#save").href = editor.href;
    view.querySelector("#upload").href = repo + "/upload/main/" + responseDir;
    view.querySelector("#download").onclick = () => {
      const url = URL.createObjectURL(new Blob([csv], {type: "text/csv;charset=utf-8"}));
      const link = document.createElement("a");
      link.href = url; link.download = filename; document.body.append(link);
      link.click(); link.remove();
      setTimeout(() => URL.revokeObjectURL(url), 30000);
    };
  }

  if (draft.page === pages.length) { finish(); return; }
  await engine.run([{ timeline: [{ type: StudyPage }], loop_function: () => draft.page < pages.length }]);
}

start().catch(error => {
  console.error(error);
  document.querySelector("#study").innerHTML = '<p class="loading">The study could not load. Refresh this page to try again.</p>';
});
