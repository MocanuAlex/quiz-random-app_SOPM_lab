import { useState } from "react";
import "./App.css";

const initialQuizzes = [
  {
    question: "Care este capitala Franței?",
    options: ["Paris", "Madrid", "Berlin", "Roma"],
    correctAnswerIndex: 0,
    userAdded: false
  },
  {
    question: "Cât face 2 + 2?",
    options: ["3", "4", "5", "6"],
    correctAnswerIndex: 1,
    userAdded: false
  },
  {
    question: "Ce culoare are cerul?",
    options: ["Roșu", "Albastru", "Verde", "Galben"],
    correctAnswerIndex: 1,
    userAdded: false
  }
];

const shuffle = (arr) => [...arr].sort(() => Math.random() - 0.5);

function App() {
  const [quizzes, setQuizzes] = useState(() => {
    const saved = localStorage.getItem("quizzes");
    return saved ? shuffle(JSON.parse(saved)) : shuffle(initialQuizzes);
  });
  
  const [answers, setAnswers] = useState({});
  const [score, setScore] = useState(0);
  const [newQuestion, setNewQuestion] = useState("");
  const [newOptions, setNewOptions] = useState(["", ""]);
  const [correctIndex, setCorrectIndex] = useState(0);

  const handleAnswer = (quizIndex, optionIndex) => {
    if (answers[quizIndex] !== undefined) return;
    
    const isCorrect = optionIndex === quizzes[quizIndex].correctAnswerIndex;
    
    // Adaugă clasa pentru animație
    document.body.classList.add(isCorrect ? 'show-correct' : 'show-wrong');
    
    // Elimină clasa după animație
    setTimeout(() => {
      document.body.classList.remove('show-correct', 'show-wrong');
    }, 1000);
    
    // Actualizează scorul
    if (isCorrect) {
      setScore(prev => prev + 10);
    } else {
      setScore(prev => Math.max(0, prev - 10));
    }
    
    setAnswers(prev => ({ ...prev, [quizIndex]: optionIndex }));
  };

  const saveQuizzes = (qs) => localStorage.setItem("quizzes", JSON.stringify(qs));

  const handleReset = () => {
    setAnswers({});
    setScore(0);
    const shuffled = quizzes.map(q => {
      const opts = shuffle(q.options);
      const correct = opts.indexOf(q.options[q.correctAnswerIndex]);
      return { ...q, options: opts, correctAnswerIndex: correct };
    });
    setQuizzes(shuffle(shuffled));
    saveQuizzes(shuffle(shuffled));
  };

  const addOption = () => setNewOptions([...newOptions, ""]);
  
  const changeOption = (val, idx) => {
    const opts = [...newOptions];
    opts[idx] = val;
    setNewOptions(opts);
  };

  const addQuestion = (e) => {
    e.preventDefault();
    if (!newQuestion.trim() || newOptions.some(opt => !opt.trim())) return;

    const newQ = {
      question: newQuestion,
      options: newOptions,
      correctAnswerIndex: correctIndex,
      userAdded: true
    };
    
    const updated = [...quizzes, newQ];
    setQuizzes(updated);
    saveQuizzes(updated);

    setNewQuestion("");
    setNewOptions(["", ""]);
    setCorrectIndex(0);
  };

  const deleteQuestion = (idx) => {
    const updated = quizzes.filter((_, i) => i !== idx);
    setQuizzes(updated);
    saveQuizzes(updated);
  };

  const total = quizzes.length;
  const answered = Object.keys(answers).length;
  const progress = (answered / total) * 100;

  return (
    <div className="quiz-container">
      <div className="progress-wrapper">
        <span className="progress-text">
          {answered}/{total} | Scor: {score}
        </span>
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${progress}%` }}></div>
        </div>
        <button className="reset-btn" onClick={handleReset}>
          Reset
        </button>
      </div>

      {quizzes.map((q, i) => {
        const sel = answers[i];
        return (
          <div key={i} className="single-quiz">
            <h2>
              {q.question}
              {q.userAdded && (
                <button className="delete-btn" onClick={() => deleteQuestion(i)}>
                  ✖
                </button>
              )}
            </h2>
            <ul>
              {q.options.map((opt, idx) => {
                let cls = "";
                if (sel !== undefined) {
                  cls =
                    idx === q.correctAnswerIndex
                      ? "correct"
                      : idx === sel
                      ? "wrong"
                      : "";
                }
                return (
                  <li
                    key={idx}
                    className={cls}
                    onClick={() => handleAnswer(i, idx)}
                  >
                    {opt}
                  </li>
                );
              })}
            </ul>
          </div>
        );
      })}

      <div className="add-question-form">
        <h3>Adaugă întrebare</h3>
        <form onSubmit={addQuestion}>
          <input
            type="text"
            placeholder="Întrebarea"
            value={newQuestion}
            onChange={(e) => setNewQuestion(e.target.value)}
            required
          />
          {newOptions.map((opt, idx) => (
            <div key={idx}>
              <input
                type="text"
                placeholder={`Opțiunea ${idx + 1}`}
                value={opt}
                onChange={(e) => changeOption(e.target.value, idx)}
                required
              />
              <label>
                <input
                  type="radio"
                  name="correctOption"
                  checked={correctIndex === idx}
                  onChange={() => setCorrectIndex(idx)}
                />
                Corect
              </label>
            </div>
          ))}
          <button type="button" onClick={addOption}>
            Adaugă opțiune
          </button>
          <button type="submit">Adaugă întrebare</button>
        </form>
      </div>
    </div>
  );
}

export default App;