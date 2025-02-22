'use client';

interface ColorOption {
  name: string;
  rgb: [number, number, number];
  className: string;
  shadowColor: string;
}

const colorOptions: ColorOption[] = [
  {
    name: 'Cyan',
    rgb: [0, 255, 255],
    className: 'bg-cyan-400',
    shadowColor: 'shadow-cyan-500/20'
  },
  {
    name: 'Orange',
    rgb: [255, 165, 0],
    className: 'bg-orange-400',
    shadowColor: 'shadow-orange-500/20'
  },
  {
    name: 'Red',
    rgb: [255, 0, 0],
    className: 'bg-red-500',
    shadowColor: 'shadow-red-600/20'
  },
  {
    name: 'Blue',
    rgb: [0, 0, 255],
    className: 'bg-blue-500',
    shadowColor: 'shadow-blue-600/20'
  },
  {
    name: 'Green',
    rgb: [0, 255, 0],
    className: 'bg-green-400',
    shadowColor: 'shadow-green-500/20'
  },
  {
    name: 'Purple',
    rgb: [128, 0, 128],
    className: 'bg-purple-500',
    shadowColor: 'shadow-purple-600/20'
  }
];

interface ColorPickerProps {
  onColorSelect: (color: [number, number, number]) => Promise<void>;
  onWhiteSelect: (type: 'warm' | 'cold') => Promise<void>;
  isLoading?: boolean;
}

export default function ColorPicker({ onColorSelect, onWhiteSelect, isLoading }: ColorPickerProps) {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={() => onWhiteSelect('warm')}
          disabled={isLoading}
          className="md-button relative h-8 rounded-lg bg-amber-100 dark:bg-amber-900/20 shadow-elevation-1 hover:shadow-elevation-2 transition-all duration-material group overflow-hidden"
          title="Warm White"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-amber-50/50 to-transparent dark:from-amber-500/10"></div>
          <span className="md-body-medium text-amber-900 dark:text-amber-100 relative z-10 group-hover:scale-105 transition-transform duration-material">
            Warm
          </span>
          {isLoading && (
            <div className="absolute inset-x-0 bottom-0 h-0.5">
              <div className="h-full bg-amber-200/50 dark:bg-amber-500/30 animate-loading"></div>
            </div>
          )}
        </button>
        <button
          onClick={() => onWhiteSelect('cold')}
          disabled={isLoading}
          className="md-button relative h-8 rounded-lg bg-blue-50 dark:bg-blue-900/20 shadow-elevation-1 hover:shadow-elevation-2 transition-all duration-material group overflow-hidden"
          title="Cold White"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-transparent dark:from-blue-500/10"></div>
          <span className="md-body-medium text-blue-900 dark:text-blue-100 relative z-10 group-hover:scale-105 transition-transform duration-material">
            Cold
          </span>
          {isLoading && (
            <div className="absolute inset-x-0 bottom-0 h-0.5">
              <div className="h-full bg-blue-200/50 dark:bg-blue-500/30 animate-loading"></div>
            </div>
          )}
        </button>
      </div>

      <div className="h-px bg-gray-200 dark:bg-gray-700/50"></div>

      <div className="grid grid-cols-3 gap-2">
        {colorOptions.map((color) => (
          <button
            key={color.name}
            onClick={() => onColorSelect(color.rgb)}
            disabled={isLoading}
            className={`
              md-button aspect-square rounded-lg ${color.className} ${color.shadowColor}
              shadow-elevation-1 hover:shadow-elevation-2 transition-all duration-material
              disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none
              relative overflow-hidden group
            `}
            title={color.name}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-material"></div>
            {isLoading && (
              <div className="absolute inset-x-0 bottom-0 h-0.5">
                <div className="h-full bg-white/30 animate-loading"></div>
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}