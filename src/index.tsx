import { Hono } from "hono";
import { jsxRenderer } from "hono/jsx-renderer";
import { Layout } from "./components/layout";
import { NicknameForm } from "./components/NicknameForm";
import { QuizPage } from "./components/QuizPage";
import { AnswerResult } from "./components/AnswerResult";
import { AdminQuestionPage } from "./components/AdminQuestionPage";
import { UserList } from "./components/UserList";

type Env = {
  Bindings: {
    DB: D1Database; // Cloudflare が提供している型
  };
};

const app = new Hono<Env>();

app.use("*", jsxRenderer());

// 管理画面 - 一覧表示 & 作成フォーム
app.get("/admin/questions", async (c) => {
  const { results } = await c.env.DB.prepare(
    "SELECT * FROM questions ORDER BY id"
  ).all();

  return c.render(
    <Layout>
      <AdminQuestionPage questions={results} />
    </Layout>
  );
});

// 問題新規作成
app.post("/admin/questions", async (c) => {
  const body = await c.req.parseBody();
  const question = body.question?.toString();
  const options = [body.option1, body.option2, body.option3, body.option4].map(
    (o) => o?.toString()
  );
  const correctAnswer = body.correct_answer?.toString();

  if (!question || !correctAnswer || options.some((o) => !o)) {
    return c.text("全てのフィールドを入力してください", 400);
  }

  // 既存の問題数を数えてIDを生成
  const { results } = await c.env.DB.prepare(
    "SELECT COUNT(*) as count FROM questions"
  ).all();
  const count = results[0].count as number;
  const id = `q${count + 1}`; // 例: q4, q5, ...

  await c.env.DB.prepare(
    "INSERT INTO questions (id, question, options, correct_answer) VALUES (?1, ?2, ?3, ?4)"
  )
    .bind(id, question, JSON.stringify(options), correctAnswer)
    .run();

  return c.redirect("/admin/questions");
});

// ユーザー確認画面
app.get("/admin/users", async (c) => {
  const { results } = (await c.env.DB.prepare(
    `
    SELECT
      u.id,
      u.nickname,
      u.created_at,
      COUNT(a.id) as total_answers,
      SUM(CASE WHEN a.is_correct THEN 1 ELSE 0 END) as correct_answers
    FROM users u
    LEFT JOIN answers a ON u.id = a.user_id
    GROUP BY u.id
    ORDER BY u.created_at DESC
  `
  ).all()) as {
    results: {
      id: string;
      nickname: string;
      created_at: string;
      total_answers: number;
      correct_answers: number;
    }[];
  };

  return c.render(
    <Layout>
      <UserList users={results} />
    </Layout>
  );
});

app.post("/admin/users/delete/:id", async (c) => {
  const id = c.req.param("id");

  await c.env.DB.prepare("DELETE FROM users WHERE id = ?1").bind(id).run();

  return c.redirect("/admin/users");
});

app.post("/admin/users/delete-all", async (c) => {
  const deleteAnswers = await c.env.DB.prepare("DELETE FROM answers");
  const deleteUsers = await c.env.DB.prepare("DELETE FROM users");

  await deleteAnswers.run();
  await deleteUsers.run();

  return c.redirect("/admin/users");
});

// 問題削除
app.post("/admin/questions/delete/:id", async (c) => {
  const id = c.req.param("id");

  await c.env.DB.prepare("DELETE FROM questions WHERE id = ?1").bind(id).run();

  return c.redirect("/admin/questions");
});

app.get("/", (c) => c.redirect("/register"));

app.get("/test", async (c) => {
  const result = await c.env.DB.prepare("SELECT * FROM users").all();
  return c.json(result);
});

// GET: ニックネーム登録フォーム
app.get("/register", (c) => {
  return c.render(
    <Layout>
      <NicknameForm />
    </Layout>
  );
});
// POST: ニックネーム登録処理
app.post("/register", async (c) => {
  const body = await c.req.parseBody();
  const nickname = body.nickname?.toString();

  if (!nickname) {
    return c.render(
      <Layout>
        <p className="text-red-600">ニックネームは必須です。</p>
        <a href="/register" className="text-blue-600 underline">
          戻る
        </a>
      </Layout>
    );
  }

  const id = crypto.randomUUID();

  await c.env.DB.prepare("INSERT INTO users (id, nickname) VALUES (?1, ?2)")
    .bind(id, nickname)
    .run();

  // ユーザーIDをcookieに保存（次の画面でも使えるように）
  c.header("Set-Cookie", `user_id=${id}; Path=/; HttpOnly; SameSite=Lax`);

  return c.redirect("/quiz/1");
});

app.get("/quiz/:id", async (c) => {
  const id = c.req.param("id");
  const question = await c.env.DB.prepare(
    "SELECT * FROM questions WHERE id = ?1"
  )
    .bind(`q${id}`)
    .first();

  if (!question) {
    return c.text("クイズが見つかりません", 404);
  }

  const options = JSON.parse(question.options as string);

  return c.render(
    <Layout>
      <QuizPage
        id={id}
        question={question.question as string}
        options={options}
      />
    </Layout>
  );
});

app.post("/quiz/:id", async (c) => {
  const id = c.req.param("id");
  const body = await c.req.parseBody();
  const selected = body.answer?.toString();
  const userId = c.req.header("Cookie")?.match(/user_id=([^;]+)/)?.[1];

  if (!selected || !userId) {
    return c.text("回答またはユーザー情報が見つかりません", 400);
  }

  const question = await c.env.DB.prepare(
    "SELECT * FROM questions WHERE id = ?1"
  )
    .bind(`q${id}`)
    .first();

  if (!question) return c.text("クイズが見つかりません", 404);

  const isCorrect = selected === question.correct_answer;
  const answerId = crypto.randomUUID();

  await c.env.DB.prepare(
    "INSERT INTO answers (id, user_id, question_id, answer, is_correct) VALUES (?1, ?2, ?3, ?4, ?5)"
  )
    .bind(answerId, userId, `q${id}`, selected, isCorrect)
    .run();

  const nextId = parseInt(id) + 1;

  return c.render(
    <Layout>
      <AnswerResult selected={selected} isCorrect={isCorrect} nextId={nextId} />
    </Layout>
  );
});

app.get("/result", async (c) => {
  const userId = c.req.header("Cookie")?.match(/user_id=([^;]+)/)?.[1];

  if (!userId) {
    return c.text("ユーザーが特定できません（cookieがありません）", 400);
  }

  // 全回答取得（JOINでquestion内容も含める）
  const { results } = await c.env.DB.prepare(
    `
    SELECT
      a.question_id,
      q.question,
      a.answer,
      q.correct_answer,
      a.is_correct
    FROM answers a
    JOIN questions q ON a.question_id = q.id
    WHERE a.user_id = ?1
    ORDER BY a.created_at ASC
  `
  )
    .bind(userId)
    .all();

  const correctCount = results.filter((r) => r.is_correct).length;
  const total = results.length;

  return c.render(
    <Layout>
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
    </Layout>
  );
});

export default app;
