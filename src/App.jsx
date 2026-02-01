import { useMemo, useState } from "react";

const isPiBrowser = () => typeof window !== "undefined" && !!window.Pi;

export default function App() {
  const inPi = useMemo(() => isPiBrowser(), []);
  const [authLoading, setAuthLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [authError, setAuthError] = useState("");

  const [payLoading, setPayLoading] = useState(false);
  const [payResult, setPayResult] = useState("");

  // 🔐 LOGIN (MIT payments-SCOPE)
  const login = async () => {
    setAuthError("");
    setAuthLoading(true);

    try {
      if (!window.Pi) throw new Error("Pi SDK not available (not in Pi Browser)");

      const scopes = ["username", "payments"];

      const authResult = await window.Pi.authenticate(scopes, (payment) => {
        console.log("🔁 Incomplete payment found:", payment);
        return payment;
      });

      const u = authResult?.user || authResult;
      setUser(u);

      console.log("✅ Auth success:", authResult);
    } catch (err) {
      console.error("❌ Login error:", err);
      setAuthError(err?.message || "Login failed");
    } finally {
      setAuthLoading(false);
    }
  };

  // 💳 SANDBOX PAYMENT (MIT BACKEND APPROVE + COMPLETE)
  const testPayment = async () => {
    setPayResult("");
    setPayLoading(true);

    try {
      if (!window.Pi) throw new Error("Pi SDK not available");
      if (!user) throw new Error("Not logged in");

      const paymentData = {
        amount: 1,
        memo: "GeoPi Sandbox Test Payment",
        metadata: { purpose: "sandbox-test" },
      };

      await window.Pi.createPayment(paymentData, {
        onReadyForServerApproval: async (paymentId) => {
          console.log("✅ READY FOR SERVER APPROVAL:", paymentId);
          setPayResult(`⏳ Approving on server… (paymentId: ${paymentId})`);

          const r = await fetch("/api/pi-approve", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ paymentId }),
          });

          const data = await r.json().catch(() => ({}));
          if (!r.ok) {
            console.error("❌ Server approve failed:", data);
            throw new Error(data?.error || "Server approve failed");
          }

          setPayResult("✅ Server approved. Waiting for completion…");
        },

        onReadyForServerCompletion: async (paymentId, txid) => {
          console.log("✅ READY FOR SERVER COMPLETION:", paymentId, txid);
          setPayResult(`⏳ Completing on server… (txid: ${txid || "n/a"})`);

          const r = await fetch("/api/pi-complete", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ paymentId, txid }),
          });

          const data = await r.json().catch(() => ({}));
          if (!r.ok) {
            console.error("❌ Server complete failed:", data);
            throw new Error(data?.error || "Server complete failed");
          }

          setPayResult(`✅ Payment completed! (txid: ${txid || "n/a"})`);
        },

        onCancel: (paymentId) => {
          console.log("⚠️ CANCELLED:", paymentId);
          setPayResult("⚠️ Payment cancelled by user");
        },

        onError: (error, payment) => {
          console.error("❌ PAYMENT ERROR:", error, payment);
          setPayResult(`❌ Payment error: ${error?.message || "unknown"}`);
        },
      });
    } catch (err) {
      console.error("❌ Payment failed:", err);
      setPayResult(`❌ ${err?.message || "Payment failed"}`);
    } finally {
      setPayLoading(false);
    }
  };

  return (
    <div style={{ padding: 24, fontFamily: "system-ui, Arial", maxWidth: 720, margin: "0 auto" }}>
      <h1>GeoPi</h1>

      {!inPi && (
        <div style={{ padding: 12, border: "1px solid #444", borderRadius: 8, marginBottom: 16 }}>
          <b>Du bist nicht im Pi Browser.</b>
          <div>Pi Login & Payments funktionieren nur im Pi Browser.</div>
        </div>
      )}

      {inPi && (
        <div style={{ padding: 12, border: "1px solid #444", borderRadius: 8, marginBottom: 16 }}>
          <div>Pi SDK: ✅ gefunden</div>
          <div>User: {user ? `✅ ${user.username || "logged in"}` : "❌ not logged in"}</div>
        </div>
      )}

      {inPi && !user && (
        <button onClick={login} disabled={authLoading} style={{ padding: "10px 14px" }}>
          {authLoading ? "Logging in…" : "Mit Pi anmelden"}
        </button>
      )}

      {authError && <div style={{ marginTop: 12, color: "tomato" }}>{authError}</div>}

      {inPi && user && (
        <div style={{ marginTop: 24 }}>
          <h2>Payments</h2>

          <button onClick={testPayment} disabled={payLoading} style={{ padding: "10px 14px" }}>
            {payLoading ? "Paying…" : "Sandbox Payment (1 Pi)"}
          </button>

          {payResult && <div style={{ marginTop: 12 }}>{payResult}</div>}

          <div style={{ marginTop: 10, opacity: 0.8, fontSize: 13 }}>
            Backend aktiv: Approve + Complete werden serverseitig aufgerufen.
          </div>
        </div>
      )}
    </div>
  );
}
