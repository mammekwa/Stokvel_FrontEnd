const escapeCell = (value) => {
  if (value === null || value === undefined) return ''
  const text = String(value)
  return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text
}

// columns: [{ header, value: (row) => any }]
export const toCsv = (rows, columns) => {
  const lines = [columns.map((column) => escapeCell(column.header)).join(',')]
  rows.forEach((row) => {
    lines.push(columns.map((column) => escapeCell(column.value(row))).join(','))
  })
  return lines.join('\r\n')
}

export const downloadFile = (filename, content, type = 'text/csv;charset=utf-8') => {
  // BOM so Excel opens UTF-8 (e.g. names with accents) correctly.
  const blob = new Blob(['﻿', content], { type })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}

export const slugify = (text) =>
  String(text || 'report')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
