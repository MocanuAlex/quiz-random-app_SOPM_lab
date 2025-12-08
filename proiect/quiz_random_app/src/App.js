import { useState, useEffect } from "react";
import "./App.css";

const shuffle = (arr) => [...arr].sort(() => Math.random() - 0.5);

// Transformă codurile urâte (HTML entities) în text normal
const decodeHTML = (html) => {
  if (!html) return "";
  const txt = document.createElement('textarea');
  txt.innerHTML = html;
  return txt.value;
};

function App() {
  const [quizzes, setQuizzes] = useState([]);
  const [answers, setAnswers] = useState({});
  const [score, setScore] = useState(0);
  const [newQ, setNewQ] = useState("");
  const [newOptions, setNewOptions] = useState(["", ""]);
  const [correctIndex, setCorrectIndex] = useState(0);

  // ==========================================
  // 2. DESCĂRCAREA ÎNTREBĂRILOR (FIXATĂ)
  // ==========================================
  useEffect(() => {
    fetch("https://opentdb.com/api.php?amount=10&category=15&difficulty=easy")
      .then(res => res.json())
      .then(data => {
        const formatted = data.results.map(q => {
          // AICI ESTE SCHIMBAREA: Curățăm textul înainte să-l folosim
          const decodedQuestion = decodeHTML(q.question);
          const decodedCorrectAnswer = decodeHTML(q.correct_answer);
          const decodedIncorrectAnswers = q.incorrect_answers.map(decodeHTML);

          // Folosim variantele curățate pentru a construi opțiunile
          const options = shuffle([...decodedIncorrectAnswers, decodedCorrectAnswer]);
          const correctAnswerIndex = options.indexOf(decodedCorrectAnswer);

          return { 
            question: decodedQuestion, 
            options, 
            correctAnswerIndex, 
            userAdded: false 
          };
        });
        setQuizzes(shuffle(formatted));
      })
      .catch(err => console.error("Eroare la API:", err));
  }, []);

  // ==========================================
  // 3. RESTUL LOGICII (NESCHIMBAT)
  // ==========================================
  const handleAnswer = (i, idx) => {
    if (answers[i] !== undefined) return;
    const correct = idx === quizzes[i].correctAnswerIndex;

    document.body.classList.add(correct ? "show-correct" : "show-wrong");
    setTimeout(() => document.body.classList.remove("show-correct","show-wrong"), 1000);

    setScore(prev => correct ? prev + 10 : prev - 10);
    setAnswers(prev => ({ ...prev, [i]: idx }));
  };

  const handleReset = () => {
    setAnswers({});
    setScore(0);
    const shuffled = quizzes.map(q => {
      const opts = shuffle(q.options);
      // Trebuie să regăsim indexul corect bazat pe string-ul răspunsului
      const correctString = q.options[q.correctAnswerIndex]; 
      // Nota: Aici e o mică capcană la reset dacă nu știm care era stringul corect.
      // Dar pentru simplitate, reamestecăm doar opțiunile:
      const newCorrectIndex = opts.indexOf(correctString);
      
      return { ...q, options: opts, correctAnswerIndex: newCorrectIndex };
    });
    setQuizzes(shuffle(shuffled));
  };

  const addQuestion = (e) => {
    e.preventDefault();
    if (!newQ.trim() || newOptions.some(o => !o.trim())) return;

    const updated = [...quizzes, { question: newQ, options: newOptions, correctAnswerIndex: correctIndex, userAdded: true }];
    setQuizzes(updated);
    setNewQ(""); setNewOptions(["",""]); setCorrectIndex(0);
  };

  const deleteQuestion = (i) => {
    const updated = quizzes.filter((_, idx) => idx !== i);
    setQuizzes(updated);
  };

  const progress = quizzes.length ? Object.keys(answers).length / quizzes.length * 100 : 0;

  return (
    <div className="quiz-container">
      <div className="progress-wrapper">
        <span className="progress-text">{Object.keys(answers).length}/{quizzes.length} | Scor: {score}</span>
        <div className="progress-bar"><div className="progress-fill" style={{ width: `${progress}%` }}></div></div>
        <button className="reset-btn" onClick={handleReset}>Reset</button>
      </div>

      {quizzes.length > 0 && quizzes.map((q, i) => (
        <div key={i} className="single-quiz">
          <h2>
            {q.question}
            {q.userAdded && <button className="delete-btn" onClick={() => deleteQuestion(i)}>✖</button>}
          </h2>
          <ul>
            {q.options.map((opt, idx) => {
              const cls = answers[i] !== undefined
                ? (idx === q.correctAnswerIndex ? "correct" : idx === answers[i] ? "wrong" : "")
                : "";
              return <li key={idx} className={cls} onClick={() => handleAnswer(i, idx)}>{opt}</li>;
            })}
          </ul>
        </div>
      ))}

      <div className="add-question-form">
        <h3>Adaugă întrebare</h3>
        <form onSubmit={addQuestion}>
          <input type="text" placeholder="Întrebarea" value={newQ} onChange={e => setNewQ(e.target.value)} required />
          {newOptions.map((opt, idx) => (
            <div key={idx}>
              <input type="text" placeholder={`Opțiunea ${idx + 1}`} value={opt} onChange={e => setNewOptions(prev => prev.map((v,i)=>i===idx?e.target.value:v))} required />
              <label>
                <input type="radio" name="correctOption" checked={correctIndex===idx} onChange={()=>setCorrectIndex(idx)} /> Corect
              </label>
            </div>
          ))}
          <button type="button" onClick={()=>setNewOptions([...newOptions,""])}>Adaugă opțiune</button>
          <button type="submit">Adaugă întrebare</button>
        </form>
      </div>
    </div>
  );
}

export default App;