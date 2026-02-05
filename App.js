import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  Gamepad2, 
  FileText, 
  ListChecks, 
  Sparkles, 
  Copy, 
  Check, 
  X,
  GraduationCap,
  BrainCircuit,
  MessageSquareQuote,
  ExternalLink,
  Bot,
  Zap,
  Globe,
  Play,
  Loader2,
  AlertCircle
} from 'lucide-react';

// --- API UTILS ---
const callGeminiAPI = async (prompt) => {
  const apiKey = "AIzaSyC1IY0edFOKI0xwzRy1BBubU5hfbYO1t9E"; // Ключ предоставляется средой выполнения
const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
  const makeRequest = async (retryCount = 0) => {
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
      });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      
      const data = await response.json();
      return data.candidates?.[0]?.content?.parts?.[0]?.text;
    } catch (error) {
      if (retryCount < 3) {
        await new Promise(r => setTimeout(r, 1000 * Math.pow(2, retryCount))); // Backoff: 1s, 2s, 4s
        return makeRequest(retryCount + 1);
      }
      throw error;
    }
  };

  return makeRequest();
};

// --- DATA: Рекомендуемые нейросети ---
const AI_SERVICES = [
  {
    name: 'ChatGPT (OpenAI)',
    url: 'https://chat.openai.com',
    desc: 'Мировой стандарт. Лучше всего справляется со сложными планами уроков и креативом.',
    icon: Bot,
    color: 'bg-emerald-100 text-emerald-700'
  },
  {
    name: 'Gemini (Google)',
    url: 'https://gemini.google.com',
    desc: 'Отлично работает с актуальной информацией и поиском фактов в интернете.',
    icon: Sparkles,
    color: 'bg-blue-100 text-blue-700'
  },
  {
    name: 'GigaChat (Сбер)',
    url: 'https://giga.chat',
    desc: 'Российская нейросеть. Понимает контекст нашей школы, работает без VPN.',
    icon: Zap,
    color: 'bg-orange-100 text-orange-700'
  },
  {
    name: 'YandexGPT (Алиса)',
    url: 'https://ya.ru',
    desc: 'Доступна на главной Яндекса. Хорошо пишет краткие тексты и объяснения.',
    icon: Globe,
    color: 'bg-red-100 text-red-700'
  }
];

// --- DATA: Библиотека промтов ---
const PROMPT_TOOLS = [
  {
    id: 'test',
    title: 'Генератор Тестов',
    icon: ListChecks,
    color: 'from-indigo-500 to-blue-500',
    description: 'Создайте проверочный тест с вариантами ответов за секунды.',
    inputs: [
      { id: 'topic', label: 'Тема урока', placeholder: 'Причастия', type: 'text' },
      { id: 'grade', label: 'Класс', placeholder: '7 класс', type: 'text' },
      { id: 'count', label: 'Количество вопросов', placeholder: '10', type: 'text' }
    ],
    generate: (data) => `Действуй как опытный методист. Составь тест по теме "${data.topic || '...'}" для учеников ${data.grade || '...'} класса.
В тесте должно быть ${data.count || '10'} вопросов.
Для каждого вопроса предложи 4 варианта ответа, где только один правильный.
В конце предоставь ключи (правильные ответы) к тесту.
Стиль должен быть академическим, но понятным для учеников этого возраста.`
  },
  {
    id: 'lesson-plan',
    title: 'План Урока по ФГОС',
    icon: BookOpen,
    color: 'from-emerald-500 to-teal-500',
    description: 'Структурированный план с таймингом, целями и задачами.',
    inputs: [
      { id: 'topic', label: 'Тема урока', placeholder: 'Законы Ньютона', type: 'text' },
      { id: 'duration', label: 'Длительность (мин)', placeholder: '45', type: 'text' },
      { id: 'goal', label: 'Главная цель', placeholder: 'Понять принцип инерции', type: 'text' },
      { 
        id: 'customTemplate', 
        label: 'Ваш шаблон (оставьте пустым для стандартного)', 
        placeholder: 'Вставьте сюда структуру урока, если она отличается от стандартной...\n1. Введение\n2. Опрос\n...', 
        type: 'textarea' 
      }
    ],
    generate: (data) => {
      const structure = data.customTemplate 
        ? `Используй СТРОГО следующую структуру урока:\n${data.customTemplate}`
        : `Структура должна включать:
1. Организационный момент.
2. Актуализация знаний.
3. Объяснение нового материала (используй интересные аналогии).
4. Закрепление (практические задания).
5. Рефлексия и домашнее задание.`;

      return `Напиши подробный план-конспект урока на тему "${data.topic || '...'}" длительностью ${data.duration || '45'} минут.
Цель урока: ${data.goal || '...'}.
${structure}
Для каждого этапа укажи примерное время.`;
    }
  },
  {
    id: 'game',
    title: 'Игровые Механики',
    icon: Gamepad2,
    color: 'from-violet-500 to-purple-500',
    description: 'Геймификация сложной темы для вовлечения класса.',
    inputs: [
      { id: 'topic', label: 'Тема для игры', placeholder: 'Таблица умножения', type: 'text' },
      { id: 'setting', label: 'Сеттинг (по желанию)', placeholder: 'Космос / Пираты / Детектив', type: 'text' }
    ],
    generate: (data) => `Придумай образовательную игру для класса по теме "${data.topic || '...'}".
${data.setting ? `Используй сеттинг/антураж: ${data.setting}.` : ''}
Опиши:
1. Правила игры.
2. Необходимый реквизит (простой, который есть в классе).
3. Как эта игра помогает закрепить материал.
4. Механику подсчета очков и определения победителя.
Игра должна занимать не более 15-20 минут.`
  },
  {
    id: 'report',
    title: 'Официальные Отчеты',
    icon: FileText,
    color: 'from-slate-600 to-slate-500',
    description: 'Помощь в написании характеристик и формальных документов.',
    inputs: [
      { id: 'student', label: 'Имя ученика (или "Ученик")', placeholder: 'Иван Иванов', type: 'text' },
      { id: 'qualities', label: 'Ключевые качества/проблемы', placeholder: 'Активный, но невнимательный', type: 'text' },
      { id: 'type', label: 'Тип документа', placeholder: 'Характеристика для психолога', type: 'text' }
    ],
    generate: (data) => `Напиши текст документа: "${data.type || 'Характеристика'}".
Объект: ${data.student || 'Ученик'}.
Ключевые моменты, которые нужно отразить: ${data.qualities || '...'}.
Используй официально-деловой педагогический стиль. Текст должен быть корректным, объективным и профессиональным.`
  },
  {
    id: 'analogy',
    title: 'Объясни «на пальцах»',
    icon: BrainCircuit,
    color: 'from-pink-500 to-rose-500',
    description: 'Простые аналогии для объяснения самых сложных тем.',
    inputs: [
      { id: 'topic', label: 'Сложная тема', placeholder: 'Квантовая запутанность', type: 'text' },
      { id: 'age', label: 'Возраст детей', placeholder: '10 лет', type: 'text' }
    ],
    generate: (data) => `Объясни тему "${data.topic || '...'}" для детей возраста ${data.age || '10'} лет.
Используй яркую, понятную жизненную аналогию или метафору. Избегай сложных терминов.
Приведи пример из реальной жизни, с которым дети сталкиваются ежедневно.`
  },
  {
    id: 'quotes',
    title: 'Вдохновение к уроку',
    icon: MessageSquareQuote,
    color: 'from-amber-500 to-orange-500',
    description: 'Цитаты и удивительные факты для начала занятия.',
    inputs: [
      { id: 'topic', label: 'Тема урока', placeholder: 'История Рима', type: 'text' }
    ],
    generate: (data) => `Найди 3 интересные, малоизвестные цитаты или удивительных факта, связанных с темой "${data.topic || '...'}".
Эти факты должны захватить внимание учеников в начале урока и вызвать желание узнать больше.`
  }
];

// --- COMPONENTS ---

const Header = () => (
  <header className="bg-white border-b border-gray-200 sticky top-0 z-20 shadow-sm">
    <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <div className="bg-indigo-600 p-2.5 rounded-xl text-white shadow-lg shadow-indigo-200 transform hover:scale-105 transition-transform">
          <Sparkles size={28} strokeWidth={2.5} />
        </div>
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight leading-none">
            Банк <span className="text-indigo-600">Золотых</span> Промтов
          </h1>
          <p className="text-sm text-slate-500 font-medium mt-1">
            Библиотека команд для нейросетей
          </p>
        </div>
      </div>
      <div className="hidden md:flex gap-6 text-sm font-medium text-slate-600">
        <span className="flex items-center gap-2 px-3 py-1 bg-slate-100 rounded-full"><Check size={16} className="text-green-600"/> Экономия времени</span>
        <span className="flex items-center gap-2 px-3 py-1 bg-slate-100 rounded-full"><Check size={16} className="text-green-600"/> Для всех предметов</span>
      </div>
    </div>
  </header>
);

const Hero = () => (
  <div className="bg-gradient-to-b from-indigo-50 via-white to-white py-20 px-6 text-center">
    <div className="max-w-4xl mx-auto">
      <h2 className="text-4xl md:text-6xl font-black text-slate-900 mb-6 leading-tight">
        Ваш личный методист <br/>
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">
          на базе Искусственного Интеллекта
        </span>
      </h2>
      <p className="text-xl text-slate-600 mb-10 leading-relaxed max-w-2xl mx-auto">
        Мы подготовили идеальные шаблоны запросов (промты). Теперь вы можете не только копировать их, но и 
        <span className="font-bold text-indigo-600"> сразу получать ответы от ИИ</span> прямо здесь.
      </p>
      
      <div className="flex flex-wrap justify-center gap-4">
        <a href="#tools" className="px-8 py-4 bg-indigo-600 text-white text-lg font-bold rounded-full shadow-xl shadow-indigo-200 hover:bg-indigo-700 hover:scale-105 transition-all">
          Выбрать инструмент
        </a>
        <a href="#ai-services" className="px-8 py-4 bg-white text-slate-700 text-lg font-bold rounded-full border border-slate-200 shadow-sm hover:bg-slate-50 transition-all flex items-center gap-2">
          Где использовать?
        </a>
      </div>
    </div>
  </div>
);

const SectionTitle = ({ title, subtitle, id }) => (
  <div className="text-center mb-12" id={id}>
    <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">{title}</h2>
    <p className="text-lg text-slate-500 max-w-2xl mx-auto">{subtitle}</p>
  </div>
);

const AIServices = () => (
  <section id="ai-services" className="py-20 bg-slate-50 border-t border-slate-200">
    <div className="max-w-7xl mx-auto px-6">
      <SectionTitle 
        title="Куда вставлять эти промты?" 
        subtitle="Вот список проверенных нейросетей, которые помогут вам в работе. Выберите любую из них."
      />
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {AI_SERVICES.map((service, idx) => (
          <div key={idx} className="bg-white p-6 rounded-2xl border border-slate-200 hover:shadow-lg transition-all flex flex-col h-full">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${service.color}`}>
              <service.icon size={24} />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">{service.name}</h3>
            <p className="text-slate-600 text-sm mb-6 flex-grow leading-relaxed">
              {service.desc}
            </p>
            <a 
              href={service.url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="mt-auto flex items-center justify-center gap-2 w-full py-2.5 rounded-lg border border-slate-200 text-slate-700 font-medium hover:bg-slate-50 hover:border-indigo-200 hover:text-indigo-600 transition-colors"
            >
              Перейти на сайт <ExternalLink size={16} />
            </a>
          </div>
        ))}
      </div>
    </div>
  </section>
);

const Modal = ({ tool, onClose }) => {
  const [inputs, setInputs] = useState({});
  const [copied, setCopied] = useState(false);
  const [generatedPrompt, setGeneratedPrompt] = useState('');
  
  // AI State
  const [aiResult, setAiResult] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [aiError, setAiError] = useState(null);

  useEffect(() => {
    setGeneratedPrompt(tool.generate({}));
    setInputs({});
    setCopied(false);
    setAiResult('');
    setAiError(null);
  }, [tool]);

  const handleInputChange = (id, value) => {
    const newInputs = { ...inputs, [id]: value };
    setInputs(newInputs);
    setGeneratedPrompt(tool.generate(newInputs));
    setCopied(false);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedPrompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleGenerateAI = async () => {
    setIsLoading(true);
    setAiError(null);
    setAiResult('');
    
    try {
      const result = await callGeminiAPI(generatedPrompt);
      if (result) {
        setAiResult(result);
      } else {
        setAiError('Не удалось получить ответ. Попробуйте еще раз.');
      }
    } catch (err) {
      setAiError('Ошибка соединения с ИИ. Пожалуйста, проверьте интернет или попробуйте позже.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[95vh] flex flex-col overflow-hidden ring-1 ring-slate-900/5"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`p-6 bg-gradient-to-r ${tool.color} text-white flex justify-between items-start shrink-0`}>
          <div className="flex gap-4 items-center">
            <div className="bg-white/20 p-2.5 rounded-xl backdrop-blur-md shadow-inner">
              <tool.icon size={28} />
            </div>
            <div>
              <h3 className="text-xl font-bold">{tool.title}</h3>
              <p className="text-white/90 text-sm mt-0.5">{tool.description}</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-white/70 hover:text-white hover:bg-white/20 p-2 rounded-full transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Body - Two Columns on Large Screens */}
        <div className="flex flex-col lg:flex-row h-full overflow-hidden bg-slate-50">
          
          {/* Left Column: Inputs & Prompt */}
          <div className="w-full lg:w-1/2 p-6 overflow-y-auto custom-scrollbar border-r border-slate-200 flex flex-col gap-6">
            <div className="space-y-4">
              {tool.inputs.map((input) => (
                <div key={input.id}>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wide">
                    {input.label}
                  </label>
                  {input.type === 'textarea' ? (
                    <textarea
                      placeholder={input.placeholder}
                      className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-4 focus:ring-indigo-100 focus:border-indigo-400 outline-none transition-all text-slate-800 bg-white shadow-sm text-sm min-h-[120px]"
                      onChange={(e) => handleInputChange(input.id, e.target.value)}
                    />
                  ) : (
                    <input
                      type="text"
                      placeholder={input.placeholder}
                      className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-4 focus:ring-indigo-100 focus:border-indigo-400 outline-none transition-all text-slate-800 bg-white shadow-sm text-sm"
                      onChange={(e) => handleInputChange(input.id, e.target.value)}
                    />
                  )}
                </div>
              ))}
            </div>

            <div className="relative group flex-grow">
               <div className="flex justify-between items-end mb-2 px-1">
                 <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Ваш готовый промт</span>
               </div>
              <div className="bg-white p-4 rounded-xl border-2 border-indigo-100 text-slate-600 font-mono text-xs whitespace-pre-wrap leading-relaxed shadow-sm hover:border-indigo-200 transition-colors h-full max-h-[200px] overflow-y-auto">
                {generatedPrompt}
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button 
                onClick={handleCopy}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-bold shadow-sm transition-all text-sm ${
                  copied 
                    ? 'bg-green-100 text-green-700 border border-green-200' 
                    : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                {copied ? <Check size={18} /> : <Copy size={18} />}
                {copied ? 'Скопировано!' : 'Копировать'}
              </button>
              
              <button 
                onClick={handleGenerateAI}
                disabled={isLoading}
                className="flex-[1.5] flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 shadow-lg shadow-indigo-200 active:scale-95 transition-all disabled:opacity-70 disabled:cursor-not-allowed text-sm"
              >
                {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Play size={18} fill="currentColor" />}
                {isLoading ? 'Генерирую...' : 'Спросить у ИИ'}
              </button>
            </div>
          </div>

          {/* Right Column: AI Result */}
          <div className="w-full lg:w-1/2 bg-white flex flex-col h-full min-h-[300px] lg:min-h-0">
             <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
               <div className="flex items-center gap-2">
                 <Bot size={20} className="text-indigo-600" />
                 <span className="font-bold text-slate-700">Ответ ИИ</span>
               </div>
               {aiResult && (
                 <button 
                  onClick={() => {navigator.clipboard.writeText(aiResult)}}
                  className="text-xs text-indigo-600 hover:text-indigo-800 font-medium"
                 >
                   Копировать ответ
                 </button>
               )}
             </div>
             
             <div className="flex-grow p-6 overflow-y-auto custom-scrollbar relative">
                {!aiResult && !isLoading && !aiError && (
                  <div className="h-full flex flex-col items-center justify-center text-slate-400 text-center p-4">
                    <Sparkles size={48} className="mb-4 text-slate-200" />
                    <p>Нажмите «Спросить у ИИ», чтобы получить результат прямо здесь.</p>
                  </div>
                )}

                {isLoading && (
                  <div className="h-full flex flex-col items-center justify-center text-indigo-600">
                    <Loader2 size={48} className="animate-spin mb-4" />
                    <p className="font-medium animate-pulse">Искусственный интеллект думает...</p>
                  </div>
                )}

                {aiError && (
                  <div className="h-full flex flex-col items-center justify-center text-red-500 text-center p-4">
                    <AlertCircle size={48} className="mb-4 bg-red-50 p-2 rounded-full" />
                    <p className="font-medium">{aiError}</p>
                  </div>
                )}

                {aiResult && (
                  <div className="prose prose-sm prose-slate max-w-none">
                    <div className="whitespace-pre-wrap leading-relaxed text-slate-800">
                      {aiResult}
                    </div>
                  </div>
                )}
             </div>
          </div>

        </div>
      </div>
    </div>
  );
};

const ToolCard = ({ tool, onClick }) => (
  <button 
    onClick={onClick}
    className="group bg-white p-8 rounded-3xl border border-slate-100 shadow-sm hover:shadow-2xl hover:shadow-indigo-100/50 hover:-translate-y-2 transition-all duration-300 text-left flex flex-col h-full relative overflow-hidden ring-1 ring-slate-900/5"
  >
    <div className={`absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r ${tool.color}`} />
    
    <div className="mb-6 inline-flex p-4 rounded-2xl bg-slate-50 group-hover:bg-indigo-50 text-slate-600 group-hover:text-indigo-600 transition-colors duration-300">
      <tool.icon size={32} />
    </div>
    
    <h3 className="text-2xl font-bold text-slate-800 mb-3 group-hover:text-indigo-700 transition-colors">
      {tool.title}
    </h3>
    
    <p className="text-slate-500 text-base leading-relaxed mb-6 flex-grow">
      {tool.description}
    </p>

    <div className="flex items-center text-indigo-600 font-bold tracking-wide group-hover:gap-2 transition-all">
      Создать промт <span className="ml-1 text-xl transition-transform group-hover:translate-x-1">→</span>
    </div>
  </button>
);

export default function App() {
  const [selectedTool, setSelectedTool] = useState(null);

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900 pb-20 selection:bg-indigo-100 selection:text-indigo-900">
      <Header />
      <Hero />

      <main className="max-w-7xl mx-auto px-6 -mt-10 mb-20">
        <div id="tools" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {PROMPT_TOOLS.map((tool) => (
            <ToolCard 
              key={tool.id} 
              tool={tool} 
              onClick={() => setSelectedTool(tool)} 
            />
          ))}
        </div>
      </main>

      <AIServices />
      
      {/* Footer */}
      <footer className="py-12 bg-white text-center border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-center gap-2 mb-4 text-indigo-600 font-bold">
            <GraduationCap size={24} />
            <span>Банк Золотых Промтов</span>
          </div>
          <p className="text-slate-500 text-sm">
            Создано для помощи учителям. Используйте ИИ ответственно. <br/>
            © 2024 Все права защищены.
          </p>
        </div>
      </footer>

      {/* Modal Overlay */}
      {selectedTool && (
        <Modal 
          tool={selectedTool} 
          onClose={() => setSelectedTool(null)} 
        />
      )}
    </div>
  );
}