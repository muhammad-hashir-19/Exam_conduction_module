const Groq = require("groq-sdk");
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

class GradingService {
  async evaluateAnswer(givenAnswer, correctAnswer, questionText) {
    console.log(`[GRADING] Question: "${questionText.substring(0, 50)}..."`);
    console.log(`[GRADING] Comparing: "${givenAnswer}" vs "${correctAnswer}"`);

    // 1. Exact Match (Cleaned)
    const cleanGiven = String(givenAnswer).trim().toLowerCase();
    const cleanCorrect = String(correctAnswer).trim().toLowerCase();

    if (cleanGiven === cleanCorrect) {
      console.log(`[GRADING] Match found: Exact`);
      return true;
    }

    // 2. AI Intelligence Match
    try {
      const prompt = `
        You are a smart Exam Grader. 
        Question: "${questionText}"
        The correct answer is: "${correctAnswer}"
        The student chose: "${givenAnswer}"
        
        Task: Does the student's choice mean the same thing as the correct answer? 
        Often the student clicks the text of an option, but the database might store the option letter or a slightly different format.
        
        Respond ONLY with a JSON object: {"isCorrect": true} or {"isCorrect": false}
      `;

      const chatCompletion = await groq.chat.completions.create({
        messages: [{ role: "user", content: prompt }],
        model: "llama-3.3-70b-versatile",
        response_format: { type: "json_object" },
      });

      const result = JSON.parse(chatCompletion.choices[0]?.message?.content);
      console.log(`[GRADING] AI Decision: ${result.isCorrect}`);
      return result.isCorrect === true;
    } catch (error) {
      console.error("[GRADING] AI Error:", error);
      return false;
    }
  }

  calculatePassStatus(totalScore, passingScore) {
    return totalScore >= passingScore ? 'PASSED' : 'FAILED';
  }
}

module.exports = new GradingService();
