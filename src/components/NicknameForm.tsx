import { FC } from "hono/jsx";

export const NicknameForm: FC = () => (
  <>
    <h1 className="text-2xl font-bold mb-4">ニックネームを入力してください</h1>
    <form method="post" action="/register" className="space-y-4">
      <input
        type="text"
        name="nickname"
        placeholder="例: たろう"
        required
        className="border p-2 rounded w-full"
      />
      <button
        type="submit"
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
      >
        登録する
      </button>
    </form>
  </>
);
