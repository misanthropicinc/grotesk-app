"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { login, getSession } from "./authService";
import ForgotModal from "./ForgotModal";
import ScanChatModal from "./ScanChatModal";

function useAuthRedirect() {
  const router = useRouter();
  const session = getSession();

  useEffect(() => {
    if (session) {
      router.push("/profile");
    }
  }, [session, router]);

  return session;
}

export default function AuthCard() {
  const session = useAuthRedirect();
  const searchParams = useSearchParams();
  const [forgotOpen, setForgotOpen] = useState(false);
  const [isRegister, setIsRegister] = useState(searchParams.get("mode") === "signup");
  const [telegram, setTelegram] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState(null);
  const [scanOpen, setScanOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  function handleSubmit(e) {
    e.preventDefault();
    setMessage(null);

    if (isRegister) {
      if (password !== confirmPassword) {
        setMessage({ type: "error", text: "Passwords do not match" });
        return;
      }
      setScanOpen(true);
    } else {
      const result = login(telegram, password);
      if (result.success) {
        window.location.href = "/profile";
      } else {
        setMessage({ type: "error", text: result.error });
      }
    }
  }

  return (
    <>
      <form className="auth-card" onSubmit={handleSubmit}>
        <h1 className="auth-card-title">{isRegister ? "Sign up" : "Log in"}</h1>

        <label className="auth-input-group">
          <span className="auth-input-label">Telegram *</span>
          <input
            type="text"
            className="auth-input"
            placeholder="@username"
            value={telegram}
            onChange={(e) => setTelegram(e.target.value)}
          />
        </label>

        <label className="auth-input-group">
          {isRegister ? (
            <span className="auth-input-label">Password *</span>
          ) : (
            <span className="auth-input-label-row">
              <span className="auth-input-label">Password *</span>
              <button
                type="button"
                className="auth-forgot-btn"
                onClick={() => setForgotOpen(true)}
              >
                Forgot?
              </button>
            </span>
          )}
          <div className="auth-password-wrapper">
            <input
              type={showPassword ? "text" : "password"}
              className="auth-input"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              type="button"
              className="auth-eye-btn"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                  <line x1="1" y1="1" x2="23" y2="23" />
                </svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              )}
            </button>
          </div>
        </label>

        {isRegister && (
          <label className="auth-input-group">
            <span className="auth-input-label">Confirm Password *</span>
            <div className="auth-password-wrapper">
              <input
                type={showConfirm ? "text" : "password"}
                className="auth-input"
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              <button
                type="button"
                className="auth-eye-btn"
                onClick={() => setShowConfirm(!showConfirm)}
                aria-label={showConfirm ? "Hide password" : "Show password"}
              >
                {showConfirm ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
          </label>
        )}

        {message && (
          <p className={`auth-message auth-message--${message.type}`}>
            {message.text}
          </p>
        )}

        <div className="auth-card-footer">
          <button type="submit" className="auth-submit-btn">
            {isRegister ? "Sign up" : "Log in"}
          </button>
          <button
            type="button"
            className="auth-create-btn"
            onClick={() => {
              setIsRegister(!isRegister);
              setMessage(null);
            }}
          >
            {isRegister ? (
              <>
                <span className="auth-no-account">ALREADY HAVE AN ACCOUNT?</span>{" "}
                <span className="auth-create-underline">LOG IN</span>
              </>
            ) : (
              <>
                <span className="auth-no-account">NO ACCOUNT?</span>{" "}
                <span className="auth-create-underline">CREATE ONE</span>
              </>
            )}
          </button>
        </div>
      </form>

      {scanOpen && (
        <ScanChatModal
          telegram={telegram}
          password={password}
          onComplete={() => {
            setScanOpen(false);
            setMessage({ type: "success", text: "Account created. You can now log in." });
            setTelegram("");
            setPassword("");
            setConfirmPassword("");
            setIsRegister(false);
          }}
          onCancel={() => setScanOpen(false)}
        />
      )}

      {forgotOpen && (
        <ForgotModal
          telegram={telegram}
          onClose={() => setForgotOpen(false)}
          onReset={() => setMessage({ type: "success", text: "Password reset successfully. You can now log in." })}
        />
      )}

    </>
  );
}
