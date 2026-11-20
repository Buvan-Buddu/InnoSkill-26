async function testOllamaChat() {
  try {
    console.log('Sending request to local Ollama on http://127.0.0.1:11434/api/chat...');
    const res = await fetch('http://127.0.0.1:11434/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'llama2:latest',
        messages: [{ role: 'user', content: 'Respond with valid JSON containing {"status": "OLLAMA_OK"}' }],
        stream: false,
        format: 'json'
      })
    });
    const data = await res.json();
    console.log('Ollama response content:', data.message?.content);
  } catch (e) {
    console.log('Ollama chat error:', e.message);
  }
}
testOllamaChat();
