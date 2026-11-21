import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage } from "pdf-lib";
import type { CycleInsight } from "./insights";
import type { CycleReport } from "./cycle-report";

const PAGE_WIDTH = 595.28;
const PAGE_HEIGHT = 841.89;
const MARGIN = 48;
const INK = rgb(0.08, 0.075, 0.067);
const MUTED = rgb(0.416, 0.4, 0.373);
const TRACK = rgb(0.894, 0.882, 0.855);
const BAR = rgb(0.337, 0.439, 0.059);
const BAR_SOFT = rgb(0.8, 0.871, 0.42);
const CARD = rgb(0.973, 0.969, 0.957);

const CYCLE_STATUS: Record<string, string> = {
  DRAFT: "Rascunho",
  SELF_EVALUATION: "Autoavaliação",
  LEADER_EVALUATION: "Avaliação do líder",
  COMPARISON: "Comparação",
  FEEDBACK: "Devolutiva",
  CLOSED: "Encerrado",
};

function formatRange(startsAt: Date, endsAt: Date) {
  const format = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short", year: "numeric" });
  return `${format.format(startsAt)} a ${format.format(endsAt)}`;
}

function score(value: number | null) {
  if (value == null) return "-";
  return value.toLocaleString("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
}

class PdfCursor {
  private doc: PDFDocument;
  private page: PDFPage;
  private font: PDFFont;
  private bold: PDFFont;
  private y: number;

  private constructor(doc: PDFDocument, page: PDFPage, font: PDFFont, bold: PDFFont) {
    this.doc = doc;
    this.page = page;
    this.font = font;
    this.bold = bold;
    this.y = PAGE_HEIGHT - MARGIN;
  }

  static async create() {
    const doc = await PDFDocument.create();
    const font = await doc.embedFont(StandardFonts.Helvetica);
    const bold = await doc.embedFont(StandardFonts.HelveticaBold);
    const page = doc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
    return new PdfCursor(doc, page, font, bold);
  }

  private ensure(height: number) {
    if (this.y - height >= MARGIN) return;
    this.page = this.doc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
    this.y = PAGE_HEIGHT - MARGIN;
  }

  text(value: string, options?: { size?: number; bold?: boolean; color?: ReturnType<typeof rgb>; x?: number }) {
    const size = options?.size ?? 11;
    const font = options?.bold ? this.bold : this.font;
    this.ensure(size + 6);
    this.page.drawText(value, {
      x: options?.x ?? MARGIN,
      y: this.y - size,
      size,
      font,
      color: options?.color ?? INK,
    });
    this.y -= size + 6;
  }

  paragraph(value: string, size = 10) {
    const maxWidth = PAGE_WIDTH - MARGIN * 2;
    const words = value.split(/\s+/);
    let line = "";
    for (const word of words) {
      const next = line ? `${line} ${word}` : word;
      if (this.font.widthOfTextAtSize(next, size) > maxWidth) {
        this.text(line, { size, color: MUTED });
        line = word;
      } else {
        line = next;
      }
    }
    if (line) this.text(line, { size, color: MUTED });
  }

  gap(amount = 14) {
    this.y -= amount;
  }

  heading(value: string) {
    this.gap(8);
    this.text(value, { size: 13, bold: true });
    this.gap(4);
  }

  bar(label: string, value: number | null, max: number) {
    this.ensure(28);
    const labelWidth = 130;
    const barWidth = 250;
    const ratio = value == null || max === 0 ? 0 : Math.min(1, value / max);
    const top = this.y - 4;
    this.page.drawText(label, {
      x: MARGIN,
      y: top - 10,
      size: 9,
      font: this.font,
      color: MUTED,
    });
    this.page.drawRectangle({
      x: MARGIN + labelWidth,
      y: top - 12,
      width: barWidth,
      height: 8,
      color: TRACK,
    });
    if (ratio > 0) {
      this.page.drawRectangle({
        x: MARGIN + labelWidth,
        y: top - 12,
        width: Math.max(4, barWidth * ratio),
        height: 8,
        color: label === "Líder" ? BAR : BAR_SOFT,
      });
    }
    this.page.drawText(score(value), {
      x: MARGIN + labelWidth + barWidth + 10,
      y: top - 11,
      size: 9,
      font: this.bold,
      color: INK,
    });
    this.y -= 22;
  }

  table(headers: string[], rows: string[][], widths: number[]) {
    const rowHeight = 22;
    const drawRow = (cells: string[], header = false) => {
      this.ensure(rowHeight + 4);
      let x = MARGIN;
      const top = this.y;
      if (header) {
        this.page.drawRectangle({
          x: MARGIN,
          y: top - rowHeight + 6,
          width: PAGE_WIDTH - MARGIN * 2,
          height: rowHeight,
          color: CARD,
        });
      }
      cells.forEach((cell, index) => {
        const width = (widths[index] ?? 80) - 10;
        const font = header ? this.bold : this.font;
        let label = cell;
        while (label.length > 1 && font.widthOfTextAtSize(label, 9) > width) {
          label = label.slice(0, -2);
        }
        if (label !== cell) label = `${label.trimEnd()}...`;
        this.page.drawText(label, {
          x: x + 6,
          y: top - 12,
          size: 9,
          font,
          color: header ? MUTED : INK,
        });
        x += widths[index] ?? 80;
      });
      this.y -= rowHeight;
    };
    drawRow(headers, true);
    if (!rows.length) {
      drawRow(["Sem dados neste recorte", "", "", ""]);
      return;
    }
    for (const row of rows) drawRow(row);
  }

  async bytes() {
    return this.doc.save();
  }
}

export async function renderCyclePdf(report: CycleReport, insights: CycleInsight[]) {
  const pdf = await PdfCursor.create();
  const final = report.cycle.status === "CLOSED";

  pdf.text("growly", { size: 12, bold: true });
  pdf.text(final ? "Relatório de encerramento" : "Prévia do relatório", {
    size: 20,
    bold: true,
  });
  pdf.text(report.cycle.name, { size: 14, bold: true });
  pdf.paragraph(
    `${report.companyName} · ${formatRange(report.cycle.startsAt, report.cycle.endsAt)} · ${CYCLE_STATUS[report.cycle.status] ?? report.cycle.status}`,
  );
  pdf.paragraph(
    `${report.selfDone}/${report.people.length} autoavaliações enviadas · ${report.leaderDone}/${report.people.length} avaliações de líder enviadas`,
  );

  pdf.heading("Leitura");
  for (const insight of insights) {
    pdf.text(insight.title, { size: 11, bold: true });
    pdf.paragraph(insight.text);
    pdf.gap(6);
  }

  pdf.heading("Competências");
  pdf.paragraph("Barras da média enviada. A mais clara é a autoavaliação e a mais escura é a nota do líder.");
  if (!report.skills.length) {
    pdf.paragraph("Nenhuma nota enviada ainda.");
  }
  for (const skill of report.skills) {
    pdf.text(skill.name, { size: 11, bold: true });
    pdf.bar("Auto", skill.self, skill.scaleMax);
    pdf.bar("Líder", skill.leader, skill.scaleMax);
    pdf.paragraph(
      skill.gap == null
        ? "Gap ainda sem as duas notas."
        : `Gap ${skill.gap > 0 ? "+" : ""}${score(skill.gap)} (autoavaliação menos líder).`,
    );
    pdf.gap(4);
  }

  pdf.heading("Pessoas do ciclo");
  pdf.table(
    ["Pessoa", "Time", "Autoavaliação", "Líder"],
    report.people.map((person) => [person.name, person.team, person.self, person.leader]),
    [170, 120, 110, 90],
  );

  const bytes = await pdf.bytes();
  return Buffer.from(bytes);
}
