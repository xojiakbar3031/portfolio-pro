// Loyihalar ro'yxati — work-section shundan render qilinadi.
// description uch tilda: uz / ru / en (til almashtirilganda mos matn olinadi).
// demo bo'lmasa (bot, desktop ilova) "Ko'rish" tugmasi chiqmaydi.
var WORK_PROJECTS = [
  {
    num: "01",
    title: "Uzbek Voice Agent",
    year: "2026",
    description: {
      uz: "O'zbek tilini tushunadigan ovozli yordamchi. Nutq kompyuterning o'zida (Whisper, internetsiz) matnga aylanadi, so'ng LLM agent kerakli vositani tanlaydi: dastur ochadi, ovozni boshqaradi, Telegram'da xabar yuboradi va o'zbekcha ovoz bilan javob beradi.",
      ru: "Голосовой ассистент, понимающий узбекский язык. Речь распознаётся локально (Whisper, без интернета), затем LLM-агент выбирает нужный инструмент: открывает программы, управляет звуком, отправляет сообщения в Telegram и отвечает голосом на узбекском.",
      en: "A voice assistant that understands Uzbek. Speech is transcribed on-device (Whisper, offline), then an LLM agent picks the right tool: it opens apps, controls volume, sends Telegram messages and answers out loud in Uzbek."
    },
    tags: ["Python", "Whisper", "LLM Agent", "Groq / Gemini", "Telegram"],
    image: "assets/uzbek-voice-agent.jpg",
    code: "https://github.com/xojiakbar3031/uzbek-voice-agent"
  },
  {
    num: "02",
    title: "Audio → Notes",
    year: "2026",
    description: {
      uz: "Ma'ruza yoki yig'ilishni yozib oling yoki audio fayl yuklang. Ilova uni Whisper bilan matnga o'giradi va AI tayyor konspekt chiqaradi: xulosa, asosiy fikrlar, topshiriqlar. Har qanday uzunlikdagi yozuv, 3 til, Markdown eksport.",
      ru: "Запишите лекцию или встречу либо загрузите аудиофайл. Приложение расшифровывает его через Whisper, а ИИ готовит конспект: резюме, ключевые мысли, задачи. Записи любой длины, 3 языка, экспорт в Markdown.",
      en: "Record a lecture or meeting, or upload an audio file. The app transcribes it with Whisper and AI turns it into notes: summary, key points and action items. Recordings of any length, 3 languages, Markdown export."
    },
    tags: ["Next.js", "TypeScript", "Whisper", "LLM", "Web Audio API"],
    image: "assets/audio-to-notes.jpg",
    code: "https://github.com/xojiakbar3031/audio-to-notes"
  },
  {
    num: "03",
    title: "Forex News Bot",
    year: "2026",
    description: {
      uz: "24/7 ishlaydigan Telegram bot. AQShning muhim iqtisodiy ko'rsatkichlari (CPI, NFP, FOMC) chiqishidan oldin ogohlantiradi, natijani prognoz bilan solishtirib e'lon qiladi, kripto narx va yangiliklarni ham kuzatadi. Testlar bilan qoplangan.",
      ru: "Telegram-бот, работающий 24/7. Предупреждает о важных экономических данных США (CPI, NFP, FOMC), публикует результат в сравнении с прогнозом, следит за криптовалютами и новостями. Покрыт тестами.",
      en: "A 24/7 Telegram bot. It warns before high-impact US economic releases (CPI, NFP, FOMC), posts the actual figure against the forecast, and tracks crypto prices and news. Covered by tests."
    },
    tags: ["Python", "Telegram Bot", "REST API", "pytest"],
    image: "assets/forex-news-bot.jpg",
    code: "https://github.com/xojiakbar3031/forex-news-bot"
  },
  {
    num: "04",
    title: "City Library Platform",
    year: "2026",
    description: {
      uz: "Shahar kutubxonasi uchun sayt va xodimlar paneli: kitob katalogi (qidiruv, janr filtri), onlayn a'zolik arizasi, a'zolar va to'lovlarni boshqarish, CSV eksport. Himoyalangan kirish: imzolangan sessiya va urinishlar limiti.",
      ru: "Сайт и панель сотрудников для городской библиотеки: каталог книг (поиск, фильтр по жанрам), онлайн-заявка на членство, управление читателями и оплатами, экспорт в CSV. Защищённый вход: подписанные сессии и лимит попыток.",
      en: "Website and staff panel for a city library: book catalog (search, genre filter), online membership applications, member and payment management, CSV export. Secure login with signed sessions and rate limiting."
    },
    tags: ["Next.js 16", "TypeScript", "Tailwind CSS", "Auth"],
    image: "assets/city-library.jpg",
    code: "https://github.com/xojiakbar3031/city-library-platform"
  },
  {
    num: "05",
    title: "YouTube Clone",
    year: "2026",
    description: {
      uz: "React va Vite'da qurilgan YouTube uslubidagi ilova: haqiqiy videolar, qidiruv, kategoriyalar, video sahifasi, like, obuna, izohlar va ko'rish tarixi. Havolalarni ulashish va \"orqaga\" tugmasi ishlaydi.",
      ru: "Приложение в стиле YouTube на React и Vite: реальные видео, поиск, категории, страница просмотра, лайки, подписки, комментарии и история. Ссылками можно делиться, кнопка «назад» работает.",
      en: "A YouTube-style app built with React and Vite: real videos, search, categories, a watch page, likes, subscriptions, comments and history. Shareable links and a working back button."
    },
    tags: ["React", "Vite", "SPA", "localStorage"],
    image: "assets/youtube-clone.jpg",
    demo: "https://xojiakbar3031.github.io/youtube-clone/",
    code: "https://github.com/xojiakbar3031/youtube-clone"
  },
  {
    num: "06",
    title: "StreamVibe",
    year: "2026",
    description: {
      uz: "Streaming platforma interfeysi: TVMaze API'dan jonli ma'lumotlar, janrlar, top 10, butun katalog bo'yicha qidiruv va serial haqida batafsil oyna. Freymvorksiz, sof JavaScript, to'liq responsive.",
      ru: "Интерфейс стриминговой платформы: живые данные из TVMaze API, жанры, топ-10, поиск по всему каталогу и окно с деталями сериала. Без фреймворков, чистый JavaScript, полностью адаптивный.",
      en: "A streaming-platform interface: live data from the TVMaze API, genres, top 10, search across the whole catalogue and a show details dialog. No framework, pure JavaScript, fully responsive."
    },
    tags: ["JavaScript", "REST API", "Responsive"],
    image: "assets/streamvibe.jpg",
    demo: "https://xojiakbar3031.github.io/streamvibe/",
    code: "https://github.com/xojiakbar3031/streamvibe"
  }
];
