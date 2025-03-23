import { FC } from "hono/jsx";

export const ResultPage: FC<{ results: any[] }> = ({ results }) => {
  const correctCount = results.filter((r) => r.is_correct).length;
  const total = results.length;

  return (
    <>
      <h1 className="text-2xl font-bold mb-4">クイズ結果</h1>
      <p className="mb-2">
        正解数: <strong>{correctCount}</strong> / {total}
      </p>
      <ul className="space-y-4 mt-4">
        {results.map((r, i) => (
          <li
            key={r.question_id}
            className="border p-4 rounded bg-white shadow"
          >
            <p className="font-semibold mb-1">
              第{i + 1}問: {r.question}
            </p>
            <p>
              あなたの回答: <strong>{r.answer}</strong>
              {r.is_correct ? (
                <span className="text-green-600 ml-2">（正解）</span>
              ) : (
                <span className="text-red-600 ml-2">（不正解）</span>
              )}
            </p>
            {!r.is_correct && (
              <p className="text-sm text-gray-600">正解: {r.correct_answer}</p>
            )}
          </li>
        ))}
      </ul>
      <a href="/register" className="inline-block mt-6 text-blue-600 underline">
        もう一度やる →
      </a>
    </>
  );
};
