import sqlite3
import datetime

DB_NAME = 'assistant.db'

def init_db():
    conn = sqlite3.connect(DB_NAME)
    c = conn.cursor()
    c.execute('''CREATE TABLE IF NOT EXISTS agenda
                 (id INTEGER PRIMARY KEY AUTOINCREMENT,
                  content TEXT NOT NULL,
                  date TEXT,
                  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP)''')
    c.execute('''CREATE TABLE IF NOT EXISTS diary
                 (id INTEGER PRIMARY KEY AUTOINCREMENT,
                  content TEXT NOT NULL,
                  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP)''')
    c.execute('''CREATE TABLE IF NOT EXISTS chats
                 (id INTEGER PRIMARY KEY AUTOINCREMENT,
                  role TEXT NOT NULL,
                  content TEXT NOT NULL,
                  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP)''')
    conn.commit()
    conn.close()

def add_agenda(content, date=None):
    conn = sqlite3.connect(DB_NAME)
    c = conn.cursor()
    c.execute("INSERT INTO agenda (content, date) VALUES (?, ?)", (content, date))
    conn.commit()
    conn.close()

def add_diary(content):
    conn = sqlite3.connect(DB_NAME)
    c = conn.cursor()
    c.execute("INSERT INTO diary (content) VALUES (?)", (content,))
    conn.commit()
    conn.close()

def add_chat(role, content):
    conn = sqlite3.connect(DB_NAME)
    c = conn.cursor()
    c.execute("INSERT INTO chats (role, content) VALUES (?, ?)", (role, content))
    conn.commit()
    conn.close()

def get_agenda():
    conn = sqlite3.connect(DB_NAME)
    c = conn.cursor()
    c.execute("SELECT content, date, timestamp FROM agenda ORDER BY timestamp DESC")
    rows = c.fetchall()
    conn.close()
    return [{"content": r[0], "date": r[1], "timestamp": r[2]} for r in rows]

def get_diary():
    conn = sqlite3.connect(DB_NAME)
    c = conn.cursor()
    c.execute("SELECT content, timestamp FROM diary ORDER BY timestamp DESC")
    rows = c.fetchall()
    conn.close()
    return [{"content": r[0], "timestamp": r[1]} for r in rows]

def get_chats():
    conn = sqlite3.connect(DB_NAME)
    c = conn.cursor()
    # Limit to last 50 messages for now
    c.execute("SELECT role, content, timestamp FROM chats ORDER BY timestamp ASC LIMIT 50")
    rows = c.fetchall()
    conn.close()
    return [{"role": r[0], "content": r[1], "timestamp": r[2]} for r in rows]
