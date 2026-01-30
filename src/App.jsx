import { useEffect, useState } from "react";

const isPiBrowser = () => typeof window !== "undefined" && !!window.Pi;

export default function App() {
  const [inPi, setInPi] = useState(false);

  const [piReady, setPiReady] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [authError, setAuthError] = useState("");

  const [payLoading, setPayLoading] = useState(false);
  const [payResult, setPayResult] = useState("");

  // ✅ Pi Browser Detection (Pi SDK kann erst nach dem ersten Render auftauchen)
  useEffect(() => {
    const t = setInterval(() => {
      if (isPiBrowser()) {
        setInPi(true);
        clearInterval(t);
      }
    }, 200);

    // nach max 5 Sekunden aufgeben
    const stop = setTimeout(() => clearInterval(t), 5000);

    return () => {
      clearInterval(t);
      clearTimeout(stop);
    };
  }, []);

  // ✅ Pi SDK init (erst wenn wirklich im Pi Browser)
  useEffect(() => {
    if (!inPi) return;

    try {
      window.Pi.init({ version: "2.0", sandbox: false });
      setPiReady(true);
      console.log("✅ Pi.init ok");
    } catch (e) {
      console.warn("❌ Pi.init failed", e);
      setPiReady(false);
    }
  }, [inPi]);

  // 🔐 Login
  const login = async () => {
    setAuthError("");
    setAuthLoading(true);

    try {
      console.log("LOGIN clicked", { inPi, piReady, hasPi: !!window.Pi });

      if (!window.Pi) throw new Error("Pi SDK not available (not in Pi Browser?)");

      const scopes = ["username"];
      console.log("calling authenticate...");

      const authResult = await window.Pi.authenticate(scopes, (payment) => {
        console.log("Incomplete payment found:", payment);
        return payment;
      });

      console.log("authResult", authResult);

      // je nach SDK-Version kann die Struktur variieren
      const u = authResult?.user || authResult;
      setUser(u);
    } catch (err) {
      console.error("Login error:", err);
      setAuthError(err?.message || "Login failed");
    } finally {
      setAuthLoading(false);
    }
  };

  // 💳 Test Payment (Demo)
  const testPayment = async () => {
    setPayResult("");
    setPayLoading(true);

    try {
      if (!window.Pi) throw new Error("Pi SDK not available");
      if (!user) throw new Error("Not logged in");

      const paymentData = {
        amount: 1,
        memo: "GeoPi Test Payment",
        metadata: { purpose: "test" },
      };

      const payment = await window.Pi.createPayment(paymentData, {
        onReadyForServerApproval: (paymentId) => {
          console.log("onReadyForServerApproval paymentId:", paymentId);
          setPayResult(`⏳ Waiting for server approval (paymentId: ${paymentId})`);
        },
        onReadyForServerCompletion: (paymentId, txid) => {
          console.log("onReadyForServerCompletion:", paymentId, txid);
          setPayResult(`✅ Payment completed (txid: ${txid || "n/a"})`);
        },
        onCancel: (paymentId) => {
          console.log("Payment cancelled:", paymentId);
          setPayResult("⚠️ Payment cancelled");
        },
        onError: (error, payment) => {
          console.error("Payment error:", error, payment);
          setPayResult(`❌ Payment error: ${error?.message || "unknown"}`);
        },
      });

      console.log("Payment created:", payment);
      if (!payment) setPayResult("✅ Payment created (waiting for callbacks)");
    } catch (err) {
      setPayResult(`❌ ${err?.message || "Payment failed"}`);
    } finally {
      setPayLoading(false);
    }
  };

  return (
    <div
      style={{
        padding: 24,
        fontFamily: "system-ui, Arial",
        maxWidth: 720,
        margin: "0 auto",
      }}
    >
      <h1>GeoPi</h1>

      {!inPi && (
        <div
          style={{
            padding: 12,
            border: "1px solid #444",
            borderRadius: 8,
            marginBottom: 16,
          }}
        >
          <b>Du bist nicht im Pi Browser.</b>
          <div>Pi Login & Payments funktionieren nur im Pi Browser / Pi App.</div>
          <div style={{ marginTop: 8, opacity: 0.8, fontSize: 13 }}>
            Tipp: Öffne die App über Pi Browser und rufe <b>https://geopi.app</b> auf.
          </div>
        </div>
      )}

      {inPi && (
        <div
          style={{
            padding: 12,
            border: "1px solid #444",
            borderRadius: 8,
            marginBottom: 16,
          }}
        >
          <div>Pi Browser erkannt: ✅</div>
          <div>Pi SDK: {piReady ? "✅ ready" : "⏳ init..."}</div>
          <div>User: {user ? `✅ ${user.username || "logged in"}` : "❌ not logged in"}</div>
        </div>
      )}

      {inPi && !user && (
        <button onClick={login} disabled={authLoading} style={{ padding: "10px 14px" }}>
          {authLoading ? "Logging in..." : "Mit Pi anmelden"}
        </button>
      )}

      {authError && <div style={{ marginTop: 12, color: "tomato" }}>{authError}</div>}

      {inPi && user && (
        <div style={{ marginTop: 24 }}>
          <h2>Payments</h2>

          <button onClick={testPayment} disabled={payLoading} style={{ padding: "10px 14px" }}>
            {payLoading ? "Paying..." : "Test Payment (1 Pi)"}
          </button>

          {payResult && <div style={{ marginTop: 12 }}>{payResult}</div>}

          <div style={{ marginTop: 10, opacity: 0.8, fontSize: 13 }}>
            Hinweis: Für echte Zahlungen brauchst du ein Backend, das Approval/Completion serverseitig macht.
          </div>
        </div>
      )}
    </div>
  );
}