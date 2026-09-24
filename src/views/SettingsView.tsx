import React, { useState } from 'react';
import {
  Settings,
  Database,
  Copy,
  Check,
  ShieldCheck,
  Server,
  Code2,
  ExternalLink,
  Sparkles,
} from 'lucide-react';
import { SUPABASE_SCHEMA_SQL } from '../data/supabaseSchema';
import { db } from '../services/db';

interface SettingsViewProps {
  isSupabaseConnected: boolean;
  onRefreshStatus: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  isSupabaseConnected,
  onRefreshStatus,
}) => {
  const [copied, setCopied] = useState(false);
  const [supabaseUrl, setSupabaseUrl] = useState(
    localStorage.getItem('smart_diet_supabase_url') || ''
  );
  const [supabaseAnonKey, setSupabaseAnonKey] = useState(
    localStorage.getItem('smart_diet_supabase_anon_key') || ''
  );
  const [saveStatus, setSaveStatus] = useState<string | null>(null);
  const [adminCreds] = useState(() => db.getAdminCredentials());
  const [copiedCreds, setCopiedCreds] = useState(false);

  const handleCopyAdminCreds = () => {
    navigator.clipboard.writeText(`User Naam: ${adminCreds.username}\nPassword: ${adminCreds.password}`);
    setCopiedCreds(true);
    setTimeout(() => setCopiedCreds(false), 2000);
  };

  const handleCopySql = () => {
    navigator.clipboard.writeText(SUPABASE_SCHEMA_SQL);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleSaveSupabaseConfig = (e: React.FormEvent) => {
    e.preventDefault();
    if (supabaseUrl.trim() && supabaseAnonKey.trim()) {
      localStorage.setItem('smart_diet_supabase_url', supabaseUrl.trim());
      localStorage.setItem('smart_diet_supabase_anon_key', supabaseAnonKey.trim());
      setSaveStatus('Supabase configuration saved! Reloading DB client...');
    } else {
      localStorage.removeItem('smart_diet_supabase_url');
      localStorage.removeItem('smart_diet_supabase_anon_key');
      setSaveStatus('Reset to Guest / Local Database engine mode.');
    }
    setTimeout(() => {
      onRefreshStatus();
      setSaveStatus(null);
    }, 1200);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2">
            <Settings className="w-5 h-5 text-emerald-600" />
            <span>Database Settings & Supabase Schema</span>
          </h3>
          <p className="text-xs text-slate-500">
            Configure live Supabase PostgreSQL connection or review complete SQL DDL schema for college project viva
          </p>
        </div>

        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
          <span
            className={`w-2 h-2 rounded-full ${
              isSupabaseConnected ? 'bg-emerald-500' : 'bg-indigo-500'
            }`}
          />
          <span>{isSupabaseConnected ? 'Live Supabase Cloud' : 'Local Storage Engine'}</span>
        </div>
      </div>

      {/* Admin Credentials Quick Reference Card */}
      <div className="bg-gradient-to-r from-indigo-50/90 via-purple-50/80 to-indigo-50/90 rounded-2xl border border-indigo-200/80 p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-sm shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-extrabold text-slate-900 text-sm">
              Admin Dashboard Authentication (User Naam & Password)
            </h4>
            <p className="text-xs text-slate-600 mt-0.5">
              Access the Faculty & System Administration portal anytime with these credentials
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-xl border border-indigo-100 text-xs font-mono">
            <div>
              <span className="text-[10px] text-slate-400 block font-sans uppercase font-bold">User Naam</span>
              <span className="font-bold text-indigo-950">{adminCreds.username}</span>
            </div>
            <span className="text-slate-300">|</span>
            <div>
              <span className="text-[10px] text-slate-400 block font-sans uppercase font-bold">Password</span>
              <span className="font-bold text-indigo-950">{adminCreds.password}</span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleCopyAdminCreds}
            className="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shrink-0 shadow-xs"
          >
            {copiedCreds ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedCreds ? 'Copied' : 'Copy'}</span>
          </button>
        </div>
      </div>

      {/* Supabase Connection Setup Box */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 sm:p-6 space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
          <Database className="w-4 h-4 text-emerald-600" />
          <h4 className="font-bold text-slate-900 text-sm">Supabase PostgreSQL Configuration</h4>
        </div>

        <p className="text-xs text-slate-600 leading-relaxed">
          The app automatically works seamlessly right out of the box in <strong>Guest / Local Storage Engine</strong> mode.
          To bind your own live Supabase project for real-time cloud sync and PostgreSQL persistence, input your Project URL and Anon Public Key below.
        </p>

        {saveStatus && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-semibold text-emerald-800">
            {saveStatus}
          </div>
        )}

        <form onSubmit={handleSaveSupabaseConfig} className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Supabase Project URL
            </label>
            <input
              type="text"
              placeholder="https://xyzproject.supabase.co"
              value={supabaseUrl}
              onChange={(e) => setSupabaseUrl(e.target.value)}
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Supabase Anon Public Key
            </label>
            <input
              type="password"
              placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
              value={supabaseAnonKey}
              onChange={(e) => setSupabaseAnonKey(e.target.value)}
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
            />
          </div>

          <div className="pt-2 flex items-center gap-2">
            <button
              type="submit"
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors"
            >
              Save Credentials & Connect
            </button>
            <button
              type="button"
              onClick={() => {
                setSupabaseUrl('');
                setSupabaseAnonKey('');
                localStorage.removeItem('smart_diet_supabase_url');
                localStorage.removeItem('smart_diet_supabase_anon_key');
                setSaveStatus('Cleared custom Supabase keys. Using Local Demo mode.');
                setTimeout(() => onRefreshStatus(), 500);
              }}
              className="px-3 py-2 text-slate-500 hover:text-slate-800 text-xs font-semibold"
            >
              Use Offline Local Engine
            </button>
          </div>
        </form>
      </div>

      {/* SQL DDL & RLS Schema for Viva / Defense */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 shadow-md p-5 sm:p-6 text-white space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div>
            <h4 className="font-bold text-white text-sm flex items-center gap-2">
              <Code2 className="w-4 h-4 text-emerald-400" />
              PostgreSQL DDL & RLS Schema (College Project Viva)
            </h4>
            <p className="text-xs text-slate-400">
              Run this script directly in the Supabase SQL Editor to provision all tables and security policies
            </p>
          </div>

          <button
            onClick={handleCopySql}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold flex items-center gap-2 border border-slate-700 transition-colors self-start sm:self-auto"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Copied to Clipboard!' : 'Copy SQL Schema'}</span>
          </button>
        </div>

        <div className="bg-slate-950 rounded-xl p-4 overflow-x-auto max-h-96 text-xs font-mono text-emerald-300 leading-relaxed border border-slate-800/80">
          <pre>{SUPABASE_SCHEMA_SQL}</pre>
        </div>
      </div>
    </div>
  );
};
