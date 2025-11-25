import { useState } from "react"; //functiile useState
import "./App.css"; //conectiunea cu css ul

//grile initiale
const initialQuizzes = [
  { question: "Care este capitala Franței?", options: ["Paris","Madrid","Berlin","Roma"], correctAnswerIndex: 0, userAdded: false },
  { question: "Cât face 2 + 2?", options: ["3","4","5","6"], correctAnswerIndex: 1, userAdded: false },
  { question: "Ce culoare are cerul?", options: ["Roșu","Albastru","Verde","Galben"], correctAnswerIndex: 1, userAdded: false }
];

// amesteca intrebarile
const shuffle = (arr) => [...arr].sort(() => Math.random() - 0.5);

function App() {
  const [quizzes, setQuizzes] = useState(() => {
    const saved = localStorage.getItem("quizzes");
    return saved ? shuffle(JSON.parse(saved)) : shuffle(initialQuizzes);
  });

  const [answers, setAnswers] = useState({});
  const [score, setScore] = useState(0);
  const [newQ, setNewQ] = useState("");
  const [newOptions, setNewOptions] = useState(["",""]);
  const [correctIndex, setCorrectIndex] = useState(0);

//-------------------------
  const handleAnswer = (i, idx) => {
    if (answers[i] !== undefined) return;
    const correct = idx === quizzes[i].correctAnswerIndex;

    document.body.classList.add(correct ? "show-correct" : "show-wrong");
    setTimeout(() => document.body.classList.remove("show-correct","show-wrong"), 1000);

    setScore(prev => correct ? prev + 10 : prev - 10);
    setAnswers(prev => ({ ...prev, [i]: idx }));
  };
//-------------------------
  const saveQuizzes = (qs) => localStorage.setItem("quizzes", JSON.stringify(qs)); //salveaza grilele

  //amesteca variantele
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

  //adaugam o grila noua in lista
  const addQuestion = (e) => {
    e.preventDefault();
    if (!newQ.trim() || newOptions.some(o => !o.trim())) return;

    const updated = [...quizzes, { question: newQ, options: newOptions, correctAnswerIndex: correctIndex, userAdded: true }];
    setQuizzes(updated);
    saveQuizzes(updated);
    setNewQ(""); setNewOptions(["",""]); setCorrectIndex(0);
  };

  //stergem una din grilele adaugate
  const deleteQuestion = (i) => {
    const updated = quizzes.filter((_, idx) => idx !== i);
    setQuizzes(updated);
    saveQuizzes(updated);
  };

  //progresul in functie de cate grile au primit raspuns
  const progress = Object.keys(answers).length / quizzes.length * 100;

  return (

    <div className="quiz-container">



      <div className="progress-wrapper">
        <span className="progress-text">{Object.keys(answers).length}/{quizzes.length} | Scor: {score}</span>
        <div className="progress-bar"><div className="progress-fill" style={{ width: `${progress}%` }}></div></div>
        <button className="reset-btn" onClick={handleReset}>Reset</button>
      </div>



      {quizzes.map((q,i) => (
        <div key={i} className="single-quiz">
          <h2>{q.question}{q.userAdded && <button className="delete-btn" onClick={() => deleteQuestion(i)}>✖</button>}</h2>
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
          <input type="text" placeholder="Întrebarea" value={newQ} onChange={e=>setNewQ(e.target.value)} required />
          {newOptions.map((opt,idx)=>(
            <div key={idx}>
              <input type="text" placeholder={`Opțiunea ${idx+1}`} value={opt} onChange={e=>setNewOptions(prev => prev.map((v,i)=>i===idx?e.target.value:v))} required />
              <label><input type="radio" name="correctOption" checked={correctIndex===idx} onChange={()=>setCorrectIndex(idx)} /> Corect</label>
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
