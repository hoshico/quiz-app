import { FC } from "hono/jsx";

export const AnswerResult: FC<{
  selected: string;
  isCorrect: boolean;
  nextId: number;
}> = ({ selected, isCorrect, nextId }) => (
  <>
    <h1 className="text-2xl font-bold mb-4">結果</h1>
    <p>
      あなたの回答: <strong>{selected}</strong>
    </p>
    <p className={isCorrect ? "text-green-600" : "text-red-600"}>
      {isCorrect ? "正解！🎉" : "不正解 😢"}
    </p>
    <a
      href={nextId > 3 ? "/result" : `/quiz/${nextId}`}
      className="inline-block mt-4 text-blue-600 underline"
    >
      {nextId > 3 ? "結果を確認 →" : "次の問題へ →"}
    </a>
  </>
);
