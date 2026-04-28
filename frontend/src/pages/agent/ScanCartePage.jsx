/**
 * BOMBA CASH — ScanCartePage.jsx
 * Page : /agent/scan
 * Auteur : Johann Finance SA © 2026
 * Stack  : React + Tailwind CSS + html5-qrcode + SweetAlert2 + Axios (Sanctum)
 *
 * ⚠️  NE PAS envelopper avec <AgentLayout> — déjà géré par App.jsx via Outlet
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Html5Qrcode } from 'html5-qrcode';
import Swal from 'sweetalert2';
import axios from '../../lib/axios';
// ❌ SUPPRIMER : import AgentLayout from '../../layouts/AgentLayout';

/* ─── Constantes ──────────────────────────────────────────────── */
const SCANNER_ELEMENT_ID = 'bc-qrcode-region';
const QR_CONFIG = {
    fps: 12,
    qrbox: (vw, vh) => {
        const side = Math.min(vw, vh) * 0.72;
        return { width: Math.round(side), height: Math.round(side) };
    },
    aspectRatio: 1.0,
    experimentalFeatures: { useBarCodeDetectorIfSupported: true },
};

/* ─── Icônes SVG inline ─────────────── */
const Icon = {
    scan: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-6 h-6">
            <path d="M3 7V5a2 2 0 0 1 2-2h2M17 3h2a2 2 0 0 1 2 2v2M21 17v2a2 2 0 0 1-2 2h-2M7 21H5a2 2 0 0 1-2-2v-2" strokeLinecap="round" />
            <line x1="7" y1="12" x2="17" y2="12" strokeLinecap="round" />
        </svg>
    ),
    flip: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
            <path d="M1 4v6h6" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M23 20v-6h-6" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4-4.64 4.36A9 9 0 0 1 3.51 15" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    ),
    torch: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
            <path d="M8.25 7.5V6.108c0-1.135.845-2.098 1.976-2.192.373-.03.748-.057 1.123-.08M15.75 18H18a2.25 2.25 0 0 0 2.25-2.25V9.456c0-1.081-.768-2.015-1.837-2.175a48.055 48.055 0 0 0-1.913-.247M15.75 18V7.5H8.25V18M15.75 18l.75 3H7.5l.75-3M8.25 7.5V6.108c0-1.135-.845-2.098-1.976-2.192A48.424 48.424 0 0 0 6.25 3.75" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    ),
    keyboard: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
            <rect x="2" y="6" width="20" height="12" rx="2" ry="2" />
            <path d="M6 10h.01M10 10h.01M14 10h.01M18 10h.01M8 14h8" strokeLinecap="round" />
        </svg>
    ),
    user: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-6 h-6">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="12" cy="7" r="4" />
        </svg>
    ),
    card: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
            <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
            <line x1="1" y1="10" x2="23" y2="10" />
        </svg>
    ),
    wallet: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
            <path d="M20 7H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z" />
            <path d="M16 3H8a2 2 0 0 0-2 2v2h12V5a2 2 0 0 0-2-2z" />
            <circle cx="16" cy="14" r="1" fill="currentColor" />
        </svg>
    ),
    check: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-4 h-4">
            <polyline points="20 6 9 17 4 12" />
        </svg>
    ),
    alert: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-6 h-6">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
    ),
    refresh: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
            <polyline points="23 4 23 10 17 10" />
            <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    ),
    ops: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="16" />
            <line x1="8" y1="12" x2="16" y2="12" />
        </svg>
    ),
    arrow: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
            <line x1="5" y1="12" x2="19" y2="12" />
            <polyline points="12 5 19 12 12 19" />
        </svg>
    ),
};

/* ─── Helpers ──────────────────────────────────────────────────── */
const fmt = (n) =>
    new Intl.NumberFormat('fr-FR', { minimumFractionDigits: 0 }).format(n ?? 0);

const statutConfig = {
    active: { label: 'Active', bg: 'bg-emerald-100', text: 'text-emerald-700', dot: 'bg-emerald-500' },
    inactive: { label: 'Inactive', bg: 'bg-gray-100', text: 'text-gray-500', dot: 'bg-gray-400' },
    bloquée: { label: 'Bloquée', bg: 'bg-red-100', text: 'text-red-600', dot: 'bg-red-500' },
    expirée: { label: 'Expirée', bg: 'bg-amber-100', text: 'text-amber-700', dot: 'bg-amber-500' },
};

const ProgressBar = ({ value }) => (
    <div className="w-full bg-orange-100 rounded-full h-2.5 overflow-hidden">
        <div
            className="h-2.5 rounded-full bg-gradient-to-r from-orange-400 to-orange-600 transition-all duration-700"
            style={{ width: `${Math.min(value ?? 0, 100)}%` }}
        />
    </div>
);

/* ─────────────────────────────────────────────────────────────── */
/*  COMPOSANT PRINCIPAL                                            */
/* ─────────────────────────────────────────────────────────────── */
export default function ScanCartePage() {
    const navigate = useNavigate();

    /* états machine */
    const [phase, setPhase] = useState('idle');
    const [cameras, setCameras] = useState([]);
    const [camIndex, setCamIndex] = useState(0);
    const [useFront, setUseFront] = useState(false);
    const [torchOn, setTorchOn] = useState(false);
    const [torchSupported, setTorchSupported] = useState(false);

    /* résultats */
    const [scanData, setScanData] = useState(null);
    const [errMsg, setErrMsg] = useState('');

    /* saisie manuelle */
    const [showManual, setShowManual] = useState(false);
    const [manualVal, setManualVal] = useState('');
    const [manualLoading, setManualLoading] = useState(false);

    /* refs */
    const html5QrRef = useRef(null);
    const processingRef = useRef(false);
    const trackRef = useRef(null);

    /* ─── Nettoyage ──────────────────────────────────────────────── */
    const stopScanner = useCallback(async () => {
        if (html5QrRef.current) {
            try {
                await html5QrRef.current.stop();
                html5QrRef.current.clear();
            } catch (_) { }
            html5QrRef.current = null;
        }
        trackRef.current = null;
    }, []);

    useEffect(() => {
        return () => { stopScanner(); };
    }, [stopScanner]);

    /* ─── Appel API scan ─────────────────────────────────────────── */
    const callScanAPI = useCallback(async (numeroCarte) => {
        setPhase('loading');
        try {
            const { data } = await axios.post('/api/agent/scan', { numero_carte: numeroCarte });
            await stopScanner();
            setScanData(data);
            setPhase('result');
        } catch (err) {
            await stopScanner();
            const msg =
                err?.response?.status === 404
                    ? 'Carte introuvable dans le système.'
                    : err?.response?.data?.message ?? 'Erreur lors de la vérification.';
            setErrMsg(msg);
            setPhase('error');
        }
    }, [stopScanner]);

    /* ─── Callback QR détecté ───────────────────────────────────── */
    const onQrSuccess = useCallback((decodedText) => {
        if (processingRef.current) return;
        processingRef.current = true;
        if (navigator.vibrate) navigator.vibrate([80, 30, 80]);
        callScanAPI(decodedText.trim());
    }, [callScanAPI]);

    /* ─── Démarrer le scanner ────────────────────────────────────── */
    const startScanner = useCallback(async (facingMode = 'environment') => {
        setPhase('scanning');
        setErrMsg('');
        setScanData(null);
        processingRef.current = false;
        await new Promise(r => setTimeout(r, 80));

        try {
            const camList = await Html5Qrcode.getCameras();
            if (camList?.length) setCameras(camList);

            const scanner = new Html5Qrcode(SCANNER_ELEMENT_ID, { verbose: false });
            html5QrRef.current = scanner;

            const constraint = camList?.length > 1
                ? { facingMode }
                : (camList?.[0]?.id ? { deviceId: { exact: camList[0].id } } : { facingMode });

            await scanner.start(constraint, QR_CONFIG, onQrSuccess, () => { });

            try {
                const videoElem = document.querySelector(`#${SCANNER_ELEMENT_ID} video`);
                if (videoElem?.srcObject) {
                    const [t] = videoElem.srcObject.getVideoTracks();
                    if (t) {
                        trackRef.current = t;
                        const caps = t.getCapabilities?.();
                        setTorchSupported(!!(caps?.torch));
                    }
                }
            } catch (_) { }

        } catch (err) {
            setPhase('idle');
            const msg =
                err?.message?.includes('Permission')
                    ? 'Accès caméra refusé. Autorisez la caméra dans les paramètres.'
                    : err?.message?.includes('No camera')
                        ? 'Aucune caméra détectée sur cet appareil.'
                        : `Impossible de démarrer la caméra : ${err.message}`;

            Swal.fire({
                icon: 'error',
                title: 'Caméra indisponible',
                text: msg,
                confirmButtonColor: '#f97316',
                background: '#fff',
            });
        }
    }, [onQrSuccess]);

    /* ─── Changer de caméra ──────────────────────────────────────── */
    const flipCamera = useCallback(async () => {
        const next = !useFront;
        setUseFront(next);
        await stopScanner();
        setTorchOn(false);
        await startScanner(next ? 'user' : 'environment');
    }, [useFront, stopScanner, startScanner]);

    /* ─── Toggle Torch ───────────────────────────────────────────── */
    const toggleTorch = useCallback(async () => {
        if (!trackRef.current) return;
        const next = !torchOn;
        try {
            await trackRef.current.applyConstraints({ advanced: [{ torch: next }] });
            setTorchOn(next);
        } catch (_) { }
    }, [torchOn]);

    /* ─── Saisie manuelle ────────────────────────────────────────── */
    const handleManualSubmit = async (e) => {
        e.preventDefault();
        if (!manualVal.trim()) return;
        setManualLoading(true);
        setShowManual(false);
        await stopScanner();
        await callScanAPI(manualVal.trim());
        setManualLoading(false);
        setManualVal('');
    };

    /* ─── Reset ──────────────────────────────────────────────────── */
    const resetScan = useCallback(async () => {
        await stopScanner();
        processingRef.current = false;
        setScanData(null);
        setErrMsg('');
        setTorchOn(false);
        setPhase('idle');
        setShowManual(false);
    }, [stopScanner]);

    /* ─────────────────────────────────────────────────────────────── */
    /*  RENDER                                                         */
    /* ─────────────────────────────────────────────────────────────── */

    const { carte, client, compte } = scanData ?? {};
    const statut = carte?.statut?.toLowerCase() ?? 'inactive';
    const statutCfg = statutConfig[statut] ?? statutConfig.inactive;

    return (
        // ❌ SUPPRIMER : <AgentLayout>
        <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50 px-4 py-6 md:px-8">

            {/* ── En-tête ───────────────────────────────────────────── */}
            <div className="flex items-center gap-3 mb-6">
                <button
                    onClick={() => navigate('/agent/dashboard')}
                    className="p-2 rounded-xl bg-white border border-orange-100 shadow-sm hover:bg-orange-50 transition-colors"
                >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5 text-orange-500">
                        <polyline points="15 18 9 12 15 6" />
                    </svg>
                </button>
                <div>
                    <h1 className="text-xl font-bold text-gray-800 leading-tight">Scanner une carte</h1>
                    <p className="text-xs text-gray-400">Pointez le QR code de la carte client</p>
                </div>
            </div>

            {/* ════════════════════════════════════════════════════════ */}
            {/* PHASE : IDLE                                            */}
            {/* ════════════════════════════════════════════════════════ */}
            {phase === 'idle' && (
                <div className="flex flex-col items-center gap-6 pt-8">
                    <div className="relative w-48 h-48">
                        <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-orange-400 to-orange-600 opacity-10 animate-pulse" />
                        <div className="absolute inset-4 rounded-2xl border-4 border-orange-300 border-dashed" />
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="text-orange-500">
                                <svg viewBox="0 0 80 80" className="w-24 h-24" fill="none">
                                    <path d="M10 25 L10 10 L25 10" stroke="#f97316" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
                                    <path d="M55 10 L70 10 L70 25" stroke="#f97316" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
                                    <path d="M70 55 L70 70 L55 70" stroke="#f97316" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
                                    <path d="M25 70 L10 70 L10 55" stroke="#f97316" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
                                    <rect x="28" y="28" width="10" height="10" rx="2" fill="#fdba74" />
                                    <rect x="42" y="28" width="10" height="10" rx="2" fill="#fdba74" />
                                    <rect x="28" y="42" width="10" height="10" rx="2" fill="#fdba74" />
                                    <rect x="44" y="44" width="6" height="6" rx="1" fill="#f97316" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    <div className="text-center">
                        <p className="text-gray-700 font-medium text-base">Prêt à scanner</p>
                        <p className="text-gray-400 text-sm mt-1">Appuyez sur le bouton pour activer la caméra</p>
                    </div>

                    <button
                        onClick={() => startScanner('environment')}
                        className="flex items-center gap-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold text-base px-8 py-4 rounded-2xl shadow-lg shadow-orange-200 active:scale-95 transition-all hover:shadow-orange-300"
                    >
                        {Icon.scan}
                        Démarrer le scan
                    </button>

                    <button
                        onClick={() => setShowManual(true)}
                        className="flex items-center gap-2 text-orange-500 font-medium text-sm border border-orange-200 px-5 py-2.5 rounded-xl bg-white hover:bg-orange-50 transition-colors"
                    >
                        {Icon.keyboard}
                        Saisir le numéro manuellement
                    </button>
                </div>
            )}

            {/* ════════════════════════════════════════════════════════ */}
            {/* PHASE : SCANNING                                        */}
            {/* ════════════════════════════════════════════════════════ */}
            {phase === 'scanning' && (
                <div className="flex flex-col gap-4">
                    <div className="relative rounded-3xl overflow-hidden bg-black shadow-xl">
                        <div id={SCANNER_ELEMENT_ID} className="w-full" style={{ minHeight: 'min(72vw, 360px)' }} />
                        <div className="absolute inset-0 pointer-events-none">
                            <span className="absolute top-6 left-6 w-8 h-8 border-t-4 border-l-4 border-orange-400 rounded-tl-lg" />
                            <span className="absolute top-6 right-6 w-8 h-8 border-t-4 border-r-4 border-orange-400 rounded-tr-lg" />
                            <span className="absolute bottom-6 left-6 w-8 h-8 border-b-4 border-l-4 border-orange-400 rounded-bl-lg" />
                            <span className="absolute bottom-6 right-6 w-8 h-8 border-b-4 border-r-4 border-orange-400 rounded-br-lg" />
                            <div className="absolute left-8 right-8 top-1/2 -translate-y-1/2 overflow-hidden" style={{ height: '2px' }}>
                                <div className="w-full h-full bg-gradient-to-r from-transparent via-orange-400 to-transparent" style={{ animation: 'scanLine 2s ease-in-out infinite' }} />
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-between items-center px-2">
                        {cameras.length > 1 && (
                            <button onClick={flipCamera} className="flex items-center gap-2 bg-white border border-orange-200 text-orange-600 text-sm font-medium px-4 py-2.5 rounded-xl shadow-sm hover:bg-orange-50 active:scale-95 transition-all">
                                {Icon.flip}
                                {useFront ? 'Caméra arrière' : 'Caméra avant'}
                            </button>
                        )}
                        {torchSupported && (
                            <button onClick={toggleTorch} className={`flex items-center gap-2 text-sm font-medium px-4 py-2.5 rounded-xl border shadow-sm active:scale-95 transition-all ${torchOn ? 'bg-orange-500 text-white border-orange-500' : 'bg-white border-orange-200 text-orange-600 hover:bg-orange-50'}`}>
                                {Icon.torch}
                                Flash
                            </button>
                        )}
                        <button onClick={resetScan} className="flex items-center gap-2 bg-gray-100 text-gray-600 text-sm font-medium px-4 py-2.5 rounded-xl hover:bg-gray-200 active:scale-95 transition-all">✕ Annuler</button>
                    </div>

                    <p className="text-center text-gray-400 text-xs">Alignez le QR code de la carte BOMBA CASH dans le cadre</p>
                    <button onClick={() => setShowManual(true)} className="text-center text-orange-500 text-sm underline underline-offset-2">Saisir le numéro manuellement</button>
                </div>
            )}

            {/* ════════════════════════════════════════════════════════ */}
            {/* PHASE : LOADING                                         */}
            {/* ════════════════════════════════════════════════════════ */}
            {phase === 'loading' && (
                <div className="flex flex-col items-center gap-5 pt-16">
                    <div className="relative w-20 h-20">
                        <div className="absolute inset-0 rounded-full border-4 border-orange-100" />
                        <div className="absolute inset-0 rounded-full border-4 border-orange-500 border-t-transparent animate-spin" />
                        <div className="absolute inset-0 flex items-center justify-center text-orange-400">{Icon.card}</div>
                    </div>
                    <p className="text-gray-600 font-medium">Vérification de la carte…</p>
                    <p className="text-gray-400 text-sm">Connexion au serveur en cours</p>
                </div>
            )}

            {/* ════════════════════════════════════════════════════════ */}
            {/* PHASE : ERROR                                           */}
            {/* ════════════════════════════════════════════════════════ */}
            {phase === 'error' && (
                <div className="flex flex-col items-center gap-5 pt-12">
                    <div className="w-20 h-20 rounded-full bg-red-50 border-2 border-red-200 flex items-center justify-center text-red-500">{Icon.alert}</div>
                    <div className="text-center">
                        <p className="text-gray-800 font-bold text-lg">Scan échoué</p>
                        <p className="text-gray-500 text-sm mt-1 max-w-xs">{errMsg}</p>
                    </div>
                    <button onClick={resetScan} className="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold px-7 py-3.5 rounded-2xl shadow-lg shadow-orange-200 active:scale-95 transition-all">{Icon.refresh} Réessayer</button>
                    <button onClick={() => setShowManual(true)} className="text-orange-500 text-sm underline underline-offset-2">Saisir manuellement</button>
                </div>
            )}

            {/* ════════════════════════════════════════════════════════ */}
            {/* PHASE : RESULT                                          */}
            {/* ════════════════════════════════════════════════════════ */}
            {phase === 'result' && carte && client && (
                <div className="flex flex-col gap-4 animate-fadeIn">
                    <div className="flex items-center gap-2.5 bg-emerald-50 border border-emerald-200 rounded-2xl px-4 py-3">
                        <span className="w-7 h-7 rounded-full bg-emerald-500 flex items-center justify-center text-white flex-shrink-0">{Icon.check}</span>
                        <p className="text-emerald-700 font-semibold text-sm">Carte détectée avec succès</p>
                    </div>

                    <div className="bg-white rounded-3xl border border-orange-100 shadow-sm overflow-hidden">
                        <div className="bg-gradient-to-r from-orange-500 to-orange-600 px-5 py-5">
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center flex-shrink-0">
                                    <span className="text-white font-bold text-xl">{(client.prenom?.[0] ?? '') + (client.nom?.[0] ?? '')}</span>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-white font-bold text-lg leading-tight truncate">{client.prenom} {client.nom}</p>
                                    <p className="text-orange-100 text-sm">{client.telephone}</p>
                                    <p className="text-orange-200 text-xs mt-0.5 truncate">{client.ville}</p>
                                </div>
                                <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${statutCfg.bg} ${statutCfg.text}`}>
                                    <span className={`w-2 h-2 rounded-full ${statutCfg.dot}`} />
                                    {statutCfg.label}
                                </div>
                            </div>
                        </div>

                        <div className="px-5 py-5 space-y-4">
                            <div className="flex items-center gap-3 bg-orange-50 rounded-xl px-4 py-3">
                                <span className="text-orange-400">{Icon.card}</span>
                                <div>
                                    <p className="text-gray-400 text-xs">Numéro de carte</p>
                                    <p className="text-gray-800 font-mono font-semibold text-sm tracking-wider">{carte.numero_carte?.replace(/(.{4})/g, '$1 ').trim()}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 bg-orange-50 rounded-xl px-4 py-3">
                                <span className="text-orange-400">{Icon.wallet}</span>
                                <div className="flex-1">
                                    <p className="text-gray-400 text-xs">Solde disponible</p>
                                    <p className="text-orange-600 font-extrabold text-xl">{fmt(compte?.solde_total)} <span className="text-sm font-semibold">FCFA</span></p>
                                </div>
                            </div>

                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <p className="text-gray-600 text-sm font-medium">Progression épargne</p>
                                    <span className="text-orange-600 font-bold text-sm">{carte.progression ?? 0}%</span>
                                </div>
                                <ProgressBar value={carte.progression} />
                            </div>

                            <div className="grid grid-cols-3 gap-2 pt-1">
                                {[
                                    { label: 'Dépôts', value: fmt(compte?.total_depots), color: 'text-emerald-600' },
                                    { label: 'Retraits', value: fmt(compte?.total_retraits), color: 'text-red-500' },
                                    { label: 'Pénalités', value: fmt(compte?.total_penalites), color: 'text-amber-600' },
                                ].map((s) => (
                                    <div key={s.label} className="bg-gray-50 rounded-xl px-3 py-2.5 text-center">
                                        <p className="text-gray-400 text-xs">{s.label}</p>
                                        <p className={`font-bold text-sm ${s.color}`}>{s.value}</p>
                                    </div>
                                ))}
                            </div>

                            <div className="flex gap-3">
                                {carte.date_activation && (
                                    <div className="flex-1 bg-gray-50 rounded-xl px-3 py-2">
                                        <p className="text-gray-400 text-xs">Activation</p>
                                        <p className="text-gray-700 text-xs font-semibold">{new Date(carte.date_activation).toLocaleDateString('fr-FR')}</p>
                                    </div>
                                )}
                                {carte.date_expiration && (
                                    <div className="flex-1 bg-gray-50 rounded-xl px-3 py-2">
                                        <p className="text-gray-400 text-xs">Expiration</p>
                                        <p className={`text-xs font-semibold ${new Date(carte.date_expiration) < new Date() ? 'text-red-500' : 'text-gray-700'}`}>{new Date(carte.date_expiration).toLocaleDateString('fr-FR')}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <button
                            onClick={() => navigate(`/agent/clients/${client.id_client}/operation`)}
                            disabled={statut !== 'active'}
                            className={`flex flex-col items-center gap-2 py-4 rounded-2xl font-bold text-sm transition-all active:scale-95 ${statut === 'active' ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-200 hover:shadow-orange-300' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
                        >
                            {Icon.ops}
                            Ajouter opération
                            {statut !== 'active' && <span className="text-xs font-normal opacity-70">Carte {statut}</span>}
                        </button>

                        <button onClick={() => navigate(`/agent/clients/${client.id_client}`)} className="flex flex-col items-center gap-2 py-4 rounded-2xl bg-white border-2 border-orange-200 text-orange-600 font-bold text-sm hover:bg-orange-50 transition-all active:scale-95">
                            {Icon.user}
                            Voir profil
                            <span className="text-xs font-normal text-gray-400">Détails complets</span>
                        </button>
                    </div>

                    <button onClick={resetScan} className="flex items-center justify-center gap-2 text-gray-500 text-sm py-3 rounded-2xl bg-gray-50 hover:bg-gray-100 transition-colors active:scale-95">{Icon.refresh} Scanner une autre carte</button>
                </div>
            )}

            {/* ════════════════════════════════════════════════════════ */}
            {/* OVERLAY : SAISIE MANUELLE                              */}
            {/* ════════════════════════════════════════════════════════ */}
            {showManual && (
                <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowManual(false)} />
                    <div className="relative bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl z-10 animate-slideUp">
                        <div className="w-12 h-1.5 rounded-full bg-gray-200 mx-auto mb-6 sm:hidden" />
                        <h3 className="text-gray-800 font-bold text-lg mb-1">Saisie manuelle</h3>
                        <p className="text-gray-400 text-sm mb-5">Entrez le numéro imprimé sur la carte</p>
                        <form onSubmit={handleManualSubmit} className="flex flex-col gap-4">
                            <input type="text" value={manualVal} onChange={e => setManualVal(e.target.value)} placeholder="Ex : BC-2024-0001" autoFocus className="w-full bg-orange-50 border-2 border-orange-200 rounded-xl px-4 py-3.5 text-gray-800 font-mono text-base placeholder-gray-300 focus:outline-none focus:border-orange-400 transition-colors" />
                            <div className="flex gap-3">
                                <button type="button" onClick={() => setShowManual(false)} className="flex-1 py-3.5 rounded-xl border border-gray-200 text-gray-600 font-medium hover:bg-gray-50 transition-colors">Annuler</button>
                                <button type="submit" disabled={!manualVal.trim() || manualLoading} className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl bg-orange-500 text-white font-bold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-orange-600 transition-colors">
                                    {manualLoading ? <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : Icon.arrow}
                                    Valider
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

        </div>
        // ❌ SUPPRIMER : </AgentLayout>
    );
}