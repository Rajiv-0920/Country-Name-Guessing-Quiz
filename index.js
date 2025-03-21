import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import 'dotenv/config';


const app = express();
const port = 3000;

const db = new pg.Client({
    user: process.env.DB_USER || "postgres",
    host: process.env.DB_HOST || "localhost",
    database: process.env.DB_DATABASE || "world",
    password: process.env.DB_PASSWORD || "Admin",
    port: 5432
})

db.connect();
let currentQuestion = {};
let quiz = [];
let totalCorrect;
db.query('SELECT * FROM flags', (err, res) => {
    if (err) {
        console.error(`Error on fetching data ${err}`);
    } else {
        quiz = res.rows;
    }
    db.end();
})

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

app.get("/", (req, res) => {
    totalCorrect = 0;
    nextQuestion();
    res.render("index.ejs", { question: currentQuestion.flag });
})

app.post("/submit", (req, res) => {
    let userAnswer = req.body.answer.trim();
    let isCorrect = false;
    if (userAnswer.toLowerCase() === currentQuestion.name.toLowerCase()) {
        totalCorrect++;
        isCorrect = true;
    }
    nextQuestion();
    res.render("index.ejs", {
        question: currentQuestion.flag,
        wasCorrect: isCorrect,
        score: totalCorrect,
    })
})

app.listen(port, () => {
    console.log(`Listening on port ${port}`);
})

function nextQuestion() {
    currentQuestion = quiz[Math.floor(Math.random() * quiz.length)];
}