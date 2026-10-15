# Дизайн і інструменти

## Візуальна система

Це вигаданий дослідницький артефакт, а не персональна атака. Авторитетність створюють пропорції, типографіка та надмірна аналітична процедура.

- **Колір:** папір `#f1efe7`, чорнило `#242722`, редакторський червоний `#b53727`. Два обчислювальні розділи змінюють площину на темно-зелену `#252d28`, із теплим червоним `#ef816b`.
- **Шрифти:** PT Serif для тез та великих оцінок; IBM Plex Sans для пояснень; IBM Plex Mono для індексів і параметрів. Шрифти локальні, з кирилицею, `font-display: swap`.
- **Композиція:** титульна антиква врівноважується математичною поверхнею. Резюме використовує відкриту смугу чисел. Хронологія має вертикальну вісь; SWOT — строгі квадранти; симуляція — широке поле крапок; модель — панель регуляторів поруч із великою оцінкою. Фінал прибирає інформаційну щільність.
- **Рух:** лінії відкривають дані, інтервал стискається, сигнал проходить мережею, Canvas накопичує результати. Немає фонового відео, нескінченного паралаксу, пружинних карток чи загального fade-up.
- **Мобільний екран:** типографіка залишається головним елементом; резюме перебудовується в 2×2, SWOT зберігає матричність, модель переносить результат під параметри. Лише нейромережа має окремий доступний горизонтальний скрол.

## Реально використані встановлені навички

1. **frontend-design** — вибір редакційного напряму, типографічна ієрархія, уникнення шаблонних карток, перевірка desktop/mobile.
2. **ui-ux-pro-max** — виконано CLI-пошук дизайн-системи та уточнений пошук `editorial asymmetric publication`. Перший результат пропонував портфоліо, тому його не використано; релевантний результат Editorial Grid / Magazine застосовано до асиметрії та композиції. Використано правила контрасту, клавіатури, підписів графіків та reduced motion.
3. **ponytail** — SVG/CSS/Canvas замість бібліотеки графіків і motion-фреймворку, окремі тести для обчислень, мінімальна статична архітектура.
4. **Sites** — прочитано й застосовано guidance для presentation-led site та локального preview. Відповідно до прямої вимоги користувача публікація відбувається через GitHub Pages, а не Sites hosting.

## MCP та інші інструменти

- **Penpot MCP:** створено композиційний ескіз «Unnecessary research — editorial composition», отримано структуру, експортовано й візуально переглянуто PNG. Ескіз був відправною точкою типографіки, полів і числової смуги; фінальна композиція розвинена у браузері.
- **GitHub MCP:** перевірено підключену ідентичність для публікації. API створення репозиторію не був представлений у наборі MCP, тому створення та Pages виконані GitHub REST API через локальний Git Credential Manager; Git — для комітів і push. Дані акаунта не використані як контент дослідження.
- **Headroom MCP:** стиснуто великий повторюваний каталог GitHub-інструментів; hash `b0f036d4924f8452b1d7be11`. Проксі повідомив про недоступність. Точні інтерфейси викликів читалися безпосередньо перед використанням. Автоматичного стиснення всього трафіку не заявляємо.
- **Codex app MCP:** відкрито локальний preview для користувача.
- **Playwright + Chrome:** браузерні сценарії, скриншоти, клавіатурна перевірка, reduced motion, viewport і console checks. Це встановлений npm-інструмент, не окремий MCP.
- **axe-core:** автоматична перевірка WCAG A/AA на трьох розмірах екрана.
- **KaTeX:** справжній рендер формул, завантажуваний за потреби.
- **Pillow:** контактні аркуші для огляду скриншотів; не генерує ілюстрації сайту.

Штучно згенеровані фотографії та набори іконок не використовувалися: роль зображень виконують програмні графіки. Додаткових агентів не залучали.

## Editorial refinement · GSAP edition

The cover now pairs a large typographic thesis with a vermilion research plate. The original Ukrainian satire, forty exhibits and interactive calculations are retained. A drawn bureau symbol replaces the platform-dependent emoji mark; locally bundled symbol glyphs keep arrows consistent.

References consulted: [Juxtopposed’s design course](https://www.youtube.com/watch?v=wIuVvCuiJhU), [HOVERSTAT.ES — Developments](https://www.hoverstat.es/features/developments/), and [HOVERSTAT.ES — Phase](https://www.hoverstat.es/features/phase/). Applied principles: content-led hierarchy, distinct editorial pacing, and small interactions specific to the material. The layout is original, not a reproduction of a reference.

GSAP and ScrollTrigger now own cover line reveals, the wireframe drawing, chapter number/title entrances, plotted-line drawing, impact bars, summary statistics, contents entrance and final verdict. Native scrolling is retained; no pinned sections or scroll interception. Existing interval, network and simulation animations remain. Context cleanup restores inline styles and removes triggers when motion is disabled or the component unmounts. The single-file review build is separate from the production build.
