
/* global APP_CONFIG */
const state = {
  theme: APP_CONFIG.defaults.theme,
  mode: APP_CONFIG.defaults.mode,
  model: APP_CONFIG.defaults.model,
  conversations: [],
  currentId: null,
  systemPrompt: "",
  attachments: [],
  generation: false,
  imageModePrompt: "",
  rightPanelOpen: true,
  selectedMessageId: null,
  aborter: null
};

const els = {};

document.addEventListener("DOMContentLoaded", init);

function init() {
  cacheEls();
  hydrateConfig();
  hydrateState();
  buildStaticUI();
  bindEvents();
  renderAll();

  if (!localStorage.getItem(APP_CONFIG.storageKey.welcome)) {
    showWelcome();
  } else {
    showApp();
  }
}

function cacheEls() {
  const ids = [
    "welcome","app","toastStack","sidebar","rightbar","menuBtn","panelBtn","themeBtn",
    "newChatBtn","settingsBtn","exportBtn","clearBtn","modeList","modelList","conversationList",
    "topPills","statusDot","statusText","pageTitle","pageSubtitle","bannerText","activeModelBadge",
    "emptyState","feed","promptInput","fileInput","sendBtn","stopBtn","clearAttachBtn","attachStrip",
    "promptAssistBtn","systemDialog","systemPromptInput","closeSystemBtn","resetSystemBtn","saveSystemBtn",
    "featureGrid","quickRow","tipList","inspectorText","previewFrame","startBtn","themeFromWelcome",
    "welcomeTitle","welcomeSub","welcomeFeatures","welcomeBullets","imageDialog","imageDialogRun",
    "closeImageDialogBtn","imageDialogCancel","imageModelSelect","imagePromptInput","imageSizeInput"
  ];
  ids.forEach((id) => els[id] = document.getElementById(id));
}

function hydrateConfig() {
  const first = APP_CONFIG.models[0];
  if (first && !APP_CONFIG.models.some((m) => m.id === state.model)) {
    state.model = first.id;
  }
}

function hydrateState() {
  try {
    state.theme = localStorage.getItem(APP_CONFIG.storageKey.theme) || APP_CONFIG.defaults.theme;
    state.systemPrompt = localStorage.getItem(APP_CONFIG.storageKey.settings) ? JSON.parse(localStorage.getItem(APP_CONFIG.storageKey.settings) || "{}").systemPrompt || "" : "";
    const raw = localStorage.getItem(APP_CONFIG.storageKey.convo);
    const current = localStorage.getItem(APP_CONFIG.storageKey.current);
    if (raw) state.conversations = JSON.parse(raw);
    if (current) state.currentId = current;
  } catch (err) {
    console.warn(err);
    state.conversations = [];
  }

  if (!state.conversations.length) {
    const convo = createConversation();
    state.conversations = [convo];
    state.currentId = convo.id;
  }
  if (!state.currentId || !state.conversations.some((c) => c.id === state.currentId)) {
    state.currentId = state.conversations[0].id;
  }
  const current = getCurrentConversation();
  if (current?.model) state.model = current.model;
}

function buildStaticUI() {
  document.body.dataset.theme = state.theme;
  els.welcomeTitle.textContent = APP_CONFIG.welcome.headline;
  els.welcomeSub.textContent = APP_CONFIG.welcome.subline;

  els.welcomeFeatures.innerHTML = APP_CONFIG.presets.map((item) => `
    <div class="feature-card">
      <h3>${escapeHtml(item.title)}</h3>
      <p>${escapeHtml(item.prompt)}</p>
    </div>
  `).join("");

  els.welcomeBullets.innerHTML = APP_CONFIG.welcome.bullets.map((item) => `
    <div class="check"><i>✓</i><span>${escapeHtml(item)}</span></div>
  `).join("");

  els.featureGrid.innerHTML = APP_CONFIG.presets.map((item, idx) => `
    <div class="feature-card">
      <h3>${idx === 0 ? "Chat" : idx === 1 ? "Analisis gambar" : idx === 2 ? "Analisis file" : "Generate gambar"}</h3>
      <p>${escapeHtml(item.prompt)}</p>
    </div>
  `).join("");

  els.quickRow.innerHTML = APP_CONFIG.presets.map((item) => `
    <button class="quick-chip" data-prompt="${escapeHtmlAttr(item.prompt)}">${escapeHtml(item.title)}</button>
  `).join("");

  els.tipList.innerHTML = [
    "Pakai Attach untuk file teks atau gambar.",
    "Mode image perlu endpoint vision/image di config.js.",
    "Model bisa kamu ganti dari sidebar.",
    "Semua data disimpan lokal di browser."
  ].map((t) => `<div class="small-item">${escapeHtml(t)}</div>`).join("");

  els.imageModelSelect.innerHTML = APP_CONFIG.models.map((m) => `
    <option value="${m.id}">${m.label} (${m.modes.join(", ")})</option>
  `).join("");

  const modeLabels = [
    { id: "chat", label: "Chat" },
    { id: "vision", label: "Analyze image" },
    { id: "file", label: "Analyze file" },
    { id: "image", label: "Generate image" }
  ];
  els.modeList.innerHTML = modeLabels.map((m) => `
    <button class="side-btn ${state.mode === m.id ? "active" : ""}" data-mode="${m.id}">
      <span>${m.label}</span>
      <small>${m.id}</small>
    </button>
  `).join("");

  els.modelList.innerHTML = APP_CONFIG.models.map((m) => `
    <button class="side-btn ${state.model === m.id ? "active" : ""}" data-model="${m.id}">
      <span>${m.label}</span>
      <small>${m.description}</small>
    </button>
  `).join("");

  els.topPills.innerHTML = APP_CONFIG.models.slice(0, 4).map((m) => `
    <button class="pill ${state.model === m.id ? "active" : ""}" data-top-model="${m.id}">${m.label}</button>
  `).join("");
}

function bindEvents() {
  els.menuBtn.addEventListener("click", () => toggleSidebar());
  els.panelBtn.addEventListener("click", () => toggleRightbar());
  els.themeBtn.addEventListener("click", toggleTheme);
  els.themeFromWelcome.addEventListener("click", toggleTheme);
  els.startBtn.addEventListener("click", startApp);
  els.newChatBtn.addEventListener("click", () => { createNewConversation(); toast("Siap", "Chat baru dibuka."); });
  els.settingsBtn.addEventListener("click", () => els.systemDialog.showModal());
  els.closeSystemBtn.addEventListener("click", () => els.systemDialog.close());
  els.resetSystemBtn.addEventListener("click", () => {
    state.systemPrompt = "";
    els.systemPromptInput.value = "";
    persistSettings();
    toast("Reset", "System prompt dihapus.");
  });
  els.saveSystemBtn.addEventListener("click", () => {
    state.systemPrompt = els.systemPromptInput.value.trim();
    persistSettings();
    els.systemDialog.close();
    toast("Tersimpan", "System prompt diperbarui.");
  });
  els.exportBtn.addEventListener("click", exportConversations);
  els.clearBtn.addEventListener("click", clearLocalData);
  els.clearAttachBtn.addEventListener("click", clearAttachments);
  els.stopBtn.addEventListener("click", stopGeneration);
  els.promptAssistBtn.addEventListener("click", openPromptAssist);
  els.fileInput.addEventListener("change", handleFiles);
  els.sendBtn.addEventListener("click", send);
  els.promptInput.addEventListener("input", autoResize);
  els.promptInput.addEventListener("keydown", handleComposerKey);
  els.quickRow.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-prompt]");
    if (!btn) return;
    els.promptInput.value = btn.dataset.prompt;
    autoResize();
    els.promptInput.focus();
  });

  els.modeList.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-mode]");
    if (!btn) return;
    switchMode(btn.dataset.mode);
  });

  els.modelList.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-model]");
    if (!btn) return;
    switchModel(btn.dataset.model);
  });

  els.topPills.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-top-model]");
    if (!btn) return;
    switchModel(btn.dataset.topModel);
  });

  els.conversationList.addEventListener("click", (e) => {
    const del = e.target.closest("[data-del]");
    if (del) {
      e.stopPropagation();
      deleteConversation(del.dataset.del);
      return;
    }
    const item = e.target.closest("[data-convo]");
    if (item) {
      openConversation(item.dataset.convo);
      closeSidebarIfMobile();
    }
  });

  document.addEventListener("click", (e) => {
    const action = e.target.closest("[data-action]");
    if (!action) return;
    const { action: act, id } = action.dataset;
    if (act === "copy") copyMessage(id);
    if (act === "edit") editMessage(id);
    if (act === "retry") retryFromMessage(id);
    if (act === "preview") previewCode(id);
    if (act === "copy-code") copyCodeBlock(id);
    if (act === "attach-view") viewAttachment(id);
  });

  els.imageDialogRun.addEventListener("click", runImageGeneration);
  els.closeImageDialogBtn.addEventListener("click", () => els.imageDialog.close());
  els.imageDialogCancel.addEventListener("click", () => els.imageDialog.close());

  window.addEventListener("resize", () => {
    if (window.innerWidth > 980) {
      els.sidebar.classList.remove("open");
    }
  });
}

function showWelcome() {
  els.welcome.classList.remove("hidden");
  els.welcome.setAttribute("aria-hidden", "false");
}
function startApp() {
  localStorage.setItem(APP_CONFIG.storageKey.welcome, "1");
  els.welcome.classList.add("hidden");
  els.welcome.setAttribute("aria-hidden", "true");
  showApp();
}
function showApp() {
  els.app.classList.remove("hidden");
  renderAll();
  els.promptInput.focus();
}

function toggleTheme() {
  state.theme = state.theme === "dark" ? "light" : "dark";
  document.body.dataset.theme = state.theme;
  localStorage.setItem(APP_CONFIG.storageKey.theme, state.theme);
  toast("Tema", `Mode ${state.theme}.`);
}

function toggleSidebar() {
  els.sidebar.classList.toggle("open");
}
function toggleRightbar() {
  state.rightPanelOpen = !state.rightPanelOpen;
  els.rightbar.classList.toggle("open", state.rightPanelOpen);
}

function closeSidebarIfMobile() {
  if (window.innerWidth <= 980) els.sidebar.classList.remove("open");
}

function switchMode(mode) {
  state.mode = mode;
  renderModeButtons();
  updateBanner();
  toast("Mode", `Berpindah ke ${mode}.`);
}

function switchModel(modelId) {
  const current = APP_CONFIG.models.find((m) => m.id === modelId);
  if (!current) return;
  state.model = modelId;
  const convo = getCurrentConversation();
  if (convo) convo.model = modelId;
  persistState();
  renderModelButtons();
  updateHeader();
  toast("Model", `${current.label} aktif.`);
}

function renderModeButtons() {
  [...els.modeList.querySelectorAll("[data-mode]")].forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.mode === state.mode);
  });
}

function renderModelButtons() {
  [...els.modelList.querySelectorAll("[data-model]")].forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.model === state.model);
  });
  [...els.topPills.querySelectorAll("[data-top-model]")].forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.topModel === state.model);
  });
}

function updateHeader() {
  const convo = getCurrentConversation();
  els.pageTitle.textContent = convo?.title || "New conversation";
  const model = APP_CONFIG.models.find((m) => m.id === state.model);
  els.pageSubtitle.textContent = `${APP_CONFIG.brand} · ${model?.label || "Model"} · ${modeLabel(state.mode)}`;
  els.activeModelBadge.textContent = `${model?.label || "Model"} · ${modeLabel(state.mode)}`;
  els.bannerText.textContent = state.mode === "vision"
    ? "Drop gambar, beri instruksi, lalu kirim."
    : state.mode === "file"
      ? "Upload file teks, lalu minta ringkasan atau analisis."
      : state.mode === "image"
        ? "Masukkan prompt gambar, pilih model, lalu generate."
        : "Pilih model, kirim prompt, dan lihat hasilnya.";
}

function updateBanner() {
  updateHeader();
  renderEmptyStateHint();
}

function renderEmptyStateHint() {
  const text = {
    chat: "Pakai chat untuk tanya jawab umum.",
    vision: "Pakai attach gambar lalu minta analisis.",
    file: "Pakai attach file teks untuk ringkasan atau ekstraksi.",
    image: "Pakai prompt generator image untuk hasil visual."
  }[state.mode];
  els.inspectorText.textContent = text;
}

function createConversation() {
  return {
    id: uid(),
    title: "New conversation",
    model: state.model,
    mode: state.mode,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    messages: []
  };
}

function createNewConversation() {
  const convo = createConversation();
  state.conversations.unshift(convo);
  state.currentId = convo.id;
  state.attachments = [];
  state.selectedMessageId = null;
  persistState();
  renderAll();
}

function getCurrentConversation() {
  return state.conversations.find((c) => c.id === state.currentId) || null;
}

function openConversation(id) {
  const convo = state.conversations.find((c) => c.id === id);
  if (!convo) return;
  state.currentId = id;
  state.model = convo.model || state.model;
  state.mode = convo.mode || state.mode;
  persistState();
  renderAll();
}

function deleteConversation(id) {
  state.conversations = state.conversations.filter((c) => c.id !== id);
  if (!state.conversations.length) {
    const convo = createConversation();
    state.conversations.push(convo);
    state.currentId = convo.id;
  } else if (state.currentId === id) {
    state.currentId = state.conversations[0].id;
  }
  persistState();
  renderAll();
  toast("Hapus", "Percakapan dihapus.");
}

function persistState() {
  if (state.currentId) localStorage.setItem(APP_CONFIG.storageKey.current, state.currentId);
  localStorage.setItem(APP_CONFIG.storageKey.convo, JSON.stringify(state.conversations.map(sanitizeConversation)));
  persistSettings();
}

function persistSettings() {
  localStorage.setItem(APP_CONFIG.storageKey.settings, JSON.stringify({
    systemPrompt: state.systemPrompt
  }));
}

function sanitizeConversation(convo) {
  return {
    ...convo,
    messages: (convo.messages || []).map((m) => ({
      ...m,
      attachments: (m.attachments || []).map((a) => ({
        id: a.id, name: a.name, type: a.type, size: a.size,
        textContent: typeof a.textContent === "string" ? a.textContent.slice(0, 50000) : undefined,
        dataUrl: typeof a.dataUrl === "string" ? a.dataUrl : undefined,
        previewUrl: typeof a.previewUrl === "string" ? a.previewUrl : undefined
      }))
    }))
  };
}

function renderAll() {
  renderModeButtons();
  renderModelButtons();
  renderConversationList();
  renderFeed();
  renderAttachments();
  renderPromptAssist();
  updateHeader();
  renderStatus();
  autoResize();
  els.systemPromptInput.value = state.systemPrompt || "";
}

function renderConversationList() {
  const sorted = [...state.conversations].sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
  els.conversationList.innerHTML = sorted.map((convo) => {
    const model = APP_CONFIG.models.find((m) => m.id === convo.model);
    return `
      <div class="convo-item ${convo.id === state.currentId ? "active" : ""}" data-convo="${convo.id}">
        <div class="convo-top">
          <div>
            <div class="convo-title">${escapeHtml(convo.title || "Untitled")}</div>
            <div class="convo-meta">${escapeHtml(model?.label || convo.model || "Model")} · ${fmtDate(convo.updatedAt)}</div>
          </div>
          <button class="convo-del" data-del="${convo.id}" title="Delete">✕</button>
        </div>
      </div>
    `;
  }).join("");
}

function renderFeed() {
  const convo = getCurrentConversation();
  const messages = convo?.messages || [];
  els.emptyState.classList.toggle("hidden", messages.length > 0);
  els.feed.innerHTML = messages.map((msg) => renderMessage(msg)).join("");
  requestAnimationFrame(scrollToBottom);
  if (!messages.length) {
    renderEmptyStateHint();
  }
}

function renderMessage(msg) {
  const model = APP_CONFIG.models.find((m) => m.id === msg.model);
  const roleName = msg.role === "assistant" ? "Assistant" : "You";
  const badge = msg.role === "assistant" ? "AI" : "You";
  const actions = [
    `<button class="msg-action" data-action="copy" data-id="${msg.id}">Copy</button>`
  ];
  if (msg.role === "user") {
    actions.push(`<button class="msg-action" data-action="edit" data-id="${msg.id}">Edit</button>`);
  }
  if (msg.role === "assistant" && !state.generation) {
    actions.push(`<button class="msg-action" data-action="retry" data-id="${msg.id}">Retry</button>`);
  }

  const content = renderContent(msg);
  const attachmentHtml = renderMessageAttachments(msg.attachments || []);
  const title = model ? `<span class="badge">${escapeHtml(model.label)}</span>` : "";

  return `
    <article class="msg ${msg.role}">
      <div class="msg-head">
        <div class="msg-role"><span class="role">${badge}</span><span>${roleName}</span>${title}</div>
        <div class="msg-actions">${actions.join("")}</div>
      </div>
      <div class="msg-body">${content}${attachmentHtml}</div>
    </article>
  `;
}

function renderContent(msg) {
  if (msg.kind === "image-generation") {
    return `
      <p><strong>Prompt gambar:</strong> ${escapeHtml(msg.prompt || "")}</p>
      ${msg.resultUrl ? `<p><a href="${escapeAttr(msg.resultUrl)}" target="_blank" rel="noreferrer">Buka hasil gambar</a></p>` : ""}
      ${msg.note ? `<p>${escapeHtml(msg.note)}</p>` : ""}
    `;
  }

  if (msg.kind === "analysis") {
    return `<div class="badge">Analysis</div>${markdownToHtml(msg.content || "")}`;
  }

  return markdownToHtml(msg.content || "");
}

function renderMessageAttachments(list) {
  if (!list.length) return "";
  return `
    <div class="attach-row">
      ${list.map((a) => `
        <div class="attach" data-action="attach-view" data-id="${a.id}">
          ${a.type && a.type.startsWith("image/") ? "🖼️" : "📄"}
          <span>${escapeHtml(a.name)}</span>
        </div>
      `).join("")}
    </div>
  `;
}

function renderAttachments() {
  const list = state.attachments || [];
  els.attachStrip.classList.toggle("hidden", !list.length);
  els.attachStrip.innerHTML = list.map((a) => `
    <div class="attach-pill">
      ${a.type && a.type.startsWith("image/") ? "🖼️" : "📄"} ${escapeHtml(a.name)}
      <button data-remove="${a.id}" aria-label="Remove">✕</button>
    </div>
  `).join("");

  [...els.attachStrip.querySelectorAll("[data-remove]")].forEach((btn) => {
    btn.addEventListener("click", () => {
      state.attachments = state.attachments.filter((a) => a.id !== btn.dataset.remove);
      renderAttachments();
    });
  });
}

function renderPromptAssist() {
  els.composerHintPills.innerHTML = APP_CONFIG.presets.map((p) => `
    <button class="pill" data-preset="${escapeHtmlAttr(p.prompt)}">${escapeHtml(p.title)}</button>
  `).join("");
  [...els.composerHintPills.querySelectorAll("[data-preset]")].forEach((btn) => {
    btn.addEventListener("click", () => {
      els.promptInput.value = btn.dataset.preset || "";
      autoResize();
      els.promptInput.focus();
    });
  });
}

function renderStatus() {
  els.statusText.textContent = state.generation ? "Memproses…" : "Ready";
  els.statusDot.style.background = state.generation ? "var(--warning)" : "var(--success)";
}

function modeLabel(mode) {
  return {
    chat: "Chat",
    vision: "Image analysis",
    file: "File analysis",
    image: "Image generation"
  }[mode] || "Chat";
}

async function handleFiles(e) {
  const files = [...(e.target.files || [])].slice(0, APP_CONFIG.ui.maxAttachmentPreview);
  for (const file of files) {
    try {
      state.attachments.push(await readAttachment(file));
    } catch (err) {
      console.warn(err);
      toast("Skip", `Tidak bisa baca ${file.name}.`);
    }
  }
  e.target.value = "";
  renderAttachments();
}

async function readAttachment(file) {
  const isImage = file.type.startsWith("image/");
  const isText =
    file.type.startsWith("text/") ||
    ["application/json", "application/javascript", "application/xml", "text/csv"].includes(file.type) ||
    /\.(txt|md|json|js|ts|html|css|csv|xml|yaml|yml|svg)$/i.test(file.name);

  if (isImage) {
    return {
      id: uid(),
      name: file.name,
      type: file.type,
      size: file.size,
      dataUrl: await toDataUrl(file),
      previewUrl: await toDataUrl(file)
    };
  }

  if (isText) {
    const text = await file.text();
    return {
      id: uid(),
      name: file.name,
      type: file.type || "text/plain",
      size: file.size,
      textContent: text.slice(0, 50000)
    };
  }

  return {
    id: uid(),
    name: file.name,
    type: file.type || "application/octet-stream",
    size: file.size
  };
}

function clearAttachments() {
  state.attachments = [];
  els.fileInput.value = "";
  renderAttachments();
}

function autoResize() {
  const ta = els.promptInput;
  ta.style.height = "auto";
  ta.style.height = Math.min(ta.scrollHeight, APP_CONFIG.ui.maxComposerHeight) + "px";
}

function handleComposerKey(e) {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    send();
  }
}

async function send() {
  if (state.generation) return toast("Tunggu", "AI masih memproses.");
  const prompt = els.promptInput.value.trim();
  const convo = getCurrentConversation() || createNewConversationAndGet();

  if (!prompt && !state.attachments.length) return;

  convo.model = state.model;
  convo.mode = state.mode;

  const userMessage = {
    id: uid(),
    role: "user",
    content: prompt,
    attachments: cloneAttachments(state.attachments),
    createdAt: Date.now()
  };
  convo.messages.push(userMessage);
  convo.updatedAt = Date.now();
  if (convo.title === "New conversation" && prompt) convo.title = truncate(prompt, 52);

  els.promptInput.value = "";
  state.attachments = [];
  renderAttachments();
  persistState();
  renderAll();

  if (state.mode === "image") {
    await requestImageGeneration(convo, prompt);
    return;
  }

  if (state.mode === "vision") {
    await requestVisionAnalysis(convo, prompt);
    return;
  }

  if (state.mode === "file") {
    await requestFileAnalysis(convo, prompt);
    return;
  }

  await requestTextResponse(convo, prompt);
}

function createNewConversationAndGet() {
  const convo = createConversation();
  state.conversations.unshift(convo);
  state.currentId = convo.id;
  return convo;
}

async function requestTextResponse(convo, prompt) {
  const model = APP_CONFIG.models.find((m) => m.id === state.model);
  const assistant = addPendingAssistant(convo, "text");
  state.generation = true;
  renderStatus();
  persistState();
  try {
    const payload = buildTextPayload(convo, prompt);
    const text = await fetchModelText(model?.id || state.model, payload);
    assistant.content = text;
    assistant.streaming = false;
    convo.updatedAt = Date.now();
    persistState();
    renderAll();
    toast("Selesai", "Jawaban berhasil dibuat.");
  } catch (err) {
    assistant.content = err.message || "Terjadi kesalahan.";
    assistant.error = true;
    assistant.streaming = false;
    renderAll();
    toast("Error", assistant.content);
  } finally {
    state.generation = false;
    renderStatus();
  }
}

async function requestVisionAnalysis(convo, prompt) {
  const images = (convo.messages.at(-1)?.attachments || []).filter((a) => a.type?.startsWith("image/"));
  const assistant = addPendingAssistant(convo, "analysis");
  state.generation = true;
  renderStatus();
  try {
    if (!images.length) throw new Error("Mode image analysis butuh file gambar.");
    const payload = buildVisionPayload(convo, prompt, images);
    const text = await fetchVisionResponse(state.model, payload);
    assistant.content = text;
    assistant.streaming = false;
    convo.updatedAt = Date.now();
    persistState();
    renderAll();
  } catch (err) {
    assistant.content = err.message || "Gagal analisis gambar.";
    assistant.error = true;
    assistant.streaming = false;
    renderAll();
  } finally {
    state.generation = false;
    renderStatus();
  }
}

async function requestFileAnalysis(convo, prompt) {
  const textFiles = (convo.messages.at(-1)?.attachments || []).filter((a) => typeof a.textContent === "string");
  const assistant = addPendingAssistant(convo, "analysis");
  state.generation = true;
  renderStatus();
  try {
    if (!textFiles.length) throw new Error("Mode file analysis butuh file teks yang bisa dibaca browser.");
    const payload = buildFilePayload(convo, prompt, textFiles);
    const text = await fetchFileResponse(state.model, payload);
    assistant.content = text;
    assistant.streaming = false;
    convo.updatedAt = Date.now();
    persistState();
    renderAll();
  } catch (err) {
    assistant.content = err.message || "Gagal analisis file.";
    assistant.error = true;
    assistant.streaming = false;
    renderAll();
  } finally {
    state.generation = false;
    renderStatus();
  }
}

async function requestImageGeneration(convo, prompt) {
  const assistant = addPendingAssistant(convo, "image-generation");
  state.generation = true;
  renderStatus();
  try {
    const size = els.imageSizeInput.value.trim() || "1024x1024";
    const modelId = els.imageModelSelect.value || state.model;
    const result = await fetchImageGeneration(modelId, prompt, size);
    assistant.prompt = prompt;
    assistant.resultUrl = result.url || "";
    assistant.note = result.note || "Gambar berhasil dibuat.";
    assistant.streaming = false;
    convo.updatedAt = Date.now();
    persistState();
    renderAll();
    if (result.url) {
      els.previewFrame.src = result.url;
      els.inspectorText.textContent = "Preview image generation ditampilkan di panel kanan.";
    }
  } catch (err) {
    assistant.prompt = prompt;
    assistant.note = err.message || "Image generation endpoint belum di-set di config.js.";
    assistant.error = true;
    assistant.streaming = false;
    renderAll();
  } finally {
    state.generation = false;
    renderStatus();
  }
}

function addPendingAssistant(convo, kind) {
  const msg = {
    id: uid(),
    role: "assistant",
    model: state.model,
    kind,
    content: "",
    attachments: [],
    createdAt: Date.now(),
    streaming: true
  };
  convo.messages.push(msg);
  persistState();
  renderAll();
  return msg;
}

function buildTextPayload(convo, prompt) {
  return buildPayloadBase(convo, prompt, state.attachments, "text");
}

function buildVisionPayload(convo, prompt, images) {
  return buildPayloadBase(convo, prompt, images, "vision");
}

function buildFilePayload(convo, prompt, files) {
  return buildPayloadBase(convo, prompt, files, "file");
}

function buildPayloadBase(convo, prompt, attachments, mode) {
  const history = (convo.messages || [])
    .filter((m) => m.role !== "assistant" || !m.streaming)
    .slice(-10)
    .map((m) => `${m.role.toUpperCase()}: ${m.content || ""}`)
    .join("\n\n");

  const attachmentText = (attachments || []).map((a) => {
    if (a.textContent) return `FILE ${a.name}\n${a.textContent.slice(0, 8000)}`;
    if (a.dataUrl) return `IMAGE ${a.name}\n${a.dataUrl}`;
    return `ATTACHMENT ${a.name}`;
  }).join("\n\n---\n\n");

  return {
    mode,
    model: state.model,
    prompt,
    systemPrompt: state.systemPrompt,
    history,
    attachments: attachmentText,
    conversationTitle: convo.title
  };
}

async function fetchModelText(modelId, payload) {
  const endpoint = APP_CONFIG.endpoints.text;
  const url = new URL(endpoint.baseUrl);
  url.searchParams.set(endpoint.param, assemblePrompt(payload));
  if (endpoint.modelParam) url.searchParams.set(endpoint.modelParam, modelId);
  const res = await fetch(url.toString());
  return parseResponse(await safeReadText(res));
}

async function fetchVisionResponse(modelId, payload) {
  const endpoint = APP_CONFIG.endpoints.vision;
  if (!endpoint.baseUrl) {
    throw new Error("Endpoint vision belum diisi di config.js.");
  }
  const body = {
    model: modelId,
    prompt: assemblePrompt(payload),
    attachments: payload.attachments,
    systemPrompt: payload.systemPrompt
  };
  const res = await fetch(endpoint.baseUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });
  return parseResponse(await safeReadText(res));
}

async function fetchFileResponse(modelId, payload) {
  const endpoint = APP_CONFIG.endpoints.file;
  if (!endpoint.baseUrl) {
    throw new Error("Endpoint file belum diisi di config.js.");
  }
  const body = {
    model: modelId,
    prompt: assemblePrompt(payload),
    attachments: payload.attachments,
    systemPrompt: payload.systemPrompt
  };
  const res = await fetch(endpoint.baseUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });
  return parseResponse(await safeReadText(res));
}

async function fetchImageGeneration(modelId, prompt, size) {
  const endpoint = APP_CONFIG.endpoints.imageGen;
  if (!endpoint.baseUrl) {
    throw new Error("Endpoint image generation belum diisi di config.js.");
  }
  const body = {
    model: modelId,
    prompt,
    size
  };
  const res = await fetch(endpoint.baseUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });
  const text = await safeReadText(res);
  const parsed = tryParseJson(text);
  if (parsed && typeof parsed === "object") {
    const url = parsed.url || parsed.result?.url || parsed.image || parsed.data?.url || parsed.data?.image;
    if (url) return { url, note: parsed.message || "Selesai." };
  }
  return { url: text.trim(), note: "Selesai." };
}

function assemblePrompt(payload) {
  const chunks = [];
  if (payload.systemPrompt?.trim()) chunks.push(`[SYSTEM]\n${payload.systemPrompt.trim()}`);
  if (payload.history?.trim()) chunks.push(`[HISTORY]\n${payload.history.trim()}`);
  if (payload.attachments?.trim()) chunks.push(`[ATTACHMENTS]\n${payload.attachments.trim()}`);
  if (payload.prompt?.trim()) chunks.push(`[USER]\n${payload.prompt.trim()}`);
  return chunks.join("\n\n");
}

async function safeReadText(res) {
  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(txt.slice(0, 280) || `HTTP ${res.status}`);
  }
  return await res.text();
}

function parseResponse(text) {
  const raw = String(text || "").trim();
  if (!raw) throw new Error("Respons kosong.");
  const json = tryParseJson(raw);
  if (json) {
    const candidates = [
      json.result?.text,
      json.result?.response,
      json.result,
      json.text,
      json.response,
      json.answer,
      json.message,
      json.content,
      json.output,
      json.data?.text,
      json.data?.response
    ];
    for (const c of candidates) {
      if (typeof c === "string" && c.trim()) return cleanText(c);
    }
    if (Array.isArray(json.choices)) {
      const c = json.choices[0]?.message?.content || json.choices[0]?.text;
      if (typeof c === "string" && c.trim()) return cleanText(c);
    }
    return cleanText(JSON.stringify(json, null, 2));
  }
  return cleanText(raw);
}

function tryParseJson(text) {
  try { return JSON.parse(text); } catch { return null; }
}

function cleanText(text) {
  return String(text || "").replace(/<think>[\s\S]*?<\/think>/gi, "").trim();
}

function buildPromptAssist() {
  els.imagePromptInput.value = els.promptInput.value.trim() || APP_CONFIG.presets[3].prompt;
  els.imageModelSelect.value = state.model;
  els.imageDialog.showModal();
}

function openPromptAssist() {
  if (state.mode === "image") {
    buildPromptAssist();
    return;
  }
  const prompt = APP_CONFIG.presets.find((p) => p.title.toLowerCase().includes("prompt")) || APP_CONFIG.presets[0];
  els.promptInput.value = prompt.prompt;
  autoResize();
  els.promptInput.focus();
  toast("Prompt assist", "Prompt cepat sudah diisi.");
}

function runImageGeneration() {
  els.promptInput.value = els.imagePromptInput.value.trim();
  state.model = els.imageModelSelect.value;
  switchMode("image");
  els.imageDialog.close();
  send();
}

function stopGeneration() {
  if (state.aborter) state.aborter.abort();
}

function editMessage(id) {
  const convo = getCurrentConversation();
  const msg = convo?.messages.find((m) => m.id === id);
  if (!msg || msg.role !== "user") return;
  els.promptInput.value = msg.content || "";
  state.attachments = cloneAttachments(msg.attachments || []);
  convo.messages = convo.messages.slice(0, convo.messages.findIndex((m) => m.id === id));
  convo.updatedAt = Date.now();
  persistState();
  renderAll();
  autoResize();
}

async function retryFromMessage(id) {
  const convo = getCurrentConversation();
  if (!convo) return;
  const idx = convo.messages.findIndex((m) => m.id === id);
  if (idx <= 0) return;
  const before = convo.messages.slice(0, idx);
  const lastUser = [...before].reverse().find((m) => m.role === "user");
  if (!lastUser) return;
  convo.messages = before;
  els.promptInput.value = lastUser.content || "";
  state.attachments = cloneAttachments(lastUser.attachments || []);
  persistState();
  renderAll();
  await send();
}

function copyMessage(id) {
  const convo = getCurrentConversation();
  const msg = convo?.messages.find((m) => m.id === id);
  if (!msg) return;
  navigator.clipboard.writeText(msg.content || "").then(() => toast("Copied", "Pesan disalin."));
}

function copyCodeBlock(id) {
  const block = document.querySelector(`[data-code-id="${CSS.escape(id)}"] pre`);
  if (!block) return;
  navigator.clipboard.writeText(block.innerText || "").then(() => toast("Copied", "Kode disalin."));
}

function previewCode(id) {
  const block = document.querySelector(`[data-code-id="${CSS.escape(id)}"] pre`);
  if (!block) return;
  els.previewFrame.srcdoc = block.innerText || "";
  els.inspectorText.textContent = "Preview HTML/SVG dimuat di panel kanan.";
}

function viewAttachment(id) {
  const convo = getCurrentConversation();
  const msg = convo?.messages.find((m) => (m.attachments || []).some((a) => a.id === id));
  if (!msg) return;
  const attachment = (msg.attachments || []).find((a) => a.id === id);
  if (!attachment) return;
  els.inspectorText.textContent = `${attachment.name} · ${prettySize(attachment.size)}`;
  if (attachment.previewUrl) els.previewFrame.src = attachment.previewUrl;
  else if (attachment.dataUrl) els.previewFrame.src = attachment.dataUrl;
}

function renderCodeBlocks(rootHtml, msgId) {
  let index = 0;
  return rootHtml.replace(/```([a-zA-Z0-9_+#.-]*)?\n([\s\S]*?)```/g, (_, lang, code) => {
    const blockId = `${msgId}-${index++}`;
    return `
      <div class="code-block" data-code-id="${blockId}">
        <div class="code-top">
          <span>${escapeHtml((lang || "text").toLowerCase())}</span>
          <div class="code-acts">
            ${/^(html|svg)$/i.test(lang || "") ? `<button class="code-btn" data-action="preview" data-id="${blockId}">Preview</button>` : ""}
            <button class="code-btn" data-action="copy-code" data-id="${blockId}">Copy</button>
          </div>
        </div>
        <pre><code>${escapeHtml(code)}</code></pre>
      </div>
    `;
  });
}

function markdownToHtml(src) {
  const text = String(src || "").replace(/\r\n/g, "\n");
  if (!text.trim()) return `<p style="color:var(--muted)">...</p>`;

  let html = escapeHtml(text);

  html = html.replace(/`([^`]+)`/g, (_, c) => `<code class="inline">${escapeHtml(c)}</code>`);
  html = html.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  html = html.replace(/\n/g, "<br>");
  html = html.replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2" target="_blank" rel="noreferrer">$1</a>');

  html = html.replace(/<br><br>/g, "</p><p>");
  html = `<p>${html}</p>`;
  html = html.replace(/<p><\/p>/g, "");
  html = renderCodeBlocks(html, uid());
  return html;
}

function openPromptAssistIfNeeded() {
  if (state.mode === "image") {
    buildPromptAssist();
  } else {
    openPromptAssist();
  }
}

function exportConversations() {
  const blob = new Blob([JSON.stringify(state.conversations, null, 2)], { type: "application/json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "auralis-conversations.json";
  a.click();
  URL.revokeObjectURL(a.href);
}

function clearLocalData() {
  if (!confirm("Hapus semua data lokal?")) return;
  localStorage.removeItem(APP_CONFIG.storageKey.convo);
  localStorage.removeItem(APP_CONFIG.storageKey.current);
  localStorage.removeItem(APP_CONFIG.storageKey.settings);
  localStorage.removeItem(APP_CONFIG.storageKey.theme);
  localStorage.removeItem(APP_CONFIG.storageKey.welcome);
  location.reload();
}

function cloneAttachments(list) {
  return JSON.parse(JSON.stringify(list || []));
}

function prettySize(bytes) {
  if (!bytes) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  let n = bytes;
  let i = 0;
  while (n >= 1024 && i < units.length - 1) { n /= 1024; i++; }
  return `${n.toFixed(n < 10 && i ? 1 : 0)} ${units[i]}`;
}

function truncate(text, n) {
  const t = String(text || "");
  return t.length > n ? `${t.slice(0, n).trimEnd()}…` : t;
}

function fmtDate(ts) {
  if (!ts) return "now";
  try {
    return new Intl.DateTimeFormat("id-ID", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit"
    }).format(new Date(ts));
  } catch {
    return "now";
  }
}

function scrollToBottom() {
  window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
}

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function escapeHtmlAttr(value) {
  return escapeHtml(value).replace(/`/g, "&#96;");
}

function toDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function uid() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
}

function toast(title, message) {
  const stack = els.toastStack;
  const node = document.createElement("div");
  node.className = "toast";
  node.innerHTML = `<h4>${escapeHtml(title)}</h4><p>${escapeHtml(message)}</p>`;
  stack.appendChild(node);
  setTimeout(() => {
    node.style.opacity = "0";
    node.style.transform = "translateY(8px)";
  }, 2600);
  setTimeout(() => node.remove(), 3200);
}

function renderStatus() {
  els.statusText.textContent = state.generation ? "Memproses…" : "Ready";
  els.statusDot.style.background = state.generation ? "var(--warning)" : "var(--success)";
}

function copyText(text) {
  return navigator.clipboard.writeText(text);
}

function hydrateConfigIfMissing() {
  if (!APP_CONFIG.models.some((m) => m.id === state.model)) {
    state.model = APP_CONFIG.models[0]?.id || "claude";
  }
}
