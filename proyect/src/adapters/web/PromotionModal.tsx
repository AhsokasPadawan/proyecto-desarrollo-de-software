import { Color, PieceType } from '../../core/pieces/types';
import { STANDARD_PIECE_SYMBOLS } from './pieceDisplay';
import { ModalDialog } from './components/ModalDialog';
import { PromotionOptionButton } from './components/PromotionOptionButton';

export interface PromotionModalProps {
  readonly color: Color;
  readonly isOpen: boolean;
  readonly onSelectPiece: (pieceType: PieceType) => void;
  readonly onCancel: () => void;
}

const PROMOTION_OPTIONS: readonly { readonly type: PieceType; readonly label: string }[] = [
  { type: 'QUEEN', label: 'Reina' },
  { type: 'ROOK', label: 'Torre' },
  { type: 'BISHOP', label: 'Alfil' },
  { type: 'KNIGHT', label: 'Caballo' },
];

export function PromotionModal({ color, isOpen, onSelectPiece, onCancel }: PromotionModalProps): JSX.Element | null {
  return (
    <ModalDialog
      isOpen={isOpen}
      testId="promotion-modal"
      ariaLabelledBy="promotion-modal-title"
      panelClassName="max-w-sm text-center"
    >
      <h3 id="promotion-modal-title" className="text-xl font-bold text-zinc-100 mb-2">
        Coronación de Peón
      </h3>
      <p className="text-sm text-zinc-400 mb-6">Selecciona la pieza a la que deseas promover:</p>

      <div className="grid grid-cols-2 gap-3 mb-4">
        {PROMOTION_OPTIONS.map((option) => {
          const symbol = STANDARD_PIECE_SYMBOLS[color]?.[option.type] ?? option.label[0];
          return (
            <PromotionOptionButton
              key={option.type}
              pieceType={option.type}
              label={option.label}
              symbol={symbol}
              onClick={onSelectPiece}
              testId={`promotion-option-${option.type.toLowerCase()}`}
            />
          );
        })}
      </div>

      <button
        type="button"
        onClick={onCancel}
        className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
      >
        Cancelar movimiento
      </button>
    </ModalDialog>
  );
}
