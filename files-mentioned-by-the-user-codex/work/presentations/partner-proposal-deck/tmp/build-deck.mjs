import fs from "node:fs/promises";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { Presentation, PresentationFile } = require("@oai/artifact-tool");

const ROOT =
  "/Users/a1/Documents/Codex/2026-06-19/files-mentioned-by-the-user-codex";
const TMP = `${ROOT}/work/presentations/partner-proposal-deck/tmp`;
const PREVIEW = `${TMP}/preview`;
const HIRES = `${TMP}/hires`;
const LAYOUT = `${TMP}/layout`;
const FINAL = `${ROOT}/outputs/partner-referral-kp.pptx`;

const W = 1280;
const H = 720;
const N = 8;

const C = {
  bg: "#07100B",
  bg2: "#0B160E",
  panel: "#132317",
  panel2: "#1D301C",
  panel3: "#263D22",
  line: "#3E563A",
  line2: "#6D815B",
  text: "#F3F7EA",
  muted: "#B7C3AE",
  dim: "#7F8E79",
  lime: "#D8FF64",
  mint: "#B8EF97",
  coral: "#FF7E6F",
  amber: "#FFC766",
  blue: "#2AA6E8",
  black: "#07100B",
};

const FONT_HEAD = "Aptos Display";
const FONT_BODY = "Aptos";

async function writeBlob(path, blob) {
  await fs.writeFile(path, new Uint8Array(await blob.arrayBuffer()));
}

function pos(left, top, width, height) {
  return { left, top, width, height };
}

function addShape(slide, geometry, p, fill = C.panel, line = C.line, radius = 8) {
  const config = {
    geometry,
    position: p,
    fill,
    line:
      line === "none"
        ? { style: "solid", fill: "none", width: 0 }
        : { style: "solid", fill: line, width: 1 },
  };
  if (["rect", "textbox", "roundRect"].includes(geometry)) {
    config.borderRadius = radius;
  }
  return slide.shapes.add(config);
}

function addText(slide, text, p, options = {}) {
  const shape = slide.shapes.add({
    geometry: "textbox",
    position: p,
    fill: "none",
    line: { style: "solid", fill: "none", width: 0 },
  });
  shape.text = text;
  shape.text.style = {
    typeface: options.typeface || FONT_BODY,
    fontSize: options.size || 20,
    bold: options.bold || false,
    color: options.color || C.text,
    alignment: options.align || "left",
    verticalAlignment: options.valign || "top",
    lineSpacing: options.lineSpacing || 1.08,
    wrap: "square",
    autoFit: options.autoFit || "shrinkText",
    insets: options.insets || { top: 0, right: 0, bottom: 0, left: 0 },
  };
  return shape;
}

function addCard(slide, p, options = {}) {
  return addShape(
    slide,
    "roundRect",
    p,
    options.fill || C.panel,
    options.line || C.line,
    options.radius ?? 8,
  );
}

function addPill(slide, text, x, y, w, options = {}) {
  addShape(
    slide,
    "roundRect",
    pos(x, y, w, 34),
    options.fill || C.panel2,
    options.line || C.line,
    8,
  );
  addText(slide, text, pos(x + 12, y + 7, w - 24, 18), {
    size: options.size || 13,
    bold: true,
    color: options.color || C.lime,
    align: "center",
  });
}

function addDot(slide, x, y, fill = C.lime) {
  addShape(slide, "ellipse", pos(x, y, 10, 10), fill, "none", 5);
}

function addFooter(slide, index, label = "Партнерское КП") {
  addShape(slide, "line", pos(64, 654, 1152, 0), "none", "#31402D", 0);
  addText(slide, label, pos(64, 672, 320, 20), {
    size: 12,
    bold: true,
    color: C.dim,
  });
  addText(slide, `${String(index).padStart(2, "0")} / ${String(N).padStart(2, "0")}`, pos(1132, 672, 84, 20), {
    size: 12,
    bold: true,
    color: C.dim,
    align: "right",
  });
}

function addHeader(slide, index, kicker, title, subtitle) {
  addPill(slide, kicker, 64, 52, 260, { fill: C.panel2, line: C.line });
  addText(slide, title, pos(64, 100, 780, 94), {
    typeface: FONT_HEAD,
    size: 38,
    bold: true,
    color: C.text,
    lineSpacing: 0.98,
  });
  if (subtitle) {
    addText(slide, subtitle, pos(878, 104, 338, 82), {
      size: 18,
      color: C.muted,
      lineSpacing: 1.18,
    });
  }
  addFooter(slide, index);
}

function addBackground(slide) {
  slide.background.fill = C.bg;
  addShape(slide, "ellipse", pos(410, -150, 520, 380), "#315E2C", "none", 260);
  addShape(slide, "ellipse", pos(520, -112, 500, 360), "#77B74C", "none", 250);
  addShape(slide, "rect", pos(0, 0, W, H), "#07100B/34", "none", 0);
}

function addMiniStatus(slide, x, y) {
  addDot(slide, x, y, C.coral);
  addDot(slide, x + 20, y, C.amber);
  addDot(slide, x + 40, y, C.mint);
}

function slide1(presentation) {
  const slide = presentation.slides.add();
  addBackground(slide);

  addMiniStatus(slide, 72, 64);
  addText(slide, "Маркетолог на аутсорсе", pos(140, 58, 310, 26), {
    size: 18,
    bold: true,
  });
  addPill(slide, "для разработчиков, дизайнеров, SMM и руководителей", 744, 52, 472, {
    color: C.muted,
  });

  addText(slide, "Партнерское КП:", pos(64, 144, 620, 66), {
    typeface: FONT_HEAD,
    size: 58,
    bold: true,
    lineSpacing: 0.94,
  });
  addText(slide, "20% за клиента\nна маркетинг", pos(64, 214, 690, 160), {
    typeface: FONT_HEAD,
    size: 66,
    bold: true,
    color: C.lime,
    lineSpacing: 0.92,
  });
  addText(
    slide,
    "Если клиенту после вашей работы нужны заявки, реклама и аналитика - передайте его мне. После оплаты клиента вы получаете 20% с чека.",
    pos(66, 394, 628, 70),
    { size: 22, color: C.muted, lineSpacing: 1.2 },
  );

  addCard(slide, pos(760, 158, 388, 270), { fill: C.panel, line: C.line2 });
  addText(slide, "Партнерская ставка", pos(792, 188, 260, 28), {
    size: 16,
    color: C.muted,
    bold: true,
  });
  addText(slide, "20%", pos(790, 226, 260, 86), {
    typeface: FONT_HEAD,
    size: 88,
    bold: true,
    color: C.lime,
  });
  addText(slide, "от оплаченного чека клиента", pos(794, 326, 286, 32), {
    size: 20,
    color: C.text,
    bold: true,
  });
  addText(slide, "Фиксируем источник до первого созвона, выплату - после оплаты.", pos(794, 366, 292, 44), {
    size: 16,
    color: C.muted,
    lineSpacing: 1.18,
  });

  const metricY = 510;
  const metricW = 252;
  [
    ["5-15 тыс. ₽", "средняя выплата с одной рекомендации"],
    ["25-75 тыс. ₽", "типовой первый чек для расчета"],
    ["1 интро", "достаточно, чтобы закрепить источник"],
  ].forEach((m, i) => {
    const x = 64 + i * (metricW + 16);
    addCard(slide, pos(x, metricY, metricW, 112), { fill: "#152419", line: C.line });
    addText(slide, m[0], pos(x + 18, metricY + 18, metricW - 36, 36), {
      typeface: FONT_HEAD,
      size: 28,
      bold: true,
      color: i === 0 ? C.lime : C.text,
    });
    addText(slide, m[1], pos(x + 18, metricY + 60, metricW - 36, 34), {
      size: 15,
      color: C.muted,
      lineSpacing: 1.12,
    });
  });

  addCard(slide, pos(872, 516, 276, 82), { fill: "#D8FF64", line: "none" });
  addText(slide, "Цель КП", pos(894, 534, 220, 20), {
    size: 15,
    bold: true,
    color: C.black,
  });
  addText(slide, "кого передавать и сколько это может приносить", pos(894, 558, 224, 22), {
    size: 15,
    bold: true,
    color: C.black,
    lineSpacing: 1.08,
  });

  addFooter(slide, 1);
}

function slide2(presentation) {
  const slide = presentation.slides.add();
  addBackground(slide);
  addHeader(
    slide,
    2,
    "когда предлагать",
    "Рекомендация появляется в момент, когда клиент спрашивает про заявки",
    "Лучше всего работает warm intro: партнер уже в доверии, а клиент понимает, зачем ему следующий шаг.",
  );

  const cards = [
    ["После сайта", "Сайт готов, но клиент не понимает, откуда брать заявки и как окупать разработку."],
    ["После дизайна", "Есть новый лендинг, упаковка или бренд, но нет теста оффера на реальном трафике."],
    ["После SMM", "Контент и комьюнити есть, но нужен платный поток лидов и понятная воронка."],
    ["После стратегии", "Руководитель видит точки роста, но не хочет нанимать маркетолога в штат."],
  ];
  cards.forEach((card, i) => {
    const x = 64 + (i % 2) * 380;
    const y = 238 + Math.floor(i / 2) * 160;
    addCard(slide, pos(x, y, 350, 128), { fill: C.panel, line: C.line });
    addText(slide, card[0], pos(x + 22, y + 20, 260, 28), {
      size: 24,
      bold: true,
      color: C.lime,
    });
    addText(slide, card[1], pos(x + 22, y + 58, 292, 52), {
      size: 17,
      color: C.muted,
      lineSpacing: 1.15,
    });
  });

  addCard(slide, pos(860, 248, 356, 294), { fill: C.panel2, line: C.line2 });
  addText(slide, "Фраза-маркер клиента", pos(892, 282, 260, 24), {
    size: 15,
    bold: true,
    color: C.muted,
  });
  addText(slide, "«А как теперь\nпривлекать клиентов?»", pos(890, 322, 276, 96), {
    typeface: FONT_HEAD,
    size: 38,
    bold: true,
    color: C.text,
    lineSpacing: 0.96,
  });
  addText(slide, "Если этот вопрос уже прозвучал, рекомендация выглядит не как продажа, а как логичное продолжение вашей работы.", pos(894, 446, 260, 64), {
    size: 18,
    color: C.muted,
    lineSpacing: 1.16,
  });
}

function slide3(presentation) {
  const slide = presentation.slides.add();
  addBackground(slide);
  addHeader(
    slide,
    3,
    "задачи и чеки",
    "Какие задачи я закрываю и сколько это примерно стоит",
    "Цены нужны, чтобы партнер сразу понимал порядок чека и своей выплаты. Финальная смета зависит от ниши, каналов, бюджета и текущей воронки.",
  );

  const data = [
    ["Аудит рекламы и воронки", "узкие места, быстрые правки, карта тестов", "15-25 тыс. ₽"],
    ["Стратегия + медиаплан", "каналы, KPI, бюджет, план на 30 дней", "25-45 тыс. ₽"],
    ["Запуск 1 канала", "Яндекс / VK / Telegram / Avito", "35-60 тыс. ₽"],
    ["Запуск 2-3 каналов", "несколько гипотез и связок под лиды", "70-120 тыс. ₽"],
    ["Ведение 1 канала", "оптимизация, отчеты, новые тесты", "40-70 тыс. ₽ / мес"],
    ["Ведение 2-3 каналов", "управление, аналитика, рост-гипотезы", "80-150 тыс. ₽ / мес"],
    ["Оффер и лендинг", "смыслы, структура, формы, конверсия", "30-80 тыс. ₽"],
    ["Аналитика + CRM", "цели, события, дашборд, передача лида", "25-70 тыс. ₽"],
    ["Рост-спринт / перезапуск", "пересборка воронки и запуск тестов", "90-180 тыс. ₽"],
  ];

  const startX = 64;
  const startY = 220;
  const colW = 368;
  const rowH = 106;
  data.forEach((item, i) => {
    const x = startX + (i % 3) * (colW + 18);
    const y = startY + Math.floor(i / 3) * (rowH + 16);
    addCard(slide, pos(x, y, colW, rowH), {
      fill: i === 8 ? "#D8FF64" : C.panel,
      line: i === 8 ? "none" : C.line,
    });
    const dark = i === 8;
    addText(slide, item[0], pos(x + 18, y + 15, colW - 36, 26), {
      size: 20,
      bold: true,
      color: dark ? C.black : C.text,
    });
    addText(slide, item[1], pos(x + 18, y + 46, colW - 36, 24), {
      size: 14,
      color: dark ? "#223018" : C.muted,
    });
    addText(slide, item[2], pos(x + 18, y + 72, colW - 36, 22), {
      size: 18,
      bold: true,
      color: dark ? C.black : C.lime,
    });
  });

  addCard(slide, pos(64, 590, 1152, 46), { fill: "#0D190F", line: C.line });
  addText(slide, "Пример выплаты: чек 50 тыс. ₽ = 10 тыс. ₽ партнеру; чек 120 тыс. ₽ = 24 тыс. ₽ партнеру.", pos(90, 604, 820, 20), {
    size: 18,
    bold: true,
    color: C.text,
  });
  addText(slide, "20% считается от фактически оплаченного чека", pos(940, 604, 244, 20), {
    size: 14,
    bold: true,
    color: C.lime,
    align: "right",
  });
}

function slide4(presentation) {
  const slide = presentation.slides.add();
  addBackground(slide);
  addHeader(
    slide,
    4,
    "качество лида",
    "Кого лучше рекомендовать, чтобы интро превращалось в оплату",
    "Чем теплее контекст и понятнее задача клиента, тем выше шанс, что рекомендация не зависнет на созвоне.",
  );

  addCard(slide, pos(64, 224, 538, 330), { fill: C.panel, line: C.line2 });
  addText(slide, "Зеленые признаки", pos(96, 252, 380, 34), {
    size: 30,
    bold: true,
    color: C.lime,
  });
  const good = [
    "есть продукт, цена, география и понятная маржа",
    "клиент готов выделять рекламный бюджет и оплачивать работу",
    "есть сайт, лендинг, соцсети или готовность быстро поправить посадочную",
    "ЛПР выходит на созвон и принимает решения без месяца согласований",
    "есть менеджер или понятный процесс обработки заявок",
  ];
  good.forEach((t, i) => {
    const y = 314 + i * 40;
    addDot(slide, 100, y + 6, C.lime);
    addText(slide, t, pos(124, y, 414, 28), { size: 18, color: C.text });
  });

  addCard(slide, pos(640, 224, 576, 330), { fill: "#151D13", line: C.line });
  addText(slide, "Когда лучше не передавать", pos(672, 252, 420, 34), {
    size: 30,
    bold: true,
    color: C.coral,
  });
  const bad = [
    "клиент ищет бесплатную консультацию вместо платной работы",
    "нет бюджета даже на тестовый запуск",
    "заявки не обрабатывают или отвечают через несколько дней",
    "продукт, цена или оффер еще не собраны",
    "ожидание: «запустите рекламу и сразу сделайте продажи без участия бизнеса»",
  ];
  bad.forEach((t, i) => {
    const y = 314 + i * 40;
    addShape(slide, "rect", pos(676, y + 8, 12, 3), C.coral, "none", 0);
    addText(slide, t, pos(704, y, 430, 30), { size: 18, color: C.muted });
  });

  addCard(slide, pos(64, 582, 1152, 54), { fill: "#D8FF64", line: "none" });
  addText(slide, "Самый сильный интро-контекст: «Мы сделали проект. Следующий шаг - заявки. Есть маркетолог, который может посмотреть воронку и предложить план запуска».", pos(92, 600, 1060, 20), {
    size: 18,
    bold: true,
    color: C.black,
  });
}

function slide5(presentation) {
  const slide = presentation.slides.add();
  addBackground(slide);
  addHeader(
    slide,
    5,
    "математика партнера",
    "Сколько может приносить партнёрка при разном потоке клиентов",
    "База расчета: клиент оплатил работу маркетолога - партнер получил 20% от чека.",
  );

  addCard(slide, pos(64, 214, 1152, 78), { fill: "#D8FF64", line: "none" });
  addText(slide, "Формула", pos(96, 234, 120, 28), {
    size: 22,
    bold: true,
    color: C.black,
  });
  addText(slide, "чек 25-75 тыс. ₽  × 20%  =  5-15 тыс. ₽ с одной рекомендации", pos(230, 230, 800, 34), {
    typeface: FONT_HEAD,
    size: 30,
    bold: true,
    color: C.black,
  });
  addText(slide, "крупные проекты считаются так же: чек 150 тыс. ₽ = 30 тыс. ₽ партнеру", pos(232, 264, 760, 18), {
    size: 14,
    color: "#253119",
  });

  const rows = [
    ["2-4", "2-3", "2-3", "5-15 тыс. ₽", "15-45 тыс. ₽"],
    ["6-8", "4-6", "3-5", "5-15 тыс. ₽", "25-75 тыс. ₽"],
    ["10-12", "6-8", "5-7", "5-15 тыс. ₽", "40-105 тыс. ₽"],
    ["15+", "8-12", "7-10", "5-15 тыс. ₽", "60-150 тыс. ₽"],
  ];
  const headers = ["Новых клиентов / мес", "Кому предложили", "Оплаченных стартов", "Выплата с 1", "Ориентир / мес"];
  const x = 64;
  const y = 318;
  const widths = [214, 210, 238, 206, 236];
  const hHead = 48;
  const hRow = 58;

  let left = x;
  headers.forEach((h, i) => {
    addCard(slide, pos(left, y, widths[i], hHead), { fill: "#1B2B19", line: C.line });
    addText(slide, h, pos(left + 14, y + 14, widths[i] - 28, 18), {
      size: 14,
      bold: true,
      color: C.muted,
      align: i === 0 ? "left" : "center",
    });
    left += widths[i] + 6;
  });

  rows.forEach((r, row) => {
    let colLeft = x;
    r.forEach((cell, col) => {
      const bright = col === 4;
      addCard(slide, pos(colLeft, y + hHead + 8 + row * (hRow + 6), widths[col], hRow), {
        fill: bright ? C.lime : C.panel,
        line: bright ? "none" : C.line,
      });
      addText(slide, cell, pos(colLeft + 12, y + hHead + 24 + row * (hRow + 6), widths[col] - 24, 22), {
        typeface: col === 0 || col === 4 ? FONT_HEAD : FONT_BODY,
        size: col === 0 || col === 4 ? 24 : 20,
        bold: true,
        color: bright ? C.black : col === 0 ? C.lime : C.text,
        align: col === 0 ? "left" : "center",
      });
      colLeft += widths[col] + 6;
    });
  });

  addText(slide, "Нижняя граница сценариев - рабочий ориентир, а не математический минимум. Точная выплата всегда считается по фактическому оплаченному чеку.", pos(76, 636, 1080, 14), {
    size: 11,
    color: C.dim,
  });
}

function slide6(presentation) {
  const slide = presentation.slides.add();
  addBackground(slide);
  addHeader(
    slide,
    6,
    "процесс",
    "Как проходит передача клиента: 4 шага без лишней бюрократии",
    "Партнеру не нужно продавать за меня. Достаточно теплого интро и контекста по задаче.",
  );

  const steps = [
    ["1", "Вы делаете интро", "Добавляете меня в чат или передаете контакт. Желательно: сайт, ниша, задача, что уже сделано."],
    ["2", "Я квалифицирую запрос", "Смотрю продукт, воронку, готовность к запуску и говорю, где есть смысл начинать."],
    ["3", "Клиент получает смету", "Фиксируем задачу, чек, сроки, рекламные каналы и ожидаемый первый результат."],
    ["4", "После оплаты - выплата", "Когда клиент оплатил работу, вы получаете 20% с согласованного чека."],
  ];
  steps.forEach((s, i) => {
    const x = 64 + i * 288;
    addCard(slide, pos(x, 244, 260, 276), {
      fill: i === 3 ? "#D8FF64" : C.panel,
      line: i === 3 ? "none" : C.line,
    });
    const dark = i === 3;
    addText(slide, s[0], pos(x + 22, 270, 64, 58), {
      typeface: FONT_HEAD,
      size: 54,
      bold: true,
      color: dark ? C.black : C.lime,
    });
    addText(slide, s[1], pos(x + 24, 348, 204, 52), {
      size: 26,
      bold: true,
      color: dark ? C.black : C.text,
      lineSpacing: 0.98,
    });
    addText(slide, s[2], pos(x + 24, 418, 204, 70), {
      size: 16,
      color: dark ? "#263017" : C.muted,
      lineSpacing: 1.16,
    });
  });

  addCard(slide, pos(194, 566, 890, 54), { fill: "#101C13", line: C.line });
  addText(slide, "Что прислать в интро: ниша, сайт/соцсети, что вы уже сделали, какая задача у клиента, кто принимает решение.", pos(222, 584, 828, 20), {
    size: 18,
    bold: true,
    color: C.text,
    align: "center",
  });
}

function slide7(presentation) {
  const slide = presentation.slides.add();
  addBackground(slide);
  addHeader(
    slide,
    7,
    "условия",
    "Правила выплаты: чтобы всем было понятно до первого созвона",
    "Главное: источник закрепляется заранее, а деньги считаются только от оплаченного клиентом чека.",
  );

  const rules = [
    ["Что считается чеком", "Сумма, которую клиент оплатил за мою работу: аудит, запуск, ведение, аналитику или спринт."],
    ["Когда выплата", "После фактической оплаты клиента. Стандартно - в течение 1-3 рабочих дней после поступления денег."],
    ["Сколько выплат", "По умолчанию - с первого оплаченного чека. Повторные выплаты за ведение фиксируем отдельно до старта."],
    ["Как закрепляем источник", "В переписке до первого созвона: кто передал клиента, контакт клиента, задача и дата интро."],
  ];

  rules.forEach((r, i) => {
    const x = 64 + (i % 2) * 578;
    const y = 230 + Math.floor(i / 2) * 152;
    addCard(slide, pos(x, y, 548, 124), { fill: C.panel, line: C.line });
    addText(slide, r[0], pos(x + 24, y + 22, 350, 26), {
      size: 24,
      bold: true,
      color: C.lime,
    });
    addText(slide, r[1], pos(x + 24, y + 58, 470, 44), {
      size: 17,
      color: C.muted,
      lineSpacing: 1.16,
    });
  });

  addCard(slide, pos(64, 558, 1152, 70), { fill: "#D8FF64", line: "none" });
  const examples = [
    ["50 тыс. ₽", "10 тыс. ₽"],
    ["90 тыс. ₽", "18 тыс. ₽"],
    ["150 тыс. ₽", "30 тыс. ₽"],
  ];
  addText(slide, "Примеры:", pos(96, 580, 110, 24), {
    size: 21,
    bold: true,
    color: C.black,
  });
  examples.forEach((e, i) => {
    const x = 230 + i * 278;
    addText(slide, `${e[0]} чек → ${e[1]} партнеру`, pos(x, 580, 248, 24), {
      size: 21,
      bold: true,
      color: C.black,
      align: "center",
    });
  });
}

function slide8(presentation) {
  const slide = presentation.slides.add();
  addBackground(slide);

  addPill(slide, "готовое интро", 64, 52, 190, { fill: C.panel2, line: C.line });
  addText(slide, "Как предложить клиента\nбез неловкой продажи", pos(64, 110, 600, 112), {
    typeface: FONT_HEAD,
    size: 48,
    bold: true,
    color: C.text,
    lineSpacing: 0.96,
  });
  addText(slide, "Можно буквально скопировать текст ниже, заменить контекст и отправить клиенту после завершения своей части проекта.", pos(704, 126, 448, 70), {
    size: 20,
    color: C.muted,
    lineSpacing: 1.18,
  });

  addCard(slide, pos(64, 260, 690, 254), { fill: "#D8FF64", line: "none" });
  addText(slide, "Сообщение клиенту", pos(96, 290, 250, 26), {
    size: 18,
    bold: true,
    color: C.black,
  });
  addText(
    slide,
    "Привет! Следующий шаг после [сайта / дизайна / SMM] - понять, откуда будут заявки и как их считать. Могу познакомить с маркетологом: он посмотрит воронку, каналы и предложит понятный план запуска. Познакомить?",
    pos(96, 334, 600, 112),
    { size: 24, bold: true, color: C.black, lineSpacing: 1.12 },
  );
  addText(slide, "Такое интро сохраняет вашу роль: вы не продаете рекламу, вы помогаете клиенту закрыть следующий логичный шаг.", pos(96, 470, 590, 24), {
    size: 15,
    color: "#263017",
  });

  addCard(slide, pos(790, 260, 426, 254), { fill: C.panel, line: C.line2 });
  addText(slide, "Контакты", pos(820, 292, 260, 24), {
    size: 17,
    bold: true,
    color: C.muted,
  });
  addText(slide, "Telegram:\n@isrmtnkv", pos(820, 338, 300, 76), {
    typeface: FONT_HEAD,
    size: 32,
    bold: true,
    color: C.lime,
    lineSpacing: 1,
  });
  addText(slide, "Email: my@srmtnkv.ru", pos(822, 430, 300, 24), {
    size: 21,
    bold: true,
    color: C.text,
  });
  addText(slide, "Пишите в Telegram или на почту, если удобнее письмом.", pos(822, 472, 300, 24), {
    size: 15,
    color: C.muted,
  });

  addCard(slide, pos(64, 560, 1152, 68), { fill: "#0D190F", line: C.line });
  addText(slide, "Что писать мне: ниша клиента, ссылка на проект, какая работа уже сделана, какая задача по заявкам, кто принимает решение.", pos(94, 584, 1060, 20), {
    size: 18,
    bold: true,
    color: C.text,
    align: "center",
  });

  addFooter(slide, 8, "Маркетолог на аутсорсе");
}

async function main() {
  await fs.mkdir(PREVIEW, { recursive: true });
  await fs.mkdir(HIRES, { recursive: true });
  await fs.mkdir(LAYOUT, { recursive: true });

  const presentation = Presentation.create({
    slideSize: { width: W, height: H },
  });

  slide1(presentation);
  slide2(presentation);
  slide3(presentation);
  slide4(presentation);
  slide5(presentation);
  slide6(presentation);
  slide7(presentation);
  slide8(presentation);

  for (const [index, slide] of presentation.slides.items.entries()) {
    const stem = `slide-${String(index + 1).padStart(2, "0")}`;
    await writeBlob(
      `${PREVIEW}/${stem}.png`,
      await presentation.export({ slide, format: "png", scale: 1 }),
    );
    await writeBlob(
      `${HIRES}/${stem}.png`,
      await presentation.export({ slide, format: "png", scale: 3 }),
    );
    const layout = await slide.export({ format: "layout" });
    await fs.writeFile(`${LAYOUT}/${stem}.layout.json`, await layout.text());
  }

  await writeBlob(
    `${PREVIEW}/deck-montage.webp`,
    await presentation.export({ format: "webp", montage: true, scale: 1 }),
  );

  const pptx = await PresentationFile.exportPptx(presentation);
  await pptx.save(FINAL);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
