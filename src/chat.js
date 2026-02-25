export class ChatService {
    constructor(aiService) {
        this.conversations = [];
        this.currentConversationId = null;
        this.currentCategory = 'general';
        this.filterCategory = 'all';
        this.CONVERSATIONS_KEY = 'chat_conversations';
        this.uploadedFiles = [];
        this.aiService = aiService;
    }
    setUploadedFiles(files) {
        this.uploadedFiles = files;
    }
    getUploadedFiles() {
        return this.uploadedFiles;
    }
    clearUploadedFiles() {
        this.uploadedFiles = [];
    }
    loadConversations() {
        const stored = localStorage.getItem(this.CONVERSATIONS_KEY);
        this.conversations = stored ? JSON.parse(stored) : [];
        if (this.conversations.length === 0) {
            this.newConversation();
        }
        else {
            this.currentConversationId = this.conversations[0].id;
        }
        this.renderConversations();
        this.renderMessages();
    }
    newConversation() {
        const conversation = {
            id: Date.now().toString(),
            title: `Nota ${this.conversations.length + 1}`,
            messages: [],
            category: this.currentCategory
        };
        this.conversations.unshift(conversation);
        this.currentConversationId = conversation.id;
        this.saveConversations();
        this.renderConversations();
        this.renderMessages();
    }
    setCurrentCategory(category) {
        this.currentCategory = category;
        const conversation = this.conversations.find(c => c.id === this.currentConversationId);
        if (conversation) {
            conversation.category = category;
            this.saveConversations();
        }
    }
    filterByCategory(category) {
        this.filterCategory = category;
        this.renderConversations();
    }
    async sendMessage(content, category = 'general') {
        if (!this.currentConversationId)
            return;
        const userMessage = {
            role: 'user',
            content,
            timestamp: Date.now(),
            category,
            files: this.uploadedFiles.length > 0 ? [...this.uploadedFiles] : undefined
        };
        this.addMessage(userMessage);
        this.renderMessages();
        // Crear mensaje temporal de IA
        const tempAiMessage = {
            role: 'ai',
            content: '',
            timestamp: Date.now(),
            category
        };
        this.addMessage(tempAiMessage);
        // Enviar con archivos si hay
        const aiResponse = await this.aiService.chat(content, (partialText) => {
            const conversation = this.conversations.find(c => c.id === this.currentConversationId);
            if (conversation && conversation.messages.length > 0) {
                conversation.messages[conversation.messages.length - 1].content = partialText;
                this.renderMessages();
            }
        }, this.uploadedFiles.length > 0 ? this.uploadedFiles : undefined);
        // Limpiar archivos después de enviar
        this.clearUploadedFiles();
        // Update final message
        const conversation = this.conversations.find(c => c.id === this.currentConversationId);
        if (conversation && conversation.messages.length > 0) {
            conversation.messages[conversation.messages.length - 1].content = aiResponse;
            this.saveConversations();
            this.renderMessages();
        }
    }
    stopAIResponse() {
        this.aiService.stopGeneration();
    }
    getLastAIMessage() {
        const conversation = this.conversations.find(c => c.id === this.currentConversationId);
        if (!conversation)
            return null;
        const aiMessages = conversation.messages.filter(m => m.role === 'ai');
        return aiMessages.length > 0 ? aiMessages[aiMessages.length - 1].content : null;
    }
    addMessage(message) {
        const conversation = this.conversations.find(c => c.id === this.currentConversationId);
        if (conversation) {
            conversation.messages.push(message);
            this.saveConversations();
        }
    }
    renderConversations() {
        const container = document.getElementById('conversations');
        const filtered = this.filterCategory === 'all'
            ? this.conversations
            : this.conversations.filter(c => c.category === this.filterCategory);
        container.innerHTML = filtered.map(conv => {
            const categoryEmoji = this.getCategoryEmoji(conv.category);
            return `
        <div class="conversation-item ${conv.id === this.currentConversationId ? 'active' : ''}" 
             data-id="${conv.id}">
          ${categoryEmoji} ${conv.title}
        </div>
      `;
        }).join('');
        container.querySelectorAll('.conversation-item').forEach(item => {
            item.addEventListener('click', () => {
                this.currentConversationId = item.dataset.id;
                this.renderConversations();
                this.renderMessages();
                // Update category select
                const conversation = this.conversations.find(c => c.id === this.currentConversationId);
                if (conversation) {
                    const select = document.getElementById('note-category');
                    select.value = conversation.category || 'general';
                }
            });
        });
    }
    getCategoryEmoji(category) {
        switch (category) {
            case 'resumen': return '📄';
            case 'tarea': return '✏️';
            case 'importante': return '⭐';
            default: return '💬';
        }
    }
    getCategoryBadge(category) {
        if (!category || category === 'general')
            return '';
        const labels = {
            resumen: 'Resumen',
            tarea: 'Tarea',
            importante: 'Importante'
        };
        return `<span class="message-badge badge-${category}">${labels[category] || category}</span>`;
    }
    renderMessages() {
        const container = document.getElementById('messages');
        const conversation = this.conversations.find(c => c.id === this.currentConversationId);
        if (!conversation) {
            container.innerHTML = '';
            return;
        }
        container.innerHTML = conversation.messages.map(msg => {
            const filesHtml = msg.files && msg.files.length > 0 ? `
        <div class="message-files">
          ${msg.files.map(file => `
            <div class="message-file">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M13 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V9z"/>
                <path d="M13 2v7h7"/>
              </svg>
              ${file.name}
            </div>
          `).join('')}
        </div>
      ` : '';
            return `
        <div class="message ${msg.role}">
          ${this.getCategoryBadge(msg.category)}
          ${msg.content}
          ${filesHtml}
        </div>
      `;
        }).join('');
        container.scrollTop = container.scrollHeight;
    }
    saveConversations() {
        localStorage.setItem(this.CONVERSATIONS_KEY, JSON.stringify(this.conversations));
    }
}
