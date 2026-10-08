# CV manbasi: bitta shablon, ikki til.
#
#   python cv/build.py
#
# cv/cv-en.html va cv/cv-uz.html fayllarini yaratadi; ular brauzer orqali
# PDF'ga chop etiladi (buyruq README'da) va assets/ ichiga yoziladi.
import html
import pathlib

PORTFOLIO = "https://xojiakbar3031.github.io/portfolio-pro/"
GITHUB = "https://github.com/xojiakbar3031"

T = {
    "en": {
        "file": "cv-en.html",
        "role": "AI Engineer & Frontend Developer",
        "city": "Angren, Uzbekistan",
        "h_profile": "Profile",
        "h_skills": "Skills",
        "h_projects": "Projects",
        "h_edu": "Education",
        "profile": (
            "AI engineer and frontend developer. I build products where an LLM does real work: "
            "voice agents with tool calling, speech-to-text pipelines and Telegram bots, wrapped in "
            "fast, responsive interfaces built with Next.js and React. I take projects from idea to a "
            "deployed application, including a production website that a real client uses today."
        ),
        "skills": [
            ("AI", "LLM agents & function calling (Groq, Gemini, OpenAI-compatible APIs), Whisper / faster-whisper speech-to-text, prompt design, text-to-speech"),
            ("Frontend", "Next.js, React, TypeScript, JavaScript (ES6+), Tailwind CSS, HTML5 / CSS3, Three.js, responsive design"),
            ("Backend & data", "Python, Node.js, Prisma ORM, SQLite, REST API integration, Telegram bots"),
            ("Tools", "Git & GitHub, pytest, VS Code, VPS / Vercel deployment, GitHub Pages"),
            ("Languages", "Uzbek (native), Russian, English (A2)"),
        ],
        "projects": [
            ("Angren City Technical College No. 4 — Official Site", "Client project",
             "Trilingual (UZ/RU/EN) institutional website built with Next.js, Prisma and NextAuth. Online admission system, a complete admin dashboard (programs, staff, news) and automated Telegram notifications. Running live on a VPS.",
             [("angren-texnikum.uz", "https://angren-texnikum.uz")]),
            ("Uzbek Voice Agent", "AI · Python",
             "Windows voice assistant that understands Uzbek. Speech is transcribed offline with a fine-tuned Whisper model, then an LLM agent with tool calling opens apps, controls volume and media, sends Telegram messages and answers out loud. Two LLM providers with automatic fallback.",
             [("Code", GITHUB + "/uzbek-voice-agent")]),
            ("Audio → Notes", "AI · Next.js",
             "Record or upload audio and get a transcript plus structured notes (summary, key points, action items) in Uzbek, Russian or English. Long files are split in the browser, so recordings of any length work on serverless hosting.",
             [("Code", GITHUB + "/audio-to-notes")]),
            ("Forex News Bot", "Python · Telegram",
             "24/7 Telegram bot for high-impact US economic releases: reminders before each event and the actual figure against the forecast, plus crypto price and news alerts. Duplicate-safe state, retries and a pytest suite.",
             [("Code", GITHUB + "/forex-news-bot")]),
            ("City Library Platform", "Next.js · TypeScript",
             "Library website with a searchable catalog and online membership applications, plus a staff admin panel protected by HMAC-signed sessions and login rate limiting.",
             [("Code", GITHUB + "/city-library-platform")]),
            ("YouTube Clone · StreamVibe", "React · JavaScript",
             "Two frontend apps on live data: a YouTube-style SPA (React, Vite) with search, a watch page, comments and history, and a streaming UI in vanilla JavaScript on the TVMaze API.",
             [("YouTube demo", "https://xojiakbar3031.github.io/youtube-clone/"), ("StreamVibe demo", "https://xojiakbar3031.github.io/streamvibe/")]),
        ],
        "edu": ("Frontend Development Course", "Shanghai School", "2025 – 2026"),
    },
    "uz": {
        "file": "cv-uz.html",
        "role": "AI Engineer va Frontend dasturchi",
        "city": "Angren, O'zbekiston",
        "h_profile": "Men haqimda",
        "h_skills": "Ko'nikmalar",
        "h_projects": "Loyihalar",
        "h_edu": "Ta'lim",
        "profile": (
            "AI engineer va frontend dasturchiman. LLM haqiqiy ish bajaradigan mahsulotlar yarataman: "
            "vosita chaqiradigan ovozli agentlar, nutqni matnga o'giruvchi tizimlar va Telegram botlar. "
            "Ularga Next.js va React'da tez, moslashuvchan interfeys quraman. Loyihani g'oyadan ishga "
            "tushirilgan ilovagacha olib boraman. Ishlarimdan biri hozir real mijoz foydalanayotgan sayt."
        ),
        "skills": [
            ("AI", "LLM agentlar va function calling (Groq, Gemini, OpenAI-mos API'lar), Whisper / faster-whisper (nutqni matnga o'girish), prompt yozish, matnni ovozga o'girish"),
            ("Frontend", "Next.js, React, TypeScript, JavaScript (ES6+), Tailwind CSS, HTML5 / CSS3, Three.js, responsive dizayn"),
            ("Backend", "Python, Node.js, Prisma ORM, SQLite, REST API integratsiya, Telegram botlar"),
            ("Vositalar", "Git va GitHub, pytest, VS Code, VPS / Vercel'ga joylash, GitHub Pages"),
            ("Tillar", "O'zbek (ona tili), rus, ingliz (A2)"),
        ],
        "projects": [
            ("Angren shahar 4-son Texnikumi — rasmiy sayt", "Mijoz loyihasi",
             "Next.js, Prisma va NextAuth'da qurilgan uch tilli (UZ/RU/EN) muassasa sayti. Onlayn qabul tizimi, to'liq admin panel (yo'nalishlar, xodimlar, yangiliklar) va avtomatik Telegram bildirishnomalari. VPS serverda ishlab turibdi.",
             [("angren-texnikum.uz", "https://angren-texnikum.uz")]),
            ("Uzbek Voice Agent", "AI · Python",
             "O'zbek tilini tushunadigan Windows ovozli yordamchisi. Nutq o'zbek tiliga moslangan Whisper modeli bilan internetsiz matnga o'giriladi, so'ng vosita chaqiradigan LLM agent dastur ochadi, ovoz va mediani boshqaradi, Telegram'da xabar yuboradi va ovoz bilan javob beradi. Ikki LLM provayderi bor: biri ishlamasa, ikkinchisi ishlaydi.",
             [("Kod", GITHUB + "/uzbek-voice-agent")]),
            ("Audio → Notes", "AI · Next.js",
             "Audio yozing yoki yuklang: ilova matnini va tayyor konspektni (xulosa, asosiy fikrlar, topshiriqlar) o'zbek, rus yoki ingliz tilida beradi. Uzun fayllar brauzerda bo'laklanadi, shuning uchun har qanday uzunlikdagi yozuv serverless hostingda ham ishlaydi.",
             [("Kod", GITHUB + "/audio-to-notes")]),
            ("Forex News Bot", "Python · Telegram",
             "AQShning muhim iqtisodiy ko'rsatkichlari uchun 24/7 ishlaydigan Telegram bot: voqeadan oldin eslatma, natijani prognoz bilan solishtirish, kripto narx va yangilik ogohlantirishlari. Takroriy xabarlardan himoya, qayta urinishlar va pytest testlari.",
             [("Kod", GITHUB + "/forex-news-bot")]),
            ("City Library Platform", "Next.js · TypeScript",
             "Kutubxona sayti: qidiruvli katalog va onlayn a'zolik arizasi, hamda HMAC bilan imzolangan sessiya va kirish urinishlari limiti bilan himoyalangan xodimlar paneli.",
             [("Kod", GITHUB + "/city-library-platform")]),
            ("YouTube Clone · StreamVibe", "React · JavaScript",
             "Jonli ma'lumot bilan ishlaydigan ikki frontend ilova: YouTube uslubidagi SPA (React, Vite) qidiruv, video sahifasi, izohlar va tarix bilan; TVMaze API'dagi streaming interfeysi sof JavaScript'da.",
             [("YouTube demo", "https://xojiakbar3031.github.io/youtube-clone/"), ("StreamVibe demo", "https://xojiakbar3031.github.io/streamvibe/")]),
        ],
        "edu": ("Frontend dasturlash kursi", "Shanghai School", "2025 – 2026"),
    },
}

CSS = """
@page { size: A4; margin: 0; }
* { box-sizing: border-box; margin: 0; padding: 0; }
body { font-family: "Segoe UI", "Inter", Arial, sans-serif; color: #15161a; font-size: 9.2pt; line-height: 1.42;
  -webkit-print-color-adjust: exact; print-color-adjust: exact; }
.page { width: 210mm; height: 297mm; padding: 12mm 15mm 10mm; position: relative; overflow: hidden; }
a { color: inherit; text-decoration: none; }
h1 { font-size: 25pt; letter-spacing: -0.6pt; line-height: 1.05; font-weight: 700; }
.role { color: #3d56d6; font-weight: 600; font-size: 11pt; margin-top: 4pt; }
.contacts { display: flex; flex-wrap: wrap; gap: 3pt 14pt; margin-top: 9pt; font-size: 8.8pt; color: #3a3c45; }
.contacts a { border-bottom: 0.6pt solid #c9cde0; }
.rule { height: 1.4pt; background: #15161a; margin: 10pt 0 2pt; }
h2 { font-size: 8pt; letter-spacing: 1.6pt; text-transform: uppercase; color: #3d56d6; margin: 10pt 0 5pt; font-weight: 700; }
.profile { max-width: 168mm; color: #2a2c34; }
.skills { display: grid; grid-template-columns: 30mm 1fr; gap: 3.5pt 10pt; }
.skills dt { color: #6b6e7b; font-size: 8.6pt; padding-top: 0.6pt; }
.project { padding: 5.5pt 0; border-top: 0.6pt solid #dfe1ea; break-inside: avoid; }
.project.last { border-bottom: 0.6pt solid #dfe1ea; }
.p-head { display: flex; align-items: baseline; gap: 10pt; }
.p-title { margin-right: auto; }
.p-title { font-weight: 700; font-size: 10.6pt; }
.tag { font-size: 7.6pt; color: #3d56d6; background: #eef1fd; padding: 1.5pt 6pt; border-radius: 3pt; white-space: nowrap; }
.p-desc { color: #33353e; margin-top: 2pt; }
.p-links { font-size: 8.2pt; display: flex; gap: 10pt; white-space: nowrap; }
.p-links a { color: #3d56d6; border-bottom: 0.6pt solid #c9d2f7; }
.edu { display: flex; justify-content: space-between; border-top: 0.6pt solid #dfe1ea; border-bottom: 0.6pt solid #dfe1ea; padding: 6.5pt 0; }
.edu b { font-size: 10.2pt; }
.edu span { color: #6b6e7b; }
.foot { position: absolute; left: 15mm; right: 15mm; bottom: 7mm; display: flex; justify-content: space-between; font-size: 7.6pt; color: #9a9dab; }
"""


def e(text):
    return html.escape(text, quote=True)


def render(lang, t):
    skills = "".join(f"<dt>{e(k)}</dt><dd>{e(v)}</dd>" for k, v in t["skills"])
    projects = ""
    for i, (title, tag, desc, links) in enumerate(t["projects"]):
        last = " last" if i == len(t["projects"]) - 1 else ""
        link_html = "".join(f'<a href="{e(url)}">{e(name)} ↗</a>' for name, url in links)
        projects += (
            f'<div class="project{last}"><div class="p-head"><span class="p-title">{e(title)}</span>'
            f'<span class="p-links">{link_html}</span><span class="tag">{e(tag)}</span></div>'
            f'<p class="p-desc">{e(desc)}</p></div>'
        )
    course, school, years = t["edu"]
    return f"""<!doctype html>
<html lang="{lang}"><head><meta charset="utf-8"><title>Xojiakbar Saydullayev — CV</title><style>{CSS}</style></head>
<body><div class="page">
<h1>Xojiakbar Saydullayev</h1>
<p class="role">{e(t['role'])}</p>
<div class="contacts">
  <span>{e(t['city'])}</span>
  <a href="mailto:xojiakbarsaydullaev13@gmail.com">xojiakbarsaydullaev13@gmail.com</a>
  <span>+998 95 313 71 13</span>
  <a href="{GITHUB}">github.com/xojiakbar3031</a>
  <a href="https://t.me/FEL1X333">Telegram: @FEL1X333</a>
  <a href="{PORTFOLIO}">xojiakbar3031.github.io/portfolio-pro</a>
</div>
<div class="rule"></div>
<h2>{e(t['h_profile'])}</h2><p class="profile">{e(t['profile'])}</p>
<h2>{e(t['h_skills'])}</h2><dl class="skills">{skills}</dl>
<h2>{e(t['h_projects'])}</h2>{projects}
<h2>{e(t['h_edu'])}</h2>
<div class="edu"><div><b>{e(course)}</b><br><span>{e(school)}</span></div><span>{e(years)}</span></div>
<div class="foot"><span>Xojiakbar Saydullayev</span><span>CV · 2026</span></div>
</div></body></html>"""


here = pathlib.Path(__file__).parent
for lang, t in T.items():
    (here / t["file"]).write_text(render(lang, t), encoding="utf-8")
    print("wrote", t["file"])
