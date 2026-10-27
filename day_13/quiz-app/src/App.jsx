
import { useEffect, useState } from "react";
import "./App.css";

function App() {
  const [questions, setQuestions] = useState([]);
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState("");
  const [answers, setAnswers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [finished, setFinished] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    fetch("/questions.json")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Could not load questions.json");
        }
        return response.json();
      })
      .then((data) => {
        if (
          !Array.isArray(data) ||
          data.length === 0 ||
          !data.every(
            (q) =>
              q.question &&
              Array.isArray(q.options) &&
              q.options.length > 0 &&
              q.options.includes(q.correct_answer)
          )
        ) {
          throw new Error("Invalid question data format");
        }

        setQuestions(data);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  function submitAnswer() {
    if (!selected || submitted) return;

    setAnswers((previous) => [
      ...previous,
      {
        questionId: questions[current].id,
        selected,
        correct: selected === questions[current].correct_answer,
      },
    ]);

    setSubmitted(true);
  }

  function nextQuestion() {
    if (current === questions.length - 1) {
      setFinished(true);
    } else {
      setCurrent((previous) => previous + 1);
      setSelected("");
      setSubmitted(false);
    }
  }

  function restartQuiz() {
    setCurrent(0);
    setSelected("");
    setAnswers([]);
    setSubmitted(false);
    setFinished(false);
  }

  if (loading) {
    return <div className="message">Loading your quiz...</div>;
  }

  if (error) {
    return (
      <div className="message error">
        <h2>Unable to load quiz</h2>
        <p>{error}</p>
        <p>
          Check that questions.json is inside the public folder
          of your quiz-app project.
        </p>
      </div>
    );
  }

  const score = answers.filter((answer) => answer.correct).length;
  const question = questions[current];
  const progress = ((current + 1) / questions.length) * 100;

  if (finished) {
    const percentage = Math.round((score / questions.length) * 100);

    return (
      <main className="app">
        <section className="quiz-card result-card">
          <div className="result-icon">
            {percentage >= 60 ? "🎉" : "📚"}
          </div>

          <h1>Quiz Completed!</h1>
          <p className="subtitle">Here is your final result.</p>

          <div className="score-circle">
            <strong>{percentage}%</strong>
            <span>Score</span>
          </div>

          <div className="result-stats">
            <div>
              <strong>{score}</strong>
              <span>Correct</span>
            </div>
            <div>
              <strong>{questions.length - score}</strong>
              <span>Incorrect</span>
            </div>
            <div>
              <strong>{questions.length}</strong>
              <span>Total</span>
            </div>
          </div>

          <button className="primary-btn" onClick={restartQuiz}>
            Try Again
          </button>
        </section>
      </main>
    );
  }

  return (
    <main className="app">
      <section className="quiz-card">
        <header className="quiz-header">
          <div className="brand">QUIZ MASTER</div>
          <span className="question-count">
            Question {current + 1} of {questions.length}
          </span>
        </header>

        <div className="progress-track">
          <div
            className="progress-bar"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="badges">
          <span className="category">
            {question.category || "General"}
          </span>
          <span className="difficulty">
            {question.difficulty || "Standard"}
          </span>
        </div>

        <h1 className="question-title">{question.question}</h1>
        <p className="instruction">Select one correct answer.</p>

        <div className="options-list">
          {question.options.map((option, index) => {
            let className = "option";

            if (selected === option) className += " selected";

            if (submitted && option === question.correct_answer) {
              className += " correct";
            } else if (
              submitted &&
              option === selected &&
              selected !== question.correct_answer
            ) {
              className += " incorrect";
            }

            return (
              <button
                key={index}
                className={className}
                onClick={() => {
                  if (!submitted) setSelected(option);
                }}
                disabled={submitted}
              >
                <span className="option-letter">
                  {String.fromCharCode(65 + index)}
                </span>
                <span>{option}</span>
              </button>
            );
          })}
        </div>

        {submitted && (
          <p
            className={
              selected === question.correct_answer
                ? "feedback correct-text"
                : "feedback incorrect-text"
            }
          >
            {selected === question.correct_answer
              ? "Correct answer!"
              : `Incorrect. Correct answer: ${question.correct_answer}`}
          </p>
        )}

        <footer className="quiz-footer">
          <span>Score: {score}</span>

          {!submitted ? (
            <button
              className="primary-btn"
              onClick={submitAnswer}
              disabled={!selected}
            >
              Submit Answer
            </button>
          ) : (
            <button className="primary-btn" onClick={nextQuestion}>
              {current === questions.length - 1
                ? "View Results"
                : "Next Question"}
            </button>
          )}
        </footer>
      </section>
    </main>
  );
}

export default App;
