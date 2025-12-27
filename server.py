
import http.server
import socketserver
import json
import os
import mimetypes
from database_utils import init_db, add_agenda, add_diary, get_agenda, get_diary, add_chat, get_chats
from gemini_client import generate_content

PORT = 8000
# Updated to serve dist
PUBLIC_DIR = os.path.join(os.path.dirname(__file__), 'dist')

class RequestHandler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        if self.path.startswith('/api/agenda'):
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            data = get_agenda()
            self.wfile.write(json.dumps(data).encode())
            return
            
        if self.path.startswith('/api/diary'):
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            data = get_diary()
            self.wfile.write(json.dumps(data).encode())
            return

        if self.path.startswith('/api/chat/history'):
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            data = get_chats()
            self.wfile.write(json.dumps(data).encode())
            return

        # Serve static files from public directory
        if self.path == '/':
            self.path = '/index.html'
            
        file_path = os.path.join(PUBLIC_DIR, self.path.lstrip('/'))
        
        # Fallback to index.html for React routing if file not found
        if not os.path.exists(file_path) and not self.path.startswith('/api'):
             file_path = os.path.join(PUBLIC_DIR, 'index.html')

        if os.path.exists(file_path) and os.path.isfile(file_path):
            self.send_response(200)
            mime_type, _ = mimetypes.guess_type(file_path)
            self.send_header('Content-type', mime_type or 'application/octet-stream')
            self.end_headers()
            with open(file_path, 'rb') as f:
                self.wfile.write(f.read())
        else:
            self.send_error(404, "File not found")

    def do_POST(self):
        if self.path == '/api/chat':
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            request = json.loads(post_data)
            user_message = request.get('message', '')
            add_chat('user', user_message)

            # System Prompt for Gemini
            system_prompt = f"""
            You are a helpful personal assistant. Your job is to categorize the user's input and extract data.
            User Input: "{user_message}"
            
            Return ONLY a valid JSON object with no markdown formatting. The JSON must have this structure:
            {{
                "type": "AGENDA" or "DIARY" or "CHAT",
                "content": "The extracted core content of the agenda item or diary entry. If it is just chat, put the response here.",
                "date": "If agenda, extract the date/time as a string. Else null.",
                "reply": "A friendly conversational response to the user confirming the action or answering the question."
            }}
            """
            
            # Call Gemini
            ai_response_text = generate_content(system_prompt)
            print(f"Raw AI Response: {ai_response_text}")

            try:
                # Clean up potential markdown code blocks if Gemini adds them
                cleaned_text = ai_response_text.replace('```json', '').replace('```', '').strip()
                ai_data = json.loads(cleaned_text)
                
                response_type = ai_data.get('type', 'CHAT').upper()
                content = ai_data.get('content', '')
                reply = ai_data.get('reply', 'I processed that.')
                date = ai_data.get('date')

                if response_type == 'AGENDA':
                    add_agenda(content, date)
                elif response_type == 'DIARY':
                    add_diary(content)
                
                add_chat('assistant', reply)
                
                self.send_response(200)
                self.send_header('Content-type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({"reply": reply, "type": response_type}).encode())

            except json.JSONDecodeError:
                # Fallback if AI returns invalid JSON
                self.send_response(200)
                self.send_header('Content-type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({
                    "reply": ai_response_text, # Just return what it said
                    "type": "CHAT"
                }).encode())
            return

        self.send_error(404)

if __name__ == "__main__":
    init_db()
    with socketserver.TCPServer(("", PORT), RequestHandler) as httpd:
        print(f"Serving at port {PORT}")
        httpd.serve_forever()
