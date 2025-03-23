import { FC } from "hono/jsx";

export const QuizPage: FC<{
  id: string;
  question: string;
  options: string[];
}> = ({ id, question, options }) => (
  <>
    <h1 className="text-2xl font-bold mb-4">
      第{id}問: {question}
    </h1>
    <form method="post" action={`/quiz/${id}`} className="space-y-2">
      {options.map((opt) => (
        <label key={opt} className="block">
          <input
            type="radio"
            name="answer"
            value={opt}
            className="mr-2"
            required
          />
          {opt}
        </label>
      ))}
      <button
        type="submit"
        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
      >
        回答する
      </button>
    </form>
  </>
);
