
Local ChatGPT-style Chat App   
📝 Overview  
A real-time chat application with streaming responses powered by Ollama's LLM. Features include persistent chat history, real-time message streaming, and the ability to stop ongoing responses.  

🛠 Tech Stack  
  Backend  
    Node.js (v18+)  
    Express (Web framework)  
    PostgreSQL (Database)  
    Ollama (Local LLM inference)  

  Frontend  
    React (v18+)  
    Next.js (v14+)  
    EventSource API (For server-sent events)  

🚀 Setup Instructions  
  1. Ollama Setup  
    Install Ollama from ollama.ai  
    Pull the desired model:

    ollama pull gemma3:1b  
  
  Start Ollama:  
  
      ollama serve  
  
2. Database Setup  

  Manual Setup:  
    Install PostgreSQL 15+  
    Create database and tables:    
  
    sql  
    CREATE DATABASE chat_app;  
    \c chat_app  
    CREATE TABLE chats (  
      id SERIAL PRIMARY KEY,  
      title VARCHAR(255) NOT NULL,  
      created_at TIMESTAMP DEFAULT NOW()  
    );  
    CREATE TABLE messages (  
      id SERIAL PRIMARY KEY,  
      chat_id INTEGER REFERENCES chats(id),  
      role VARCHAR(20) NOT NULL,  
      content TEXT NOT NULL,  
      created_at TIMESTAMP DEFAULT NOW()  
    );  
    
3. Backend Setup  
  Clone the repository  

  Install dependencies:  
  
    bash  
    cd backend  
    npm install  
    
Configure environment variables (create .env file):    

  env  
  
    DATABASE_URL=postgres://username:password@localhost:5432/chat_app  
    PORT=5000  
    
  Start the server:  

    bash  
    npm start  
    
4. Frontend Setup  
    
   Navigate to frontend directory:    
  
        cd frontend  
      
  Install dependencies:  
  
      bash  
      npm install  
      
  Configure environment variables (create .env.local file):  
  
    env  
    
      NEXT_PUBLIC_API_URL=http://localhost:5000  
      
     Start the development server:  
  
      bash  
      npm run dev  
    
🏃 Local Run Instructions  
    Start Ollama in a terminal:  
    
    bash  
    ollama serve  
    
Start PostgreSQL  

Start backend server:  

    bash  
    cd backend && npm start  
    
Start frontend:  

    bash  
    cd frontend && npm run dev  
    
Open browser to http://localhost:3000  

⚙️ Configuration Options  
  Backend    
  
    PORT: Server port (default: 5000)  

    DATABASE_URL: PostgreSQL connection string  

    OLLAMA_ENDPOINT: Ollama API endpoint (default: http://127.0.0.1:11434)  

Frontend    

    NEXT_PUBLIC_API_URL: Backend API URL (default: http://localhost:5000)  

📌 Assumptions & Constraints  
  Ollama Requirements:    
    Requires at least 8GB RAM for smaller models  
    Gemma3:1b requires ~10GB disk space  
    Only tested on Linux/macOS (Windows support may vary)  

  Database:  
    PostgreSQL 15+ required  
    Assumes local installation or Docker usage  
    No automatic migrations included  

  Performance:  
      Streaming responses may be slow on low-end hardware  
      No production-grade load balancing implemented  

  Security:    
    No authentication implemented  
    Not suitable for production use without additional security measures  

  Browser Support:  
    Requires modern browser with EventSource support  
    Not tested on mobile devices    

🧑‍💻 Development Notes  
      Backend API follows REST conventions with SSE for streaming  
      Frontend uses React hooks for state management  
      All database operations use parameterized queries to prevent SQL injection    
      Error handling is basic - production use would require more robust solutions  
