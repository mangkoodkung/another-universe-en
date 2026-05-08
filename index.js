// Another Universe - SillyTavern Extension
// "What if we met in another universe?"

// Import from SillyTavern core
import { extension_settings, getContext, loadExtensionSettings } from "../../../extensions.js";
import { saveSettingsDebounced, generateQuietPrompt } from "../../../../script.js";

// Extension name MUST match folder name
const extensionName = "another-universe";
const extensionFolderPath = `scripts/extensions/third-party/${extensionName}`;

// Universe themes
const universeThemes = {
    random: { label: "🎲 สุ่ม (Random)", prompt: "any creative setting you can imagine" },
    medieval: { label: "🏰 แฟนตาซียุคกลาง (Medieval Fantasy)", prompt: "a medieval fantasy kingdom with magic, castles, and ancient legends" },
    scifi: { label: "🚀 ไซไฟ / อวกาศ (Sci-Fi / Space)", prompt: "a futuristic sci-fi setting — a space station, distant planet, or starship among the stars" },
    cyberpunk: { label: "🌆 ไซเบอร์พังค์ (Cyberpunk)", prompt: "a neon-lit cyberpunk metropolis with holograms, augmented reality, and rain-soaked streets" },
    modern: { label: "☕ ชีวิตประจำวัน (Modern Slice of Life)", prompt: "a cozy modern-day setting — a quiet café, a bookstore, a rainy city street, or a chance encounter in everyday life" },
    postapoc: { label: "🏚️ โลกหลังหายนะ (Post-Apocalyptic)", prompt: "a post-apocalyptic wasteland where survivors cling to hope among the ruins" },
    historical: { label: "🎭 ย้อนยุค (Historical Drama)", prompt: "a historical setting — 1920s Paris, ancient Rome, Edo-period Japan, or Victorian London" },
    horror: { label: "🌑 สยองขวัญ (Dark / Horror)", prompt: "a dark, eerie setting — a haunted mansion, a cursed forest, or a town where something is terribly wrong" },
    dream: { label: "💫 โลกความฝัน (Dreamscape / Surreal)", prompt: "a surreal dreamscape where reality bends — floating islands, shifting landscapes, and impossible architecture" },
};

// Encounter types
const encounterTypes = {
    random: { label: "🎲 สุ่ม (Random)", prompt: "Choose any type of encounter that feels natural and compelling." },
    firstMeet: { label: "💫 พบกันครั้งแรก (First Meeting)", prompt: "They are meeting for the very first time. There is curiosity, tension, and the electricity of a new connection. Neither knows the other, yet something feels inexplicably familiar." },
    reunion: { label: "🔄 กลับมาพบกันอีกครั้ง (Reunion)", prompt: "They knew each other once — perhaps long ago. Now they meet again after years apart. Memories surface, unspoken words hang in the air, and time collapses between them." },
    rivals: { label: "⚔️ คู่แข่ง / ศัตรู (Rivals / Enemies)", prompt: "They stand on opposite sides — enemies, competitors, or reluctant adversaries. Yet beneath the conflict, there is a grudging respect, a dangerous fascination, or an undeniable pull toward each other." },
    allies: { label: "🤝 พันธมิตร (Partners / Allies)", prompt: "They are thrown together by circumstance — partners, teammates, or unlikely allies. They must rely on each other, and through shared struggle, something deeper begins to emerge." },
    bittersweet: { label: "💔 รักที่ต้องพราก (Bittersweet)", prompt: "Their connection is real but cannot last. Something — duty, fate, circumstance — keeps them apart. This is a meeting colored by the knowledge that it is fleeting, precious, and possibly the only one they will ever have." },
    mistaken: { label: "🎭 จำผิดคน (Mistaken Identity)", prompt: "One of them mistakes the other for someone else, or they meet under false pretenses. The truth is hidden beneath masks, roles, or misunderstandings — but the genuine connection that forms is undeniably real." },
    fated: { label: "🌙 พรหมลิขิต (Fated Encounter)", prompt: "The universe conspired to bring them together. Against all odds, through impossible coincidences and cosmic alignment, they find each other. It feels like destiny, like the multiverse itself wanted this moment to exist." },
};

// Mood types
const moodTypes = {
    random: { label: "🎲 สุ่ม (Random)", prompt: "Choose the mood that best fits the scene naturally." },
    romantic: { label: "💕 โรแมนติกหวานซึ้ง (Romantic)", prompt: "MOOD: Deeply romantic. Lingering gazes, racing hearts, unspoken desire. The air between them is electric with attraction. Every accidental touch sends sparks." },
    comedic: { label: "😂 ตลกเฮฮา (Comedic)", prompt: "MOOD: Lighthearted and funny. Witty banter, awkward mishaps, and genuine laughter. The connection forms through humor and playful chaos." },
    dark: { label: "🖤 เข้มข้น / ดุดัน (Dark / Intense)", prompt: "MOOD: Dark and intense. Shadows, secrets, danger lurking beneath the surface. Their connection is forged in fire — desperate, raw, and consuming." },
    melancholic: { label: "🌧️ เศร้าหมอง / โหยหา (Melancholic)", prompt: "MOOD: Melancholic and wistful. A sense of loss, nostalgia, or longing pervades the scene. Beauty mixed with sadness — like a song you can't forget." },
    mysterious: { label: "🔮 ลึกลับซับซ้อน (Mysterious)", prompt: "MOOD: Mysterious and enigmatic. Unanswered questions, hidden motives, and an atmosphere thick with intrigue. Nothing is quite what it seems." },
    wholesome: { label: "🌻 อบอุ่นหัวใจ (Wholesome)", prompt: "MOOD: Warm and wholesome. Gentle kindness, quiet comfort, and genuine human connection. A scene that makes the reader's heart feel full." },
};

// Default settings
const defaultSettings = {
    enabled: false,
    selectedTheme: "random",
    selectedEncounter: "random",
    selectedMood: "random",
    gallery: [],
    hasSeenWelcome: false,
};

// Load saved settings
async function loadSettings() {
    extension_settings[extensionName] = extension_settings[extensionName] || {};
    if (Object.keys(extension_settings[extensionName]).length === 0) {
        Object.assign(extension_settings[extensionName], defaultSettings);
    }
    if (!extension_settings[extensionName].selectedTheme) {
        extension_settings[extensionName].selectedTheme = defaultSettings.selectedTheme;
    }
    if (!extension_settings[extensionName].selectedEncounter) {
        extension_settings[extensionName].selectedEncounter = defaultSettings.selectedEncounter;
    }
    if (!extension_settings[extensionName].selectedMood) {
        extension_settings[extensionName].selectedMood = defaultSettings.selectedMood;
    }
    if (!extension_settings[extensionName].gallery) {
        extension_settings[extensionName].gallery = [];
    }
    $("#another_universe_enabled").prop("checked", extension_settings[extensionName].enabled);
    $("#another_universe_theme").val(extension_settings[extensionName].selectedTheme);
    $("#another_universe_encounter").val(extension_settings[extensionName].selectedEncounter);
    $("#another_universe_mood").val(extension_settings[extensionName].selectedMood);
}

// Handle checkbox change
function onEnabledChange(event) {
    const value = Boolean($(event.target).prop("checked"));
    extension_settings[extensionName].enabled = value;
    saveSettingsDebounced();
    updateChatButtonVisibility();
    console.log(`[${extensionName}] Enabled:`, value);
}

// Create and inject the floating chat button
function createChatButton() {
    // Don't create if already exists
    if ($("#au-chat-btn").length > 0) return;

    const chatBtnHtml = `
    <div id="au-chat-btn" class="au-chat-btn" title="Open Another Universe 🌌">
        <span class="au-chat-btn-icon">🌌</span>
        <span class="au-chat-btn-loading" style="display:none;">🌀</span>
    </div>`;

    $("#send_form").append(chatBtnHtml);
    $("#au-chat-btn").on("click", showQuickSettings);
}

// Reusable overlay style
function getOverlayStyle() {
    return [
        'position:fixed', 'top:0', 'left:0', 'right:0', 'bottom:0',
        'width:100vw', 'height:100vh', 'background:rgba(0,0,0,0.8)',
        'backdrop-filter:blur(8px)', 'display:flex', 'align-items:center',
        'justify-content:center', 'z-index:99999', 'padding:16px',
        'box-sizing:border-box', 'margin:0',
    ].join(';');
}

// Quick Settings Popup — shown when clicking 🌌 button
function showQuickSettings() {
    const isEnabled = extension_settings[extensionName].enabled;
    if (!isEnabled) {
        toastr.warning("กรุณาเปิดใช้งาน Extension ก่อนนะ!", "🌌 Another Universe");
        return;
    }
    $("#another-universe-modal-overlay").remove();

    const curTheme = extension_settings[extensionName].selectedTheme || 'random';
    const curEncounter = extension_settings[extensionName].selectedEncounter || 'random';
    const curMood = extension_settings[extensionName].selectedMood || 'random';

    const themeOpts = Object.entries(universeThemes).map(([k, v]) => `<option value="${k}" ${k === curTheme ? 'selected' : ''}>${v.label}</option>`).join('');
    const encOpts = Object.entries(encounterTypes).map(([k, v]) => `<option value="${k}" ${k === curEncounter ? 'selected' : ''}>${v.label}</option>`).join('');
    const moodOpts = Object.entries(moodTypes).map(([k, v]) => `<option value="${k}" ${k === curMood ? 'selected' : ''}>${v.label}</option>`).join('');

    const html = `
    <div id="another-universe-modal-overlay" style="${getOverlayStyle()}">
        <div class="au-universal-popup au-quick-popup">
            <div class="au-universal-popup-header">
                <div class="au-card-front-header-text">
                    <span class="au-modal-title">🌌 Another Universe</span>
                    <span class="au-modal-theme-badge">เลือกการตั้งค่าแล้วกด Generate</span>
                </div>
                <div style="display: flex; gap: 4px; align-items: center;">
                    <span id="au-quick-info" class="au-modal-close" title="เกี่ยวกับโปรเจกต์ (About)">ℹ️</span>
                    <span id="au-modal-close" class="au-modal-close">✕</span>
                </div>
            </div>
            <div class="au-universal-popup-body au-quick-body">
                <div class="au-quick-row">
                    <label>🎭 Theme</label>
                    <select id="au-quick-theme" class="text_pole">${themeOpts}</select>
                </div>
                <div class="au-quick-row">
                    <label>💫 Encounter</label>
                    <select id="au-quick-encounter" class="text_pole">${encOpts}</select>
                </div>
                <div class="au-quick-row">
                    <label>🎨 Mood</label>
                    <select id="au-quick-mood" class="text_pole">${moodOpts}</select>
                </div>
            </div>
            <div class="au-universal-popup-footer au-quick-footer">
                <input id="au-quick-gallery" class="menu_button" type="submit" value="📚 Gallery" />
                <input id="au-quick-generate" class="menu_button" type="submit" value="✨ Generate" />
            </div>
        </div>
    </div>`;

    document.body.insertAdjacentHTML('beforeend', html);

    // Save selections on change
    $("#au-quick-theme").on("change", function () { extension_settings[extensionName].selectedTheme = $(this).val(); saveSettingsDebounced(); });
    $("#au-quick-encounter").on("change", function () { extension_settings[extensionName].selectedEncounter = $(this).val(); saveSettingsDebounced(); });
    $("#au-quick-mood").on("change", function () { extension_settings[extensionName].selectedMood = $(this).val(); saveSettingsDebounced(); });

    $("#au-quick-generate").on("click", () => { $("#another-universe-modal-overlay").remove(); onOpenUniverseClick(); });
    $("#au-quick-gallery").on("click", () => { $("#another-universe-modal-overlay").remove(); showGalleryModal(); });
    $("#au-quick-info").on("click", () => { $("#another-universe-modal-overlay").remove(); showWelcomeModal(); });
    $("#au-modal-close").on("click", () => { $("#another-universe-modal-overlay").remove(); });
    $("#another-universe-modal-overlay").on("click", (e) => { if (e.target === e.currentTarget) $("#another-universe-modal-overlay").remove(); });
}

// Toggle chat button visibility based on enabled state
function updateChatButtonVisibility() {
    const isEnabled = extension_settings[extensionName]?.enabled;
    if (isEnabled) {
        $("#au-chat-btn").show();
    } else {
        $("#au-chat-btn").hide();
    }
}

// Handle theme change
function onThemeChange(event) {
    const value = $(event.target).val();
    extension_settings[extensionName].selectedTheme = value;
    saveSettingsDebounced();
    console.log(`[${extensionName}] Theme selected:`, value, universeThemes[value]?.label);
}

// Handle encounter change
function onEncounterChange(event) {
    const value = $(event.target).val();
    extension_settings[extensionName].selectedEncounter = value;
    saveSettingsDebounced();
    console.log(`[${extensionName}] Encounter selected:`, value, encounterTypes[value]?.label);
}

// Handle mood change
function onMoodChange(event) {
    const value = $(event.target).val();
    extension_settings[extensionName].selectedMood = value;
    saveSettingsDebounced();
    console.log(`[${extensionName}] Mood selected:`, value, moodTypes[value]?.label);
}

// Extract recent chat messages for context
function getRecentChatContext(maxMessages = 10) {
    const context = getContext();
    const chat = context.chat || [];

    if (chat.length === 0) return "";

    const recentMessages = chat
        .filter(msg => !msg.is_system && msg.mes)
        .slice(-maxMessages)
        .map(msg => {
            const sender = msg.is_user ? (context.name1 || "User") : (context.name2 || "Character");
            const text = msg.mes.length > 200 ? msg.mes.substring(0, 200) + "..." : msg.mes;
            return `${sender}: ${text}`;
        })
        .join("\n");

    return recentMessages;
}

// Build the prompt for LLM
function buildUniversePrompt(charName, charDescription, userName, chatContext) {
    const selectedTheme = extension_settings[extensionName].selectedTheme || "random";
    const themeInfo = universeThemes[selectedTheme] || universeThemes.random;
    const settingInstruction = selectedTheme === "random"
        ? "Choose any creative, unexpected, and vivid setting for this parallel universe. Surprise the reader."
        : `The parallel universe is set in: ${themeInfo.prompt}.`;

    const selectedEncounter = extension_settings[extensionName].selectedEncounter || "random";
    const encounterInfo = encounterTypes[selectedEncounter] || encounterTypes.random;
    const encounterInstruction = `ENCOUNTER TYPE: ${encounterInfo.prompt}`;

    const selectedMood = extension_settings[extensionName].selectedMood || "random";
    const moodInfo = moodTypes[selectedMood] || moodTypes.random;
    const moodInstruction = selectedMood === "random"
        ? ""
        : `\n${moodInfo.prompt}`;

    const contextSection = chatContext
        ? `\nRecent conversation between them (use this to understand their dynamic, tone, and relationship — then REIMAGINE it in the new universe):\n---\n${chatContext}\n---`
        : "";

    return `[System: PARALLEL UNIVERSE NARRATIVE GENERATOR]

You are a master storyteller. Write an immersive, cinematic scene (3-4 paragraphs) set in a parallel universe where "${charName}" and "${userName || 'the user'}" exist as completely different versions of themselves — yet something about their connection remains hauntingly familiar.

${settingInstruction}

${encounterInstruction}
${moodInstruction}

Character essence: ${charDescription ? charDescription.substring(0, 600) : 'Use the conversation below to infer personality.'}
${contextSection}

IMPORTANT RULES:
- DO NOT copy or reference the current conversation directly. Instead, let it INSPIRE the emotional undertone and chemistry between the characters.
- The encounter type above MUST shape the narrative structure and emotional tone of the scene.
- ${charName}'s core personality traits should bleed through even in this alternate life — their speech patterns, quirks, the way they look at ${userName}.
- Open with a striking, atmospheric description that immediately pulls the reader into this other world.
- Build tension or intrigue that matches the encounter type.
- Include at least one moment of dialogue that feels authentic to ${charName}'s character.
- End with a powerful emotional beat — a lingering glance, an unfinished sentence, a feeling that this universe's story is just beginning.
- Write ONLY the scene. No titles, no meta-commentary, no "In this universe..." preamble. Just drop the reader straight into the moment.
- Use vivid sensory language: light, sound, texture, scent, atmosphere.
- The tone should feel like a beautiful, bittersweet dream — something the reader wishes they could stay in a little longer.
- CRITICAL TONE ADJUSTMENT: The core emotional tone MUST lean towards ROMANCE, DEEP CONNECTION, or YEARNING. Even in dark or comedic settings, there should be an underlying romantic tension, a magnetic pull between them, or a sense of destined longing.`;
}

// Save story to gallery
function saveToGallery(charName, storyText, themeBadge) {
    if (!extension_settings[extensionName].gallery) {
        extension_settings[extensionName].gallery = [];
    }
    const entry = {
        charName,
        storyText,
        themeBadge,
        timestamp: new Date().toLocaleString(),
    };
    extension_settings[extensionName].gallery.unshift(entry);
    // Keep max 20 entries
    if (extension_settings[extensionName].gallery.length > 20) {
        extension_settings[extensionName].gallery = extension_settings[extensionName].gallery.slice(0, 20);
    }
    saveSettingsDebounced();
    console.log(`[${extensionName}] 📚 Saved to gallery (${extension_settings[extensionName].gallery.length} entries)`);
}

// Delete a gallery item
function deleteGalleryItem(index) {
    const gallery = extension_settings[extensionName].gallery || [];
    gallery.splice(index, 1);
    saveSettingsDebounced();
    showGalleryModal(); // refresh
}

// Clear all gallery
function clearGallery() {
    extension_settings[extensionName].gallery = [];
    saveSettingsDebounced();
    showGalleryModal();
}

// Toggle favorite
function toggleFavorite(index) {
    const gallery = extension_settings[extensionName].gallery || [];
    if (gallery[index]) {
        gallery[index].isFavorite = !gallery[index].isFavorite;
        saveSettingsDebounced();
        showGalleryModal();
    }
}

// Show gallery modal
function showGalleryModal(showFavOnly = false) {
    $("#another-universe-modal-overlay").remove();

    const gallery = extension_settings[extensionName].gallery || [];
    const filtered = showFavOnly ? gallery.filter(e => e.isFavorite) : gallery;

    let listHtml = '';
    if (filtered.length === 0) {
        const msg = showFavOnly ? 'ยังไม่มีเรื่องโปรด<br><small>กด ⭐ เพื่อเพิ่ม!</small>' : 'ยังไม่มีเรื่องราวในแกลเลอรี<br><small>กด Generate เพื่อสร้างเรื่องแรก!</small>';
        listHtml = `<div style="text-align:center;padding:40px 20px;color:rgba(180,160,255,0.5);">${msg}</div>`;
    } else {
        listHtml = filtered.map((entry, fi) => {
            const realIndex = gallery.indexOf(entry);
            const preview = entry.storyText.substring(0, 100).replace(/</g, '&lt;') + '...';
            const starClass = entry.isFavorite ? 'au-star-active' : '';
            return `
            <div class="au-gallery-item" data-index="${realIndex}">
                <div class="au-gallery-item-header">
                    <span class="au-gallery-item-char">🌌 ${entry.charName}</span>
                    <div class="au-gallery-item-actions">
                        <span class="au-gallery-star ${starClass}" data-index="${realIndex}" title="Favorite">⭐</span>
                        <span class="au-gallery-delete" data-index="${realIndex}" title="Delete">🗑️</span>
                    </div>
                </div>
                <div class="au-gallery-item-meta">
                    <span class="au-gallery-item-badge">${entry.themeBadge}</span>
                    <span class="au-gallery-item-time">${entry.timestamp}</span>
                </div>
                <div class="au-gallery-item-preview">${preview}</div>
            </div>`;
        }).join('');
    }

    const favBtnLabel = showFavOnly ? '📚 All' : '⭐ Favorites';
    const countLabel = showFavOnly ? `${filtered.length} favorites` : `${gallery.length} เรื่องราว`;

    const modalHtml = `
    <div id="another-universe-modal-overlay" style="${getOverlayStyle()}">
        <div class="au-universal-popup">
            <div class="au-universal-popup-header">
                <div class="au-card-front-header-text">
                    <span class="au-modal-title">📚 แกลเลอรีจักรวาลคู่ขนาน</span>
                    <span class="au-modal-theme-badge">${countLabel}</span>
                </div>
                <span id="au-modal-close" class="au-modal-close">✕</span>
            </div>
            <div class="au-universal-popup-body au-gallery-list">
                ${listHtml}
            </div>
            <div class="au-universal-popup-footer">
                <input id="au-gallery-filter" class="menu_button" type="submit" value="${favBtnLabel}" />
                <input id="au-gallery-clear" class="menu_button" type="submit" value="🗑️ Clear All" />
                <input id="au-modal-close-btn" class="menu_button" type="submit" value="Close" />
            </div>
        </div>
    </div>`;

    document.body.insertAdjacentHTML('beforeend', modalHtml);

    // Click item text/preview to view story
    $(".au-gallery-item-preview, .au-gallery-item-char").on("click", function () {
        const index = $(this).closest(".au-gallery-item").data("index");
        const entry = gallery[index];
        if (entry) {
            $("#another-universe-modal-overlay").remove();
            showStoryModal(entry.charName, entry.storyText, entry.themeBadge);
        }
    });

    // Star toggle
    $(".au-gallery-star").on("click", function (e) {
        e.stopPropagation();
        toggleFavorite($(this).data("index"));
    });

    // Delete
    $(".au-gallery-delete").on("click", function (e) {
        e.stopPropagation();
        deleteGalleryItem($(this).data("index"));
    });

    // Filter toggle
    $("#au-gallery-filter").on("click", () => {
        $("#another-universe-modal-overlay").remove();
        showGalleryModal(!showFavOnly);
    });

    // Clear all
    $("#au-gallery-clear").on("click", () => {
        if (confirm("ลบเรื่องราวทั้งหมดในแกลเลอรี?")) {
            clearGallery();
        }
    });

    // Close
    $("#au-modal-close, #au-modal-close-btn").on("click", () => {
        $("#another-universe-modal-overlay").remove();
    });
    $("#another-universe-modal-overlay").on("click", (e) => {
        if (e.target === e.currentTarget) {
            $("#another-universe-modal-overlay").remove();
        }
    });
}

// Show the story modal (works on all screen sizes)
function showStoryModal(charName, storyText, themeName) {
    // Remove existing
    $("#another-universe-modal-overlay").remove();

    const escapedStory = storyText
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/\n/g, '<br>');

    const modalHtml = `
    <div id="another-universe-modal-overlay" style="${getOverlayStyle()}">
        <div class="au-universal-popup">
            <div class="au-universal-popup-header">
                <div class="au-card-front-header-text">
                    <span class="au-modal-title">🌌 ${charName}</span>
                    <span class="au-modal-theme-badge">${themeName}</span>
                </div>
                <span id="au-modal-close" class="au-modal-close">✕</span>
            </div>
            <div class="au-universal-popup-body">
                <div class="au-story-text">${escapedStory}</div>
            </div>
            <div class="au-universal-popup-footer">
                <input id="au-modal-regenerate" class="menu_button" type="submit" value="🔄 Another Universe" />
                <input id="au-modal-close-btn" class="menu_button" type="submit" value="Close" />
            </div>
        </div>
    </div>`;

    // Append as LAST child of <body> to avoid parent transform issues
    document.body.insertAdjacentHTML('beforeend', modalHtml);

    // Bind close
    $("#au-modal-close, #au-modal-close-btn").on("click", () => {
        $("#another-universe-modal-overlay").remove();
    });

    // Bind regenerate
    $("#au-modal-regenerate").on("click", () => {
        $("#another-universe-modal-overlay").remove();
        onOpenUniverseClick();
    });

    // Close on overlay click
    $("#another-universe-modal-overlay").on("click", (e) => {
        if (e.target === e.currentTarget) {
            $("#another-universe-modal-overlay").remove();
        }
    });

    console.log(`[${extensionName}] 📱 Popup created, overlay visible:`, $("#another-universe-modal-overlay").is(":visible"));
}

// Show loading state
function showLoadingState(show) {
    if (show) {
        $("#another_universe_open_btn").prop("disabled", true).val("🌀 กำลังเปิดประตูจักรวาล...");
        // Chat button loading state
        $("#au-chat-btn").addClass("au-chat-btn-busy");
        $("#au-chat-btn .au-chat-btn-icon").hide();
        $("#au-chat-btn .au-chat-btn-loading").show();
    } else {
        $("#another_universe_open_btn").prop("disabled", false).val("✨ Open Another Universe");
        // Chat button normal state
        $("#au-chat-btn").removeClass("au-chat-btn-busy");
        $("#au-chat-btn .au-chat-btn-icon").show();
        $("#au-chat-btn .au-chat-btn-loading").hide();
    }
}

// Handle button click - generate the universe story
async function onOpenUniverseClick() {
    const isEnabled = extension_settings[extensionName].enabled;

    if (!isEnabled) {
        toastr.warning("กรุณาเปิดใช้งาน Extension ก่อนนะ!", "🌌 Another Universe");
        return;
    }

    const context = getContext();
    if (!context.characterId && context.characterId !== 0) {
        toastr.warning("กรุณาเลือกตัวละครก่อนนะ!", "🌌 Another Universe");
        return;
    }

    const charName = context.name2 || "Unknown";
    const userName = context.name1 || "User";
    const charDescription = context.characters?.[context.characterId]?.description || "";
    const selectedTheme = extension_settings[extensionName].selectedTheme || "random";
    const themeLabel = universeThemes[selectedTheme]?.label || "🎲 Random";
    const selectedEncounter = extension_settings[extensionName].selectedEncounter || "random";
    const encounterLabel = encounterTypes[selectedEncounter]?.label || "🎲 Random";
    const selectedMood = extension_settings[extensionName].selectedMood || "random";
    const moodLabel = moodTypes[selectedMood]?.label || "🎲 Random";
    const chatContext = getRecentChatContext(10);

    console.log(`[${extensionName}] Generating for ${charName} [Theme: ${themeLabel}] [Encounter: ${encounterLabel}] [Mood: ${moodLabel}] [Chat: ${chatContext ? 'yes' : 'none'}]`);
    showLoadingState(true);

    try {
        const prompt = buildUniversePrompt(charName, charDescription, userName, chatContext);
        const result = await generateQuietPrompt(prompt);

        if (result) {
            const badge = `${themeLabel} · ${encounterLabel} · ${moodLabel}`;
            saveToGallery(charName, result, badge);
            showStoryModal(charName, result, badge);
            toastr.success("เรื่องราวจักรวาลคู่ขนานพร้อมแล้ว!", "🌌 Another Universe");
            console.log(`[${extensionName}] ✅ Universe generated successfully`);
        } else {
            toastr.error("ไม่สามารถสร้างเรื่องราวได้ ลองใหม่อีกครั้ง", "🌌 Another Universe");
            console.log(`[${extensionName}] ❌ Empty result from LLM`);
        }
    } catch (error) {
        toastr.error(`เกิดข้อผิดพลาด: ${error.message}`, "🌌 Another Universe");
        console.error(`[${extensionName}] ❌ Generation failed:`, error);
    } finally {
        showLoadingState(false);
    }
}

// Show Welcome Modal
function showWelcomeModal() {
    const html = `
    <div id="au-welcome-overlay" style="${getOverlayStyle()}">
        <div class="au-universal-popup">
            <div class="au-universal-popup-header">
                <div class="au-card-front-header-text">
                    <span class="au-modal-title">🌌 Another Universe v1.0</span>
                    <span class="au-modal-theme-badge">ถ้าเราได้พบกัน...ในอีกจักรวาลหนึ่ง</span>
                </div>
                <span id="au-welcome-close" class="au-modal-close">✕</span>
            </div>
            <div class="au-universal-popup-body" style="padding: 24px; text-align: left;">
                <h3 style="margin-top:0; margin-bottom:16px; color:var(--SmartThemeBodyColor, #e0d0ff);">
                    ขอบคุณที่ติดตั้ง <strong>Another Universe</strong> 🌌
                </h3>
                <p style="font-size:0.95em; line-height:1.6; margin-bottom:12px;">
                    โปรเจกต์นี้เกิดขึ้นจากคำถามง่ายๆ คำถามหนึ่ง<br>
                    <em>“ถ้าตัวละครสองคนได้พบกันในโลกที่แตกต่างออกไป เรื่องราวของพวกเขาจะยังเหมือนเดิมไหม?”</em>
                </p>

                <p style="font-size:0.95em; line-height:1.6; margin-bottom:12px;">
                    บางจักรวาล พวกเขาอาจเป็นคนแปลกหน้าที่เดินสวนกันใต้สายฝน<br>
                    บางจักรวาล อาจเป็นศัตรู คู่หู หรือคนรักที่ถูกโชคชะตาพลัดพราก<br>
                    แต่ไม่ว่าโลกจะเปลี่ยนไปมากแค่ไหน ความรู้สึกบางอย่างอาจยังคงเดิมเสมอ
                </p>

                <p style="font-size:0.95em; line-height:1.6; margin-bottom:16px;">
                    Another Universe จะนำบทสนทนา บุคลิก และความสัมพันธ์ของตัวละคร<br>
                    มาตีความใหม่ในโลกคู่ขนาน ผ่านธีม อารมณ์ และรูปแบบการพบกันที่แตกต่างกันออกไป
                </p>

                <hr style="border-color: rgba(130, 100, 255, 0.15); margin: 16px 0;">

                <p style="font-size:0.9em; line-height:1.6; opacity:0.85; margin-bottom:12px;">
                    ✨ กดปุ่ม 🌌 ข้างช่องแชท เพื่อเริ่มเปิดประตูสู่จักรวาลใหม่
                </p>

                <p style="font-size: 0.85em; opacity: 0.75; margin:0;">
                    หากเกิดรอยร้าวระหว่างจักรวาล หรือพบปัญหาในการเดินทางข้ามโลก<br>
                    สามารถติดต่อได้ที่ Discord: <strong>majesty.pop (POPKO)</strong>
                </p>
                
                <div style="margin-top: 28px; font-size: 0.7em; opacity: 0.6; text-align:center; padding-top: 14px; border-top: 1px dashed rgba(130, 100, 255, 0.2);">
                    ⚠️ โปรเจกต์นี้จัดทำขึ้นเพื่อความสนุกสนาน (AGPL-3.0)<br>
                    อนุญาตให้ Fork ได้ แต่ <strong>ห้ามใช้เพื่อการค้า และ ห้ามปิดซอร์สโค้ดเด็ดขาด</strong><br>
                    <span style="color: #ff8888;">หากตรวจพบว่ามีบางส่วนของโค้ดถูกละเมิด จะดำเนินการแจ้งกับทุกคอมมูนิตี้ที่เกี่ยวข้องทันที</span>
                </div>
            </div>
            <div class="au-universal-popup-footer" style="justify-content:center;">
                <input id="au-welcome-close-btn" class="menu_button" type="submit" value="✨ เริ่มเดินทางข้ามจักรวาล" style="width:100%;" />
            </div>
        </div>
    </div>`;

    document.body.insertAdjacentHTML('beforeend', html);

    const closeWelcome = () => {
        $("#au-welcome-overlay").remove();
        extension_settings[extensionName].hasSeenWelcome = true;
        saveSettingsDebounced();
    };

    $("#au-welcome-close, #au-welcome-close-btn").on("click", closeWelcome);
    $("#au-welcome-overlay").on("click", (e) => {
        if (e.target === e.currentTarget) closeWelcome();
    });
}

// Extension initialization
jQuery(async () => {
    console.log(`[${extensionName}] Loading...`);

    try {
        const settingsHtml = await $.get(`${extensionFolderPath}/example.html`);
        $("#extensions_settings2").append(settingsHtml);

        // Bind events
        $("#another_universe_enabled").on("input", onEnabledChange);
        $("#another_universe_theme").on("change", onThemeChange);
        $("#another_universe_encounter").on("change", onEncounterChange);
        $("#another_universe_mood").on("change", onMoodChange);
        $("#another_universe_open_btn").on("click", onOpenUniverseClick);
        $("#another_universe_gallery_btn").on("click", showGalleryModal);

        // Create the floating chat button
        createChatButton();

        // Load saved settings
        await loadSettings();

        // Set initial chat button visibility
        updateChatButtonVisibility();

        // Show welcome message on first run
        if (!extension_settings[extensionName].hasSeenWelcome) {
            showWelcomeModal();
        }

        console.log(`[${extensionName}] ✅ Loaded successfully`);
    } catch (error) {
        console.error(`[${extensionName}] ❌ Failed to load:`, error);
    }
});
