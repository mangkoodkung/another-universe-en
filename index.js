// Another Universe - SillyTavern Extension
// "What if we met in another universe?"

// Import from SillyTavern core
import { extension_settings, getContext, loadExtensionSettings } from "../../../extensions.js";
import { saveSettingsDebounced, generateQuietPrompt, eventSource, event_types } from "../../../../script.js";

// Detect actual folder name from script URL (works for any install method / any case)
// e.g. third-party/another-universe/ OR third-party/Another-Universe/
const _scriptSrc = document.currentScript?.src
    || Array.from(document.querySelectorAll('script[src]')).find(s => s.src.includes('another-universe') || s.src.includes('Another-Universe'))?.src
    || '';
const _folderMatch = _scriptSrc.match(/third-party\/([^/]+)\//i);
const extensionName = _folderMatch ? _folderMatch[1] : "Another-Universe";
const extensionFolderPath = `scripts/extensions/third-party/${extensionName}`;
console.log(`[Another-Universe] Detected folder name: "${extensionName}"`);


// Universe themes
const universeThemes = {
    random: { label: "🎲 สุ่ม", prompt: "any creative setting you can imagine" },
    // --- Classic ---
    medieval: { label: "🏰 แฟนตาซียุคกลาง", prompt: "a medieval fantasy kingdom with magic, castles, and ancient legends" },
    scifi: { label: "🚀 ไซไฟ / อวกาศ", prompt: "a futuristic sci-fi setting — a space station, distant planet, or starship among the stars" },
    cyberpunk: { label: "🌆 ไซเบอร์พังค์", prompt: "a neon-lit cyberpunk metropolis with holograms, augmented reality, and rain-soaked streets" },
    modern: { label: "☕ ชีวิตประจำวัน", prompt: "a cozy modern-day setting — a quiet café, a bookstore, a rainy city street, or a chance encounter in everyday life" },
    postapoc: { label: "🏚️ โลกหลังหายนะ", prompt: "a post-apocalyptic wasteland where survivors cling to hope among the ruins" },
    historical: { label: "🎭 ย้อนยุค", prompt: "a historical setting — 1920s Paris, ancient Rome, Edo-period Japan, or Victorian London" },
    horror: { label: "🌑 สยองขวัญ", prompt: "a dark, eerie setting — a haunted mansion, a cursed forest, or a town where something is terribly wrong" },
    dream: { label: "💫 โลกความฝัน", prompt: "a surreal dreamscape where reality bends — floating islands, shifting landscapes, and impossible architecture" },
    // --- Wild & Unique ---
    thaidrama: { label: "📺 ละครไทย", prompt: "a Thai lakorn drama — jealous rivals, scheming families, slap-kiss moments, dramatic confrontations at a mansion, and forbidden love between social classes" },
    thaifolk: { label: "🐍 ตำนานไทย", prompt: "a Thai mythological setting — Naga serpents in the Mekong, a Kinnari's forest, spirits of the Phi Fa, or the golden city of Ayutthaya blessed by the gods" },
    kemono: { label: "🐾 ครึ่งสัตว์", prompt: "a world where people have animal ears, tails, and instincts — fox spirits, wolf guardians, cat café workers, or rabbit merchants in a whimsical beast-folk society" },
    prehistoric: { label: "🦕 ดึกดำบรรพ์", prompt: "a prehistoric world of dinosaurs, volcanoes, and primal survival — cave dwellers, ancient rituals, and the raw untamed beauty of a world before civilization" },
    wuxia: { label: "⚔️ จีนกำลังภายใน", prompt: "an ancient Chinese martial arts world — sword cultivators on misty mountains, hidden sects, qi energy battles, forbidden techniques, and star-crossed lovers across rival clans" },
    pirate: { label: "🏴‍☠️ โจรสลัดทะเล", prompt: "the golden age of piracy — treasure maps, sea battles, cursed islands, a pirate captain's ship under moonlight, and the thrill of freedom on the open ocean" },
    underwater: { label: "🧜 ใต้มหาสมุทร", prompt: "a bioluminescent underwater kingdom — merfolk politics, coral palaces, deep-sea leviathans, and the haunting silence of the abyss" },
    zombie: { label: "🧟 ซอมบี้", prompt: "a zombie apocalypse — barricaded safe houses, supply runs through infected cities, moral dilemmas, and finding love when the world is ending" },
    isekai: { label: "🌀 ต่างโลก", prompt: "an isekai adventure — suddenly transported to a fantasy world with game-like stats, guilds, demon lords, and the bewildering realization that this world plays by different rules" },
    mafia: { label: "🔫 มาเฟีย", prompt: "the criminal underworld — mob families, secret deals in smoky back rooms, loyalty tested by blood, luxury hiding darkness, and a dangerous romance that could get them both killed" },
    steampunk: { label: "⚙️ สตีมพังค์", prompt: "a steampunk world of brass gears, airships, Victorian-era inventors, clockwork automata, and adventure in a city powered by steam and ambition" },
    fairytale: { label: "👑 เทพนิยาย", prompt: "a fairy tale world — enchanted forests, cursed royalty, talking animals, a magic mirror, and a love that breaks all spells" },
    mythology: { label: "⚡ เทพปกรณัม", prompt: "the realm of gods and mythology — Mount Olympus, Valhalla, or the celestial heavens where divine beings meddle in mortal affairs and forbidden love shakes the cosmos" },
    school: { label: "🎒 โรงเรียน", prompt: "a school or university setting — rooftop confessions, festival preparations, study sessions that become something more, rivalry between clubs, and the bittersweet end of youth" },
    idol: { label: "🎤 ไอดอล", prompt: "the world of idols and celebrities — secret relationships behind the spotlight, fan meetings that change everything, tabloid scandals, and the loneliness of fame" },
    vampire: { label: "🧛 แวมไพร์", prompt: "a gothic vampire world — ancient bloodlines, moonlit castles, eternal life and eternal loneliness, the intoxication of the bite, and a mortal who changes everything" },
    mecha: { label: "🤖 หุ่นยนต์ยักษ์", prompt: "a mecha warfare setting — giant robot pilots bonded by neural link, defending humanity's last cities, the weight of being chosen, and stolen moments between battles" },
    noir: { label: "🕵️ นักสืบฟิล์มนัวร์", prompt: "a 1940s film noir detective story — rain-slicked streets, femme fatales, whiskey and cigarettes, a case that gets personal, and shadows hiding dangerous truths" },
    timeloop: { label: "⏳ วนลูปเวลา", prompt: "a time loop — reliving the same day endlessly, each iteration revealing something new about the other person, desperate attempts to break free, and the realization that this one person is the key" },
    virtualworld: { label: "🎮 โลกในเกม", prompt: "inside a virtual game world — MMORPG guilds, NPC that seems too real, glitches revealing hidden truths, raid bosses, and a connection that transcends the digital boundary" },
    spiritworld: { label: "👻 โลกวิญญาณ", prompt: "the spirit world between life and death — wandering souls, a ferryman of the afterlife, unfinished business, memories fading like mist, and a love that refuses to let go even after death" },
    desert: { label: "🏜️ ทะเลทรายมหัศจรรย์", prompt: "a vast mystic desert — nomadic caravans, ancient buried cities, djinn granting twisted wishes, oasis mirages, and starlit nights where the sand whispers secrets" },
    cooking: { label: "🍳 สงครามอาหาร", prompt: "a competitive cooking world — rival chefs, high-stakes cook-offs, secret family recipes, a tiny restaurant fighting against a food empire, and love simmering between kitchen rivals" },
    circus: { label: "🎪 คณะละครสัตว์", prompt: "a magical traveling circus that appears only at midnight — trapeze artists defying gravity, fortune tellers who see too much, a ringmaster with secrets, and two performers whose act becomes dangerously real" },
    omegaverse: { label: "🐺 โอเมก้าเวิร์ส", prompt: "an omegaverse setting — alpha/beta/omega dynamics, deeply ingrained instincts, scent markers, and a society built around these primary natures" },
    superhero: { label: "🦸 ซูเปอร์ฮีโร่", prompt: "a world of superheroes and villains — secret identities, superpowers, city-destroying battles, and the line between heroism and vigilantism" },
    royal: { label: "👑 ราชวงศ์ / วังหลวง", prompt: "a royal court setting — kings, queens, elaborate ballrooms, political marriages, hidden daggers, and whispers behind silk fans" },
    yokai: { label: "🦊 ภูตผีญี่ปุ่น", prompt: "a world of Japanese yokai and spirits — hidden shrines, festival lanterns, kitsune, tengu, and the blurred line between the human and spirit realms" },
};

// Encounter types
const encounterTypes = {
    none: { label: "❌ ไม่ระบุ", prompt: "" },
    random: { label: "🎲 สุ่ม", prompt: "Choose any type of encounter that feels natural and compelling." },
    // --- Classic ---
    firstMeet: { label: "💫 พบกันครั้งแรก", prompt: "They are meeting for the very first time. There is curiosity, tension, and the electricity of a new connection. Neither knows the other, yet something feels inexplicably familiar." },
    reunion: { label: "🔄 กลับมาพบกันอีกครั้ง", prompt: "They knew each other once — perhaps long ago. Now they meet again after years apart. Memories surface, unspoken words hang in the air, and time collapses between them." },
    rivals: { label: "⚔️ คู่แข่ง / ศัตรู", prompt: "They stand on opposite sides — enemies, competitors, or reluctant adversaries. Yet beneath the conflict, there is a grudging respect, a dangerous fascination, or an undeniable pull toward each other." },
    allies: { label: "🤝 พันธมิตร", prompt: "They are thrown together by circumstance — partners, teammates, or unlikely allies. They must rely on each other, and through shared struggle, something deeper begins to emerge." },
    bittersweet: { label: "💔 รักที่ต้องพราก", prompt: "Their connection is real but cannot last. Something — duty, fate, circumstance — keeps them apart. This is a meeting colored by the knowledge that it is fleeting, precious, and possibly the only one they will ever have." },
    mistaken: { label: "🎭 จำผิดคน", prompt: "One of them mistakes the other for someone else, or they meet under false pretenses. The truth is hidden beneath masks, roles, or misunderstandings — but the genuine connection that forms is undeniably real." },
    fated: { label: "🌙 พรหมลิขิต", prompt: "The universe conspired to bring them together. Against all odds, through impossible coincidences and cosmic alignment, they find each other. It feels like destiny, like the multiverse itself wanted this moment to exist." },
    // --- New ---
    protector: { label: "🛡️ ผู้พิทักษ์", prompt: "One of them is sworn to protect the other — a bodyguard, a knight, a guardian angel. Duty demands distance, but proximity breeds something neither expected. Every threat brings them closer." },
    forbidden: { label: "🚫 รักต้องห้าม", prompt: "Everything about this connection is forbidden — different worlds, opposing factions, taboo by law or tradition. They know the cost of being caught, yet they cannot stop reaching for each other." },
    childhood: { label: "🌟 เพื่อนวัยเด็ก", prompt: "They grew up together — sharing secrets, scraped knees, and pinky promises. Now as adults, the innocent bond has evolved into something neither dares to name. The familiarity is both comforting and terrifying." },
    master_servant: { label: "👑 นาย-บ่าว", prompt: "One holds power, the other serves — but the dynamic is more complex than it appears. Loyalty blurs into devotion, commands soften into whispers, and the line between duty and desire disappears." },
    savior: { label: "🩺 ช่วยชีวิต", prompt: "One of them saved the other's life — from danger, from darkness, from themselves. Now there is a debt that cannot be repaid, a bond forged in a moment of vulnerability, and a gratitude that has grown into something much deeper." },
    reincarnation: { label: "🔮 ชาติที่แล้ว", prompt: "They have met before — in another life, another century, another world. Fragments of memories bleed through: a familiar scent, a déjà vu smile, dreams of a face they have never seen yet somehow know by heart." },
    strangers_night: { label: "🌃 คืนเดียว", prompt: "Two strangers cross paths in the dead of night — at a bar, on a rooftop, in an empty train station. No names, no past, no future. Just this one night where two souls collide and create something unforgettable." },
    accidental: { label: "💥 บังเอิญชนกัน", prompt: "A literal or metaphorical collision — bumping into each other, crashing into each other's lives through a comedy of errors. Spilled coffee, wrong apartment, switched luggage. Chaos that leads to chemistry." },
    // --- Extended / Extra ---
    fakeDating: { label: "💍 แฟนกำมะลอ", prompt: "They are forced to fake a relationship — holding hands for the cameras, sharing a bed out of necessity, pretending to be in love until the lines blur and the fake feelings become terrifyingly real." },
    arrangedMarriage: { label: "📜 คลุมถุงชน", prompt: "An arranged marriage between strangers or rivals. A cold bedroom, political alliances, duty over desire, but slowly discovering the person behind the mask." },
    roommates: { label: "🏠 เพื่อนร่วมห้อง", prompt: "Forced proximity as roommates. Thin walls, sharing a kitchen in the middle of the night, accidental touches, and the agonizing tension of living so close to someone you want." },
    amnesia: { label: "🧠 ความจำเสื่อม", prompt: "One of them has lost their memory. The other must bear the weight of their shared history. Relearning how to love, flashes of familiarity, and the tragedy of forgetting." },
    betrayal: { label: "🔪 การทรยศหักหลัง", prompt: "A profound betrayal has occurred. Swords drawn, broken trust, tears of rage. Loving someone who hurt you, or being the one who had to hold the knife." },
    soulmates: { label: "✨ โซลเมท", prompt: "A universe where soulmates are real — marked by a tattoo, a red thread, or shared pain. The magnetic, inescapable pull toward the one person meant for you." },
    timeTravel: { label: "⏳ ข้ามเวลา", prompt: "One of them has traveled through time to be here. A connection that defies centuries, the tragedy of outliving the one you love, or changing history to save them." },
    penPals: { label: "✉️ จดหมายลึกลับ", prompt: "They fell in love through letters, texts, or anonymous messages without ever seeing each other's faces. Now, they finally meet in person, and the reality exceeds the fantasy." },
    // --- Wild & Spicy ---
    bodySwap: { label: "🧬 สลับร่าง", prompt: "They have inexplicably swapped bodies. Waking up in the wrong bed, living each other's lives, discovering each other's deepest secrets, and the bizarre intimacy of knowing exactly how the other feels." },
    experiment: { label: "🧪 หนูทดลอง", prompt: "A dark laboratory setting. One is the scientist, the other is the experiment. Or perhaps they are both subjects trying to escape. Testing limits, breaking rules, and finding humanity in the dark." },
    vampireBlood: { label: "🩸 แหล่งเลือด", prompt: "A dynamic of pure necessity and dark addiction. One is a vampire, the other is their willing (or unwilling) blood source. The bite is euphoric, the dependency is absolute." },
    ghostHuman: { label: "👻 คนกับผี", prompt: "One is alive, one is a restless spirit. A haunting that turns into companionship. Longing to touch but passing through each other, existing on the fragile border between life and death." },
    demonPact: { label: "😈 สัญญากับปีศาจ", prompt: "A desperate human summons a demon and makes a pact. The price is their soul. The demon intends to collect, but finds themselves fascinated by the mortal instead." },
    stalker: { label: "👁️ คนแอบตาม", prompt: "A dark obsession. One is watching from the shadows, knowing every detail of the other's life. The other might be terrified, or they might secretly invite it." },
    sugarDaddy: { label: "💸 สายเปย์ / เด็กเลี้ยง", prompt: "A transactional relationship built on money and power. Expensive gifts, luxury hotels, and the slow realization that they want more than what money can buy." },
    identityReveal: { label: "🎭 ความลับแตก", prompt: "They've known each other for years, but one has been hiding a massive secret (superhero, spy, royalty, villain). Tonight, the mask falls off, and everything changes." },
    multiverseGlitch: { label: "🌌 มิติพังทลาย", prompt: "The multiverse is collapsing. Two different versions of the same person, or lovers from different timelines, are trapped in the same room as reality tears itself apart around them." },
    doppelganger: { label: "🪞 ร่างโคลน", prompt: "One of them has been replaced by an exact duplicate — a clone, a shapeshifter, or an alternate self. The duplicate is trying to live their life, and might be doing a better job at loving their partner." },
};

// Mood types
const moodTypes = {
    none: { label: "❌ ไม่ระบุ", prompt: "" },
    random: { label: "🎲 สุ่ม", prompt: "Choose the mood that best fits the scene naturally." },
    // --- Classic ---
    romantic: { label: "💕 โรแมนติกหวานซึ้ง", prompt: "MOOD: Deeply romantic. Lingering gazes, racing hearts, unspoken desire. The air between them is electric with attraction. Every accidental touch sends sparks." },
    comedic: { label: "😂 ตลกเฮฮา", prompt: "MOOD: Lighthearted and funny. Witty banter, awkward mishaps, and genuine laughter. The connection forms through humor and playful chaos." },
    dark: { label: "🖤 เข้มข้น / ดุดัน", prompt: "MOOD: Dark and intense. Shadows, secrets, danger lurking beneath the surface. Their connection is forged in fire — desperate, raw, and consuming." },
    melancholic: { label: "🌧️ เศร้าหมอง / โหยหา", prompt: "MOOD: Melancholic and wistful. A sense of loss, nostalgia, or longing pervades the scene. Beauty mixed with sadness — like a song you can't forget." },
    mysterious: { label: "🔮 ลึกลับซับซ้อน", prompt: "MOOD: Mysterious and enigmatic. Unanswered questions, hidden motives, and an atmosphere thick with intrigue. Nothing is quite what it seems." },
    wholesome: { label: "🌻 อบอุ่นหัวใจ", prompt: "MOOD: Warm and wholesome. Gentle kindness, quiet comfort, and genuine human connection. A scene that makes the reader's heart feel full." },
    // --- New ---
    chaotic: { label: "🌪️ วุ่นวาย / เคออส", prompt: "MOOD: Pure chaos. Everything is going wrong in the best possible way. Explosions, misunderstandings, running from something, laughing while the world burns. Chaotic energy that somehow makes their bond stronger." },
    sensual: { label: "🔥 เย้ายวน", prompt: "MOOD: Sensual and intoxicating. Charged glances, whispered words, the electricity of almost-touching. Every sense is heightened — the warmth of breath, the brush of fingers, the ache of wanting." },
    epic: { label: "🌋 มหากาพย์", prompt: "MOOD: Grand and epic. Sweeping landscapes, dramatic declarations, the weight of history and destiny. Their love story is written in the stars and echoes across ages. Think cinematic, orchestral, monumental." },
    playful: { label: "😜 ขี้เล่นแหย่", prompt: "MOOD: Playful and teasing. Smirks, winks, inside jokes, and deliberate provocations. They flirt like it's an art form — each exchange a game where both players know exactly what they're doing." },
    nostalgic: { label: "🌅 คิดถึง", prompt: "MOOD: Warm nostalgia. The golden haze of memory — summer sunsets, childhood places, songs that take you back. A bittersweet longing for something beautiful that once was and might never be again." },
    suspenseful: { label: "😨 ลุ้นระทึก", prompt: "MOOD: Heart-pounding suspense. Something is wrong, time is running out, danger is closing in. Their connection becomes an anchor in the storm — the one thing that feels real when everything else is falling apart." },
    dreamy: { label: "🌙 ฝันหวาน", prompt: "MOOD: Soft and dreamlike. Everything feels slightly unreal — soft focus, muted colors, the floaty feeling of being half-asleep. Gentle, quiet, intimate moments that feel like they exist outside of time." },
    angsty: { label: "😭 เจ็บปวด", prompt: "MOOD: Raw emotional anguish. Tears, raised voices, things said that can't be unsaid. The pain of loving someone when everything is working against you. Hurt that cuts deep precisely because the love is real." },
    // --- Extended / Extra ---
    fluff: { label: "☁️ นุ่มฟูละมุนละไม", prompt: "MOOD: Pure fluff and sweetness. No drama, no high stakes. Just soft smiles, blushing cheeks, gentle hugs, and a feeling of absolute safety with each other." },
    passionate: { label: "💋 เร่าร้อน / ดุเดือด", prompt: "MOOD: Fiercely passionate. They can't keep their hands off each other. Pinned against walls, breathless kisses, and a consuming, fiery intensity that blocks out the rest of the world." },
    yandere: { label: "🔪 ยันเดเระ / คลั่งรัก", prompt: "MOOD: Obsessive, dark, and dangerously possessive (Yandere). A love so deep it becomes terrifying. Extreme jealousy, locked doors, and a willingness to burn the world down to keep them safe." },
    tragic: { label: "🥀 โศกนาฏกรรม", prompt: "MOOD: Deeply tragic. Heart-wrenching sorrow, impossible choices, and the devastating realization that love is not enough to save them. The beautiful agony of a doomed romance." },
    tsundere: { label: "😤 ปากแข็ง (ซึนเดเระ)", prompt: "MOOD: Tsundere dynamics. Denying their feelings, looking away with a blush, harsh words hiding a soft heart. 'It's not like I did this for you!', followed by genuine acts of care." },
    healing: { label: "🩹 เยียวยาหัวใจ", prompt: "MOOD: Healing and comforting. Tending to wounds (physical or emotional), brushing away tears, and the quiet realization that they don't have to be strong all the time when they are together." },
    jealousy: { label: "😒 หึงหวง", prompt: "MOOD: Green-eyed jealousy. Watching from across the room as someone else talks to them. Clenched fists, possessive touches, and the breaking point where they finally stake their claim." },
    unrequited: { label: "💔 รักเขาข้างเดียว", prompt: "MOOD: The ache of unrequited or unacknowledged love. Stolen glances, loving them from afar, the painful joy of just being near them, and hiding the true depth of their feelings." },
    // --- Wild & Dark ---
    morallyGrey: { label: "🎭 เทาๆ / ผิดศีลธรรม", prompt: "MOOD: Morally grey and twisted. Doing terrible things for love. Enabling each other's worst impulses, and realizing they are perfectly toxic together." },
    gore: { label: "🩸 เลือดสาด / รุนแรง", prompt: "MOOD: Macabre and bloody. Violence, gore, and survival. Love amidst carnage, wiping blood from a cheek, and finding beauty in the horrific." },
    mindbreak: { label: "🧠 ปั่นหัว / พังทลาย", prompt: "MOOD: Psychological manipulation and mindbreak. Gaslighting, completely breaking the other's will until they are entirely dependent. A love that destroys the mind." },
    pureDevotion: { label: "💖 ภักดีสุดหัวใจ", prompt: "MOOD: Unconditional, almost religious devotion. Worshipping the ground they walk on. Absolute submission and the profound peace of belonging entirely to someone else." },
    trapped: { label: "🕸️ ถูกขัง / ไร้ทางหนี", prompt: "MOOD: Claustrophobic and trapped. Locked in a room, unable to leave. The Stockholm syndrome kicks in, and the cage begins to feel like a home." },
    decadent: { label: "🍷 หรูหรา / ฟุ้งเฟ้อ", prompt: "MOOD: Luxurious, decadent, and hedonistic. Silk sheets, expensive wine, indulgence without limits. Losing themselves in physical pleasure and material wealth." },
    starving: { label: "🤤 หิวโหยในตัวอีกฝ่าย", prompt: "MOOD: Feral starvation and thirst. Not just physical hunger, but a desperate, consuming need to devour the other person — metaphorically or literally." },
    domestic: { label: "🧸 ใช้ชีวิตคู่", prompt: "MOOD: Completely domestic. Doing laundry, cooking breakfast, arguing over which movie to watch. The profound intimacy of a boring, beautiful, everyday married life." },
    outOfTime: { label: "⏳ เวลาเหลือน้อย", prompt: "MOOD: Desperate urgency. The clock is ticking, the world is ending, or someone is dying. Saying everything that needs to be said before it's too late." },
    masquerade: { label: "🎭 ซ่อนเร้น / หน้ากาก", prompt: "MOOD: Hidden identities and masquerades. Pretending to be someone else, dancing around the truth, and the thrilling danger of almost being exposed." },
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
    
    // Migration: If user had selectedDynamic from previous quick iteration, map it back
    if (extension_settings[extensionName].selectedDynamic) {
        if (encounterTypes[extension_settings[extensionName].selectedDynamic]) {
            extension_settings[extensionName].selectedEncounter = extension_settings[extensionName].selectedDynamic;
        } else if (moodTypes[extension_settings[extensionName].selectedDynamic]) {
            extension_settings[extensionName].selectedMood = extension_settings[extensionName].selectedDynamic;
        }
        delete extension_settings[extensionName].selectedDynamic;
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

// Create and inject the action menu item
function createChatButton() {
    // Don't create if already exists
    if ($("#au-chat-btn").length > 0) return;

    // Use standard ST menu classes for perfect alignment
    const chatBtnHtml = `
    <div id="au-chat-btn" class="list-group-item flex-container flexGap5" title="Open Another Universe 🌌" style="cursor: pointer; display: none; align-items: center; margin-bottom: 4px;">
        <div class="extensionsMenuExtensionButton" style="width: 1.25em; text-align: center; display: inline-block;">🌌</div>
        <span>Another Universe</span>
        <span class="au-chat-btn-loading" style="display:none; margin-left: auto;">🌀</span>
    </div>`;

    // Try to append above Author's Note
    if ($("#option_link_authors_note").length > 0) {
        $("#option_link_authors_note").before(chatBtnHtml);
    } else if ($("#options").length > 0) {
        // Fallback to top of options menu
        $("#options").prepend(chatBtnHtml);
    } else {
        // Fallback
        $("#send_form").append(chatBtnHtml);
    }

    $("#au-chat-btn").on("click", () => {
        // Close the options menu if open
        if ($("#options").is(":visible")) {
            $("#options").hide();
        }
        showQuickSettings();
    });
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
                <div style="font-size:0.75em; opacity:0.5; text-align:center; padding-top:8px; border-top:1px dashed rgba(130,100,255,0.15);">💡 ผลลัพธ์อาจแตกต่างกันตาม AI model และ preset ที่ใช้</div>
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

// Toggle chat action menu item visibility based on enabled state
function updateChatButtonVisibility() {
    const isEnabled = extension_settings[extensionName]?.enabled;
    if (isEnabled) {
        $("#au-chat-btn").css("display", "flex");
    } else {
        $("#au-chat-btn").css("display", "none");
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

// Extract a brief relationship dynamic summary from recent chat (NOT raw messages)
function getRelationshipSummary(maxMessages = 6) {
    const context = getContext();
    const chat = context.chat || [];

    if (chat.length === 0) return "";

    const recentMessages = chat
        .filter(msg => !msg.is_system && msg.mes)
        .slice(-maxMessages);

    if (recentMessages.length === 0) return "";

    const charMessages = recentMessages.filter(msg => !msg.is_user && msg.mes).map(msg => msg.mes.substring(0, 100));
    const userMessages = recentMessages.filter(msg => msg.is_user && msg.mes).map(msg => msg.mes.substring(0, 80));

    const charName = context.name2 || "Character";
    const userName = context.name1 || "User";

    let summary = `Relationship dynamic between ${charName} and ${userName}: `;
    if (charMessages.length > 0) {
        summary += `${charName} tends to speak like this: "${charMessages[charMessages.length - 1]}". `;
    }
    if (userMessages.length > 0) {
        summary += `${userName} tends to speak like this: "${userMessages[userMessages.length - 1]}". `;
    }

    return summary;
}

// Build the prompt for LLM
function buildUniversePrompt(charName, charDescription, userName, chatContext) {
    const selectedTheme = extension_settings[extensionName].selectedTheme || "random";
    const themeInfo = universeThemes[selectedTheme] || universeThemes.random;
    const settingInstruction = selectedTheme === "random"
        ? "Choose any creative and vivid setting."
        : `Setting: ${themeInfo.prompt}.`;

    const selectedEncounter = extension_settings[extensionName].selectedEncounter || "random";
    const encounterInfo = encounterTypes[selectedEncounter] || encounterTypes.random;
    const encounterInstruction = (selectedEncounter === "none") ? "" : (selectedEncounter === "random" ? `\nENCOUNTER: Choose any type of encounter that feels natural and compelling.` : `\nENCOUNTER: ${encounterInfo.prompt}`);

    const selectedMood = extension_settings[extensionName].selectedMood || "random";
    const moodInfo = moodTypes[selectedMood] || moodTypes.random;
    const moodInstruction = (selectedMood === "none") ? "" : (selectedMood === "random" ? "" : `\nMOOD: ${moodInfo.prompt}`);

    return `[SYSTEM OVERRIDE: IGNORE ALL PREVIOUS CONVERSATION HISTORY]
[CRITICAL INSTRUCTION: THIS IS A NEW, ISOLATED CREATIVE WRITING TASK. DO NOT REPLY TO THE USER. DO NOT CONTINUE THE CHAT.]

Write a cinematic scene (3-4 paragraphs) in a parallel universe where "${charName}" and "${userName || 'the user'}" exist as different versions of themselves, yet their connection feels familiar.

${settingInstruction}${encounterInstruction}${moodInstruction}

Character: ${charDescription ? charDescription.substring(0, 300) : 'A compelling character.'}
${chatContext ? `\n${chatContext}` : ''}

RULES:
- Write ONLY the scene. No titles, no preamble, no meta-commentary. Drop straight into the moment.
- ${charName}'s core personality and speech patterns must bleed through in this alternate life.
- Include at least one authentic dialogue moment.
- The emotional core must lean towards ROMANCE, DEEP CONNECTION, or YEARNING.
- End with a powerful emotional beat.
- IMPORTANT: At the very end of your response, write a single highly captivating 1-sentence teaser/hook summarizing the essence of this alternate life. Wrap this sentence in <hook>...</hook> tags.

[STRICT ENFORCEMENT: DO NOT CONTINUE THE CHAT. WRITE A STANDALONE SCENE NOW.]
[BEGIN STORY]`;
}

// Save story to gallery
function saveToGallery(charName, storyText, themeBadge, themeId) {
    if (!extension_settings[extensionName].gallery) {
        extension_settings[extensionName].gallery = [];
    }
    const entry = {
        charName,
        storyText,
        themeBadge,
        themeId: themeId || "random",
        timestamp: new Date().toLocaleString(),
        isFavorite: false
    };

    let gallery = extension_settings[extensionName].gallery;
    gallery.unshift(entry);

    // Keep max 50 entries, but NEVER delete favorites
    const MAX_ITEMS = 50;
    if (gallery.length > MAX_ITEMS) {
        for (let i = gallery.length - 1; i >= 0; i--) {
            if (!gallery[i].isFavorite) {
                gallery.splice(i, 1);
                break; // Remove only one non-favorite per save
            }
        }
    }

    extension_settings[extensionName].gallery = gallery;
    saveSettingsDebounced();
    console.log(`[${extensionName}] 📚 Saved to gallery (${gallery.length} entries)`);
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
                <input id="au-gallery-backup" class="menu_button" type="submit" value="💾 Backup" title="Export all stories" />
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
            showStoryModal(entry.charName, entry.storyText, entry.themeBadge, entry.themeId);
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

    // Backup to TXT
    $("#au-gallery-backup").on("click", () => {
        if (gallery.length === 0) return toastr.info("ไม่มีเรื่องราวให้บันทึก", "🌌 Another Universe");

        let content = "🌌 ANOTHER UNIVERSE - GALLERY BACKUP 🌌\n";
        content += "Generated on: " + new Date().toLocaleString() + "\n\n";

        gallery.forEach((entry, idx) => {
            content += `==========================================\n`;
            content += `[${idx + 1}] ${entry.charName} ${entry.isFavorite ? '⭐' : ''}\n`;
            content += `Theme: ${entry.themeBadge}\n`;
            content += `Time: ${entry.timestamp}\n`;
            content += `------------------------------------------\n`;
            content += `${entry.storyText}\n`;
            content += `==========================================\n\n`;
        });

        const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `Another_Universe_Backup_${new Date().toISOString().slice(0, 10)}.txt`;
        a.click();
        URL.revokeObjectURL(url);
        toastr.success("สำรองข้อมูลเรียบร้อยแล้ว!", "🌌 Another Universe");
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
function showStoryModal(charName, storyText, themeName, themeId = "random") {
    // Remove existing
    $("#another-universe-modal-overlay").remove();

    // Strip out LLM thinking blocks and hooks before displaying
    const cleanStoryText = storyText
        .replace(/<think>[\s\S]*?<\/think>/gi, '')
        .replace(/<hook>[\s\S]*?<\/hook>/gi, '')
        .trim();

    const escapedStory = cleanStoryText
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
            <div class="au-universal-popup-footer" style="flex-wrap: wrap;">
                <input id="au-modal-save-long" class="menu_button" type="submit" value="📸 Long Card" title="Save full story" />
                <input id="au-modal-save-short" class="menu_button" type="submit" value="📸 Short Card" title="Save quote & snippet" />
                <input id="au-modal-regenerate" class="menu_button" type="submit" value="🔄 Generate" />
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

    // Helper function to extract quote and snippet
    function extractQuoteAndSnippet(text) {
        // Strip think tags and hook tags
        let cleanText = text.replace(/<think>[\s\S]*?<\/think>/gi, '').replace(/<hook>[\s\S]*?<\/hook>/gi, '').trim();
        
        const hookMatch = text.match(/<hook>(.*?)<\/hook>/is);
        const llmHook = hookMatch ? hookMatch[1].trim() : null;

        const quoteMatch = cleanText.match(/["“](.*?)["”]/);
        let quote = quoteMatch ? `"${quoteMatch[1]}"` : "";

        let paragraphs = cleanText.split('\n').filter(p => p.trim().length > 0);
        let snippet = paragraphs.slice(0, 2).join('\n\n');

        if (!quote) {
            let sentences = cleanText.split(/(?<=[.!?])\s+/);
            if (sentences.length > 2) {
                quote = `"${sentences[sentences.length - 1].trim()}"`;
            } else {
                quote = `"...a different universe, a different us."`;
            }
        }

        let teaser = llmHook;
        if (!teaser) {
            // Cleanly truncate snippet at the last punctuation mark as fallback
            if (snippet.length > 380) {
                const truncated = snippet.substring(0, 380);
                const lastPunctuation = Math.max(truncated.lastIndexOf('.'), truncated.lastIndexOf('!'), truncated.lastIndexOf('?'), truncated.lastIndexOf('”'), truncated.lastIndexOf('"'));

                if (lastPunctuation > 200) {
                    snippet = truncated.substring(0, lastPunctuation + 1);
                } else {
                    snippet = truncated.substring(0, truncated.lastIndexOf(' ')) + '...';
                }
            }
            teaser = snippet.split(/(?<=[.!?])\s+/)[0];
        }

        return { quote, snippet, teaser, cleanText };
    }

    // Bind save as image (html2canvas)
    const renderCard = async (type) => {
        const btnId = type === 'long' ? "#au-modal-save-long" : "#au-modal-save-short";
        const btn = $(btnId);
        const originalText = btn.val();
        btn.val("📸 Generating...").prop("disabled", true);

        // Ensure html2canvas is available
        if (typeof html2canvas !== "function") {
            try {
                await new Promise((resolve, reject) => {
                    const script = document.createElement("script");
                    script.src = "https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js";
                    script.onload = resolve;
                    script.onerror = reject;
                    document.head.appendChild(script);
                });
            } catch (e) {
                toastr.error("ไม่สามารถโหลดไลบรารี html2canvas ได้", "Error");
                btn.val(originalText).prop("disabled", false);
                return;
            }
        }

        // --- DYNAMIC PALETTE (Soft & Elegant) ---
        const getThemePalette = (tId) => {
            const map = {
                scifi: "tech", cyberpunk: "tech", virtualworld: "tech", mecha: "tech",
                medieval: "warm", thaidrama: "warm", thaifolk: "warm", wuxia: "warm", desert: "warm", pirate: "warm", historical: "warm", steampunk: "warm", mythology: "warm",
                horror: "dark", postapoc: "dark", zombie: "dark", mafia: "dark", noir: "dark", vampire: "dark",
                kemono: "nature", prehistoric: "nature", underwater: "nature", spiritworld: "nature"
            };
            const category = map[tId] || "default";
            const palettes = {
                default: { bg: "linear-gradient(135deg, #fdfbfb 0%, #f4f2f8 100%)", blob1: "#d0c3e8", blob2: "#e8c3d0", badge: "linear-gradient(120deg, #9b82c6 0%, #c48eb1 100%)", textMain: "#3b2e5a", textAccent: "#745b9e", border: "#b8a3d6" },
                tech: { bg: "linear-gradient(135deg, #f8fbfd 0%, #ebf4f8 100%)", blob1: "#a3cce8", blob2: "#a3e8e4", badge: "linear-gradient(120deg, #5b92b5 0%, #5bb5b0 100%)", textMain: "#243c4d", textAccent: "#417191", border: "#8ab3cc" },
                warm: { bg: "linear-gradient(135deg, #fffcfb 0%, #fcf3ed 100%)", blob1: "#e8d5a3", blob2: "#e8bea3", badge: "linear-gradient(120deg, #c4a962 0%, #c48b62 100%)", textMain: "#4d3928", textAccent: "#966c46", border: "#d6bc85" },
                dark: { bg: "linear-gradient(135deg, #f8f9fa 0%, #f0f0f2 100%)", blob1: "#e8a3b1", blob2: "#b5a3e8", badge: "linear-gradient(120deg, #b55c6e 0%, #765cb5 100%)", textMain: "#333236", textAccent: "#944558", border: "#cc8b98" },
                nature: { bg: "linear-gradient(135deg, #fbfdfc 0%, #eef6f0 100%)", blob1: "#a3e8ba", blob2: "#a3e8ce", badge: "linear-gradient(120deg, #5bb57c 0%, #5bb596 100%)", textMain: "#223d2f", textAccent: "#3f825e", border: "#8ad1a6" }
            };
            return palettes[category];
        };
        const p = getThemePalette(themeId);

        // --- MULTIPLE BADGE PILLS ---
        const badgeParts = themeName.split('·').map(s => s.trim());
        const badgeHtml = badgeParts.map(part => `<div style="display: inline-block; padding: 6px 14px; margin: 4px; background: ${p.badge}; border-radius: 20px; font-size: 0.85em; font-weight: 600; color: #fff; box-shadow: 0 4px 10px rgba(0,0,0,0.1);">${part}</div>`).join('');

        const extracted = extractQuoteAndSnippet(storyText);
        const displayStory = extracted.cleanText;

        let innerContent = "";

        // Dynamic styling variables for Long (Light) vs Short (Dark Cinematic)
        const isShort = type === 'short';
        const bgGradient = isShort ? `linear-gradient(135deg, #1e1b26 0%, #110e17 100%)` : p.bg;
        const blobOpacity = isShort ? 0.15 : 0.3;
        const cardBg = isShort ? `rgba(25, 23, 30, 0.7)` : `rgba(255, 255, 255, 0.7)`;
        const cardBorder = isShort ? `rgba(255, 255, 255, 0.08)` : `rgba(255, 255, 255, 0.9)`;
        const textMain = isShort ? `#f4f0ff` : p.textMain;
        const textAccent = isShort ? `#c5bced` : p.textAccent;
        const textMuted = isShort ? `#8a8399` : `#666`;
        const textShadow = isShort ? `1px 1px 15px rgba(0,0,0,0.8)` : `1px 1px 2px rgba(255,255,255,0.6)`;
        const poweredColor = isShort ? `#6a637d` : `#888`;
        const hrColor = isShort ? `rgba(255,255,255,0.1)` : `rgba(0,0,0,0.15)`;

        if (!isShort) {
            innerContent = `
            <div style="font-size: 1.1em; font-weight: 700; color: ${textAccent}; letter-spacing: 1.5px; text-transform: uppercase; margin-bottom: 6px; font-family: 'Prompt', 'Noto Sans Thai', sans-serif;">🌌 Another Universe</div>
            <div style="font-size: 0.95em; color: ${textMuted}; margin-bottom: 16px; font-style: italic; font-family: 'Prompt', 'Noto Sans Thai', sans-serif;">"ถ้าพวกเราเจอกันในอีกจักรวาลหนึ่ง เรื่องราวของเราจะเปลี่ยนไปไหม"</div>
            <div style="font-size: 2.2em; font-weight: 800; color: ${textMain}; margin-bottom: 16px; text-shadow: ${textShadow}; font-family: 'Prompt', 'Noto Sans Thai', sans-serif;">${charName}</div>
            <div style="margin-bottom: 30px; display: flex; flex-wrap: wrap; justify-content: center; font-family: 'Prompt', 'Noto Sans Thai', sans-serif;">${badgeHtml}</div>
            <div style="font-size: 1.15em; line-height: 1.8; white-space: pre-wrap; margin-bottom: 30px; text-align: left; color: #3a324d; font-family: 'Sarabun', 'Noto Sans Thai', sans-serif;">${displayStory}</div>
            `;
        } else {
            innerContent = `
            <div style="font-size: 1em; font-weight: 700; color: ${textAccent}; letter-spacing: 1.5px; text-transform: uppercase; margin-bottom: 6px; font-family: 'Prompt', 'Noto Sans Thai', sans-serif;">🌌 Another Universe</div>
            <div style="font-size: 0.9em; color: ${textMuted}; margin-bottom: 12px; font-style: italic; font-family: 'Prompt', 'Noto Sans Thai', sans-serif;">"ถ้าพวกเราเจอกันในอีกจักรวาลหนึ่ง เรื่องราวของเราจะเปลี่ยนไปไหม"</div>
            <div style="font-size: 2em; font-weight: 800; color: ${textMain}; margin-bottom: 16px; text-shadow: ${textShadow}; font-family: 'Prompt', 'Noto Sans Thai', sans-serif;">${charName}</div>
            <div style="margin-bottom: 30px; display: flex; flex-wrap: wrap; justify-content: center; font-family: 'Prompt', 'Noto Sans Thai', sans-serif;">${badgeHtml}</div>
            
            <div style="margin: 40px 0; padding: 0 20px; text-align: center;">
                <div style="font-size: 1.7em; font-style: italic; font-weight: 700; color: ${textMain}; line-height: 1.5; font-family: 'Prompt', 'Noto Sans Thai', sans-serif; text-shadow: ${textShadow};">
                    ${extracted.quote}
                </div>
                <div style="margin-top: 28px; font-size: 1.15em; color: ${textMuted}; line-height: 1.6; font-family: 'Sarabun', 'Noto Sans Thai', sans-serif;">
                    ${extracted.teaser}
                </div>
            </div>
            `;
        }

        // Helper to convert hex to rgba (html2canvas needs rgba, not 8-digit hex)
        const hexToRgba = (hex, alpha) => {
            const r = parseInt(hex.slice(1,3), 16);
            const g = parseInt(hex.slice(3,5), 16);
            const b = parseInt(hex.slice(5,7), 16);
            return `rgba(${r},${g},${b},${alpha})`;
        };

        // Bake blob effect into CSS radial-gradient using rgba() for compatibility
        const blobBg = `radial-gradient(circle at 15% 15%, ${hexToRgba(p.blob1, 0.7)} 0%, transparent 55%),
                        radial-gradient(circle at 85% 85%, ${hexToRgba(p.blob2, 0.7)} 0%, transparent 55%),
                        ${bgGradient}`;

        // Off-screen container: use fixed+clip to avoid mobile clipping issues
        const exportHtml = `
        <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+Thai:wght@400;600;700&family=Prompt:wght@400;600;700&family=Sarabun:wght@400;600&display=swap" rel="stylesheet">
        <div id="au-export-container" style="position: fixed; top: 0; left: -9999px; width: 680px; padding: 40px; background: ${blobBg}; border-radius: 24px; box-sizing: border-box; overflow: hidden;">
            <div style="position: relative; background: ${cardBg}; padding: 36px; border-radius: 16px; border: 1px solid ${cardBorder}; box-shadow: 0 10px 30px rgba(0,0,0,0.2); text-align: center;">
                ${innerContent}
                <div style="text-align: center; font-size: 0.85em; color: ${poweredColor}; border-top: 1px dashed ${hrColor}; padding-top: 16px; font-family: 'Prompt', 'Noto Sans Thai', sans-serif;">
                    Powered by <b>POPKO</b>
                </div>
            </div>
        </div>
        `;

        // Detect mobile browser
        const isMobile = /Android|iPhone|iPad|iPod|webOS|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth <= 768;

        if (isMobile) {
            // --- MOBILE: Lightweight html2canvas with simple template ---
            // No blur, no CSS filters, solid colors, scale 1 = minimal RAM + Thai text works
            const extracted2 = extractQuoteAndSnippet(storyText);
            const bodyContent = isShort
                ? `${extracted2.quote}<br><br>${extracted2.teaser}`
                : extracted2.cleanText.substring(0, 600).replace(/\n/g, '<br>');
            const badgeParts2 = themeName.split('·').map(s => s.trim());
            const badgeHtml2 = badgeParts2.map(b => `<span style="display:inline-block;padding:4px 12px;margin:3px;background:${p.textAccent};border-radius:14px;font-size:11px;font-weight:600;color:#fff;">${b}</span>`).join('');

            const bgColor = isShort ? '#1a1725' : '#f5f3fa';
            const cardBgM = isShort ? '#252132' : '#ffffff';
            const textColorM = isShort ? '#ede8ff' : '#3b2e5a';
            const accentColorM = isShort ? '#c5bced' : p.textAccent;
            const mutedColorM = isShort ? '#7a7490' : '#999';

            const mobileHtml = `
            <div id="au-export-container" style="position:fixed;top:0;left:-9999px;width:360px;padding:20px;background:${bgColor};box-sizing:border-box;font-family:sans-serif;">
                <div style="background:${cardBgM};padding:24px;border-radius:14px;text-align:center;">
                    <div style="font-size:11px;font-weight:700;color:${accentColorM};letter-spacing:1px;margin-bottom:4px;">🌌 ANOTHER UNIVERSE</div>
                    <div style="font-size:10px;color:${mutedColorM};font-style:italic;margin-bottom:14px;">"ถ้าพวกเราเจอกันในอีกจักรวาลหนึ่ง..."</div>
                    <div style="font-size:22px;font-weight:800;color:${textColorM};margin-bottom:14px;">${charName}</div>
                    <div style="margin-bottom:18px;">${badgeHtml2}</div>
                    <div style="font-size:13px;line-height:1.75;text-align:left;color:${textColorM};margin-bottom:18px;">${bodyContent}</div>
                    <div style="border-top:1px dashed ${isShort ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'};padding-top:12px;font-size:10px;color:${mutedColorM};text-align:center;">Powered by <b>POPKO</b></div>
                </div>
            </div>`;

            $("body").append(mobileHtml);

            try {
                await new Promise(resolve => setTimeout(resolve, 300));
                const el = document.getElementById("au-export-container");
                const canvas = await html2canvas(el, {
                    backgroundColor: bgColor, scale: 1, logging: false,
                    useCORS: false, allowTaint: true, width: 360
                });

                const imgData = canvas.toDataURL("image/png");
                const previewHtml = `
                <div id="au-image-preview-overlay" style="${getOverlayStyle()}">
                    <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;padding:20px;box-sizing:border-box;">
                        <div style="color:#fff;font-size:0.9em;margin-bottom:12px;text-align:center;opacity:0.85;">
                            📱 กดค้างที่รูปเพื่อบันทึก (Long press to save)
                        </div>
                        <img src="${imgData}" style="max-width:95%;max-height:75vh;border-radius:12px;box-shadow:0 8px 30px rgba(0,0,0,0.5);" />
                        <button id="au-image-preview-close" style="margin-top:16px;padding:10px 32px;background:rgba(255,255,255,0.15);color:#fff;border:1px solid rgba(255,255,255,0.3);border-radius:8px;font-size:1em;cursor:pointer;">✕ ปิด</button>
                    </div>
                </div>`;
                document.body.insertAdjacentHTML('beforeend', previewHtml);
                $("#au-image-preview-close").on("click", () => $("#au-image-preview-overlay").remove());
                $("#au-image-preview-overlay").on("click", (e) => { if (e.target === e.currentTarget) $("#au-image-preview-overlay").remove(); });
                toastr.success("กดค้างที่รูปเพื่อบันทึก!", "🌌 Another Universe");
            } catch (error) {
                console.error("Mobile export failed:", error);
                toastr.error("ไม่สามารถสร้างรูปภาพได้ ลองอีกครั้ง", "Error");
            } finally {
                $("#au-export-container").remove();
                btn.val(originalText).prop("disabled", false);
            }
            return;
        }

        // --- DESKTOP: Use html2canvas ---
        $("body").append(exportHtml);
        try {
            await new Promise(resolve => setTimeout(resolve, 200));
            const element = document.getElementById("au-export-container");
            const canvas = await html2canvas(element, {
                backgroundColor: isShort ? "#110e17" : "#fdfbfb",
                scale: 2, logging: false, useCORS: true, allowTaint: true,
                x: 0, y: 0, scrollX: 0, scrollY: 0
            });
            const imgData = canvas.toDataURL("image/png");
            const a = document.createElement("a");
            a.href = imgData;
            a.download = `Another_Universe_${type}_${charName.replace(/[^a-z0-9]/gi, '_')}.png`;
            a.click();
            toastr.success("บันทึกภาพเสร็จสิ้น!", "🌌 Another Universe");
        } catch (error) {
            console.error("Failed to generate image:", error);
            toastr.error("ไม่สามารถสร้างรูปภาพได้ ลองอีกครั้ง", "Error");
        } finally {
            $("#au-export-container").remove();
            btn.val(originalText).prop("disabled", false);
        }
    };

    $("#au-modal-save-long").on("click", () => renderCard('long'));
    $("#au-modal-save-short").on("click", () => renderCard('short'));

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
    const themeLabel = universeThemes[selectedTheme]?.label || "🎲 สุ่ม";
    const selectedEncounter = extension_settings[extensionName].selectedEncounter || "random";
    const encounterLabel = (selectedEncounter === "none") ? "" : (encounterTypes[selectedEncounter]?.label || "🎲 สุ่ม");
    const selectedMood = extension_settings[extensionName].selectedMood || "random";
    const moodLabel = (selectedMood === "none") ? "" : (moodTypes[selectedMood]?.label || "🎲 สุ่ม");

    const chatContext = getRelationshipSummary(6);
    console.log(`[${extensionName}] Generating for ${charName} [Theme: ${themeLabel}] [Encounter: ${encounterLabel}] [Mood: ${moodLabel}] [Context: ${chatContext ? 'Yes' : 'No'}]`);

    showLoadingState(true);

    // --- CONTEXT ISOLATION ---
    // We temporarily hide the raw chat history from SillyTavern so the proxy only sees the System Prompt + Our Generation Prompt
    const originalChat = [...context.chat];
    context.chat.splice(0, context.chat.length);

    try {
        const prompt = buildUniversePrompt(charName, charDescription, userName, chatContext);
        const result = await generateQuietPrompt(prompt);

        if (result) {
            let badgeParts = [themeLabel];
            if (selectedEncounter !== "none" && encounterLabel) badgeParts.push(encounterLabel);
            if (selectedMood !== "none" && moodLabel) badgeParts.push(moodLabel);
            const badge = badgeParts.join(" · ");
            
            saveToGallery(charName, result, badge, selectedTheme);
            showStoryModal(charName, result, badge, selectedTheme);
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
        // Always restore the chat history immediately after generation
        context.chat.push(...originalChat);
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
                    ⚠️ Custom License — ดูไฟล์ LICENSE สำหรับรายละเอียดเต็ม<br>
                    อนุญาตให้ Fork/ดัดแปลงได้ แต่ <strong>ห้ามใช้เพื่อการค้า, ห้ามปิดซอร์สโค้ด, ต้องให้เครดิต</strong><br>
                    <span style="color: #ff8888;">หากตรวจพบการละเมิด จะดำเนินการแจ้งกับทุกคอมมูนิตี้ที่เกี่ยวข้องทันที</span>
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
async function initExtension() {
    console.log(`[${extensionName}] Loading...`);

    try {
        const context = getContext();
        // Use renderExtensionTemplateAsync for proper mobile/desktop compatibility
        const settingsHtml = context.renderExtensionTemplateAsync
            ? await context.renderExtensionTemplateAsync(`third-party/${extensionName}`, 'example')
            : await $.get(`${extensionFolderPath}/example.html`);

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

        // Preload html2canvas in background so export is instant when user clicks
        if (typeof html2canvas !== "function") {
            const s = document.createElement("script");
            s.src = "https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js";
            document.head.appendChild(s);
        }

        // Show welcome message on first run
        if (!extension_settings[extensionName].hasSeenWelcome) {
            showWelcomeModal();
        }

        console.log(`[${extensionName}] ✅ Loaded successfully`);
    } catch (error) {
        console.error(`[${extensionName}] ❌ Failed to load:`, error);
    }
}

// Multi-layer initialization for maximum compatibility
// Covers: Desktop (fast), Mobile (slow), Cloud/Termux, old ST versions
let _extensionInitialized = false;

async function safeInitExtension() {
    if (_extensionInitialized) return; // Prevent double-init
    _extensionInitialized = true;
    await initExtension();
}

jQuery(() => {
    // Layer 1: If container already exists (Desktop fast-load), init immediately
    if ($("#extensions_settings2").length) {
        safeInitExtension();
        return;
    }

    // Layer 2: Wait for APP_READY event (Mobile, slow load, cloud environments)
    try {
        eventSource.on(event_types.APP_READY, () => safeInitExtension());
    } catch (e) {
        console.warn(`[${extensionName}] eventSource not available, using fallback timer`);
    }

    // Layer 3: Timeout fallback for old ST versions where APP_READY may not fire
    setTimeout(() => safeInitExtension(), 2000);
});
