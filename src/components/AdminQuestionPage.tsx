// components/AdminQuestionPage.tsx
import { FC } from "hono/jsx";

export const AdminQuestionPage: FC<{ questions: any[] }> = ({ questions }) => (
  <>
    <h1 className="text-2xl font-bold mb-4">クイズ問題管理</h1>

    <form method="post" action="/admin/questions" className="mb-8 space-y-2">
      <input
        name="question"
        placeholder="問題文"
        required
        className="border p-2 w-full"
      />
      <input
        name="option1"
        placeholder="選択肢1"
        required
        className="border p-2 w-full"
      />
      <input
        name="option2"
        placeholder="選択肢2"
        required
        className="border p-2 w-full"
      />
      <input
        name="option3"
        placeholder="選択肢3"
        required
        className="border p-2 w-full"
      />
      <input
        name="option4"
        placeholder="選択肢4"
        required
        className="border p-2 w-full"
      />
      <input
        name="correct_answer"
        placeholder="正解の選択肢"
        required
        className="border p-2 w-full"
      />
      <button className="bg-green-500 text-white px-4 py-2 rounded">
        追加
      </button>
    </form>

    <ul className="space-y-4">
      {questions.map((q) => (
        <li key={q.id} className="border p-4 bg-white rounded shadow">
          <p className="font-bold">{q.question}</p>
          <p className="text-sm text-gray-500">正解: {q.correct_answer}</p>
          <form
            method="post"
            action={`/admin/questions/delete/${q.id}`}
            className="mt-2"
          >
            <button className="text-red-600 underline">削除</button>
          </form>
        </li>
      ))}
    </ul>
  </>
);
