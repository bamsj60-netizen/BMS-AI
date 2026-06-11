
window.APP_CONFIG = {
  appName: "Auralis AI",
  brand: "BMS STUDIO",
  subtitle: "Claude-like AI workspace",
  storageKey: {
    theme: "auralis.theme",
    welcome: "auralis.welcomeSeen",
    convo: "auralis.conversations",
    current: "auralis.currentConversation",
    settings: "auralis.settings"
  },
  defaults: {
    mode: "chat",
    model: "claude",
    theme: "dark"
  },
  ui: {
    leftSidebarWidth: 320,
    maxComposerHeight: 220,
    maxAttachmentPreview: 8
  },
  endpoints: {
    text: {
      baseUrl: "https://api-nanzz.my.id/docs/api/ai/chat-gpt.php",
      param: "text",
      modelParam: "model",
      wrapPrompt: true
    },
    vision: {
      baseUrl: "",
      promptParam: "text",
      imageParam: "image",
      modelParam: "model",
      mimeParam: "mime"
    },
    file: {
      baseUrl: "",
      promptParam: "text",
      fileParam: "file",
      modelParam: "model"
    },
    imageGen: {
      baseUrl: "",
      promptParam: "prompt",
      modelParam: "model",
      sizeParam: "size"
    }
  },
  models: [
    {
      id: "claude",
      label: "Claude",
      icon: "◌",
      accent: "#a58cff",
      modes: ["chat", "file", "vision", "image"],
      description: "Rapi, aman, cocok buat ngerjain teks dan analisis."
    },
    {
      id: "deepseek",
      label: "DeepSeek",
      icon: "◆",
      accent: "#ff9f68",
      modes: ["chat", "file"],
      description: "Reasoning kuat buat jawaban panjang dan logika."
    },
    {
      id: "chatgpt",
      label: "ChatGPT",
      icon: "●",
      accent: "#7ec8ff",
      modes: ["chat", "file", "vision", "image"],
      description: "General purpose, fleksibel, enak buat segala hal."
    },
    {
      id: "gemini",
      label: "Gemini",
      icon: "✦",
      accent: "#76e4c2",
      modes: ["chat", "file", "vision", "image"],
      description: "Multimodal. Cocok buat gambar, file, dan ringkas data."
    },
    {
      id: "grok",
      label: "Grok",
      icon: "✸",
      accent: "#ffdf7a",
      modes: ["chat", "file"],
      description: "Santai tapi tetap nendang."
    },
    {
      id: "llama",
      label: "Llama",
      icon: "λ",
      accent: "#ffb3d6",
      modes: ["chat", "file"],
      description: "Model open-source yang lumayan fleksibel."
    },
    {
      id: "qwen",
      label: "Qwen",
      icon: "◈",
      accent: "#8fd3ff",
      modes: ["chat", "file", "vision"],
      description: "Bagus untuk bahasa campur dan struktur."
    },
    {
      id: "perplexity",
      label: "Perplexity",
      icon: "⌕",
      accent: "#c7c3ff",
      modes: ["chat", "file"],
      description: "Enak buat riset dan jawaban yang rapi."
    },
    {
      id: "copilot",
      label: "Copilot",
      icon: "⌘",
      accent: "#82b1ff",
      modes: ["chat", "file"],
      description: "Berguna untuk coding dan produk kerja."
    },
    {
      id: "blackbox",
      label: "Blackbox",
      icon: "⌘",
      accent: "#f3a6ff",
      modes: ["chat", "file"],
      description: "Fokus coding. Biar manusia tidak ngawur sendirian."
    },
    {
      id: "uncensored",
      label: "Uncensored",
      icon: "◍",
      accent: "#ff8ca1",
      modes: ["chat", "file"],
      description: "Mode bebas. Gunakan dengan tanggung jawab."
    },
    {
      id: "wormgpt",
      label: "WormGPT",
      icon: "⟡",
      accent: "#ff7f7f",
      modes: ["chat", "file"],
      description: "Model alternatif untuk eksperimen."
    }
  ],
  presets: [
    {
      title: "Bikin landing page",
      prompt: "Buat landing page modern dengan hero, fitur, pricing, testimonial, dan CTA."
    },
    {
      title: "Analisis gambar",
      prompt: "Analisis gambar ini secara detail. Jelaskan objek, konteks, dan hal penting yang terlihat."
    },
    {
      title: "Baca file",
      prompt: "Ringkas isi file yang ku upload, lalu kasih insight dan poin penting."
    },
    {
      title: "Generate gambar",
      prompt: "Buat prompt image generation yang sinematik, mewah, dan sangat detail."
    }
  ],
  welcome: {
    headline: "Selamat datang di Auralis AI",
    subline: "Workspace AI bergaya Claude, dengan chat, analisis file, analisis gambar, dan image generation.",
    bullets: [
      "Sidebar riwayat percakapan",
      "Mode chat, file, gambar, dan generator",
      "Tema gelap dan terang",
      "Responsive buat desktop dan mobile"
    ]
  }
};
