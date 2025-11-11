// src/App.js
import { useState } from "react";
import "./App.css";

const quizzes = [
  {
    question: "Care este capitala Franței?",
    options: ["Paris", "Madrid", "Berlin", "Roma"],
    correctAnswerIndex: 0,
  },
  {
    question: "Cât face 2 + 2?",
    options: ["3", "4", "5", "6"],
    correctAnswerIndex: 1,
  },
  {
    question: "Ce culoare are cerul?",
    options: ["Roșu", "Albastru", "Verde", "Galben"],
    correctAnswerIndex: 1,
  },
];

function App() {
  const [answers, setAnswers] = useState({});

  const handleAnswer = (quizIndex, optionIndex) => {
    setAnswers(prev => ({
      ...prev,
      [quizIndex]: optionIndex,
    }));
  };

  return (
    <div className="quiz-container">
      {quizzes.map((quiz, quizIndex) => {
        const selected = answers[quizIndex];
        return (
          <div key={quizIndex} className="single-quiz">
            <h2>{quiz.question}</h2>
            <ul>
              {quiz.options.map((option, index) => {
                let className = "";
                if (selected !== undefined) {
                  if (index === quiz.correctAnswerIndex) className = "correct";
                  else if (index === selected) className = "wrong";
                }
                return (
                  <li
                    key={index}
                    onClick={() => handleAnswer(quizIndex, index)}
                    className={className}
                  >
                    {option}
                  </li>
                );
              })}
            </ul>
          </div>
        );
      })}
    </div>
  );
}

export default App;
