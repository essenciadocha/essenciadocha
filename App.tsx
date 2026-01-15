import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Search, X, Check, Heart, Flame, Sparkles, Home, User, Leaf, Palette, Edit2, Clock, History, Plus, Coffee, Droplets, Lock, Globe, ChevronUp, Mail, LogIn, Wand2, Smartphone } from 'lucide-react';
import { Recipe, UserProgress, CategoryType, Language, ColorMode } from './types';
import { RECIPES, getIcon, NUTRI_TIPS, INGREDIENTS_POOL } from './constants';
import { motion as motionBase, AnimatePresence } from 'framer-motion';
import { initializeApp } from 'firebase/app';
// Fix: Import named exports directly from firebase/auth to avoid TypeScript errors with namespace import
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged, 
  setPersistence, 
  browserLocalPersistence, 
  browserSessionPersistence, 
  sendPasswordResetEmail 
} from 'firebase/auth';
import { getFirestore, doc, setDoc, onSnapshot } from 'firebase/firestore';
import { GoogleGenAI } from "@google/genai";

const motion = motionBase as any;

/**
 * CONFIGURAÇÃO FIREBASE
 * Utilizando process.env conforme configurado no vite.config.ts para injetar as variáveis
 * corretamente na Vercel e localmente.
 */
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID
};

// Inicialização segura do Firebase
let app: any;
let auth: any;
let db: any;

try {
  // Inicializa apenas se a API Key estiver presente
  if (firebaseConfig.apiKey) {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
  }
} catch (e) {
  console.error("Erro na inicialização do Firebase:", e);
}

const THEME_COLORS = [
  { name: 'Musgo', color: '#064E3B' },
  { name: 'Royal', color: '#1E3A8A' },
  { name: 'Borgonha', color: '#7F1D1D' },
  { name: 'Slate', color: '#334155' },
  { name: 'Lavanda', color: '#581C87' },
  { name: 'Oceano', color: '#0F766E' },
  { name: 'Terracota', color: '#9A3412' },
  { name: 'Sálvia', color: '#15803D' },
  { name: 'Grafite', color: '#1F2937' },
  { name: 'Amora', color: '#701A75' },
  { name: 'Bronze', color: '#92400E' },
  { name: 'Floresta', color: '#14532D' }
];

const TRANSLATIONS: Record<Language, any> = {
  'pt-BR': {
    appTitle: 'Essência do Chá',
    appSubtitle: 'LEVEZA NO CORPO, PAZ NA MENTE.',
    searchPlaceholder: 'Busque por ingrediente ou benefício...',
    catAll: 'Todos',
    catWeight: 'Emagrecer',
    catRelax: 'Relaxar',
    catDigestion: 'Digestão',
    catDebloat: 'Desinchar',
    greeting: 'Buscando saúde ou tranquilidade hoje?',
    hello: 'Olá',
    optionsCount: 'OPÇÕES',
    chooseTea: 'Escolha seu chá',
    yourFavorites: 'Seus Favoritos',
    verMais: '👁️ VER MAIS DE +1.080 RECEITAS EXCLUSIVAS',
    noTeas: 'Nenhum chá encontrado.',
    clearSearch: 'Limpar busca',
    navHome: 'INÍCIO',
    navRoutine: 'ATIVOS',
    navFavs: 'FAVORITOS',
    navProfile: 'PERFIL',
    navLang: 'IDIOMA',
    btnTop: 'TOPO',
    disclaimer: 'Este aplicativo contém receitas de tratamentos naturais e não substitui a consulta médica. Sempre consulte um profissional de saúde antes de iniciar qualquer dieta ou consumo de ervas.',
    instruction: 'Instrução de Uso',
    ingredients: 'Ingredientes do Ritual',
    startProtocol: 'INICIAR PROTOCOLO',
    days: 'DIAS',
    activeTreatment: 'Tratamento em Curso',
    markDoses: 'Marque as doses diárias para acompanhar seu progresso',
    themes: 'Temas',
    setYourName: 'Toque para definir seu nome',
    dosesDone: 'doses concluídas',
    noProtocol: 'Nenhuma receita iniciada',
    noFavs: 'Você ainda não tem favoritos',
    min: 'min',
    dose: 'Dose',
    tipTitle: 'DICAS DIÁRIAS',
    ing_portion: '1 porção de',
    ing_water: '250ml de água filtrada',
    ing_touch: 'Toque cítrico opcional',
    loginTitle: 'Bem-vindo(a) de volta',
    loginSubtitle: 'Acesse seu portal de bem-estar',
    emailLabel: 'E-MAIL',
    passLabel: 'SENHA',
    btnLogin: 'Entrar',
    forgotPass: 'ESQUECI MINHA SENHA',
    rememberMe: 'Lembrar meu acesso',
    logout: 'Sair da Conta',
    resetSent: 'E-mail de recuperação enviado!',
    usage_base: 'Consumir 2x ao dia, preferencialmente morno.',
    tips: NUTRI_TIPS,
    aiSommelier: 'Sommelier IA'
  },
  'pt-PT': {
    appTitle: 'Essência do Chá',
    appSubtitle: 'LEVEZA NO CORPO, PAZ NA MENTE.',
    searchPlaceholder: 'Procure por ingrediente ou benefício...',
    catAll: 'Todos',
    catWeight: 'Emagrecer',
    catRelax: 'Relaxar',
    catDigestion: 'Digestão',
    catDebloat: 'Desinchar',
    greeting: 'À procura de saúde ou tranquilidade hoje?',
    hello: 'Olá',
    optionsCount: 'OPÇÕES',
    chooseTea: 'Escolha o seu chá',
    yourFavorites: 'Os Seus Favoritos',
    verMais: '👁️ VER MAIS DE +1.080 RECEITAS EXCLUSIVAS',
    noTeas: 'Nenhum chá encontrado.',
    clearSearch: 'Limpar procura',
    navHome: 'INÍCIO',
    navRoutine: 'ATIVOS',
    navFavs: 'FAVORITOS',
    navProfile: 'PERFIL',
    navLang: 'IDIOMA',
    btnTop: 'TOPO',
    disclaimer: 'Esta aplicação contém receitas de tratamentos naturais e não substitui a consulta médica. Consulte sempre um profissional de saúde antes de iniciar qualquer dieta ou consumo de ervas.',
    instruction: 'Instrução de Uso',
    ingredients: 'Ingredientes do Ritual',
    startProtocol: 'INICIAR PROTOCOLO',
    days: 'DIAS',
    activeTreatment: 'Tratamento em Curso',
    markDoses: 'Marque as doses diárias para acompanhar o seu progresso',
    themes: 'Temas',
    setYourName: 'Toque para definir o seu nome',
    dosesDone: 'doses concluídas',
    noProtocol: 'Nenhuma receita iniciada',
    noFavs: 'Ainda não tem favoritos',
    min: 'min',
    dose: 'Dose',
    tipTitle: 'DICAS DIÁRIAS',
    ing_portion: '1 porção de',
    ing_water: '250ml de água filtrada',
    ing_touch: 'Toque cítrico opcional',
    loginTitle: 'Bem-vindo(a)',
    loginSubtitle: 'Aceda ao seu portal de bem-estar',
    emailLabel: 'E-MAIL',
    passLabel: 'PALAVRA-PASSE',
    btnLogin: 'Entrar',
    forgotPass: 'ESQUECI A MINHA SENHA',
    rememberMe: 'Lembrar o meu acesso',
    logout: 'Sair',
    resetSent: 'E-mail de recuperação enviado!',
    usage_base: 'Consumir 2x ao dia, preferencialmente morno.',
    tips: NUTRI_TIPS,
    aiSommelier: 'Sommelier IA'
  },
  'es': {
    appTitle: 'Esencia del Té',
    appSubtitle: 'LIGEREZA EN EL CUERPO, PAZ EN LA MENTE.',
    searchPlaceholder: 'Busca por ingrediente o beneficio...',
    catAll: 'Todos',
    catWeight: 'Adelgazar',
    catRelax: 'Relax',
    catDigestion: 'Digestión',
    catDebloat: 'Deshinchar',
    greeting: '¿Buscas salud o tranquilidad hoy?',
    hello: 'Hola',
    optionsCount: 'OPCIONES',
    chooseTea: 'Elige tu té',
    yourFavorites: 'Tus Favoritos',
    verMais: '👁️ VER MÁS DE +1.080 RECETAS EXCLUSIVAS',
    noTeas: 'No se encontraron tés.',
    clearSearch: 'Limpiar búsqueda',
    navHome: 'INICIO',
    navRoutine: 'ACTIVOS',
    navFavs: 'FAVORITOS',
    navProfile: 'PERFIL',
    navLang: 'IDIOMA',
    btnTop: 'ARRIBA',
    disclaimer: 'Esta aplicación contiene receitas de tratamentos naturais e não substitui a consulta médica. Siempre consulte a un profesional de la salud antes de iniciar cualquier dieta o consumo de hierbas.',
    instruction: 'Instrucción de Uso',
    ingredients: 'Ingredientes del Ritual',
    startProtocol: 'INICIAR PROTOCOLO',
    days: 'DÍAS',
    activeTreatment: 'Tratamiento en Curso',
    markDoses: 'Marque las dosis diarias para seguir su progreso',
    themes: 'Temas',
    setYourName: 'Toca para definir tu nombre',
    dosesDone: 'dosis completadas',
    noProtocol: 'Ninguna receta iniciada',
    noFavs: 'Aún no tienes favoritos',
    min: 'min',
    dose: 'Dosis',
    tipTitle: 'CONSEJOS DIARIOS',
    ing_portion: '1 porción de',
    ing_water: '250ml de agua filtrada',
    ing_touch: 'Toque cítrico opcional',
    loginTitle: 'Bienvenido(a)',
    loginSubtitle: 'Accede a tu portal de bienestar',
    emailLabel: 'CORREO ELECTRÓNICO',
    passLabel: 'CONTRASEÑA',
    btnLogin: 'Entrar',
    forgotPass: 'OLVIDÉ MI CONTRASEÑA',
    rememberMe: 'Recordar mi acceso',
    logout: 'Cerrar sesión',
    resetSent: '¡Correo de recuperação enviado!',
    usage_base: 'Consumir 2 veces al día, preferiblemente tibio.',
    tips: NUTRI_TIPS,
    aiSommelier: 'Sommelier IA'
  },
  'en': {
    appTitle: 'Essence of Tea',
    appSubtitle: 'LIGHTNESS IN BODY, PEACE IN MIND.',
    searchPlaceholder: 'Search by ingredient or benefit...',
    catAll: 'All',
    catWeight: 'Lose Weight',
    catRelax: 'Relax',
    catDigestion: 'Digestion',
    catDebloat: 'Debloat',
    greeting: 'Looking for health or tranquility today?',
    hello: 'Hello',
    optionsCount: 'OPTIONS',
    chooseTea: 'Choose your tea',
    yourFavorites: 'Your Favorites',
    verMais: '👁️ SEE MORE OF +1,080 EXCLUSIVE RECIPES',
    noTeas: 'No teas found.',
    clearSearch: 'Clear search',
    navHome: 'HOME',
    navRoutine: 'ACTIVE',
    navFavs: 'FAVORITES',
    navProfile: 'PROFILE',
    navLang: 'LANGUAGE',
    btnTop: 'TOP',
    disclaimer: 'This app contains natural treatment recipes and does not replace medical advice. Always consult a healthcare professional before starting any diet or herb consumption.',
    instruction: 'Usage Instruction',
    ingredients: 'Ritual Ingredients',
    startProtocol: 'START PROTOCOL',
    days: 'DAYS',
    activeTreatment: 'Treatment in Progress',
    markDoses: 'Mark daily doses to track your progress',
    themes: 'Themes',
    setYourName: 'Tap to set your name',
    dosesDone: 'doses completed',
    noProtocol: 'No recipe started',
    noFavs: 'No favorites yet',
    min: 'min',
    dose: 'Dose',
    tipTitle: 'DAILY TIPS',
    ing_portion: '1 portion of',
    ing_water: '250ml filtered water',
    ing_touch: 'Optional citrus touch',
    loginTitle: 'Welcome back',
    loginSubtitle: 'Access your wellness portal',
    emailLabel: 'EMAIL',
    passLabel: 'PASSWORD',
    btnLogin: 'Log In',
    forgotPass: 'FORGOT PASSWORD',
    rememberMe: 'Remember me',
    logout: 'Log Out',
    resetSent: 'Recovery email sent!',
    usage_base: 'Consume 2 times a day, preferably warm.',
    tips: NUTRI_TIPS,
    aiSommelier: 'AI Sommelier'
  }
};

const LANGS: { code: Language; label: string }[] = [
  { code: 'pt-BR', label: 'BR' },
  { code: 'pt-PT', label: 'PT' },
  { code: 'es', label: 'ES' },
  { code: 'en', label: 'US' }
];

const App: React.FC = () => {
  const [user, setUser] = useState<any | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'home' | 'history' | 'favorites' | 'profile'>('home');
  const [category, setCategory] = useState<CategoryType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [accentColor, setAccentColor] = useState('#064E3B');
  const [userName, setUserName] = useState(''); 
  const [isExpanded, setIsExpanded] = useState(false);
  const [language, setLanguage] = useState<Language>('pt-BR');
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);
  const [showTopBtn, setShowTopBtn] = useState(false);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const t = useMemo(() => TRANSLATIONS[language], [language]);

  const [progress, setProgress] = useState<UserProgress>({
    teaCount: 0,
    lastTeaDate: null,
    history: [],
    favorites: [],
    streak: 0,
    dailyDoses: {},
    weeklyCheckins: new Array(7).fill(false),
    cycleStartDates: {}
  });

  const translateDynamic = (text: string) => {
    let newText = text;
    if (language === 'pt-PT') {
      newText = newText.replace(/xícara/gi, 'chávena').replace(/suco/gi, 'sumo');
    }
    
    if (language === 'es') {
      newText = newText
        .replace(/Infusão de/g, 'Infusión de')
        .replace(/Redução de Medidas/g, 'Reducción de Medidas')
        .replace(/Sono Profundo/g, 'Sueño Profundo')
        .replace(/Digestão Leve/g, 'Digestión Ligera')
        .replace(/Efeito Desincha/g, 'Efecto Deshincha')
        .replace(/Aqueça a água sem ferver/g, 'Calienta el agua sin hervir')
        .replace(/Deixe a erva em infusão por 5 minutos/g, 'Deja la hierba en infusión por 5 minutos')
        .replace(/Coe e consuma imediatamente/g, 'Cuela y consume de inmediato');
    } else if (language === 'en') {
      newText = newText
        .replace(/Infusão de/g, 'Infusion of')
        .replace(/Redução de Medidas/g, 'Weight Reduction')
        .replace(/Sono Profundo/g, 'Deep Sleep')
        .replace(/Digestão Leve/g, 'Light Digestion')
        .replace(/Efeito Desincha/g, 'Debloat Effect')
        .replace(/Aqueça a água sem ferver/g, 'Heat water without boiling')
        .replace(/Deixe a erva em infusão por 5 minutos/g, 'Let the herb steep for 5 minutes')
        .replace(/Coe e consuma imediatamente/g, 'Strain and consume immediately');
    }
    return newText;
  };

  // Captura do evento de instalação PWA
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setInstallPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  // Monitoramento de sessão única e Auth State
  useEffect(() => {
    if (!auth) {
      setAuthLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (currentUser: any) => {
      setUser(currentUser);
      if (currentUser) {
        setUserName(currentUser.displayName || currentUser.email?.split('@')[0] || '');
        
        // Single Session Monitor
        onSnapshot(doc(db, 'users', currentUser.uid), (docSnapshot: any) => {
          const data = docSnapshot.data();
          if (data && data.sessionId) {
            const currentSessionId = localStorage.getItem('essencia_session_id');
            if (currentSessionId && data.sessionId !== currentSessionId) {
               localStorage.setItem('essencia_logout_reason', 'concurrent_login');
               signOut(auth);
            }
          }
        });
      }
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const savedProgress = localStorage.getItem('essencia_health_v15');
    if (savedProgress) {
      const parsed = JSON.parse(savedProgress) as Partial<UserProgress>;
      setProgress(prev => ({ ...prev, ...parsed }));
      if (parsed.language) setLanguage(parsed.language);
    }
    const savedColor = localStorage.getItem('essencia_theme_color');
    if (savedColor) setAccentColor(savedColor);
    const savedName = localStorage.getItem('essencia_user_name');
    if (savedName) setUserName(savedName);
  }, []);

  useEffect(() => {
    localStorage.setItem('essencia_health_v15', JSON.stringify({ ...progress, language }));
  }, [progress, language]);

  useEffect(() => {
    localStorage.setItem('essencia_theme_color', accentColor);
  }, [accentColor]);

  useEffect(() => {
    localStorage.setItem('essencia_user_name', userName);
  }, [userName]);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;
    const handleScroll = () => {
      setShowTopBtn(container.scrollTop > 800);
    };
    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, []);

  const dailyTipIndex = useMemo(() => {
    const dayOfYear = Math.floor(new Date().getTime() / 8.64e7);
    return dayOfYear % t.tips.length;
  }, [t.tips.length]);

  const filteredRecipes = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return RECIPES.filter(r => {
      const matchesCategoryFilter = category === 'all' ? true : r.category === category;
      if (!matchesCategoryFilter) return false;
      if (!q) return true;
      const translatedName = translateDynamic(r.name).toLowerCase();
      const translatedBenefit = translateDynamic(r.benefit).toLowerCase();
      return translatedName.includes(q) || translatedBenefit.includes(q) || r.name.toLowerCase().includes(q) || r.benefit.toLowerCase().includes(q);
    });
  }, [searchQuery, category, language]);

  const displayedRecipes = useMemo(() => {
    if (isExpanded) return filteredRecipes;
    return filteredRecipes.slice(0, 20);
  }, [filteredRecipes, isExpanded]);

  const favoritedRecipes = useMemo(() => {
    return RECIPES.filter(r => progress.favorites.includes(r.id));
  }, [progress.favorites]);

  const handleToggleFavorite = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setProgress(prev => ({
      ...prev,
      favorites: prev.favorites.includes(id) ? prev.favorites.filter(favId => favId !== id) : [...prev.favorites, id]
    }));
  };

  const startCycle = (id: string) => {
    setProgress(prev => ({
      ...prev,
      cycleStartDates: { ...prev.cycleStartDates, [id]: new Date().toISOString() }
    }));
  };

  const scrollToTop = () => {
    scrollContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavClick = (id: string) => {
    if (id === 'lang') {
      setIsLangMenuOpen(!isLangMenuOpen);
    } else {
      if (id === activeTab && (id === 'home' || id === 'history' || id === 'favorites')) {
        scrollToTop();
      }
      setActiveTab(id as any);
      setIsLangMenuOpen(false);
    }
  };

  const handleAISommelier = async () => {
    if (!searchQuery) return;
    setIsAiLoading(true);
    try {
      // Use process.env as configured in vite.config.ts
      const apiKey = process.env.API_KEY;
      const ai = new GoogleGenAI({ apiKey: apiKey });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Você é um sommelier de chás especialista. O usuário está sentindo ou buscando por: "${searchQuery}". Analise nossa lista de ervas: ${INGREDIENTS_POOL.slice(0, 50).join(', ')}. Identifique o ingrediente mais adequado para essa necessidade. Responda APENAS o nome do ingrediente (exatamente como na lista) para filtrar a busca, sem textos adicionais.`,
      });
      const text = response.text;
      if (text) {
        setSearchQuery(text.trim());
      }
    } catch (err) {
      console.error("AI Sommelier Error:", err);
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleInstallApp = async () => {
    if (!installPrompt) {
        console.log("Instalação automática não disponível. Tente instalar via menu do navegador.");
        return;
    }
    installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    if (outcome === 'accepted') {
      setInstallPrompt(null);
    }
  };

  const AuthScreen = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(false);
    const [error, setError] = useState('');
    const [info, setInfo] = useState('');

    useEffect(() => {
      const logoutReason = localStorage.getItem('essencia_logout_reason');
      if (logoutReason === 'concurrent_login') {
        setError('Este acesso foi desconectado pois o login foi realizado em outro dispositivo.');
        localStorage.removeItem('essencia_logout_reason');
      }
    }, []);

    const handleAuth = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!auth) {
        setError("Firebase não conectado. Verifique a configuração.");
        return;
      }
      setError('');
      setInfo('');
      try {
        await setPersistence(auth, rememberMe ? browserLocalPersistence : browserSessionPersistence);
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        const sessionId = Date.now().toString();
        localStorage.setItem('essencia_session_id', sessionId);
        await setDoc(doc(db, 'users', user.uid), { sessionId }, { merge: true });

      } catch (err: any) {
        if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
          setError('E-mail ou senha incorretos.');
        } else {
          setError('Ocorreu um erro. Verifique sua conexão ou dados.');
        }
      }
    };

    const handleForgotPass = async () => {
      if (!auth) return;
      if (!email) {
        setError('Insira seu e-mail para recuperar a senha.');
        return;
      }
      try {
        await sendPasswordResetEmail(auth, email);
        setInfo(t.resetSent);
        setError('');
      } catch (err: any) {
        setError('Erro ao enviar e-mail de recuperação.');
      }
    };

    return (
      <div className="fixed inset-0 z-[200] flex flex-col items-center justify-between py-12 px-8 text-white" style={{ backgroundColor: '#064E3B' }}>
        <div className="w-full flex flex-col items-center flex-grow justify-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md space-y-8">
            <div className="text-center space-y-2">
              <div className="text-[60px] mb-4">🍵</div>
              <h1 className="font-serif text-4xl tracking-tight">{t.appTitle}</h1>
              <p className="text-[10px] font-bold tracking-[0.2em] opacity-70 uppercase">{t.appSubtitle}</p>
            </div>

            <form onSubmit={handleAuth} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest opacity-60 ml-2">{t.emailLabel}</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input 
                    type="email" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                    required 
                    className="w-full bg-white text-slate-900 border-none rounded-2xl py-5 pl-12 pr-4 text-sm font-bold outline-none shadow-xl focus:ring-2 focus:ring-emerald-400 transition-all placeholder:text-slate-300" 
                    placeholder="Seu e-mail da compra" 
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest opacity-60 ml-2">{t.passLabel}</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input 
                    type="password" 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                    required 
                    className="w-full bg-white text-slate-900 border-none rounded-2xl py-5 pl-12 pr-4 text-sm font-bold outline-none shadow-xl focus:ring-2 focus:ring-emerald-400 transition-all placeholder:text-slate-300" 
                    placeholder="••••••••" 
                  />
                </div>
                
                <div className="flex justify-between items-center px-2 pt-1">
                   {/* CHECKBOX PREMIUM - FUNDO BRANCO E CHECK VERDE */}
                   <label className="flex items-center gap-2 cursor-pointer group select-none" htmlFor="remember">
                      <div className="relative">
                        <input 
                          type="checkbox" 
                          id="remember" 
                          checked={rememberMe} 
                          onChange={(e) => setRememberMe(e.target.checked)}
                          className="sr-only"
                        />
                        <div className="w-4 h-4 rounded-md bg-white border border-slate-100 flex items-center justify-center shadow-md transition-all">
                           <Check 
                             size={12} 
                             strokeWidth={4} 
                             className={`text-[#064E3B] transition-all duration-200 ${rememberMe ? 'scale-100 opacity-100' : 'scale-0 opacity-0'}`} 
                           />
                        </div>
                      </div>
                      <span className="text-[9px] font-black uppercase tracking-widest text-white/60 group-hover:text-white transition-colors">
                        {t.rememberMe}
                      </span>
                   </label>
                   
                   <button type="button" onClick={handleForgotPass} className="text-[9px] font-black opacity-60 hover:opacity-100 transition-all tracking-wider uppercase">
                    {t.forgotPass}
                  </button>
                </div>
              </div>

              {error && <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-[10px] text-red-200 font-bold bg-red-900/40 p-4 rounded-xl text-center border border-red-500/20">{error}</motion.p>}
              {info && <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-[10px] text-emerald-200 font-bold bg-emerald-900/40 p-4 rounded-xl text-center border border-emerald-500/20">{info}</motion.p>}

              <button type="submit" className="w-full py-5 bg-white text-[#064E3B] rounded-2xl font-black uppercase tracking-widest text-xs shadow-2xl active:scale-95 hover:brightness-110 transition-all flex items-center justify-center gap-3">
                <LogIn size={18} />
                {t.btnLogin}
              </button>
            </form>
          </motion.div>
        </div>

        <div className="w-full flex flex-col items-center gap-6 mt-8 pb-4">
          <button 
            onClick={handleInstallApp}
            className="w-full bg-white text-[#064E3B] py-4 rounded-2xl font-black uppercase tracking-widest text-xs active:scale-95 hover:brightness-110 transition-all flex items-center justify-center gap-3 shadow-[0px_0px_16px_rgba(6,78,59,0.5)]"
          >
            <Smartphone size={18} />
            INSTALAR APP NO CELULAR
          </button>

          <div className="flex flex-col items-center opacity-30">
            <p className="text-[8px] font-black uppercase tracking-[0.3em]">Powered by</p>
            <p className="text-[10px] font-serif italic mt-1 tracking-widest">JG Creator</p>
          </div>
        </div>
      </div>
    );
  };

  if (authLoading) return <div className="fixed inset-0 bg-[#064E3B] flex items-center justify-center text-white text-5xl">🍵</div>;
  if (!user) return <AuthScreen />;

  return (
    <div className="flex flex-col h-full overflow-hidden max-w-lg mx-auto relative text-[#1E293B] dark:text-slate-200 transition-colors bg-[#F1F3F5] dark:bg-slate-950">
      
      <header className="safe-top flex flex-col items-center pt-3 pb-3 px-6 shrink-0 z-20 transition-colors shadow-lg rounded-b-2xl" style={{ backgroundColor: accentColor }}>
        <div className="flex items-center gap-x-4 w-full justify-center">
          <div className="text-[26px] flex items-center justify-center">
            🍵
          </div>
          <div className="flex flex-col items-start">
            <h1 className="font-serif text-2xl font-light text-white tracking-tighter">{t.appTitle}</h1>
            <p className="text-[8px] font-bold text-white/80 tracking-[0.2em] uppercase mt-0">{t.appSubtitle}</p>
          </div>
        </div>
      </header>

      <div ref={scrollContainerRef} className="flex-1 overflow-y-auto no-scrollbar pb-40">
        <main className="px-6 space-y-6 pt-4 pb-12">
          
          {activeTab === 'home' && (
            <>
              <section key={language} className="p-2.5 rounded-none shadow-md relative overflow-hidden" style={{ background: `linear-gradient(135deg, ${accentColor}, ${accentColor}EE)` }}>
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-1.5">
                    <Sparkles size={10} className="text-white/50" />
                    <span className="text-white/60 font-black uppercase text-[7px] tracking-[0.3em]">{t.tipTitle}</span>
                  </div>
                  <p className="text-[10px] font-bold text-white italic leading-snug">"{t.tips[dailyTipIndex]}"</p>
                </div>
              </section>

              <section className="px-1 py-1 flex items-center gap-3">
                <span className="text-3xl">👩‍⚕️</span>
                <div>
                  <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100 leading-tight">{userName ? `${t.hello}, ${userName.split(' ')[0]}!` : `${t.hello}!`}</h2>
                  <p className="text-base font-medium text-slate-500 dark:text-slate-400 mt-1">{t.greeting}</p>
                </div>
              </section>

              <div className="flex flex-wrap gap-2">
                {[
                  { id: 'all', label: t.catAll, icon: null },
                  { id: 'weight', label: t.catWeight, icon: <Flame size={12} /> },
                  { id: 'relax', label: t.catRelax, icon: <Sparkles size={12} /> },
                  { id: 'digestion', label: t.catDigestion, icon: <Coffee size={12} /> },
                  { id: 'debloat', label: t.catDebloat, icon: <Droplets size={12} /> }
                ].map((c) => (
                  <div key={c.id} className="flex-1 min-w-[30%] p-[1.2px] rounded-2xl shadow-sm transition-all" style={{ background: `linear-gradient(to right, ${accentColor}44, ${accentColor}AA, ${accentColor}44)` }}>
                    <button onClick={() => { setCategory(c.id as any); setIsExpanded(false); }} className={`w-full py-3 rounded-2xl text-[8px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${category === c.id ? 'text-white' : 'bg-white dark:bg-slate-900 text-slate-400'}`} style={{ backgroundColor: category === c.id ? accentColor : undefined }}>{c.icon} {c.label}</button>
                  </div>
                ))}
              </div>

              <div className="relative group mx-1">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input type="text" placeholder={t.searchPlaceholder} className="w-full pl-12 pr-28 py-5 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none text-sm font-bold shadow-sm transition-all focus:border-opacity-100" style={{ borderColor: searchQuery ? accentColor : 'transparent' }} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                  {searchQuery && (
                    <button onClick={handleAISommelier} disabled={isAiLoading} className={`p-2 rounded-xl text-white transition-all active:scale-95 flex items-center gap-1 ${isAiLoading ? 'opacity-50' : 'hover:brightness-110'}`} style={{ backgroundColor: accentColor }}>
                      <Wand2 size={16} className={isAiLoading ? 'animate-pulse' : ''} />
                      <span className="text-[7px] font-black uppercase hidden sm:inline">{t.aiSommelier}</span>
                    </button>
                  )}
                  {searchQuery && <X size={20} className="text-slate-400 cursor-pointer" onClick={() => setSearchQuery('')} />}
                </div>
              </div>

              <section className="space-y-5 pb-10">
                <div className="flex justify-between items-center px-2">
                  <h2 className="text-xl font-black text-slate-800 dark:text-slate-200 uppercase tracking-widest">{t.chooseTea}</h2>
                  <span className="px-3 py-1 text-white rounded-full text-[10px] font-black uppercase shadow-sm" style={{ backgroundColor: accentColor }}>{filteredRecipes.length} {t.optionsCount}</span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {displayedRecipes.map((recipe) => (
                    <motion.div layout key={recipe.id} onClick={() => setSelectedRecipe(recipe)} className="bg-white dark:bg-slate-800 p-5 rounded-[2.5rem] border border-slate-100 dark:border-slate-700 shadow-sm relative active:scale-95 transition-all cursor-pointer overflow-hidden">
                      <div className="absolute left-0 top-0 bottom-0 w-1.5" style={{ backgroundColor: accentColor }} />
                      <div className="flex justify-between mb-4">
                        <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-900 flex items-center justify-center">{getIcon(recipe.icon, accentColor)}</div>
                        <button onClick={(e) => handleToggleFavorite(recipe.id, e)} className="p-1"><Heart size={18} fill={progress.favorites.includes(recipe.id) ? accentColor : "none"} style={{ color: progress.favorites.includes(recipe.id) ? accentColor : "#CBD5E1" }} /></button>
                      </div>
                      <h4 className="text-[12px] font-black text-slate-800 dark:text-slate-100 leading-tight mb-1">{translateDynamic(recipe.name)}</h4>
                      <p className="text-[8px] font-black uppercase opacity-60" style={{ color: accentColor }}>{translateDynamic(recipe.benefit)}</p>
                    </motion.div>
                  ))}
                </div>
                
                {!isExpanded && filteredRecipes.length > 20 && (
                  <motion.button onClick={() => setIsExpanded(true)} className="w-full py-6 rounded-none text-white text-sm font-black uppercase tracking-widest active:scale-95 transition-all relative overflow-hidden" style={{ backgroundColor: accentColor }} animate={{ backgroundColor: [accentColor, `${accentColor}E6`, accentColor] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}>
                    <span className="relative z-10">{t.verMais}</span>
                  </motion.button>
                )}
              </section>
            </>
          )}

          {activeTab === 'favorites' && (
            <div className="space-y-8">
              <div className="flex justify-between items-center px-2">
                <h2 className="text-xl font-black text-slate-800 dark:text-slate-200 uppercase tracking-widest">{t.yourFavorites}</h2>
              </div>
              {favoritedRecipes.length === 0 ? (
                <div className="text-center py-20 opacity-40">
                  <Heart size={48} className="mx-auto mb-4" />
                  <p className="font-bold text-sm uppercase tracking-widest">{t.noFavs}</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  {favoritedRecipes.map((recipe) => (
                    <motion.div layout key={recipe.id} onClick={() => setSelectedRecipe(recipe)} className="bg-white dark:bg-slate-800 p-5 rounded-[2.5rem] border border-slate-100 dark:border-slate-700 shadow-sm relative active:scale-95 transition-all cursor-pointer overflow-hidden">
                      <div className="absolute left-0 top-0 bottom-0 w-1.5" style={{ backgroundColor: accentColor }} />
                      <div className="flex justify-between mb-4">
                        <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-900 flex items-center justify-center">{getIcon(recipe.icon, accentColor)}</div>
                        <button onClick={(e) => handleToggleFavorite(recipe.id, e)} className="p-1"><Heart size={18} fill={accentColor} style={{ color: accentColor }} /></button>
                      </div>
                      <h4 className="text-[12px] font-black text-slate-800 dark:text-slate-100 leading-tight mb-1">{translateDynamic(recipe.name)}</h4>
                      <p className="text-[8px] font-black uppercase opacity-60" style={{ color: accentColor }}>{translateDynamic(recipe.benefit)}</p>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'history' && (
            <div className="space-y-8">
              <div className="flex justify-between items-center px-2">
                <h2 className="text-xl font-black text-slate-800 dark:text-slate-200 uppercase tracking-widest">{t.navRoutine}</h2>
              </div>
              {Object.keys(progress.cycleStartDates).length === 0 ? (
                <div className="text-center py-20 opacity-40">
                  <Clock size={48} className="mx-auto mb-4" />
                  <p className="font-bold text-sm uppercase tracking-widest">{t.noProtocol}</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {Object.entries(progress.cycleStartDates).map(([id, startDate]) => {
                    const recipe = RECIPES.find(r => r.id === id);
                    if (!recipe) return null;
                    return (
                      <motion.div layout key={id} onClick={() => setSelectedRecipe(recipe)} className="bg-white dark:bg-slate-800 p-6 rounded-[2.5rem] border border-slate-100 dark:border-slate-700 shadow-sm relative overflow-hidden active:scale-95 transition-all cursor-pointer">
                        <div className="absolute left-0 top-0 bottom-0 w-1.5" style={{ backgroundColor: accentColor }} />
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h4 className="text-sm font-black text-slate-800 dark:text-slate-100 leading-tight">{translateDynamic(recipe.name)}</h4>
                            <p className="text-[10px] font-bold uppercase tracking-widest mt-1" style={{ color: accentColor }}>{recipe.cycleDays} {t.days}</p>
                          </div>
                          <div className="w-8 h-8 rounded-xl bg-slate-50 dark:bg-slate-900 flex items-center justify-center">{getIcon(recipe.icon, accentColor)}</div>
                        </div>
                        <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-900/50 p-4 rounded-2xl mt-4">
                          <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">{t.activeTreatment}</span>
                          <div className="flex gap-2">
                            {[1, 2, 3].map(n => <div key={n} className="w-8 h-8 rounded-lg border-2 flex items-center justify-center text-[10px] font-black shadow-sm" style={{ borderColor: accentColor, color: accentColor, backgroundColor: 'white' }}>{n}</div>)}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {activeTab === 'profile' && (
            <div className="space-y-8">
              <section className="flex flex-col items-center py-6">
                <div className="w-24 h-24 rounded-full bg-white shadow-xl flex items-center justify-center text-5xl mb-4 border-4" style={{ borderColor: accentColor }}>🍵</div>
                <h2 className="text-xl font-black">{userName || t.setYourName}</h2>
                <button onClick={() => signOut(auth)} className="text-[10px] font-black uppercase tracking-widest text-red-500 mt-2 bg-red-50 px-4 py-2 rounded-full font-bold">{t.logout}</button>
              </section>
              <section className="bg-white dark:bg-slate-800 p-8 rounded-[2.5rem] space-y-4 shadow-sm border border-slate-100">
                <h3 className="font-black uppercase tracking-widest text-slate-800 dark:text-slate-200 text-xs">{t.themes}</h3>
                <div className="grid grid-cols-6 gap-2 pt-2">
                  {THEME_COLORS.map(c => (
                    <button key={c.color} onClick={() => setAccentColor(c.color)} className="flex items-center justify-center transition-all p-1"><div className={`w-6 h-6 rounded-full shadow-sm transition-all ${accentColor === c.color ? 'ring-2 ring-offset-2' : ''}`} style={{ backgroundColor: c.color }} /></button>
                  ))}
                </div>
              </section>
            </div>
          )}

          <p className="text-[10px] text-center opacity-40 px-4 leading-relaxed mt-4">{t.disclaimer}</p>
        </main>
      </div>

      <AnimatePresence>
        {showTopBtn && (
          <motion.button initial={{ opacity: 0, scale: 0.5, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.5, y: 20 }} onClick={scrollToTop} className="fixed bottom-28 right-8 z-[60] px-4 py-2 rounded-full text-white font-black text-[10px] uppercase tracking-widest shadow-lg flex items-center gap-2 active:scale-95 transition-all" style={{ backgroundColor: accentColor }}>
            <ChevronUp size={14} />
            {t.btnTop}
          </motion.button>
        )}
      </AnimatePresence>

      <div className="fixed bottom-6 left-0 right-0 max-w-lg mx-auto px-6 z-50">
        <div className="rounded-[2.6rem] shadow-2xl overflow-visible relative" style={{ backgroundColor: accentColor }}>
          <nav className="px-2 py-3">
            <div className="flex justify-between items-center relative gap-0.5">
              <AnimatePresence>
                {isLangMenuOpen && (
                  <motion.div initial={{ opacity: 0, y: 10, scale: 0.9 }} animate={{ opacity: 1, y: -20, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.9 }} className="absolute bottom-16 left-0 right-0 p-4 flex justify-around items-center gap-2 z-[60]">
                    {LANGS.map(l => (
                      <button key={l.code} onClick={() => { setLanguage(l.code); setIsLangMenuOpen(false); }} className={`flex items-center justify-center h-14 w-14 rounded-full transition-all border-b-4 active:border-b-0 active:translate-y-1 shadow-lg ${language === l.code ? 'scale-110' : 'opacity-100'}`} style={{ backgroundColor: accentColor, borderColor: '#111111' }}><span className="text-sm font-black text-white uppercase tracking-widest leading-none">{l.label}</span></button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>

              {[
                { id: 'home', label: t.navHome, icon: Home },
                { id: 'history', label: t.navRoutine, icon: History },
                { id: 'favorites', label: t.navFavs, icon: Heart },
                { id: 'lang', label: t.navLang, icon: Globe, isLang: true },
                { id: 'profile', label: t.navProfile, icon: User }
              ].map((item) => {
                const isActive = item.isLang ? isLangMenuOpen : activeTab === item.id;
                return (
                  <button key={item.id} onClick={() => handleNavClick(item.id)} className={`flex flex-col items-center justify-center flex-1 py-1 px-1 transition-all duration-300 ${isActive ? 'scale-110 opacity-100' : 'opacity-70 hover:opacity-100'}`} style={{ color: '#FFFFFF' }}>
                    <item.icon size={20} strokeWidth={isActive ? 3 : 2} />
                    <span className="text-[6px] font-black uppercase tracking-widest mt-1 text-center whitespace-nowrap">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </nav>
        </div>
      </div>

      <AnimatePresence>
        {selectedRecipe && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-end justify-center bg-slate-900/70 backdrop-blur-sm">
            <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-t-[4rem] overflow-hidden max-h-[92vh] flex flex-col shadow-2xl relative">
              <button 
                onClick={() => setSelectedRecipe(null)}
                className="absolute top-8 right-8 w-10 h-10 rounded-full flex items-center justify-center shadow-lg z-[110] transition-all active:scale-90"
                style={{ backgroundColor: accentColor }}
              >
                <X size={24} className="text-white" />
              </button>

              <div className="p-5 flex justify-center cursor-pointer" onClick={() => setSelectedRecipe(null)}><div className="w-16 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full" /></div>
              <div className="p-10 overflow-y-auto no-scrollbar">
                <span className="text-[9px] font-black uppercase tracking-widest px-4 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-full mb-5 inline-block" style={{ color: accentColor }}>{t.chooseTea}</span>
                <h2 className="text-3xl font-black mb-1 leading-tight">{translateDynamic(selectedRecipe.name)}</h2>
                <h3 className="text-xl font-bold mb-10" style={{ color: accentColor }}>{translateDynamic(selectedRecipe.benefit)}</h3>
                
                <section className="mb-10">
                  <h4 className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-4">{t.instruction}</h4>
                  <div className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border border-slate-100 dark:border-slate-800">
                    <p className="text-slate-700 dark:text-slate-200 font-medium italic leading-relaxed">"{translateDynamic(selectedRecipe.usage)}"</p>
                  </div>
                </section>

                <section className="mb-10">
                  <h4 className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-5">{t.ingredients}</h4>
                  <div className="space-y-3">
                    {selectedRecipe.ingredients.map((ing, i) => (
                      <div key={i} className="flex items-center gap-4 p-4 bg-white dark:bg-slate-800/80 rounded-2xl border border-slate-50 dark:border-slate-800 shadow-sm">
                        <div className="w-6 h-6 rounded-full flex items-center justify-center bg-slate-50 dark:bg-slate-900">
                          <Check size={14} style={{ color: accentColor }} />
                        </div>
                        <span className="text-sm font-bold text-slate-600 dark:text-slate-300">
                          {translateDynamic(
                            ing.includes('água') ? t.ing_water : 
                            ing.includes('porção') ? `${t.ing_portion} ${ing.split(' de ')[1] || ing.split(' portion of ')[1] || ''}` : 
                            ing.includes('Toque cítrico') ? t.ing_touch : ing
                          )}
                        </span>
                      </div>
                    ))}
                  </div>
                </section>

                <section className="mb-10">
                  <h4 className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-5">Passos</h4>
                  <div className="space-y-4">
                    {selectedRecipe.instructions.map((ins, i) => (
                      <div key={i} className="flex gap-4">
                        <span className="font-black text-xs opacity-20">{i+1}</span>
                        <p className="text-sm font-medium text-slate-600 dark:text-slate-300">{translateDynamic(ins)}</p>
                      </div>
                    ))}
                  </div>
                </section>

                {!progress.cycleStartDates[selectedRecipe.id] ? (
                  <button onClick={() => startCycle(selectedRecipe.id)} className="w-full py-6 rounded-[2.5rem] text-white font-black uppercase tracking-widest text-xs shadow-xl active:scale-95 transition-transform" style={{ backgroundColor: accentColor }}>
                    {t.startProtocol} {selectedRecipe.cycleDays} {t.days}
                  </button>
                ) : (
                  <div className="text-center p-8 rounded-[3rem] border shadow-inner" style={{ backgroundColor: `${accentColor}11`, borderColor: `${accentColor}22` }}>
                    <p className="text-xs font-black uppercase mb-5 tracking-widest" style={{ color: accentColor }}>{t.activeTreatment}</p>
                    <div className="flex justify-center gap-3">
                      {[1, 2, 3].map(n => <div key={n} className="w-12 h-12 rounded-2xl border-2 flex items-center justify-center font-black shadow-sm" style={{ borderColor: accentColor, color: accentColor, backgroundColor: 'white' }}>{n}</div>)}
                    </div>
                    <p className="text-[9px] font-bold uppercase tracking-widest mt-6 opacity-60" style={{ color: accentColor }}>{t.markDoses}</p>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default App;
