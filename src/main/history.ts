/**
 * History Storage Module
 * 
 * Manages browsing history with a simple JSON file storage.
 * This avoids native module bundling issues with better-sqlite3.
 */

import { app } from 'electron'
import path from 'node:path'
import fs from 'node:fs'

// ============================================
// Types
// ============================================

interface HistoryEntry {
    id: number
    url: string
    title: string
    favicon: string
    visitCount: number
    lastVisited: number
}

interface HistoryData {
    entries: HistoryEntry[]
    nextId: number
}

// ============================================
// Storage
// ============================================

let historyData: HistoryData = { entries: [], nextId: 1 }
let historyPath: string = ''
let saveTimeout: NodeJS.Timeout | null = null

function getHistoryPath(): string {
    if (!historyPath) {
        const userDataPath = app.getPath('userData')
        historyPath = path.join(userDataPath, 'browsing-history.json')
        console.log('History file path:', historyPath)
    }
    return historyPath
}

function loadHistory(): void {
    try {
        const filePath = getHistoryPath()
        if (fs.existsSync(filePath)) {
            const data = fs.readFileSync(filePath, 'utf-8')
            historyData = JSON.parse(data)
            console.log(`Loaded ${historyData.entries.length} history entries`)
        }
    } catch (err) {
        console.error('Failed to load history:', err)
        historyData = { entries: [], nextId: 1 }
    }
}

function saveHistoryDebounced(): void {
    // Debounce saves to avoid excessive file writes
    if (saveTimeout) {
        clearTimeout(saveTimeout)
    }
    saveTimeout = setTimeout(() => {
        saveHistorySync()
    }, 1000)
}

function saveHistorySync(): void {
    try {
        const filePath = getHistoryPath()
        fs.writeFileSync(filePath, JSON.stringify(historyData, null, 2))
    } catch (err) {
        console.error('Failed to save history:', err)
    }
}

// Initialize on first access
let initialized = false
function ensureInitialized(): void {
    if (!initialized) {
        loadHistory()
        initialized = true
    }
}

// ============================================
// Public API
// ============================================

/**
 * Add or update a history entry
 */
export function addHistoryEntry(url: string, title?: string, favicon?: string): void {
    ensureInitialized()

    // Skip internal URLs
    if (url.startsWith('poseidon://') || url.startsWith('about:') || url.startsWith('chrome:')) {
        return
    }

    const now = Date.now()

    // Check if URL already exists
    const existingIndex = historyData.entries.findIndex(e => e.url === url)

    if (existingIndex >= 0) {
        // Update existing entry
        const existing = historyData.entries[existingIndex]
        existing.visitCount++
        existing.lastVisited = now
        if (title && title !== 'Untitled') existing.title = title
        if (favicon) existing.favicon = favicon

        // Move to front (most recent)
        historyData.entries.splice(existingIndex, 1)
        historyData.entries.unshift(existing)
    } else {
        // Add new entry at the front
        const entry: HistoryEntry = {
            id: historyData.nextId++,
            url,
            title: title || url,
            favicon: favicon || '',
            visitCount: 1,
            lastVisited: now
        }
        historyData.entries.unshift(entry)

        // Keep max 1000 entries
        if (historyData.entries.length > 1000) {
            historyData.entries = historyData.entries.slice(0, 1000)
        }
    }

    saveHistoryDebounced()
}

/**
 * Update an existing history entry (for title/favicon updates)
 */
export function updateHistoryEntry(url: string, title?: string, favicon?: string): void {
    ensureInitialized()

    const entry = historyData.entries.find(e => e.url === url)
    if (entry) {
        if (title && title !== 'Untitled') entry.title = title
        if (favicon) entry.favicon = favicon
        saveHistoryDebounced()
    }
}

/**
 * Search history entries by query (matches URL and title)
 */
export function searchHistory(query: string, limit: number = 10): HistoryEntry[] {
    ensureInitialized()

    const q = query.toLowerCase()

    return historyData.entries
        .filter(entry =>
            entry.url.toLowerCase().includes(q) ||
            entry.title.toLowerCase().includes(q)
        )
        .slice(0, limit)
}

/**
 * Get top visited sites
 */
export function getTopSites(limit: number = 8): HistoryEntry[] {
    ensureInitialized()

    return [...historyData.entries]
        .sort((a, b) => b.visitCount - a.visitCount)
        .slice(0, limit)
}

/**
 * Get recent history
 */
export function getRecentHistory(limit: number = 20): HistoryEntry[] {
    ensureInitialized()

    return historyData.entries.slice(0, limit)
}

/**
 * Clear all history
 */
export function clearHistory(): void {
    historyData = { entries: [], nextId: 1 }
    saveHistorySync()
}

/**
 * Close database (save any pending changes)
 */
export function closeDatabase(): void {
    if (saveTimeout) {
        clearTimeout(saveTimeout)
    }
    saveHistorySync()
    console.log('History saved on close')
}
