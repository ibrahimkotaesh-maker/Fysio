import { supabase } from '@/lib/supabase';
import { practiceToSlug } from '@/lib/practiceSlug';
import { toSlug } from '@/lib/slug';
import Link from 'next/link';
import { MapPin, Star, Phone, Globe, ArrowRight, ChevronDown, Activity, Users, Search } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import StarRating from '@/components/StarRating';

// ─── Specialization Metadata ───────────────────────────────────────────────
// Human-readable descriptions optimized for SEO
const SPEC_META = {
    'manuele therapie': {
        title: 'Manueel Therapeut',
        plural: 'manueel therapeuten',
        description: 'Manuele therapie richt zich op klachten aan het bewegingsapparaat. Een manueel therapeut behandelt rug-, nek- en gewrichtsklachten door middel van mobilisatie en manipulatie technieken.',
        longDesc: 'Bij manuele therapie onderzoekt en behandelt de therapeut specifieke gewrichten en spieren. De behandeling bestaat uit mobilisaties (zacht bewegen van gewrichten), manipulaties (korte, snelle bewegingen) en oefentherapie. Manuele therapie is bijzonder effectief bij chronische rugpijn, nekklachten, hoofdpijn en gewrichtsproblemen.',
        keywords: ['manuele therapie', 'manueel therapeut', 'gewrichtsklachten', 'rugpijn behandeling'],
    },
    'revalidatie': {
        title: 'Revalidatie Fysiotherapeut',
        plural: 'revalidatie fysiotherapeuten',
        description: 'Revalidatie fysiotherapie helpt bij het herstel na een operatie, blessure of ziekte. De therapeut begeleidt je stap voor stap terug naar je normale functioneren.',
        longDesc: 'Revalidatie fysiotherapie is gericht op het zo goed mogelijk herstellen van lichamelijke functies na een operatie, ongeval of ernstige ziekte. Het behandelplan is altijd op maat en kan bestaan uit krachttraining, mobiliteits­oefeningen, balans­training en conditie­opbouw.',
        keywords: ['revalidatie', 'herstel na operatie', 'fysiotherapie revalidatie'],
    },
    'dry needling': {
        title: 'Dry Needling Therapeut',
        plural: 'dry needling therapeuten',
        description: 'Dry needling is een behandeltechniek waarbij dunne naalden worden gebruikt om triggerpoints (pijnlijke spierknobbels) aan te pakken en spierpijn te verlichten.',
        longDesc: 'Bij dry needling prikt de fysiotherapeut met een dun naaldje in een triggerpoint — een pijnlijk, gespannen punt in de spier. Dit veroorzaakt een korte spierreactie waarna de spier ontspant. De techniek is effectief bij chronische spierpijn, spanningshoofdpijn, tennisarm en schouderpijn.',
        keywords: ['dry needling', 'triggerpoint therapie', 'spierpijn behandeling'],
    },
    'sportfysiotherapie': {
        title: 'Sportfysiotherapeut',
        plural: 'sportfysiotherapeuten',
        description: 'Een sportfysiotherapeut is gespecialiseerd in sportblessures. Van preventie tot behandeling en terug naar je sport — de sportfysio helpt sporters op elk niveau.',
        longDesc: 'Sportfysiotherapie richt zich op het voorkomen, diagnosticeren en behandelen van sportblessures. De sportfysiotherapeut heeft extra kennis van sportspecifieke belasting, trainingsopbouw en blessurepreventie. Veelvoorkomende klachten zijn knieblessures, enkelverzwikkingen, hamstring­blessures en overbelasting.',
        keywords: ['sportfysiotherapeut', 'sportblessure', 'sportfysiotherapie', 'blessure behandeling'],
    },
    'ademhalingstherapie': {
        title: 'Ademhalingstherapeut',
        plural: 'ademhalingstherapeuten',
        description: 'Ademhalingstherapie helpt bij longaandoeningen zoals astma en COPD. De therapeut leert je technieken om je ademhaling te verbeteren en klachten te verminderen.',
        longDesc: 'Ademhalingstherapie (ook wel respiratoire fysiotherapie) richt zich op het verbeteren van de longfunctie en ademhaling. De therapeut leert ademhalings­technieken, slijm­mobilisatie en conditie­opbouw. Effectief bij COPD, astma, long-COVID en na een longontsteking.',
        keywords: ['ademhalingstherapie', 'COPD fysiotherapie', 'longfysiotherapie'],
    },
    'medical taping': {
        title: 'Medical Taping Therapeut',
        plural: 'medical taping therapeuten',
        description: 'Medical taping (kinesiotaping) ondersteunt spieren en gewrichten met elastische tape. Het verlicht pijn, vermindert zwelling en ondersteunt het herstelproces.',
        longDesc: 'Bij medical taping brengt de fysiotherapeut elastische tape aan op de huid volgens speciale technieken. De tape stimuleert de bloedcirculatie, ondersteunt spieren en vermindert pijn en zwelling. Het wordt vaak ingezet als aanvulling op andere behandelingen bij sportblessures, rugpijn en schouderproblemen.',
        keywords: ['medical taping', 'kinesiotaping', 'tape fysiotherapie'],
    },
    'neurologische fysiotherapie': {
        title: 'Neurologisch Fysiotherapeut',
        plural: 'neurologische fysiotherapeuten',
        description: 'Neurologische fysiotherapie helpt mensen met neurologische aandoeningen zoals een beroerte, MS of Parkinson om beter te bewegen en functioneren.',
        longDesc: 'Na een beroerte (CVA), bij multiple sclerose (MS), de ziekte van Parkinson of andere neurologische aandoeningen kan de neurologisch fysiotherapeut helpen. De behandeling richt zich op het verbeteren van motoriek, balans, coördinatie en dagelijkse activiteiten.',
        keywords: ['neurologische fysiotherapie', 'CVA revalidatie', 'fysiotherapie Parkinson'],
    },
    'echografie': {
        title: 'Echografie Fysiotherapeut',
        plural: 'fysiotherapeuten met echografie',
        description: 'Echografie in de fysiotherapie wordt gebruikt voor diagnostiek. De therapeut kan met echografie direct zien wat er in het weefsel gebeurt voor een nauwkeurigere diagnose.',
        longDesc: 'Steeds meer fysiotherapeuten gebruiken echografie (MSK echografie) als diagnostisch hulpmiddel. Met echografie kan de therapeut real-time naar spieren, pezen, banden en gewrichten kijken. Dit helpt bij het stellen van een nauwkeurige diagnose bij bijvoorbeeld peesklachten, spierscheuren en gewrichtsproblemen.',
        keywords: ['echografie fysiotherapie', 'MSK echo', 'diagnostische echografie'],
    },
    'schouder specialist': {
        title: 'Schouder Specialist (Fysiotherapeut)',
        plural: 'schouder specialisten',
        description: 'Een fysiotherapeut gespecialiseerd in schouderklachten. Van frozen shoulder tot impingement — de schouderspecialist diagnosticeert en behandelt alle schouderproblemen.',
        longDesc: 'Schouderklachten komen veel voor en kunnen complex zijn. Een schouder­specialist onder de fysiotherapeuten heeft extra kennis en ervaring met aandoeningen als frozen shoulder, impingement syndroom, rotator cuff klachten en instabiliteit. De behandeling bestaat vaak uit gerichte oefentherapie, manuele technieken en advies.',
        keywords: ['schouder specialist', 'frozen shoulder behandeling', 'schouder fysiotherapie'],
    },
    'lymfedrainage': {
        title: 'Oedeemtherapeut (Lymfedrainage)',
        plural: 'oedeemtherapeuten',
        description: 'Lymfedrainage is een milde massagetechniek die het lymfesysteem stimuleert. Effectief bij oedeem (vochtophoping), na een operatie of bij lymfoedeem.',
        longDesc: 'Manuele lymfedrainage (MLD) is een zachte, ritmische massagetechniek die de lymfestroom stimuleert. Het wordt voornamelijk ingezet bij lymfoedeem (vaak na kankerbehandeling), chronisch oedeem en veneuze insufficiëntie. De oedeemtherapeut combineert lymfedrainage vaak met compressietherapie en huidverzorging.',
        keywords: ['lymfedrainage', 'oedeemtherapie', 'lymfoedeem behandeling'],
    },
    'kinderfysiotherapie': {
        title: 'Kinderfysiotherapeut',
        plural: 'kinderfysiotherapeuten',
        description: 'Een kinderfysiotherapeut is gespecialiseerd in de motorische ontwikkeling van kinderen. Van baby tot tiener — hulp bij ontwikkeling, houding en bewegingsproblemen.',
        longDesc: 'De kinderfysiotherapeut behandelt kinderen van 0 tot 18 jaar met motorische problemen. Dit kan variëren van een baby die niet goed rolt of kruipt, tot een kind met een afwijkend looppatroon of houdingsproblemen. De behandeling is altijd spelenderwijs en op maat. De kinderfysiotherapeut werkt vaak samen met school, huisarts en kinderarts.',
        keywords: ['kinderfysiotherapeut', 'motorische ontwikkeling kind', 'kinderfysiotherapie'],
    },
    'shockwave therapie': {
        title: 'Shockwave Therapeut',
        plural: 'shockwave therapeuten',
        description: 'Shockwave therapie gebruikt geluidsgolven om chronische peesklachten te behandelen. Effectief bij hielspoor, tennisarm en andere peesblessures.',
        longDesc: 'Bij shockwave therapie worden schokgolven door het weefsel gestuurd om het natuurlijke genezingsproces te stimuleren. De behandeling is bijzonder effectief bij chronische peesklachten die niet reageren op andere behandelingen, zoals hielspoor (fasciitis plantaris), tennisarm, kalkschouder en achillespees­klachten.',
        keywords: ['shockwave therapie', 'hielspoor behandeling', 'peesklachten'],
    },
    'fysiotherapie aan huis': {
        title: 'Fysiotherapeut aan Huis',
        plural: 'fysiotherapeuten aan huis',
        description: 'Fysiotherapie aan huis: de fysiotherapeut komt bij u thuis voor behandeling. Ideaal voor mensen die moeilijk de praktijk kunnen bezoeken.',
        longDesc: 'Sommige fysiotherapeuten bieden behandeling aan huis aan. Dit is ideaal voor ouderen met beperkte mobiliteit, patiënten na een operatie, of mensen met een neurologische aandoening. De therapeut neemt alle benodigde materialen mee en de behandeling is vergelijkbaar met op de praktijk.',
        keywords: ['fysiotherapie aan huis', 'thuisfysiotherapie', 'fysiotherapeut thuis'],
    },
    'bekkenfysiotherapie': {
        title: 'Bekkenfysiotherapeut',
        plural: 'bekkenfysiotherapeuten',
        description: 'Een bekkenfysiotherapeut behandelt klachten van de bekkenbodem. Van zwangerschap tot incontinentie — gespecialiseerde hulp voor bekkenbodem­problemen.',
        longDesc: 'De bekkenfysiotherapeut is expert in het diagnosticeren en behandelen van bekken­bodem­klachten. Veelvoorkomende klachten zijn urine-incontinentie, bekkenpijn, problemen na de bevalling, prolaps en pijn bij het vrijen. De behandeling bestaat uit oefeningen, manuele technieken en advies. Bekkenfysiotherapie is ook belangrijk tijdens en na de zwangerschap.',
        keywords: ['bekkenfysiotherapeut', 'bekkenbodem klachten', 'bekkenfysiotherapie', 'incontinentie fysiotherapie'],
    },
    'geriatrie fysiotherapie': {
        title: 'Geriatrie Fysiotherapeut',
        plural: 'geriatrie fysiotherapeuten',
        description: 'Geriatrie fysiotherapie richt zich op ouderen. De therapeut helpt bij het behoud van mobiliteit, valpreventie en het langer zelfstandig functioneren.',
        longDesc: 'De geriatrie fysiotherapeut is gespecialiseerd in de behandeling van ouderen met complexe gezondheidsproblemen. Veelvoorkomende doelen zijn het verbeteren van de balans voor valpreventie, het behouden van spierkracht en mobiliteit, en het begeleiden bij het gebruik van hulpmiddelen. De therapeut kijkt altijd naar het totaalplaatje van de oudere.',
        keywords: ['geriatrie fysiotherapie', 'fysiotherapie ouderen', 'valpreventie'],
    },
    'personal training': {
        title: 'Personal Training bij Fysiotherapeut',
        plural: 'fysiotherapeuten met personal training',
        description: 'Combineer fysiotherapie met personal training. Train onder begeleiding van een fysiotherapeut voor een veilige en effectieve manier om fit te worden.',
        longDesc: 'Veel fysiotherapiepraktijken bieden personal training aan als aanvulling op of vervolg op fysiotherapie. Het voordeel: de trainer is een fysiotherapeut die rekening houdt met eventuele klachten of beperkingen. Ideaal voor wie na een blessure weer wil sporten, of gezond en verantwoord wil trainen.',
        keywords: ['personal training fysiotherapeut', 'fysiofitness', 'medische fitness'],
    },
    'psychosomatische fysiotherapie': {
        title: 'Psychosomatisch Fysiotherapeut',
        plural: 'psychosomatisch fysiotherapeuten',
        description: 'Psychosomatische fysiotherapie behandelt lichamelijke klachten die samenhangen met stress, spanning of emoties. Lichaam en geest worden samen behandeld.',
        longDesc: 'Bij psychosomatische fysiotherapie wordt de relatie tussen lichaam en geest centraal gezet. Chronische pijn, vermoeidheid, hyperventilatie of spanningshoofdpijn kunnen een psychosomatische component hebben. De therapeut gebruikt ontspanningstechnieken, lichaams­bewustwording en gerichte oefentherapie om de klachten te verminderen.',
        keywords: ['psychosomatische fysiotherapie', 'stressklachten behandeling', 'spanning fysiotherapie'],
    },
    'fysiofitness': {
        title: 'Fysiofitness',
        plural: 'fysiofitness praktijken',
        description: 'Fysiofitness combineert medisch verantwoord trainen met fysiotherapie. Train onder supervisie van een fysiotherapeut in een professionele omgeving.',
        longDesc: 'Fysiofitness is medisch verantwoord sporten onder begeleiding van een fysiotherapeut. Het is ideaal als vervolg op een behandeltraject, bij chronische klachten, of als je veilig wilt trainen met een medische achtergrond. De praktijk beschikt over professionele fitnessapparatuur en de fysiotherapeut stelt een persoonlijk trainingsprogramma op.',
        keywords: ['fysiofitness', 'medisch fitness', 'trainen bij fysiotherapeut'],
    },
    'oncologische fysiotherapie': {
        title: 'Oncologisch Fysiotherapeut',
        plural: 'oncologische fysiotherapeuten',
        description: 'Oncologische fysiotherapie begeleidt kankerpatiënten tijdens en na behandeling. Hulp bij vermoeidheid, krachtverlies en herstel na chemotherapie of operaties.',
        longDesc: 'De oncologisch fysiotherapeut is gespecialiseerd in het begeleiden van mensen met kanker. Tijdens de behandeling (chemotherapie, bestraling, operatie) en in de herstelfase kan fysiotherapie helpen bij vermoeidheid, krachtverlies, lymfoedeem en uithoudingsvermogen. Een oncologisch fysiotherapeut werkt nauw samen met het behandelend team in het ziekenhuis.',
        keywords: ['oncologische fysiotherapie', 'kanker revalidatie', 'fysiotherapie na chemo'],
    },
    'triggerpoint therapie': {
        title: 'Triggerpoint Therapeut',
        plural: 'triggerpoint therapeuten',
        description: 'Triggerpoint therapie behandelt pijnlijke knobbels in spieren die uitstralende pijn veroorzaken. Effectief bij chronische spierpijn en spanningshoofdpijn.',
        longDesc: 'Triggerpoints zijn pijnlijke, gespannen plekken in een spier die vaak uitstralende pijn veroorzaken. De therapeut behandelt deze punten door middel van druk, stretching of dry needling. Triggerpoint therapie is effectief bij spanningshoofdpijn, nekpijn, schouderpijn en chronische rugklachten.',
        keywords: ['triggerpoint therapie', 'myofasciale pijn', 'spierknobbels behandeling'],
    },
    'knie specialist': {
        title: 'Knie Specialist (Fysiotherapeut)',
        plural: 'knie specialisten',
        description: 'Een fysiotherapeut gespecialiseerd in knieklachten. Van kruisband­lestel tot artrose — de kniespecialist behandelt alle knieproblemen.',
        longDesc: 'Knieproblemen komen zeer veel voor, van sportblessures tot slijtage. Een knie­specialist onder de fysiotherapeuten heeft extra expertise in aandoeningen als kruisband­letsel, meniscus­klachten, knieartrose, patello­femorale pijn (runner\'s knee) en revalidatie na een knieoperatie.',
        keywords: ['knie specialist', 'knieklachten fysiotherapie', 'kruisband revalidatie'],
    },
    'kaakfysiotherapie': {
        title: 'Kaakfysiotherapeut',
        plural: 'kaakfysiotherapeuten',
        description: 'De kaakfysiotherapeut behandelt kaak-, hoofd- en aangezichtsklachten. Hulp bij kaakklemmen, kaakpijn, tinnitus en hoofdpijn gerelateerd aan de kaak.',
        longDesc: 'Kaakfysiotherapie (ook wel orofaciale fysiotherapie) richt zich op klachten van het kaakgewricht en omliggende structuren. De kaakfysiotherapeut behandelt CMD (cranio­mandibulaire dysfunctie), kaakklemmen, kaakpijn, knappen van de kaak, bruxisme (tandenknarsen) en sommige vormen van hoofdpijn en tinnitus.',
        keywords: ['kaakfysiotherapeut', 'CMD behandeling', 'kaakpijn fysiotherapie'],
    },
    'looptraining': {
        title: 'Looptraining Fysiotherapeut',
        plural: 'looptraining fysiotherapeuten',
        description: 'Looptraining bij de fysiotherapeut helpt bij het verbeteren van je looppatroon na een blessure, operatie of neurologische aandoening.',
        longDesc: 'Looptraining is gericht op het verbeteren of herstellen van een normaal looppatroon. Dit kan nodig zijn na een orthopedische operatie (knie, heup), bij neurologische aandoeningen (beroerte, Parkinson) of bij ouderen die onzeker zijn bij het lopen. De fysiotherapeut analyseert je looppatroon en stelt een trainingsprogramma op.',
        keywords: ['looptraining', 'gangbeeld analyse', 'looppatroon fysiotherapie'],
    },
    'bindweefsel therapie': {
        title: 'Bindweefsel Therapeut',
        plural: 'bindweefsel therapeuten',
        description: 'Bindweefseltherapie is een massagetechniek die het bindweefsel (fascia) behandelt. Effectief bij chronische pijn, doorbloedingsproblemen en interne klachten.',
        longDesc: 'Bindweefseltherapie werkt op de fascia — het bindweefsel dat spieren, organen en andere structuren omhult. Door het bindweefsel te beïnvloeden kunnen veranderingen optreden in de doorbloeding en zenuwgeleiding. De therapie kan helpen bij chronische pijn, doorbloedingsstoornissen, menstruatieklachten en darmklachten.',
        keywords: ['bindweefseltherapie', 'fascia therapie', 'bindweefsel massage'],
    },
    'rugpijn specialist': {
        title: 'Rugpijn Specialist (Fysiotherapeut)',
        plural: 'rugpijn specialisten',
        description: 'Een fysiotherapeut gespecialiseerd in rugklachten. Van lage rugpijn tot hernia — de rugspecialist biedt gerichte behandeling voor alle rugproblemen.',
        longDesc: 'Rugpijn is de meest voorkomende reden om naar de fysiotherapeut te gaan. Een rugpijn­specialist heeft extra expertise in het diagnosticeren en behandelen van lage rugpijn, hernia, spit, ischias en andere rugklachten. De behandeling combineert vaak oefentherapie, manuele therapie en voorlichting over houdingsadvies.',
        keywords: ['rugpijn specialist', 'hernia fysiotherapie', 'lage rugpijn behandeling'],
    },
    'BFR training': {
        title: 'BFR Training Fysiotherapeut',
        plural: 'BFR training fysiotherapeuten',
        description: 'Blood Flow Restriction (BFR) training combineert lichte belasting met gedeeltelijke bloedstroom­beperking voor sneller spierherstel en kracht­opbouw.',
        longDesc: 'BFR (Blood Flow Restriction) training is een innovatieve techniek waarbij een manchet de bloedtoevoer gedeeltelijk beperkt tijdens lichte oefeningen. Dit stimuleert spiergroei en kracht­opbouw zonder zware belasting. Ideaal na een operatie of bij patiënten die geen zwaar gewicht kunnen tillen.',
        keywords: ['BFR training', 'blood flow restriction', 'spierherstel fysiotherapie'],
    },
    'nekpijn specialist': {
        title: 'Nekpijn Specialist (Fysiotherapeut)',
        plural: 'nekpijn specialisten',
        description: 'Een fysiotherapeut gespecialiseerd in nekklachten. Behandeling van nekpijn, whiplash, hoofdpijn en uitstralende pijn naar de arm.',
        longDesc: 'Nekklachten zijn zeer vervelend en kunnen samengaan met hoofdpijn, duizeligheid of uitstralende pijn naar de arm. Een nekpijn specialist combineert manuele therapie, oefeningen en houdingsadvies om nekklachten effectief te behandelen.',
        keywords: ['nekpijn specialist', 'whiplash behandeling', 'nekklachten fysiotherapie'],
    },
};

// Fallback for specs not in the map
function getSpecMeta(spec) {
    if (SPEC_META[spec]) return SPEC_META[spec];
    const name = spec.charAt(0).toUpperCase() + spec.slice(1);
    return {
        title: name,
        plural: `${spec} therapeuten`,
        description: `Vind een fysiotherapeut gespecialiseerd in ${spec}. Vergelijk praktijken, bekijk beoordelingen en neem direct contact op.`,
        longDesc: `${name} is een specialisatie binnen de fysiotherapie. Op VindFysio vind je fysiotherapeuten die gespecialiseerd zijn in ${spec}.`,
        keywords: [spec, `${spec} fysiotherapie`],
    };
}

// ─── Helpers ────────────────────────────────────────────────────────────────

async function fetchAll(table, select, filters = {}) {
    let allRows = [];
    let page = 0;
    const pageSize = 1000;

    while (true) {
        let query = supabase.from(table).select(select).range(page * pageSize, (page + 1) * pageSize - 1);

        if (filters.contains) {
            for (const [col, val] of Object.entries(filters.contains)) {
                query = query.contains(col, val);
            }
        }
        if (filters.eq) {
            for (const [col, val] of Object.entries(filters.eq)) {
                query = query.eq(col, val);
            }
        }
        if (filters.order) {
            query = query.order(filters.order.col, { ascending: filters.order.asc ?? true, nullsFirst: false });
        }

        const { data, error } = await query;
        if (error || !data || data.length === 0) break;
        allRows = allRows.concat(data);
        if (data.length < pageSize) break;
        page++;
    }
    return allRows;
}

// ─── Metadata ───────────────────────────────────────────────────────────────

export async function generateMetadata({ params }) {
    const { slug } = await params;
    const specName = slug.replace(/-/g, ' ');
    const meta = getSpecMeta(specName);

    // Get count
    const practices = await fetchAll('practices', 'id', {
        contains: { specializations: [specName] },
    });

    const count = practices.length;
    const title = `${meta.title} — ${count} praktijken in Nederland | VindFysio`;
    const description = `${meta.description} Vergelijk ${count} ${meta.plural} in Nederland. ✓ Gratis ✓ Onafhankelijk ✓ Met beoordelingen`;

    return {
        title,
        description,
        alternates: {
            canonical: `https://vindfysio.nl/specialisatie/${slug}`,
        },
        openGraph: {
            title,
            description,
            url: `https://vindfysio.nl/specialisatie/${slug}`,
            siteName: 'VindFysio',
            locale: 'nl_NL',
            type: 'website',
        },
    };
}

// ─── JSON-LD ────────────────────────────────────────────────────────────────

function SpecJsonLd({ specName, meta, practices, slug }) {
    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        name: `${meta.title} in Nederland`,
        description: meta.description,
        url: `https://vindfysio.nl/specialisatie/${slug}`,
        numberOfItems: practices.length,
        itemListElement: practices.slice(0, 10).map((p, i) => ({
            '@type': 'ListItem',
            position: i + 1,
            item: {
                '@type': 'HealthBusiness',
                name: p.name,
                url: `https://vindfysio.nl/praktijk/${practiceToSlug(p.name, p.city)}`,
                ...(p.address && {
                    address: {
                        '@type': 'PostalAddress',
                        streetAddress: p.address,
                        addressLocality: p.city,
                        addressCountry: 'NL',
                    }
                }),
                ...(p.rating && {
                    aggregateRating: {
                        '@type': 'AggregateRating',
                        ratingValue: p.rating,
                        reviewCount: p.reviews_count || 1,
                        bestRating: 5,
                    },
                }),
            },
        })),
    };

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
    );
}

// FAQ JSON-LD
function FaqJsonLd({ specName, meta, practiceCount, avgRating, topCities }) {
    const cityList = topCities.slice(0, 5).map(c => c[0]).join(', ');
    const faqs = [
        {
            question: `Wat is ${specName}?`,
            answer: meta.longDesc,
        },
        {
            question: `Hoeveel ${meta.plural} zijn er in Nederland?`,
            answer: `Er zijn ${practiceCount} fysiotherapiepraktijken in Nederland die ${specName} aanbieden. De meeste ${meta.plural} vindt u in ${cityList}.`,
        },
        {
            question: `Heb ik een verwijzing nodig voor ${specName}?`,
            answer: `Nee, sinds 2006 heb je in Nederland geen verwijzing nodig om naar de fysiotherapeut te gaan. Je kunt rechtstreeks een afspraak maken bij een ${specName.includes('fysiotherap') ? specName.replace('fysiotherapie', 'fysiotherapeut') : meta.plural.replace(/en$/, '')} via directe toegang (DTF).`,
        },
        {
            question: `Wordt ${specName} vergoed door de zorgverzekering?`,
            answer: `${specName.charAt(0).toUpperCase() + specName.slice(1)} valt onder de fysiotherapie en wordt vergoed vanuit de aanvullende verzekering. Het aantal vergoede sessies hangt af van je polis. Bij chronische aandoeningen wordt fysiotherapie vaak vergoed vanuit de basisverzekering na de eerste 20 sessies.`,
        },
    ];

    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: faqs.map(f => ({
            '@type': 'Question',
            name: f.question,
            acceptedAnswer: {
                '@type': 'Answer',
                text: f.answer,
            },
        })),
    };

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <section className="section">
                <div className="container">
                    <h2 style={{ marginBottom: 24 }}>Veelgestelde vragen over {specName}</h2>
                    <div className="faq-list">
                        {faqs.map((faq, i) => (
                            <details key={i} className="faq-item" open={i === 0}>
                                <summary className="faq-question">
                                    {faq.question}
                                    <ChevronDown size={18} className="faq-chevron" />
                                </summary>
                                <p className="faq-answer">{faq.answer}</p>
                            </details>
                        ))}
                    </div>
                </div>
            </section>
        </>
    );
}

// ─── Page ───────────────────────────────────────────────────────────────────

export default async function SpecializationPage({ params }) {
    const { slug } = await params;
    const specName = slug.replace(/-/g, ' ');
    const meta = getSpecMeta(specName);

    // Fetch practices
    const practices = await fetchAll('practices', '*', {
        contains: { specializations: [specName] },
        order: { col: 'rating', asc: false },
    });

    if (practices.length === 0) {
        return (
            <>
                <Header />
                <div style={{ textAlign: 'center', padding: 120 }}>
                    <h1>Specialisatie niet gevonden</h1>
                    <p style={{ color: 'var(--text-secondary)', marginTop: 8 }}>
                        We konden geen fysiotherapeuten vinden voor deze specialisatie.
                    </p>
                    <Link href="/zoeken" className="btn btn-primary" style={{ marginTop: 24 }}>
                        Zoek fysiotherapeuten
                    </Link>
                </div>
                <Footer />
            </>
        );
    }

    // Stats
    const totalPractices = practices.length;
    const practicesWithRating = practices.filter(p => p.rating);
    const avgRating = practicesWithRating.length > 0
        ? (practicesWithRating.reduce((sum, p) => sum + p.rating, 0) / practicesWithRating.length).toFixed(1)
        : null;
    const totalReviews = practices.reduce((sum, p) => sum + (p.reviews_count || 0), 0);

    // Top cities for this specialization
    const cityMap = {};
    practices.forEach(p => {
        if (p.city) cityMap[p.city] = (cityMap[p.city] || 0) + 1;
    });
    const topCities = Object.entries(cityMap).sort((a, b) => b[1] - a[1]).slice(0, 12);

    // Related specializations (find other specs from these same practices)
    const relatedSpecMap = {};
    practices.forEach(p => {
        if (!p.specializations) return;
        p.specializations.forEach(s => {
            if (s !== specName) {
                relatedSpecMap[s] = (relatedSpecMap[s] || 0) + 1;
            }
        });
    });
    const relatedSpecs = Object.entries(relatedSpecMap)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 8);

    // All other specializations for the full list
    const allSpecs = Object.keys(SPEC_META).filter(s => s !== specName);

    return (
        <>
            <SpecJsonLd specName={specName} meta={meta} practices={practices} slug={slug} />
            <Header />

            {/* Hero */}
            <section className="city-hero">
                <div className="container">
                    <div className="city-breadcrumb">
                        <Link href="/">Home</Link>
                        <span>/</span>
                        <Link href="/specialisaties">Specialisaties</Link>
                        <span>/</span>
                        <span className="current">{meta.title}</span>
                    </div>
                    <h1>
                        <span className="city-highlight">{meta.title}</span> in Nederland
                    </h1>
                    <p className="city-subtitle">
                        {meta.description}
                    </p>

                    <div className="city-stats">
                        <div className="city-stat">
                            <Activity size={20} />
                            <div>
                                <strong>{totalPractices}</strong>
                                <span>Praktijken</span>
                            </div>
                        </div>
                        {avgRating && (
                            <div className="city-stat">
                                <Star size={20} />
                                <div>
                                    <strong>{avgRating}</strong>
                                    <span>Gem. score</span>
                                </div>
                            </div>
                        )}
                        <div className="city-stat">
                            <MapPin size={20} />
                            <div>
                                <strong>{topCities.length}</strong>
                                <span>Steden</span>
                            </div>
                        </div>
                        {totalReviews > 0 && (
                            <div className="city-stat">
                                <Users size={20} />
                                <div>
                                    <strong>{totalReviews.toLocaleString('nl-NL')}</strong>
                                    <span>Reviews</span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </section>

            {/* About this specialization */}
            <section className="section">
                <div className="container" style={{ maxWidth: 800 }}>
                    <h2 style={{ marginBottom: 12 }}>Wat is {specName}?</h2>
                    <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, fontSize: '0.938rem' }}>
                        {meta.longDesc}
                    </p>
                </div>
            </section>

            {/* Top Cities for this Specialization */}
            {topCities.length > 0 && (
                <section className="section section-gray">
                    <div className="container">
                        <h2 style={{ marginBottom: 8 }}>{meta.title} per stad</h2>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: 24, fontSize: '0.938rem' }}>
                            Vind een {meta.plural.replace(/en$/, '').replace(/n$/, '')} bij jou in de buurt
                        </p>
                        <div className="city-grid">
                            {topCities.map(([city, count]) => (
                                <Link
                                    key={city}
                                    href={`/stad/${toSlug(city)}`}
                                    className="city-card"
                                >
                                    <div className="city-icon">
                                        <MapPin size={20} />
                                    </div>
                                    <div>
                                        <div className="city-name">{city}</div>
                                        <div className="city-count">{count} {count === 1 ? 'praktijk' : 'praktijken'}</div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* Practice Listing */}
            <section className="section">
                <div className="container">
                    <h2 style={{ marginBottom: 4 }}>
                        Alle {meta.plural} in Nederland
                    </h2>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: 24, fontSize: '0.938rem' }}>
                        Gesorteerd op beoordeling — {totalPractices} {totalPractices === 1 ? 'resultaat' : 'resultaten'}
                    </p>

                    <div className="results-grid">
                        {practices.map((p) => (
                            <Link key={p.id} href={`/praktijk/${practiceToSlug(p.name, p.city)}`} className="practice-card">
                                {p.image_url && (
                                    <div className="practice-card-thumb">
                                        <img src={p.image_url} alt={p.name} loading="lazy" />
                                    </div>
                                )}
                                <div className="practice-info">
                                    <h3 className="practice-name">{p.name}</h3>
                                    <div className="practice-address">
                                        <MapPin size={14} />
                                        {p.address && `${p.address}`}
                                        {p.city && `, ${p.city}`}
                                    </div>
                                    {p.rating && (
                                        <div style={{ marginBottom: 8 }}>
                                            <StarRating rating={p.rating} count={p.reviews_count} />
                                        </div>
                                    )}
                                    <div className="practice-tags">
                                        {p.phone && (
                                            <span className="tag">
                                                <Phone size={11} /> Telefoon
                                            </span>
                                        )}
                                        {p.website && (
                                            <span className="tag">
                                                <Globe size={11} /> Website
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <div className="practice-cta">
                                    <div className="btn btn-outline btn-sm">
                                        Bekijk details
                                        <ArrowRight size={14} />
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* FAQ */}
            <FaqJsonLd
                specName={specName}
                meta={meta}
                practiceCount={totalPractices}
                avgRating={avgRating}
                topCities={topCities}
            />

            {/* Blog Articles — Cross-linking */}
            <section className="section">
                <div className="container">
                    <h2 style={{ marginBottom: 8 }}>Meer over fysiotherapie</h2>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: 24, fontSize: '0.938rem' }}>
                        Handige artikelen over fysiotherapie en {specName}
                    </p>
                    <div className="city-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
                        <Link href="/blog/wat-kost-fysiotherapie" className="city-card" style={{ textDecoration: 'none' }}>
                            <div className="city-icon" style={{ background: 'rgba(var(--primary-rgb), 0.1)' }}>💰</div>
                            <div>
                                <div className="city-name">Wat kost fysiotherapie?</div>
                                <div className="city-count" style={{ fontSize: '0.75rem' }}>Tarieven, vergoedingen en eigen risico</div>
                            </div>
                        </Link>
                        <Link href="/blog/fysiotherapie-vergoeding-zorgverzekering" className="city-card" style={{ textDecoration: 'none' }}>
                            <div className="city-icon" style={{ background: 'rgba(var(--primary-rgb), 0.1)' }}>🛡️</div>
                            <div>
                                <div className="city-name">Fysiotherapie vergoeding</div>
                                <div className="city-count" style={{ fontSize: '0.75rem' }}>Wat vergoedt jouw zorgverzekering?</div>
                            </div>
                        </Link>
                        <Link href="/blog/fysiotherapie-zonder-verwijzing" className="city-card" style={{ textDecoration: 'none' }}>
                            <div className="city-icon" style={{ background: 'rgba(var(--primary-rgb), 0.1)' }}>✅</div>
                            <div>
                                <div className="city-name">Zonder verwijzing naar de fysio</div>
                                <div className="city-count" style={{ fontSize: '0.75rem' }}>Directe toegang uitgelegd</div>
                            </div>
                        </Link>
                    </div>
                </div>
            </section>

            {/* Related Specializations */}
            {relatedSpecs.length > 0 && (
                <section className="section section-gray">
                    <div className="container">
                        <h2 style={{ marginBottom: 8 }}>Verwante specialisaties</h2>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: 24, fontSize: '0.938rem' }}>
                            Praktijken met {specName} bieden vaak ook deze specialisaties aan
                        </p>
                        <div className="city-grid">
                            {relatedSpecs.map(([spec, count]) => {
                                const relMeta = getSpecMeta(spec);
                                return (
                                    <Link
                                        key={spec}
                                        href={`/specialisatie/${toSlug(spec)}`}
                                        className="city-card"
                                    >
                                        <div className="city-icon">
                                            <Activity size={20} />
                                        </div>
                                        <div>
                                            <div className="city-name">{relMeta.title}</div>
                                            <div className="city-count">{count} praktijken</div>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                </section>
            )}

            {/* All Specializations */}
            <section className="section">
                <div className="container">
                    <h2 style={{ marginBottom: 8 }}>Alle specialisaties</h2>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: 24, fontSize: '0.938rem' }}>
                        Bekijk alle fysiotherapie specialisaties op VindFysio
                    </p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                        {allSpecs.map(spec => (
                            <Link
                                key={spec}
                                href={`/specialisatie/${toSlug(spec)}`}
                                style={{
                                    padding: '6px 14px',
                                    borderRadius: 20,
                                    fontSize: '0.813rem',
                                    background: 'var(--bg-secondary)',
                                    color: 'var(--text-primary)',
                                    textDecoration: 'none',
                                    border: '1px solid var(--border)',
                                    transition: 'all 0.2s',
                                }}
                            >
                                {getSpecMeta(spec).title}
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="section">
                <div className="container" style={{ textAlign: 'center' }}>
                    <h2 style={{ marginBottom: 12 }}>Niet gevonden wat je zoekt?</h2>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: 24 }}>
                        Zoek in alle {totalPractices.toLocaleString('nl-NL')}+ fysiotherapiepraktijken
                    </p>
                    <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
                        <Link href="/zoeken" className="btn btn-primary">
                            Alle praktijken bekijken
                            <ArrowRight size={16} />
                        </Link>
                        <Link href="/steden" className="btn btn-outline">
                            Zoek per stad
                        </Link>
                    </div>
                </div>
            </section>

            <Footer />
        </>
    );
}
