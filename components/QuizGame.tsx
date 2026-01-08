
import React, { useState, useEffect } from 'react';

interface QuizGameProps { questions: any[]; onWin: () => void; onLose: () => void; isDark: boolean; }

const QuizGame: React.FC<QuizGameProps> = ({ questions, onWin, onLose, isDark }) => {
  const [idx, setIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [timer, setTimer] = useState(15);
  const [selected, setSelected] = useState<string | null>(null);

  useEffect(() => {
    if (timer > 0 && !selected) {
      const t = setTimeout(() => setTimer(timer - 1), 1000);
      return () => clearTimeout(t);
    } else if (timer === 0 && !selected) {
      handleAnswer('');
    }
  }, [timer, selected]);

  const handleAnswer = (ans: string) => {
    setSelected(ans);
    const isCorrect = ans === questions[idx].correctAnswer;
    if (isCorrect) setScore(score + 1);
    
    setTimeout(() => {
      if (idx < questions.length - 1) {
        setIdx(idx + 1);
        setTimer(15);
        setSelected(null);
      } else {
        if (score + (isCorrect ? 1 : 0) >= 3) onWin();
        else onLose();
      }
    }, 1500);
  };

  if (!questions.length) return <div className="p-8 text-center animate-pulse">Tuning the radio... 📻</div>;

  const q = questions[idx];

  return (
    <div className="p-6 flex flex-col items-center justify-center min-h-[70vh] space-y-8 max-w-lg mx-auto">
      <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-4 overflow-hidden border-2 border-white/10">
        <div className="bg-naija-green h-full transition-all duration-1000" style={{ width: `${(timer/15)*100}%` }}></div>
      </div>

      <div className="text-center space-y-4">
        <span className="bg-purple-500 text-white px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">Question {idx+1}/{questions.length}</span>
        <h3 className="text-2xl font-black leading-tight">{q.question}</h3>
      </div>

      <div className="grid grid-cols-1 gap-4 w-full">
        {q.options.map((opt: string) => {
          const isCorrect = opt === q.correctAnswer;
          const isSelected = selected === opt;
          let btnClass = isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100';
          if (selected) {
             if (isCorrect) btnClass = 'bg-green-500 text-white border-green-400';
             else if (isSelected) btnClass = 'bg-red-500 text-white border-red-400';
          }

          return (
            <button key={opt} disabled={!!selected} onClick={() => handleAnswer(opt)} className={`p-5 rounded-2xl border-4 font-bold text-lg transition-all ${btnClass} ${!selected && 'hover:border-naija-green active:scale-95'}`}>
              {opt}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default QuizGame;
