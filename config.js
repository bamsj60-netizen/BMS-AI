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
      baseUrl: "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent",
      promptParam: "parts.text",
      imageParam: "parts.inlineData.data",
      modelParam: "model",
      mimeParam: "parts.inlineData.mimeType"
    },
    file: {
      baseUrl: "https://generativelanguage.googleapis.com/v1beta/files",
      promptParam: "text",
      fileParam: "fileData",
      modelParam: "model"
    },
    imageGen: {
      baseUrl: "https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-002:generateImages",
      promptParam: "prompt",
      modelParam: "model",
      sizeParam: "aspectRatio"
    },
    downloader: {
      baseUrl: "https://api-nanzz.my.id/docs/api/donwloader/all-in-one.php", // Pertahankan jika dari providernya memang typo "donwloader"
      param: "url"
    },
    promptGen: {
      baseUrl: "https://api-nanzz.my.id/docs/api/ai/prompt-generator.php",
      param: "text"
    }
  },

  models: [
    {
      id: "claude",
      label: "Claude",
      icon: "🎭",
      accent: "#a58cff",
      modes: ["chat", "file", "vision", "image"],
      description: "Anthropic reasoning.",
      // Logika dinamis: arahkan ke endpoint yang benar berdasarkan mode
      buildUrl: (text, mode = "chat") => {
        if (mode === "vision") return APP_CONFIG.endpoints.vision.baseUrl;
        if (mode === "image") return APP_CONFIG.endpoints.imageGen.baseUrl;
        if (mode === "file") return APP_CONFIG.endpoints.file.baseUrl;
        return `https://api-nanzz.my.id/docs/api/ai/chat-gpt.php?text=${encodeURIComponent(text)}&model=claude`;
      }
    },
    {
      id: "deepseek",
      label: "DeepSeek",
      icon: "🧠",
      accent: "#ff9f68",
      modes: ["chat", "file"],
      description: "Reasoning mendalam.",
      buildUrl: (text, mode = "chat") => {
        if (mode === "file") return APP_CONFIG.endpoints.file.baseUrl;
        return `https://api-nanzz.my.id/docs/api/ai/chat-gpt.php?text=${encodeURIComponent(text)}&model=deepseek`;
      }
    },
    {
      id: "chatgpt",
      label: "ChatGPT",
      icon: "🤖",
      accent: "#7ec8ff",
      modes: ["chat", "file", "vision", "image"],
      description: "General-purpose AI.",
      buildUrl: (text, mode = "chat") => {
        if (mode === "vision") return APP_CONFIG.endpoints.vision.baseUrl;
        if (mode === "image") return APP_CONFIG.endpoints.imageGen.baseUrl;
        if (mode === "file") return APP_CONFIG.endpoints.file.baseUrl;
        return `https://api-nanzz.my.id/docs/api/ai/chat-gpt.php?text=${encodeURIComponent(text)}&model=chatgpt`;
      }
    },
    {
      id: "gemini",
      label: "Gemini",
      icon: "💎",
      accent: "#76e4c2",
      modes: ["chat", "file", "vision", "image"],
      description: "Google multimodal.",
      buildUrl: (text, mode = "chat") => {
        if (mode === "vision") return APP_CONFIG.endpoints.vision.baseUrl;
        if (mode === "image") return APP_CONFIG.endpoints.imageGen.baseUrl;
        if (mode === "file") return APP_CONFIG.endpoints.file.baseUrl;
        return `https://api-nanzz.my.id/docs/api/ai/gemini.php?text=${encodeURIComponent(text)}`;
      }
    },
    {
      id: "grok",
      label: "Grok",
      icon: "🚀",
      accent: "#ffdf7a",
      modes: ["chat"], // Dihapus mode file jika API Nanzz Grok tidak support
      description: "X.AI powerful model.",
      buildUrl: (text) => `https://api-nanzz.my.id/docs/api/ai/chat-gpt.php?text=${encodeURIComponent(text)}&model=grok`
    },
    {
      id: "llama",
      label: "Llama",
      icon: "🦙",
      accent: "#ffb3d6",
      modes: ["chat"],
      description: "Meta open-source.",
      buildUrl: (text) => `https://api-nanzz.my.id/docs/api/ai/chat-gpt.php?text=${encodeURIComponent(text)}&model=llama`
    },
    {
      id: "qwen",
      label: "Qwen",
      icon: "🌏",
      accent: "#8fd3ff",
      modes: ["chat", "file", "vision"],
      description: "Alibaba multilingual.",
      buildUrl: (text, mode = "chat") => {
        if (mode === "vision") return APP_CONFIG.endpoints.vision.baseUrl;
        if (mode === "file") return APP_CONFIG.endpoints.file.baseUrl;
        return `https://api-nanzz.my.id/docs/api/ai/chat-gpt.php?text=${encodeURIComponent(text)}&model=qwen`;
      }
    },
    {
      id: "perplexity",
      label: "Perplexity",
      icon: "🔍",
      accent: "#c7c3ff",
      modes: ["chat"],
      description: "Search-augmented AI.",
      buildUrl: (text) => `https://api-nanzz.my.id/docs/api/ai/chat-gpt.php?text=${encodeURIComponent(text)}&model=perplexity`
    },
    {
      id: "copilot",
      label: "Copilot",
      icon: "🧑‍💻",
      accent: "#82b1ff",
      modes: ["chat"],
      description: "Microsoft AI.",
      buildUrl: (text) => `https://api-nanzz.my.id/docs/api/ai/copilot.php?q=${encodeURIComponent(text)}`
    },
    {
      id: "blackbox",
      label: "Blackbox",
      icon: "⚡",
      accent: "#f3a6ff",
      modes: ["chat"],
      description: "Fokus coding.",
      buildUrl: (text) => `https://api-nanzz.my.id/docs/api/ai/blackbox.php?q=${encodeURIComponent(text)}`
    },
    {
      id: "uncensored",
      label: "Uncensored",
      icon: "🔓",
      accent: "#ff8ca1",
      modes: ["chat"],
      description: "Tanpa filter.",
      buildUrl: (text) => `https://api-nanzz.my.id/docs/api/ai/uncensored-ai.php?text=${encodeURIComponent(text)}`
    },
    {
      id: "wormgpt",
      label: "WormGPT",
      icon: "🐛",
      accent: "#ff7f7f",
      modes: ["chat"],
      description: "Model alternatif.",
      buildUrl: (text) => `https://api-nanzz.my.id/docs/api/ai/worm-gpt.php?prompt=${encodeURIComponent(text)}`
    }
  ],

  presets: [
    { title: "Bikin landing page", prompt: "Buat landing page modern dengan hero, fitur, pricing, testimonial, dan CTA." },
    { title: "Analisis gambar", prompt: "Analisis gambar ini secara detail. Jelaskan objek, konteks, dan hal penting yang terlihat." },
    { title: "Baca file", prompt: "Ringkas isi file yang ku upload, lalu kasih insight dan poin penting." },
    { title: "Generate gambar", prompt: "Buat prompt image generation yang sinematik, mewah, dan sangat detail." }
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
