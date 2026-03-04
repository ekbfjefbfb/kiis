import { AuthService } from './auth';
import { ChatService } from './chat';
import { AudioService } from './audio';
import { NotesService } from './notes';
import { DatabaseService } from './database';
import { AIService } from './api';
import * as helpers from './app-helpers';

class App {
  private authService: AuthService;
  private chatService: ChatService;
  private audioService: AudioService;
  private notesService: NotesService;
  private dbService: DatabaseService;
  private aiService: AIService;
  public currentNoteId: string | null = null;
  public currentAudioBlob: Blob | null = null;

  constructor() {
    this.authService = new AuthService();
    this.aiService = new AIService(this.authService);
    this.chatService = new ChatService(this.aiService);
    this.audioService = new AudioService();
    this.dbService = new DatabaseService();
    this.notesService = new NotesService(this.dbService);
    this.init();
  }

  private async init() {
    try {
      await this.dbService.init();
      this.registerServiceWorker();
      this.setupAuthListeners();
      this.setupChatListeners();
      this.setupAudioListeners();
      helpers.setupNotesListeners(this);
      helpers.setupNoteAudioListeners(this);
      helpers.setupTabListeners(this);
      this.setupMobileMenu();
      helpers.setupFileUpload(this);
      this.checkAuth();
    } catch (error) {
      console.error('Error al inicializar:', error);
    }
  }

  private registerServiceWorker() {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .catch((err) => console.error('Error SW:', err));
    }
  }

  private setupAuthListeners() {
    const loginBtn = document.getElementById('login-btn');
    const googleLoginBtn = document.getElementById('google-login-btn');
    const goToSignup = document.getElementById('go-to-signup');
    const signupBtn = document.getElementById('signup-btn');
    const googleSignupBtn = document.getElementById('google-signup-btn');
    const goToLogin = document.getElementById('go-to-login');
    const logoutBtn = document.getElementById('logout-btn');

    console.log('Setting up auth listeners...', { signupBtn, loginBtn });

    if (loginBtn) {
      loginBtn.addEventListener('click', (e) => {
        e.preventDefault();
        console.log('Login button clicked');
        this.handleLogin();
      });
    }
    
    if (googleLoginBtn) {
      googleLoginBtn.addEventListener('click', (e) => {
        e.preventDefault();
        console.log('Google login clicked');
        this.handleGoogleLogin();
      });
    }
    
    if (goToSignup) {
      goToSignup.addEventListener('click', (e) => {
        e.preventDefault();
        this.showSignupScreen();
      });
    }
    
    if (signupBtn) {
      signupBtn.addEventListener('click', (e) => {
        e.preventDefault();
        console.log('Signup button clicked!');
        this.handleSignup();
      });
    }
    
    if (googleSignupBtn) {
      googleSignupBtn.addEventListener('click', (e) => {
        e.preventDefault();
        console.log('Google signup clicked');
        this.handleGoogleSignup();
      });
    }
    
    if (goToLogin) {
      goToLogin.addEventListener('click', (e) => {
        e.preventDefault();
        this.showLoginScreen();
      });
    }
    
    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => this.handleLogout());
    }
  }

  private setupChatListeners() {
    const sendBtn = document.getElementById('send-btn');
    const stopAiBtn = document.getElementById('stop-ai-btn');
    const messageInput = document.getElementById('message-input') as HTMLInputElement;
    const newChatBtn = document.getElementById('new-chat-btn');
    const categorySelect = document.getElementById('note-category') as HTMLSelectElement;

    if (sendBtn) sendBtn.addEventListener('click', () => this.sendMessage());
    if (stopAiBtn) stopAiBtn.addEventListener('click', () => {
      this.chatService.stopAIResponse();
      stopAiBtn.style.display = 'none';
      if (sendBtn) sendBtn.style.display = 'flex';
    });
    
    if (messageInput) messageInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        this.sendMessage();
      }
    });
    
    if (newChatBtn) newChatBtn.addEventListener('click', () => this.chatService.newConversation());
    
    document.querySelectorAll('.category-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const category = (e.currentTarget as HTMLElement).dataset.category!;
        this.chatService.filterByCategory(category);
        document.querySelectorAll('.category-btn').forEach(b => b.classList.remove('active'));
        (e.currentTarget as HTMLElement).classList.add('active');
      });
    });

    if (categorySelect) categorySelect.addEventListener('change', () => {
      this.chatService.setCurrentCategory(categorySelect.value);
    });
  }

  private setupAudioListeners() {
    const recordBtn = document.getElementById('record-btn');
    const speakBtn = document.getElementById('speak-btn');
    const recordingStatus = document.getElementById('recording-status');

    if (recordBtn) recordBtn.addEventListener('click', async () => {
      if (this.audioService.getIsRecording()) {
        this.audioService.stopRecording();
        recordBtn.classList.remove('recording');
        if (recordingStatus) {
          recordingStatus.textContent = '';
          recordingStatus.classList.remove('active');
        }
      } else {
        // Request permission first
        const hasPermission = await this.audioService.requestPermissions();
        if (!hasPermission) {
          alert('Necesitas dar permiso al micrófono para usar esta función');
          return;
        }

        if (recordingStatus) {
          recordingStatus.textContent = 'Escuchando...';
          recordingStatus.classList.add('active');
        }
        recordBtn.classList.add('recording');
        
        this.audioService.startRecording(
          (text) => {
            const input = document.getElementById('message-input') as HTMLInputElement;
            if (input) input.value = text;
            recordBtn.classList.remove('recording');
            if (recordingStatus) {
              recordingStatus.textContent = '';
              recordingStatus.classList.remove('active');
            }
          },
          (error) => {
            alert('Error al grabar: ' + error);
            recordBtn.classList.remove('recording');
            if (recordingStatus) {
              recordingStatus.textContent = '';
              recordingStatus.classList.remove('active');
            }
          }
        );
      }
    });

    if (speakBtn) speakBtn.addEventListener('click', () => {
      const lastMessage = this.chatService.getLastAIMessage();
      if (lastMessage) {
        speakBtn.classList.add('speaking');
        this.audioService.speak(lastMessage, () => {
          speakBtn.classList.remove('speaking');
        });
      }
    });
  }

  private setupMobileMenu() {
    const menuToggle = document.getElementById('mobile-menu-toggle');
    const sidebar = document.getElementById('sidebar');
    const closeSidebar = document.getElementById('close-sidebar');

    if (menuToggle && sidebar) menuToggle.addEventListener('click', () => {
      sidebar.classList.add('open');
    });

    if (closeSidebar && sidebar) closeSidebar.addEventListener('click', () => {
      sidebar.classList.remove('open');
    });

    document.addEventListener('click', (e) => {
      if (window.innerWidth <= 768 && sidebar) {
        const target = e.target as HTMLElement;
        if (!sidebar.contains(target) && menuToggle && !menuToggle.contains(target)) {
          sidebar.classList.remove('open');
        }
      }
    });
  }

  private async handleGoogleLogin() {
    const success = await this.authService.loginWithGoogle();
    if (success) this.showChatScreen();
    else alert('Error al iniciar sesión con Google');
  }

  private async handleGoogleSignup() {
    const success = await this.authService.loginWithGoogle();
    if (success) this.showChatScreen();
    else alert('Error al registrarse con Google');
  }

  private async handleLogin() {
    const email = (document.getElementById('login-email') as HTMLInputElement)?.value;
    const password = (document.getElementById('login-password') as HTMLInputElement)?.value;
    if (!email || !password) return alert('Completa todos los campos');
    const success = await this.authService.login(email, password);
    if (success) this.showChatScreen();
    else alert('Email o contraseña incorrectos');
  }

  private async handleSignup() {
    const name = (document.getElementById('signup-name') as HTMLInputElement)?.value?.trim();
    const email = (document.getElementById('signup-email') as HTMLInputElement)?.value?.trim();
    const password = (document.getElementById('signup-password') as HTMLInputElement)?.value;
    const confirmPassword = (document.getElementById('signup-confirm-password') as HTMLInputElement)?.value;
    
    console.log('Signup clicked:', { name, email, password, confirmPassword });
    
    if (!name || !email || !password || !confirmPassword) {
      alert('Completa todos los campos');
      return;
    }
    
    if (password !== confirmPassword) {
      alert('Las contraseñas no coinciden');
      return;
    }
    
    const success = await this.authService.register(email, password, name);
    console.log('Register result:', success);
    
    if (success) {
      this.showChatScreen();
    } else {
      alert('Error al crear la cuenta');
    }
  }

  private handleLogout() {
    this.authService.logout();
    this.showLoginScreen();
  }

  private async sendMessage() {
    const input = document.getElementById('message-input') as HTMLInputElement;
    const categorySelect = document.getElementById('note-category') as HTMLSelectElement;
    const sendBtn = document.getElementById('send-btn');
    const stopAiBtn = document.getElementById('stop-ai-btn');
    const message = input?.value.trim();
    if (!message) return;
    const category = categorySelect?.value || 'general';
    if (input) input.value = '';
    if (sendBtn) sendBtn.style.display = 'none';
    if (stopAiBtn) stopAiBtn.style.display = 'flex';
    await this.chatService.sendMessage(message, category);
    helpers.renderFilePreview(this, []);
    if (stopAiBtn) stopAiBtn.style.display = 'none';
    if (sendBtn) sendBtn.style.display = 'flex';
    if (window.innerWidth <= 768) document.getElementById('sidebar')?.classList.remove('open');
  }

  private checkAuth() {
    if (this.authService.isAuthenticated()) this.showChatScreen();
    else this.showSignupScreen(); // Mostrar registro primero
  }

  private showLoginScreen() {
    document.getElementById('login-screen')?.classList.remove('hidden');
    document.getElementById('signup-screen')?.classList.add('hidden');
    document.getElementById('chat-screen')?.classList.add('hidden');
  }

  private showSignupScreen() {
    document.getElementById('login-screen')?.classList.add('hidden');
    document.getElementById('signup-screen')?.classList.remove('hidden');
    document.getElementById('chat-screen')?.classList.add('hidden');
  }

  private async showChatScreen() {
    console.log('showChatScreen called');
    
    const loginScreen = document.getElementById('login-screen');
    const signupScreen = document.getElementById('signup-screen');
    const chatScreen = document.getElementById('chat-screen');
    
    console.log('Screens found:', { loginScreen, signupScreen, chatScreen });
    
    if (loginScreen) loginScreen.classList.add('hidden');
    if (signupScreen) signupScreen.classList.add('hidden');
    if (chatScreen) chatScreen.classList.remove('hidden');
    
    console.log('Screens toggled');
    
    const user = this.authService.getCurrentUser();
    console.log('Current user:', user);
    
    const displayText = user?.displayName || user?.email || 'Usuario';
    const userEmail = document.getElementById('user-email');
    if (userEmail) {
      userEmail.textContent = displayText;
      console.log('User email set:', displayText);
    }
    
    try {
      console.log('Loading conversations...');
      this.chatService.loadConversations();
      console.log('Loading notes...');
      await this.notesService.loadNotes();
      console.log('Chat screen ready!');
    } catch (error) {
      console.error('Error loading data:', error);
    }
  }
}

new App();
