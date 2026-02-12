import React, { useState } from 'react';
import { HelpCircle, Shield, Users, Building2, ChevronRight, CheckCircle } from 'lucide-react';

/**
 * Plan Quiz - Quiz interactivo para recomendar plan
 * Ayuda al usuario a elegir el plan correcto
 */
const PlanQuiz = ({ onComplete }) => {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [showResult, setShowResult] = useState(false);

  const questions = [
    {
      id: 'users',
      question: '¿Cuántas personas necesitas proteger?',
      options: [
        { value: 'solo', label: 'Solo yo', icon: '👤' },
        { value: 'pareja', label: 'Mi pareja y yo', icon: '👫' },
        { value: 'familia', label: 'Toda mi familia (3-5)', icon: '👨‍👩‍👧‍👦' },
        { value: 'grande', label: 'Familia extendida (6+)', icon: '👨‍👩‍👧‍👦👴👵' },
      ]
    },
    {
      id: 'risk',
      question: '¿Cuál es tu mayor preocupación?',
      options: [
        { value: 'phishing', label: 'Emails y SMS fraudulentos', icon: '📧' },
        { value: 'llamadas', label: 'Llamadas de estafadores', icon: '📞' },
        { value: 'mayores', label: 'Proteger a mis padres/abuelos', icon: '👴' },
        { value: 'todo', label: 'Todo lo anterior', icon: '🛡️' },
      ]
    },
    {
      id: 'urgency',
      question: '¿Has sido víctima de alguna estafa antes?',
      options: [
        { value: 'si', label: 'Sí, y no quiero que pase de nuevo', icon: '😰' },
        { value: 'casi', label: 'Casi caigo en una', icon: '😅' },
        { value: 'conocido', label: 'Conozco a alguien que sí', icon: '👥' },
        { value: 'no', label: 'No, pero quiero prevenirlo', icon: '🤔' },
      ]
    }
  ];

  const handleAnswer = (questionId, value) => {
    const newAnswers = { ...answers, [questionId]: value };
    setAnswers(newAnswers);

    if (step < questions.length - 1) {
      setStep(step + 1);
    } else {
      setShowResult(true);
    }
  };

  const getRecommendation = () => {
    const { users, risk, urgency } = answers;
    
    // Logic to determine best plan
    if (users === 'grande' || risk === 'todo') {
      return {
        plan: 'enterprise',
        name: 'Plan Empresarial',
        price: '€99.99',
        icon: Building2,
        color: 'purple',
        reason: 'Ideal para familias grandes o protección completa',
        features: ['Usuarios ilimitados', 'Dashboard avanzado', 'Soporte prioritario 24/7']
      };
    }
    
    if (users === 'familia' || urgency === 'si' || risk === 'mayores') {
      return {
        plan: 'family',
        name: 'Plan Familiar',
        price: '€29.99',
        icon: Users,
        color: 'emerald',
        reason: 'Perfecto para proteger a toda tu familia',
        features: ['Hasta 5 miembros', 'Alertas SOS', 'Protección para mayores']
      };
    }
    
    return {
      plan: 'personal',
      name: 'Plan Personal',
      price: '€9.99',
      icon: Shield,
      color: 'blue',
      reason: 'Protección esencial para ti',
      features: ['1 usuario', 'Análisis de amenazas', 'Alertas en tiempo real']
    };
  };

  if (showResult) {
    const recommendation = getRecommendation();
    const Icon = recommendation.icon;
    
    const colorClasses = {
      emerald: 'from-emerald-500 to-emerald-600',
      blue: 'from-blue-500 to-blue-600',
      purple: 'from-purple-500 to-purple-600',
    };

    return (
      <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700 animate-fadeIn">
        <div className="text-center mb-6">
          <div className={`w-16 h-16 bg-gradient-to-br ${colorClasses[recommendation.color]} rounded-2xl flex items-center justify-center mx-auto mb-4`}>
            <Icon className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-2xl font-bold text-white mb-2">Te recomendamos</h3>
          <p className="text-3xl font-bold text-emerald-400">{recommendation.name}</p>
          <p className="text-slate-400 mt-2">{recommendation.reason}</p>
        </div>

        <div className="bg-slate-900/50 rounded-xl p-4 mb-6">
          <div className="text-center mb-4">
            <span className="text-4xl font-bold text-white">{recommendation.price}</span>
            <span className="text-slate-400">/mes</span>
          </div>
          <ul className="space-y-2">
            {recommendation.features.map((feature, i) => (
              <li key={i} className="flex items-center gap-2 text-slate-300">
                <CheckCircle className="w-4 h-4 text-emerald-400" />
                {feature}
              </li>
            ))}
          </ul>
        </div>

        <a
          href={`/pricing?recommended=${recommendation.plan}`}
          className={`w-full py-4 bg-gradient-to-r ${colorClasses[recommendation.color]} text-white font-bold rounded-xl transition-all hover:opacity-90 flex items-center justify-center gap-2`}
        >
          Activar {recommendation.name}
          <ChevronRight className="w-5 h-5" />
        </a>

        <button
          onClick={() => { setStep(0); setAnswers({}); setShowResult(false); }}
          className="w-full mt-3 py-2 text-slate-400 hover:text-white transition-colors text-sm"
        >
          Repetir cuestionario
        </button>
      </div>
    );
  }

  const currentQuestion = questions[step];

  return (
    <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-emerald-500/20 rounded-xl flex items-center justify-center">
          <HelpCircle className="w-5 h-5 text-emerald-400" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-white">¿Qué plan necesitas?</h3>
          <p className="text-sm text-slate-400">Responde 3 preguntas rápidas</p>
        </div>
      </div>

      {/* Progress */}
      <div className="flex gap-2 mb-6">
        {questions.map((_, i) => (
          <div 
            key={i}
            className={`flex-1 h-1.5 rounded-full ${i <= step ? 'bg-emerald-500' : 'bg-slate-700'}`}
          />
        ))}
      </div>

      {/* Question */}
      <div className="mb-6">
        <p className="text-lg text-white mb-4">{currentQuestion.question}</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {currentQuestion.options.map((option) => (
            <button
              key={option.value}
              onClick={() => handleAnswer(currentQuestion.id, option.value)}
              className="flex items-center gap-3 p-4 bg-slate-900/50 hover:bg-emerald-500/20 border border-slate-700 hover:border-emerald-500/50 rounded-xl transition-all text-left"
            >
              <span className="text-2xl">{option.icon}</span>
              <span className="text-white">{option.label}</span>
            </button>
          ))}
        </div>
      </div>

      <p className="text-xs text-slate-400 text-center">
        Pregunta {step + 1} de {questions.length}
      </p>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn { animation: fadeIn 0.5s ease-out; }
      `}</style>
    </div>
  );
};

export default PlanQuiz;
