
import { useState } from "react"; //import la functiile din react
import "./App.css"; //import css

// localStorage.removeItem("quizzes");

// Întrebările inițiale
const initialQuizzes = [
  { question: "Care este capitala Franței?",
    options: ["Paris","Madrid","Berlin","Roma"],
    correctAnswerIndex: 0, userAdded: false },
  { question: "Cât face 2 + 2?",
    options: ["3","4","5","6"],
    correctAnswerIndex: 1, userAdded: false },
  { question: "Ce culoare are cerul?",
    options: ["Roșu","Albastru","Verde","Galben"],
    correctAnswerIndex: 1, userAdded: false }
];

// Shuffle simplu
const shuffle = (arr) => [...arr].sort(() => Math.random() - 0.5);

function App() {
  // Întrebări și răspunsuri
  const [quizzes, setQuizzes] = useState(() => {
    const saved = localStorage.getItem("quizzes");
    return saved ? shuffle(JSON.parse(saved)) : shuffle(initialQuizzes);
  });
  const [answers, setAnswers] = useState({});

  // Formular adăugare întrebare
  const [newQuestion, setNewQuestion] = useState("");
  const [newOptions, setNewOptions] = useState(["",""]);
  const [correctIndex, setCorrectIndex] = useState(0);

  // Selectare răspuns
  const handleAnswer = (quizIndex, optionIndex) => {
    if (answers[quizIndex] !== undefined) return;
    setAnswers(prev => ({ ...prev, [quizIndex]: optionIndex }));
  };

  // Salvează în localStorage
  const saveQuizzes = (qs) => localStorage.setItem("quizzes", JSON.stringify(qs));

  // Reset: shuffle întrebări și opțiuni
  const handleReset = () => {
    setAnswers({});
    const shuffled = quizzes.map(q => {
      const opts = shuffle(q.options);
      const correct = opts.indexOf(q.options[q.correctAnswerIndex]);
      return { ...q, options: opts, correctAnswerIndex: correct };
    });
    setQuizzes(shuffle(shuffled));
    saveQuizzes(shuffle(shuffled));
  };

  // Adăugare opțiune nouă în formular
  const addOption = () => setNewOptions([...newOptions, ""]);
  const changeOption = (val, idx) => {
    const opts = [...newOptions]; opts[idx] = val; setNewOptions(opts);
  };

  // Adăugare întrebare nouă
  const addQuestion = (e) => {
    e.preventDefault();
    if (!newQuestion.trim() || newOptions.some(opt => !opt.trim())) return;

    const newQ = { question: newQuestion, options: newOptions, correctAnswerIndex: correctIndex, userAdded: true };
    const updated = [...quizzes, newQ];
    setQuizzes(updated); saveQuizzes(updated);

    setNewQuestion(""); setNewOptions(["",""]); setCorrectIndex(0);
  };

  // Ștergere întrebare
  const deleteQuestion = (idx) => {
    const updated = quizzes.filter((_, i) => i !== idx);
    setQuizzes(updated); saveQuizzes(updated);
  };

  // Progres
  const total = quizzes.length;
  const answered = Object.keys(answers).length;
  const progress = (answered / total) * 100;

  return (
    <div className="quiz-container">

      {/* Bara de progres + Reset */}
      <div className="progress-wrapper">
        <span className="progress-text">{answered}/{total}</span>
        <div className="progress-bar"><div className="progress-fill" style={{width:`${progress}%`}}></div></div>
        <button className="reset-btn" onClick={handleReset}>Reset</button>
      </div>

      {/* Întrebări */}
      {quizzes.map((q, i) => {
        const sel = answers[i];
        return (
          <div key={i} className="single-quiz">
            <h2>
              {q.question}
              {q.userAdded && <button className="delete-btn" onClick={()=>deleteQuestion(i)}>✖</button>}
            </h2>
            <ul>
              {q.options.map((opt, idx) => {
                let cls = "";
                if(sel !== undefined){
                  cls = idx === q.correctAnswerIndex ? "correct" : (idx === sel ? "wrong" : "");
                }
                return <li key={idx} className={cls} onClick={()=>handleAnswer(i, idx)}>{opt}</li>;
              })}
            </ul>
          </div>
        )
      })}

      {/* Formular adăugare întrebare */}
      <div className="add-question-form">
        <h3>Adaugă întrebare</h3>
        <form onSubmit={addQuestion}>
          <input type="text" placeholder="Întrebarea" value={newQuestion} onChange={e=>setNewQuestion(e.target.value)} required/>
          {newOptions.map((opt, idx)=>(
            <div key={idx}>
              <input type="text" placeholder={`Opțiunea ${idx+1}`} value={opt} onChange={e=>changeOption(e.target.value, idx)} required/>
              <label><input type="radio" name="correctOption" checked={correctIndex===idx} onChange={()=>setCorrectIndex(idx)}/> Corect</label>
            </div>
          ))}
          <button type="button" onClick={addOption}>Adaugă opțiune</button>
          <button type="submit">Adaugă întrebare</button>
        </form>
      </div>

    </div>
  )
}

export default App;
