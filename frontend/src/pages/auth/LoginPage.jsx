import { useState }    from "react";
import { useNavigate } from "react-router-dom";
import PasswordField   from "../../components/ui/PasswordField";
import Toast           from "../../components/ui/Toast";
import SanctumFlow     from "../../components/ui/SanctumFlow";
import { IconUser }    from "../../components/ui/icons";
import { getCsrfCookie, loginRequest } from "../../services/auth";

export default function LoginPage() {
  const navigate = useNavigate();

  const [name,        setName]        = useState("");
  const [password,    setPassword]    = useState("");
  const [isLoading,   setIsLoading]   = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [flowStep,    setFlowStep]    = useState(0);
  const [toast,       setToast]       = useState({ msg: "", type: "" });

  const showToast  = (msg, type) => {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: "", type: "" }), 3500);
  };
  const fieldError = (f) => fieldErrors[f]?.[0] ?? "";

  const handleLogin = async (e) => {
    e.preventDefault();
    setFieldErrors({});

    if (!name.trim() || !password.trim()) {
      showToast("Veuillez remplir tous les champs", "error");
      return;
    }

    setIsLoading(true);
    setFlowStep(1);

    try {
      // Étape 1 — Cookie CSRF
      await getCsrfCookie();
      setFlowStep(2);

      // Étape 2 — POST /login → retourne { message, user }
      const { data } = await loginRequest({ name: name.trim(), password });
      setFlowStep(3);

      const user = data.user;

      if (user.statut === "inactif") {
        showToast("Compte désactivé. Contactez l'administrateur.", "error");
        setFlowStep(0);
        return;
      }

      showToast(`Bienvenue ${user.name} !`, "success");
      setTimeout(() => navigate(user.role === "admin" ? "/admin" : "/dashboard"), 900);

    } catch (err) {
      setFlowStep(0);
      if (!err.response) {
        showToast("Serveur inaccessible. Laravel tourne sur :8000 ?", "error");
        return;
      }
      const { status, data } = err.response;
      if      (status === 422) { setFieldErrors(data.errors ?? {}); showToast(data.message ?? "Identifiants incorrects.", "error"); }
      else if (status === 401) showToast("Nom d'utilisateur ou mot de passe incorrect.", "error");
      else if (status === 403) showToast(data.message ?? "Compte désactivé.", "error");
      else if (status === 419) showToast("Session expirée. Rechargez la page (F5).", "error");
      else if (status === 429) showToast("Trop de tentatives. Patientez.", "error");
      else                     showToast(`Erreur serveur (${status}).`, "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @keyframes bc-spin { to { transform: rotate(360deg); } }
        .bc-spin { animation: bc-spin 1s linear infinite; }
        .bc-input:focus {
          outline: none;
          border-color: #F97316 !important;
          box-shadow: 0 0 0 3px rgba(249,115,22,0.25) !important;
        }
      `}</style>

      <div className="relative min-h-screen w-full overflow-hidden flex flex-col items-center justify-center font-sans bg-slate-50">

        <div className="absolute inset-0 z-0 pointer-events-none">
          <svg viewBox="0 0 1200 800" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice" className="w-full h-full block">
            <path d="M 0,600 L 800,100 L 1200,200 L 1200,800 L 0,800 Z" fill="#FF6600" />
            <path d="M 600,0 L 1200,100 L 1200,0 Z" fill="#FF8833" />
          </svg>
        </div>

        <div className="absolute top-7 left-8 z-10 w-[72px] h-[72px] bg-white rounded-2xl shadow-lg border border-gray-200 flex items-center justify-center">
          <span className="text-4xl">🐟</span>
        </div>

        <div className="absolute top-7 right-8 z-10 bg-white rounded-xl shadow-lg px-6 py-2.5 border border-gray-200">
          <span className="font-black text-xl">
            <span className="text-gray-900">BOMBA </span>
            <span className="text-green-600">CASH</span>
          </span>
        </div>

        <div className="relative z-10 w-full max-w-[860px] grid grid-cols-2 rounded-2xl overflow-hidden shadow-[0_30px_70px_rgba(0,0,0,0.28)] border-2 border-gray-300 mt-5">

          <div className="bg-gray-900 flex flex-col items-center justify-between min-h-[540px] p-8">
            <div className="w-full flex justify-start">
              <div className="flex items-center gap-2 bg-white rounded-lg pl-3 pr-4 h-10">
                <span className="text-lg">🐷</span>
                <span className="font-extrabold text-[13px] text-green-700">Johann Finance</span>
              </div>
            </div>
            <div className="flex-1 flex items-center justify-center py-5">
              <div className="w-[210px] h-[260px] bg-gradient-to-br from-[#1E3A5F] to-[#0C1929] rounded-xl flex items-center justify-center">
                <span className="text-[85px]">🧑‍💼</span>
              </div>
            </div>
            <div className="w-full text-center">
              <h2 className="text-white text-[19px] font-extrabold leading-snug tracking-widest uppercase m-0">
                LA FINANCE SOLIDAIRE<br />
                QUI VOUS FAIT GRANDIR
              </h2>
            </div>
          </div>

          <div className="bg-gray-200 px-9 py-10 flex flex-col justify-center">

            <div className="flex items-center justify-between mb-8">
              <h2 className="text-[22px] font-bold text-gray-900 m-0">Compte Agent</h2>
              <div className="w-[50px] h-[50px] bg-gray-900 rounded-full shadow-md flex items-center justify-center text-white">
                <IconUser />
              </div>
            </div>

            <form onSubmit={handleLogin} className="flex flex-col gap-[18px]">

              <div className="flex flex-col gap-2">
                <label htmlFor="name" className="text-[11px] font-bold text-gray-500 uppercase tracking-[0.08em]">
                  Nom d'utilisateur
                </label>
                <div className="relative">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 flex items-center pointer-events-none">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="8" r="4"/>
                      <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
                    </svg>
                  </div>
                  <input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={isLoading}
                    autoComplete="username"
                    placeholder="Entrez votre identifiant"
                    className={`bc-input w-full h-12 pl-[42px] pr-4 rounded-lg bg-white text-sm text-gray-900 transition-colors disabled:opacity-60 disabled:cursor-not-allowed border-[1.5px] ${fieldError("name") ? "border-red-500" : "border-[#CBD5E1]"}`}
                  />
                </div>
                {fieldError("name") && (
                  <p className="flex items-center gap-1 text-xs font-semibold text-red-600">
                    <span>⚠</span> {fieldError("name")}
                  </p>
                )}
              </div>

              <PasswordField
                id="password"
                label="mot de passe"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                error={fieldError("password")}
                autoComplete="current-password"
              />

              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-[50px] mt-2 bg-[#FFD700] hover:bg-[#FFCC00] hover:-translate-y-px active:translate-y-0 text-black font-bold text-[15px] tracking-[0.04em] rounded-lg shadow-md hover:shadow-xl transition-all duration-150 disabled:opacity-80 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="bc-spin shrink-0">
                      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
                    </svg>
                    connexion en cours…
                  </>
                ) : "connexion"}
              </button>

              <SanctumFlow currentStep={flowStep} />
            </form>
          </div>
        </div>

        <p className="relative z-10 mt-5 text-[13px] text-white font-medium drop-shadow-sm">
          Johann Finance SA © 2026
        </p>

        <div className="fixed bottom-5 right-5 z-[100] bg-white p-3.5 rounded-xl shadow-xl border border-gray-200 text-xs max-w-[220px]">
          <p className="font-bold text-[13px] text-gray-900 mb-2">🔑 Comptes de test</p>
          <div className="flex flex-col gap-1.5">
            <div className="bg-orange-50 px-2.5 py-1.5 rounded-md border border-orange-200">
              <span className="font-semibold text-orange-900">Admin : </span>
              <span className="font-mono text-orange-700">admin / admin123</span>
            </div>
            <div className="bg-blue-50 px-2.5 py-1.5 rounded-md border border-blue-200">
              <span className="font-semibold text-blue-900">Agent : </span>
              <span className="font-mono text-blue-700">agent / agent123</span>
            </div>
          </div>
        </div>

        <Toast msg={toast.msg} type={toast.type} />
      </div>
    </>
  );
}