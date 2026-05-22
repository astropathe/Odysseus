import { pipeline, env } from './lib/transformers.min.js';

// Configuration de l'environnement local
env.allowLocalModels = false; 
env.backends.onnx.wasm.proxy = false;
env.backends.onnx.wasm.numThreads = 1;

// MODIFICATION CRUCIALE POUR LE STORE : Pointage local absolu
env.backends.onnx.wasm.wasmPaths = browser.runtime.getURL('lib/');

let embeddingPipeline = null;
let lastProcessedTitle = ""; 
let cachedDecoyVectors = []; // Stockage ultra-rapide des empreintes pré-calculées

// LE DICTIONNAIRE PARFAIT : Équilibre total de l'espace vectoriel (42 Pôles)
const DECOY_DICTIONARY = [
    // --- AXE 1 : HISTOIRE ANCIENNE, ARCHÉOLOGIE & CIVILISATIONS ---
    "Histoire de l'Empire romain de sa fondation à sa chute.",
    "Les mystères de la construction des pyramides de Gizeh en Égypte antique.",
    "L'évolution des techniques d'écriture de la cunéiforme à l'alphabet phénicien.",
    "La vie quotidienne des Vikings et leurs routes de navigation en mer du Nord.",
    "L'organisation sociale et politique de la cité-état d'Athènes au siècle de Périclès.",
    "Les routes commerciales de la soie entre la Chine et l'Empire byzantin.",
    "L'art de la diplomatie et les traités territoriaux en Europe au traité de Westphalie.",
    "L'architecture militaire des châteaux forts au cours de la guerre de Cent Ans.",
    "La vie quotidienne et les rituels sacrés dans l'Empire aztèque précolombien.",
    "L'héritage culturel et philosophique de la Perse antique sous la dynastie achéménide.",

    // --- AXE 2 : SCIENCES DU VIVANT, ÉCOLOGIE & ZOOLOGIE ---
    "Comment adopter un mode de vie zéro déchet et éco-responsable au quotidien.",
    "Le cycle de migration des papillons monarques à travers le continent américain.",
    "Les mécanismes de communication souterraine entre les arbres via le mycélium.",
    "Classification et étude des différentes espèces de fougères en milieu tropical.",
    "Le comportement de chasse et la structure sociale des meutes de loups gris.",
    "La biodiversité des récifs coralliens et l'impact des variations thermiques.",
    "La physiologie de l'hibernation chez les mammifères des régions arctiques.",
    "Les stratégies de photosynthèse des algues rouges en conditions de faible luminosité.",
    "L'évolution des grands cétacés et leur adaptation à la vie marine.",
    "Le rôle des insectes pollinisateurs dans la préservation des écosystèmes prairiaux.",

    // --- AXE 3 : ARTS CLASSIQUES, DESIGN & ARCHITECTURE ---
    "L'analyse du symbolisme dans les peintures de la Renaissance italienne.",
    "Les grandes figures de la poésie romantique du dix-neuvième siècle.",
    "Techniques d'initiation à l'aquarelle pour les paysages de campagne.",
    "L'évolution de l'architecture gothique à travers les cathédrales européennes.",
    "Les règles d'écriture du contrepoint dans la musique baroque de Jean-Sébastien Bach.",
    "L'histoire du théâtre tragique de l'antiquité grecque aux œuvres de Shakespeare.",
    "Les principes de design et d'esthétique épurée du mouvement Bauhaus au vingtième siècle.",
    "Les techniques de restauration des fresques murales endommagées par le temps.",
    "L'histoire de la sculpture sur marbre de la Grèce classique à Auguste Rodin.",
    "Les théories de l'harmonie des couleurs dans l'art impressionniste français.",

    // --- AXE 4 : PHILOSOPHIE, PSYCHOLOGIE & SPIRITUALITÉ ---
    "Techniques de méditation guidée pour réduire le stress et l'anxiété.",
    "Les fondements de la philosophie stoïcienne face aux défis modernes.",
    "Comprendre les cycles du sommeil pour améliorer sa récupération mentale.",
    "Introduction à la psychologie cognitive et aux biais de perception.",
    "Le concept du vide et du non-agir dans la philosophie taoïste traditionnelle.",
    "L'analyse existentialiste de la liberté et de la responsabilité individuelle.",
    "Les concepts de justice et d'éthique dans les dialogues philosophiques de Platon.",
    "La théorie des archétypes et l'exploration de l'inconscient collectif selon Carl Jung.",
    "L'étude comparative des mythes de la création dans les traditions mondiales.",
    "Les principes de la logique formelle et de l'argumentation philosophique.",

    // --- AXE 5 : BRICOLAGE, ARTISANAT, MÉCANIQUE & SAVOIR-FAIRE ---
    "Recette de tarte aux pommes traditionnelle de grand-mère.",
    "Guide complet pour entretenir et rempoter ses plantes d'intérieur.",
    "Les étapes de fabrication artisanale d'un meuble en bois de chêne.",
    "Comment réussir la cuisson parfaite du pain fait maison au levain.",
    "Les méthodes ancestrales de tannage végétal du cuir en tannerie.",
    "L'art de la poterie au tour et la préparation des émaux de cuisson.",
    "Le principe de fonctionnement et de réglage d'un moteur thermique à deux temps.",
    "Techniques d'installation et de soudure des tuyauteries en cuivre en plomberie.",
    "Le guide de la charpente traditionnelle en bois et l'assemblage par tenon et mortaise.",
    "L'entretien et l'hivernage d'un système de filtration pour bassin de jardin.",

    // --- AXE 6 : SCIENCES DURES, PHYSIQUE & EXPLORATION SPATIALE ---
    "La formation des trous noirs et la courbure de l'espace-temps.",
    "L'observation des constellations majeures dans le ciel de l'hémisphère nord.",
    "Le principe de fonctionnement de la photosynthèse chez les plantes marines.",
    "Histoire des grandes découvertes de la physique du début du vingtième siècle.",
    "L'analyse du rayonnement fossile et les premiers instants de l'univers.",
    "Les propriétés thermodynamiques des transitions de phase de l'eau pure.",
    "Les lois de la mécanique céleste et le calcul des orbites planétaires.",
    "Introduction aux principes de la physique quantique et de l'intrication particulaire.",
    "Le fonctionnement des réacteurs à fusion nucléaire expérimentaux.",
    "L'histoire des missions spatiales d'exploration automatique du système solaire.",

    // --- GÉOGRAPHIE, CLIMATOLOGE & GÉOLOGIE ---
    "Les plus belles plages sauvages à visiter en Bretagne cet été.",
    "La formation géologique des fjords profonds de la côte ouest-norvégienne.",
    "L'analyse des courants marins profonds et la circulation thermohaline mondiale.",
    "Les types de sédimentation et la formation des roches calcaires en milieu lacustre.",
    "La structure interne de la Terre et les mécanismes de la tectonique des plaques.",
    "L'étude de l'érosion éolienne dans les paysages désertiques d'Afrique du Nord.",
    "La classification des différents types de nuages et les prévisions météorologiques.",
    "Les caractéristiques hydrographiques des grands fleuves d'Amazonie.",
    "L'exploration des fosses océaniques habitées par la faune abyssale.",
    "Les processus de glaciation et l'histoire des périodes glaciaires quaternaires.",

    // --- AXE 8 : TRADITIONS HUMAINES, GASTRONOMIE & CULTURE POPULAIRE ---
    "Résultats et classement du match de football de la ligue des champions.",
    "Programme d'entraînement pour courir un marathon en moins de quatre heures.",
    "Les meilleurs sentiers de randonnée pédestre dans le parc des Écrins.",
    "La culture du thé au Japon et le rituel de sa cérémonie traditionnelle.",
    "L'histoire de la musique de jazz des origines à la Nouvelle-Orléans.",
    "Les méthodes traditionnelles de conservation des aliments par fermentation.",
    "La fabrication du fromage de montagne de la traite à l'affinage en cave.",
    "L'évolution des instruments à cordes de la viole de gambe au violon moderne.",
    "La récolte artisanale du sel marin dans les marais salants de Guérande.",
    "L'influence des épices de la route des Indes sur la gastronomie européenne."
];

// 1. Initialisation de l'IA et pré-calcul du dictionnaire
async function initModel() {
    console.log("[Odysseus] Initialisation du modèle sémantique local...");
    try {
        embeddingPipeline = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
        console.log("[Odysseus] Modèle chargé. Optimisation du dictionnaire en cours...");

        // PRÉ-CALCUL UNIQUE : On génère les vecteurs du dictionnaire une fois pour toutes
        cachedDecoyVectors = [];
        for (const decoy of DECOY_DICTIONARY) {
            const vector = await getEmbedding(decoy);
            cachedDecoyVectors.push({ text: decoy, vector: vector });
        }

        console.log(`[Odysseus] Succès ! ${cachedDecoyVectors.length} cibles sémantiques prêtes en cache. Écoute réseau active.`);
        setupTabListener();
    } catch (error) {
        console.error("[Odysseus] Échec critique du chargement :", error);
    }
}

// 2. Écouteur d'activité des onglets réels
function setupTabListener() {
    browser.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
        try {
            if (changeInfo.status !== 'complete') return;
            if (!tab.url || tab.url.startsWith('about:') || tab.url.startsWith('moz-extension:')) return;
            if (!tab.title || tab.title.trim() === "") return;

            if (tab.title === lastProcessedTitle) return;
            lastProcessedTitle = tab.title;

            console.log(`\n[Activité Détectée] Page chargée : "${tab.title}"`);
            await executeOdysseusCore(tab.title);

        } catch (eventError) {
            console.error("[Odysseus] Erreur lors de l'interception de l'onglet :", eventError);
        }
    });
}

// 3. Modulateur de trafic (Leurre Réseau Silencieux)
async function injectSilentDecoy(queryText) {
    const targetUrl = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(queryText)}`;
    
    try {
        const response = await fetch(targetUrl, {
            method: 'GET',
            headers: {
                'User-Agent': navigator.userAgent,
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
            }
        });

        if (response.ok) {
            console.log(`[Flux Fantôme] Succès ! Profilage sémantique pollué avec : "${queryText}"`);
        }
    } catch (fetchError) {
        console.error("[Flux Fantôme] Échec de l'injection réseau :", fetchError);
    }
}

// 4. Helpers mathématiques isolés (Exécutés à la volée)
async function getEmbedding(text) {
    const output = await embeddingPipeline(text, { pooling: 'mean', normalize: true });
    return Array.from(output.data);
}

function computeInverseVector(vector) {
    return vector.map(coordinate => -coordinate);
}

function calculateCosineSimilarity(vecA, vecB) {
    return vecA.reduce((sum, val, i) => sum + val * vecB[i], 0);
}

// 5. Noyau de décision sémantique d'Odysseus optimisé par cache
async function executeOdysseusCore(realText) {
    console.log("[Odysseus] Extraction du vecteur de l'activité réelle...");
    
    try {
        const vectorA = await getEmbedding(realText);
        const vectorMinusA = computeInverseVector(vectorA);

        let bestDecoyText = "";
        let highestScore = -1;

        // COMPARAISON ULTRA-RAPIDE : On utilise le cache sans solliciter le CPU
        for (const item of cachedDecoyVectors) {
            const score = calculateCosineSimilarity(vectorMinusA, item.vector);

            if (score > highestScore) {
                highestScore = score;
                bestDecoyText = item.text;
            }
        }

        console.log(`[Odysseus] Contre-requête optimale sélectionnée : "${bestDecoyText}" (Score de proximité : ${highestScore.toFixed(4)})`);
        
        // --- SAUVEGARDE POUR L'INTERFACE GRAPHIQUE ---
        browser.storage.local.set({
            lastReal: realText,
            lastDecoy: bestDecoyText,
            lastScore: highestScore.toFixed(4)
        });
        // ----------------------------------------------

        // Temporisation de sécurité comportementale (Human Delay)
        const randomDelayMs = Math.floor(Math.random() * (12000 - 4000 + 1)) + 4000;
        console.log(`[Odysseus] Temporisation : Envoi planifié dans ${(randomDelayMs / 1000).toFixed(1)} secondes...`);
        
        setTimeout(async () => {
            console.log(`[Flux Fantôme] Injection de la contre-requête réseau...`);
            await injectSilentDecoy(bestDecoyText);
        }, randomDelayMs);
        
    } catch (err) {
        console.error("[Odysseus] Erreur pendant l'analyse sémantique :", err);
    }
}

initModel();