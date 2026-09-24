import React, { useState } from 'react';
import {
  X,
  Smartphone,
  Download,
  QrCode,
  ExternalLink,
  Copy,
  Check,
  Sparkles,
  WifiOff,
  Zap,
  ShieldCheck,
  Layers,
} from 'lucide-react';
import { triggerFileDownload } from '../utils/reportExporter';
import appLogo from '../assets/images/smart_diet_logo_1790175111322.jpg';

interface AndroidInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
  canInstall?: boolean;
  isInstalled?: boolean;
  onPromptInstall?: () => Promise<boolean>;
}

export const AndroidInstallModal: React.FC<AndroidInstallModalProps> = ({
  isOpen,
  onClose,
  canInstall = false,
  isInstalled = false,
  onPromptInstall,
}) => {
  const [copied, setCopied] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);

  if (!isOpen) return null;

  const appUrl = typeof window !== 'undefined' ? window.location.href : 'https://ai.studio';
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&margin=8&data=${encodeURIComponent(appUrl)}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(appUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (e) {
      console.warn('Clipboard write failed:', e);
    }
  };

  const handleNativeInstall = async () => {
    if (!onPromptInstall) return;
    setIsInstalling(true);
    try {
      await onPromptInstall();
    } finally {
      setIsInstalling(false);
    }
  };

  const handleDownloadLauncher = () => {
    const launcherHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Smart Food & Diet Planner</title>
  <meta http-equiv="refresh" content="0; url=${appUrl}">
  <script>window.location.replace("${appUrl}");</script>
</head>
<body style="font-family:sans-serif; text-align:center; padding:40px; background:#059669; color:#fff;">
  <h2>Launching Smart Food & Diet Planner...</h2>
  <p><a href="${appUrl}" style="color:#fff; font-weight:bold;">Tap here if not redirected</a></p>
</body>
</html>`;
    const blob = new Blob([launcherHtml], { type: 'text/html;charset=utf-8;' });
    triggerFileDownload(blob, 'SmartDiet-Android-App.html');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-xs animate-in fade-in overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-xl w-full my-6 overflow-hidden text-slate-900 dark:text-white flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-emerald-600 to-teal-700 text-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white shadow-md flex items-center justify-center p-1 shrink-0 overflow-hidden">
              <img
                src={appLogo}
                alt="Smart Food & Diet Planner"
                className="w-full h-full object-contain"
                referrerPolicy="no-referrer"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base sm:text-lg">Download App on Android</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/25 text-white">
                  PWA / WebAPK
                </span>
              </div>
              <p className="text-xs text-emerald-100 mt-0.5">
                Install as a full native-feeling Android app with offline access
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-white/80 hover:text-white hover:bg-white/20 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 text-xs">
          {/* Main 1-Click Install Banner if available */}
          {canInstall && !isInstalled ? (
            <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 flex items-center justify-between gap-4">
              <div>
                <span className="font-bold text-emerald-900 dark:text-emerald-200 block text-sm">
                  Ready to Install on this Device
                </span>
                <p className="text-emerald-700 dark:text-emerald-400 text-[11px] mt-0.5">
                  Tap to add Smart Food & Diet Planner to your home screen immediately.
                </p>
              </div>
              <button
                onClick={handleNativeInstall}
                disabled={isInstalling}
                className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-md hover:shadow-lg transition-all shrink-0 flex items-center gap-1.5"
              >
                <Download className="w-4 h-4" />
                <span>{isInstalling ? 'Installing...' : 'Install Now'}</span>
              </button>
            </div>
          ) : isInstalled ? (
            <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 flex items-center gap-3">
              <Check className="w-5 h-5 text-emerald-600 shrink-0" />
              <div>
                <span className="font-bold text-emerald-900 dark:text-emerald-200 text-sm">
                  App Already Installed!
                </span>
                <p className="text-emerald-700 dark:text-emerald-400 text-[11px]">
                  You are currently running Smart Food & Diet Planner as a standalone app.
                </p>
              </div>
            </div>
          ) : null}

          {/* Quick Options Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Open in full tab (Crucial for iframe sandbox bypass) */}
            <a
              href={appUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-emerald-500 dark:hover:border-emerald-500 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/20 transition-all flex items-center gap-3 group"
            >
              <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 group-hover:bg-emerald-100 dark:group-hover:bg-emerald-900/40 text-slate-600 dark:text-slate-300 group-hover:text-emerald-600 flex items-center justify-center shrink-0 transition-colors">
                <ExternalLink className="w-4 h-4" />
              </div>
              <div>
                <span className="font-bold text-slate-800 dark:text-slate-200 block text-xs">
                  Open in Chrome Tab
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 block">
                  Enables Chrome's "Install App" button
                </span>
              </div>
            </a>

            {/* Download Web Launcher */}
            <button
              onClick={handleDownloadLauncher}
              className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-emerald-500 dark:hover:border-emerald-500 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/20 transition-all flex items-center gap-3 text-left group"
            >
              <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 group-hover:bg-emerald-100 dark:group-hover:bg-emerald-900/40 text-slate-600 dark:text-slate-300 group-hover:text-emerald-600 flex items-center justify-center shrink-0 transition-colors">
                <Download className="w-4 h-4" />
              </div>
              <div>
                <span className="font-bold text-slate-800 dark:text-slate-200 block text-xs">
                  Download App Launcher
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 block">
                  Quick launcher file for Android
                </span>
              </div>
            </button>
          </div>

          {/* QR Code Section for Desktop-to-Android */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center gap-4">
            <div className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-xs shrink-0">
              <img
                src={qrUrl}
                alt="Scan to open on Android"
                className="w-28 h-28 object-contain"
                loading="lazy"
              />
            </div>
            <div className="space-y-2 text-center sm:text-left">
              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold text-[10px]">
                <QrCode className="w-3 h-3" />
                <span>Scan with Android Camera</span>
              </div>
              <h4 className="font-bold text-slate-800 dark:text-white text-xs">
                Install on your Android Phone
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Point your phone camera or Google Lens at this code to open the planner directly on your device.
              </p>
              <button
                onClick={handleCopyLink}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-[11px] font-semibold text-slate-700 dark:text-slate-300 transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Link Copied to Clipboard!' : 'Copy Mobile Link'}</span>
              </button>
            </div>
          </div>

          {/* 3 Step Android Installation Instructions */}
          <div className="space-y-2.5">
            <h4 className="font-bold text-slate-800 dark:text-white flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-emerald-600" />
              <span>How to Install on Android in 30 Seconds</span>
            </h4>

            <div className="space-y-2">
              <div className="flex items-start gap-3 p-2.5 rounded-xl bg-slate-50/70 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800/80">
                <span className="w-5 h-5 rounded-full bg-emerald-600 text-white font-black text-[10px] flex items-center justify-center shrink-0">
                  1
                </span>
                <div>
                  <strong className="text-slate-800 dark:text-slate-200">Open in Google Chrome</strong>
                  <p className="text-slate-500 dark:text-slate-400 text-[11px]">
                    Open the link in Chrome or Samsung Internet on your Android smartphone.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-2.5 rounded-xl bg-slate-50/70 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800/80">
                <span className="w-5 h-5 rounded-full bg-emerald-600 text-white font-black text-[10px] flex items-center justify-center shrink-0">
                  2
                </span>
                <div>
                  <strong className="text-slate-800 dark:text-slate-200">Tap Menu (⋮) in Chrome</strong>
                  <p className="text-slate-500 dark:text-slate-400 text-[11px]">
                    Tap the 3 dots in the top-right corner of Chrome, then tap <strong>"Install app"</strong> or <strong>"Add to Home screen"</strong>.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-2.5 rounded-xl bg-slate-50/70 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800/80">
                <span className="w-5 h-5 rounded-full bg-emerald-600 text-white font-black text-[10px] flex items-center justify-center shrink-0">
                  3
                </span>
                <div>
                  <strong className="text-slate-800 dark:text-slate-200">Tap "Install"</strong>
                  <p className="text-slate-500 dark:text-slate-400 text-[11px]">
                    Android will create the official <strong>SmartDiet</strong> icon on your home screen and in your app drawer.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Android Feature Badges */}
          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-center">
            <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/30">
              <WifiOff className="w-4 h-4 text-emerald-600 mx-auto mb-1" />
              <span className="font-bold text-[10px] block text-slate-800 dark:text-slate-200">Offline Caching</span>
              <span className="text-[9px] text-slate-400">Works without data</span>
            </div>
            <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/30">
              <Zap className="w-4 h-4 text-amber-500 mx-auto mb-1" />
              <span className="font-bold text-[10px] block text-slate-800 dark:text-slate-200">Instant Launch</span>
              <span className="text-[9px] text-slate-400">No browser toolbar</span>
            </div>
            <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/30">
              <ShieldCheck className="w-4 h-4 text-indigo-500 mx-auto mb-1" />
              <span className="font-bold text-[10px] block text-slate-800 dark:text-slate-200">Zero Storage</span>
              <span className="text-[9px] text-slate-400">&lt; 3MB footprint</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 dark:bg-slate-950/70 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0">
          <span className="text-[11px] text-slate-500 dark:text-slate-400">
            Compatible with Android 8.0+ & all modern Chromium browsers
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-semibold transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
