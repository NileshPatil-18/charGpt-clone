const pool = require('../db');
const { setStreamController, abortStream } = require('../streams/streamManager');

exports.createChat = async (req, res) => {
  try {
    const { title } = req.body;
    const result = await pool.query(
      'INSERT INTO chats(title) VALUES ($1) RETURNING id, title, created_at',
      [title || `Chat ${new Date().toLocaleString()}`]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error creating chat:', err);
    res.status(500).json({ error: 'Failed to create chat' });
  }
};

exports.getChats = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, title, created_at FROM chats ORDER BY created_at DESC'
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching chats:', err);
    res.status(500).json({ error: 'Failed to fetch chats' });
  }
};

exports.getChatMessages = async (req, res) => {
  try {
    const { chatId } = req.params;
    const result = await pool.query(
      'SELECT role, content FROM messages WHERE chat_id = $1 ORDER BY created_at ASC',
      [chatId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Error getting messages:', err);
    res.status(500).json({ error: 'Failed to get messages' });
  }
};

exports.sendMessage = async (req, res) => {
  const { chatId } = req.params;
  const content = req.query.content || req.body.content;

  if (!content?.trim()) {
    return res.status(400).json({ error: "Message content is required" });
  }

  const controller = new AbortController();
  setStreamController(chatId, controller);

  req.on('close', () => {
    if (!res.headersSent) {
      controller.abort();
    }
  });

  try {
    // Save user message
    await pool.query(
      `INSERT INTO messages (chat_id, role, content) VALUES ($1, $2, $3)`,
      [chatId, 'user', content.trim()]
    );

    // Get conversation history
    const history = await pool.query(
      `SELECT role, content FROM messages WHERE chat_id = $1 ORDER BY created_at ASC`,
      [chatId]
    );

    // Set up SSE
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

      req.on('close', () => {
      controller.abort();
    });
    // Call Ollama
    const response = await fetch('http://127.0.0.1:11434/api/chat', {
      method: 'POST',
      signal: controller.signal,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'gemma3:1b',
        stream: true,
        messages: [
          ...history.rows.map(msg => ({ role: msg.role, content: msg.content })),
          { role: 'user', content }
        ]
      }),
    });

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let fullResponse = '';
    let isComplete = false;

    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        isComplete = true;
        break;
      }

      const chunk = decoder.decode(value);
      const lines = chunk.split('\n').filter(line => line.trim());

      for (const line of lines) {
        try {
          const parsed = JSON.parse(line);
          if (parsed.message?.content) {
            res.write(`data: ${parsed.message.content}\n\n`);
            fullResponse += parsed.message.content;
          }
        } catch (e) {
          console.warn('Non-JSON line:', line);
        }
      }
    }

    // Only save complete responses
    if (isComplete) {
      await pool.query(
        `INSERT INTO messages (chat_id, role, content) VALUES ($1, $2, $3)`,
        [chatId, 'assistant', fullResponse]
      );
    }

    res.write('event: end\ndata: [DONE]\n\n');
  } catch (err) {
    if (err.name === 'AbortError') {
      console.log('Stream was aborted by user');
      // Don't save incomplete messages when aborted
    } else {
      console.error('Stream error:', err);
      res.write('event: error\ndata: ' + JSON.stringify({ error: err.message }) + '\n\n');
    }
  } finally {
    if (!res.headersSent) {
      res.end();
    }
    abortStream(chatId);
  }
};

exports.stopMessage = async (req, res) => {
  const { chatId } = req.params;
  try {
    abortStream(chatId);
    res.json({ status: "Stream aborted successfully" });
  } catch (err) {
    console.error('Error stopping stream:', err);
    res.status(500).json({ error: "Failed to stop stream" });
  }
};

exports.updateChatTitle = async (req, res) => {
  try {
    const { chatId } = req.params;
    const { title } = req.body;

    const result = await pool.query(
      'UPDATE chats SET title = $1 WHERE id = $2 RETURNING *',
      [title, chatId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Chat not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating chat title:', error);
    res.status(500).json({ error: 'Failed to update chat title' });
  }
};