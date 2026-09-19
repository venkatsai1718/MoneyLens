import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import type { CalculationResult, YearlyDataPoint } from '../types/calculator'
import { formatINR, formatAxisINR, todayFormatted } from './format'

export interface PDFColumn {
  key: keyof YearlyDataPoint
  label: string
  isCurrency?: boolean
}

const INK = '#212529'
const MUTED = '#6c757d'
const BORDER = '#dee2e6'
const INVESTED_COLOR = '#495057'
const VALUE_COLOR = '#212529'

/**
 * Draws a fresh line chart onto an offscreen canvas from the calculation's
 * yearlyData — this is generated specifically for the PDF (not a screenshot
 * of the on-page chart), so it renders crisply at print resolution.
 */
function renderYearlyChart(yearlyData: YearlyDataPoint[], withdrawMode: boolean): string {
  const canvas = document.createElement('canvas')
  const scale = 2
  canvas.width = 1000 * scale
  canvas.height = 420 * scale
  const ctx = canvas.getContext('2d')!
  ctx.scale(scale, scale)
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, 1000, 420)

  const padding = { top: 24, right: 24, bottom: 40, left: 90 }
  const chartW = 1000 - padding.left - padding.right
  const chartH = 420 - padding.top - padding.bottom

  const seriesA = yearlyData.map((d) => (withdrawMode ? d.openingBalance ?? 0 : d.totalInvestedTillDate))
  const seriesB = yearlyData.map((d) => d.closingBalance)
  const maxVal = Math.max(1, ...seriesA, ...seriesB)

  // Gridlines + y-axis labels
  ctx.strokeStyle = BORDER
  ctx.fillStyle = MUTED
  ctx.font = '11px Arial'
  ctx.textAlign = 'right'
  const gridLines = 4
  for (let i = 0; i <= gridLines; i++) {
    const y = padding.top + (chartH / gridLines) * i
    const val = maxVal - (maxVal / gridLines) * i
    ctx.beginPath()
    ctx.moveTo(padding.left, y)
    ctx.lineTo(padding.left + chartW, y)
    ctx.stroke()
    ctx.fillText(formatAxisINR(val), padding.left - 10, y + 4)
  }

  const n = yearlyData.length
  const xFor = (i: number) => padding.left + (n <= 1 ? chartW / 2 : (chartW / (n - 1)) * i)
  const yFor = (v: number) => padding.top + chartH - (v / maxVal) * chartH

  function drawLine(series: number[], color: string) {
    ctx.strokeStyle = color
    ctx.lineWidth = 2.5
    ctx.beginPath()
    series.forEach((v, i) => {
      const x = xFor(i)
      const y = yFor(v)
      if (i === 0) ctx.moveTo(x, y)
      else ctx.lineTo(x, y)
    })
    ctx.stroke()
  }

  drawLine(seriesA, INVESTED_COLOR)
  drawLine(seriesB, VALUE_COLOR)

  // x-axis labels (years)
  ctx.fillStyle = MUTED
  ctx.textAlign = 'center'
  const step = Math.max(1, Math.ceil(n / 10))
  yearlyData.forEach((d, i) => {
    if (i % step === 0 || i === n - 1) {
      ctx.fillText(`Y${d.year}`, xFor(i), padding.top + chartH + 18)
    }
  })

  // Legend
  ctx.textAlign = 'left'
  ctx.fillStyle = INVESTED_COLOR
  ctx.fillRect(padding.left, 4, 10, 10)
  ctx.fillStyle = INK
  ctx.fillText(withdrawMode ? 'Opening Corpus' : 'Total Invested', padding.left + 16, 13)
  ctx.fillStyle = VALUE_COLOR
  ctx.fillRect(padding.left + 180, 4, 10, 10)
  ctx.fillStyle = INK
  ctx.fillText(withdrawMode ? 'Closing Corpus' : 'Portfolio Value', padding.left + 196, 13)

  return canvas.toDataURL('image/png', 1.0)
}

export interface PDFExportOptions {
  brandName?: string
  disclaimer: string
  withdrawMode?: boolean
}

export function generatePDF(result: CalculationResult, columns: PDFColumn[], options: PDFExportOptions): jsPDF {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' })
  const pageWidth = doc.internal.pageSize.getWidth()
  const margin = 40
  let y = 50

  // Header
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(18)
  doc.setTextColor(INK)
  doc.text(options.brandName ?? 'MoneyLens', margin, y)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  doc.setTextColor(MUTED)
  doc.text(todayFormatted(), pageWidth - margin, y, { align: 'right' })

  y += 24
  doc.setDrawColor(BORDER)
  doc.line(margin, y, pageWidth - margin, y)

  y += 30
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(15)
  doc.setTextColor(INK)
  doc.text(`${result.calculatorName} Calculator Report`, margin, y)

  // Assumptions
  y += 26
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(11)
  doc.text('Assumptions', margin, y)
  y += 6
  autoTable(doc, {
    startY: y,
    margin: { left: margin, right: margin },
    theme: 'plain',
    styles: { fontSize: 9.5, textColor: '#212529', cellPadding: 3 },
    body: result.assumptions.map((a) => [a.label, a.value]),
    columnStyles: { 0: { fontStyle: 'bold', cellWidth: 200 }, 1: {} },
  })
  y = (doc as any).lastAutoTable.finalY + 20

  // Summary cards
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(11)
  doc.text('Summary', margin, y)
  y += 10
  const cards: { label: string; value: string }[] = [
    { label: 'Total Invested', value: formatINR(result.summary.totalInvested) },
    { label: 'Total Returns', value: formatINR(result.summary.totalReturns) },
    { label: 'Final Value', value: formatINR(result.summary.finalValue) },
  ]
  if (result.summary.totalWithdrawn !== undefined) {
    cards.push({ label: 'Total Withdrawn', value: formatINR(result.summary.totalWithdrawn) })
  }
  if (result.inflationApplied && result.summary.inflationAdjustedValue !== undefined) {
    cards.push({ label: `Inflation-Adjusted Value (@${result.inflationRate}%)`, value: formatINR(result.summary.inflationAdjustedValue) })
  }
  const cardW = (pageWidth - margin * 2 - (cards.length - 1) * 10) / cards.length
  cards.forEach((c, i) => {
    const x = margin + i * (cardW + 10)
    doc.setDrawColor(BORDER)
    doc.setFillColor('#f8f9fa')
    doc.roundedRect(x, y, cardW, 46, 4, 4, 'FD')
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8)
    doc.setTextColor(MUTED)
    doc.text(c.label, x + 8, y + 16, { maxWidth: cardW - 16 })
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(11.5)
    doc.setTextColor(INK)
    doc.text(c.value, x + 8, y + 34, { maxWidth: cardW - 16 })
  })
  y += 46 + 26

  // Chart
  if (result.yearlyData.length > 0) {
    const chartImg = renderYearlyChart(result.yearlyData, !!options.withdrawMode)
    const chartW = pageWidth - margin * 2
    const chartH = chartW * 0.42
    if (y + chartH > 760) {
      doc.addPage()
      y = 50
    }
    doc.addImage(chartImg, 'PNG', margin, y, chartW, chartH)
    y += chartH + 24
  }

  // Year-wise table
  if (y > 700) {
    doc.addPage()
    y = 50
  }
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(11)
  doc.setTextColor(INK)
  doc.text('Year-wise Breakdown', margin, y)
  y += 8

  autoTable(doc, {
    startY: y,
    margin: { left: margin, right: margin },
    head: [columns.map((c) => c.label)],
    body: result.yearlyData.map((row) =>
      columns.map((c) => {
        const val = row[c.key]
        if (typeof val !== 'number') return String(val ?? '')
        return c.isCurrency !== false ? formatINR(val) : String(val)
      }),
    ),
    styles: { fontSize: 8.5, cellPadding: 5, textColor: '#212529' },
    headStyles: { fillColor: '#212529', textColor: '#f8f9fa', fontStyle: 'bold' },
    alternateRowStyles: { fillColor: '#f8f9fa' },
    didDrawPage: () => {
      const pageCount = doc.getNumberOfPages()
      doc.setFontSize(8)
      doc.setTextColor(MUTED)
      doc.text(`Page ${pageCount}`, pageWidth - margin, 820, { align: 'right' })
    },
  })

  y = (doc as any).lastAutoTable.finalY + 24
  if (y > 760) {
    doc.addPage()
    y = 50
  }

  // Disclaimer
  doc.setFont('helvetica', 'italic')
  doc.setFontSize(8)
  doc.setTextColor(MUTED)
  const disclaimerLines = doc.splitTextToSize(options.disclaimer, pageWidth - margin * 2)
  doc.text(disclaimerLines, margin, y)

  return doc
}

export function downloadPDF(result: CalculationResult, columns: PDFColumn[], filename: string, options: PDFExportOptions) {
  const doc = generatePDF(result, columns, options)
  doc.save(filename.endsWith('.pdf') ? filename : `${filename}.pdf`)
}
