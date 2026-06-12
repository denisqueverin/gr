import { useCallback, useState, type FormEvent } from "react";
import {
  clearAuthentication,
  isAuthenticated,
  setAuthenticated,
  verifyPassword,
} from "../constants/auth";

interface Props {
  children: React.ReactNode;
}

export default function LoginGate({ children }: Props) {
  const [authed, setAuthed] = useState(isAuthenticated);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = useCallback(
    (e: FormEvent) => {
      e.preventDefault();
      if (verifyPassword(password)) {
        setAuthenticated();
        setAuthed(true);
        setError("");
        setPassword("");
        return;
      }
      setError("Неверный пароль");
    },
    [password],
  );

  if (!authed) {
    return (
      <div className="login-screen">
        <form className="login-card" onSubmit={handleSubmit}>
          <h1>Growth — динамика SP</h1>
          <p className="hint">Введите пароль для доступа к дашборду</p>
          <label className="login-label">
            Пароль
            <input
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (error) setError("");
              }}
              autoComplete="current-password"
              autoFocus
            />
          </label>
          {error && <p className="login-error">{error}</p>}
          <button type="submit" className="login-submit">
            Войти
          </button>
        </form>
      </div>
    );
  }

  return <>{children}</>;
}

export function useLogout() {
  return useCallback(() => {
    clearAuthentication();
    window.location.reload();
  }, []);
}
