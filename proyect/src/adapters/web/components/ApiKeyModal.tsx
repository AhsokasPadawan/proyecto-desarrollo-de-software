import { useState } from 'react';
import { getStoredGeminiApiKey, setStoredGeminiApiKey } from '../../services/GeminiCoachService';
import { ModalDialog } from './ModalDialog';

export interface ApiKeyModalProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly onKeySaved?: () => void;
}

function ModalHeader({ onClose }: { readonly onClose: () => void }): JSX.Element {
  return (
    <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
      <div className="flex items-center gap-2">
        <span className="text-xl">✨</span>
        <h2 id="api-key-modal-title" className="text-base font-bold text-emerald-400">
          Configuración Gemini AI Coach
        </h2>
      </div>
      <button
        type="button"
        onClick={onClose}
        className="text-zinc-400 hover:text-zinc-200 text-lg px-2 rounded hover:bg-zinc-800"
        aria-label="Cerrar modal"
      >
        ✕
      </button>
    </div>
  );
}

function ModalDescription(): JSX.Element {
  return (
    <p className="text-xs text-zinc-300 leading-relaxed">
      Ingresa tu clave de <strong>Google Gemini API</strong> para recibir explicaciones
      didácticas de tus movimientos y consejos en tiempo real. También puedes definirla en tu{' '}
      <code className="text-emerald-300 bg-zinc-950 px-1 py-0.5 rounded">.env</code> como{' '}
      <code className="text-emerald-300 bg-zinc-950 px-1 py-0.5 rounded">VITE_GEMINI_API_KEY</code>.
    </p>
  );
}

function ApiKeyInputField({
  value,
  onChange,
}: {
  readonly value: string;
  readonly onChange: (value: string) => void;
}): JSX.Element {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor="gemini-api-key-input" className="text-xs font-semibold text-zinc-400">
        Gemini API Key:
      </label>
      <input
        id="gemini-api-key-input"
        type="password"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="AIzaSy..."
        className="w-full px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-700 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-emerald-500 font-mono"
      />
    </div>
  );
}

function SavedSuccessBanner(): JSX.Element {
  return (
    <div className="text-xs text-emerald-400 bg-emerald-950/60 border border-emerald-800 p-2 rounded text-center">
      Clave guardada correctamente.
    </div>
  );
}

function ModalFooterActions({
  onClear,
  onCancel,
  onSave,
}: {
  readonly onClear: () => void;
  readonly onCancel: () => void;
  readonly onSave: () => void;
}): JSX.Element {
  return (
    <div className="flex items-center justify-between pt-2">
      <button
        type="button"
        onClick={onClear}
        className="text-xs text-rose-400 hover:text-rose-300 hover:underline"
      >
        Eliminar clave
      </button>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-3 py-1.5 rounded-lg border border-zinc-700 bg-zinc-800 hover:bg-zinc-700 text-xs text-zinc-300"
        >
          Cancelar
        </button>
        <button
          type="button"
          onClick={onSave}
          className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-xs font-semibold text-white shadow-md shadow-emerald-900/40"
        >
          Guardar
        </button>
      </div>
    </div>
  );
}

export function ApiKeyModal({ isOpen, onClose, onKeySaved }: ApiKeyModalProps): JSX.Element | null {
  const [apiKeyInput, setApiKeyInput] = useState<string>(() => getStoredGeminiApiKey());
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  const handleSave = () => {
    setStoredGeminiApiKey(apiKeyInput);
    setSavedSuccess(true);
    onKeySaved?.();
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 600);
  };

  const handleClear = () => {
    setApiKeyInput('');
    setStoredGeminiApiKey('');
    onKeySaved?.();
  };

  return (
    <ModalDialog isOpen={isOpen} ariaLabelledBy="api-key-modal-title">
      <ModalHeader onClose={onClose} />
      <ModalDescription />
      <ApiKeyInputField value={apiKeyInput} onChange={setApiKeyInput} />
      {savedSuccess && <SavedSuccessBanner />}
      <ModalFooterActions onClear={handleClear} onCancel={onClose} onSave={handleSave} />
    </ModalDialog>
  );
}
