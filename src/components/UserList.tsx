import { FC } from "hono/jsx";

export const UserList: FC<{
  users: { id: string; nickname: string; created_at: string }[];
}> = ({ users }) => (
  <>
    <h1 className="text-2xl font-bold mb-4">登録ユーザー一覧</h1>

    {/* 一括削除ボタン */}
    {users.length > 0 && (
      <form
        method="post"
        action="/admin/users/delete-all"
        className="mb-4"
        onsubmit="return confirm('⚠️ 本当にすべてのユーザーを削除しますか？')"
      >
        <button className="text-red-600 hover:underline text-sm">
          🧹 すべてのユーザーを削除
        </button>
      </form>
    )}

    <ul className="space-y-2">
      {users.map((u) => (
        <li key={u.id} className="border p-3 rounded bg-white shadow-sm">
          <div className="flex justify-between items-center">
            <div>
              <p>
                <strong>{u.nickname}</strong>
              </p>
              <p className="text-sm text-gray-500">
                登録日時: {new Date(u.created_at).toLocaleString()}
              </p>
            </div>
            <form method="post" action={`/admin/users/delete/${u.id}`}>
              <button
                className="text-red-600 hover:underline text-sm"
                onclick="return confirm('このユーザーを削除しますか？')"
              >
                削除
              </button>
            </form>
          </div>
        </li>
      ))}
    </ul>
  </>
);
