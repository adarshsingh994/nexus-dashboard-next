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
    shadowColor: 'shadow-cyan-500/50'
  },
  {
    name: 'Orange',
    rgb: [255, 165, 0],
    className: 'bg-orange-400',
    shadowColor: 'shadow-orange-500/50'
  },
  {
    name: 'Red',
    rgb: [255, 0, 0],
    className: 'bg-red-500',
    shadowColor: 'shadow-red-600/50'
  },
  {
    name: 'Blue',
    rgb: [0, 0, 255],
    className: 'bg-blue-500',
    shadowColor: 'shadow-blue-600/50'
  },
  {
    name: 'Green',
    rgb: [0, 255, 0],
    className: 'bg-green-400',
    shadowColor: 'shadow-green-500/50'
  },
  {
    name: 'Purple',
    rgb: [128, 0, 128],
    className: 'bg-purple-500',
    shadowColor: 'shadow-purple-600/50'
  }
];

interface ColorPickerProps {
  onColorSelect: (color: [number, number, number]) => Promise<void>;
  onWhiteSelect: (type: 'warm' | 'cold') => Promise<void>;
  isLoading?: boolean;
}

export default function ColorPicker({ onColorSelect, onWhiteSelect, isLoading }: ColorPickerProps) {
  return (
    <div className="space-y-1.5">
      <div className="grid grid-cols-2 gap-1.5">
        <button
          onClick={() => onWhiteSelect('warm')}
          disabled={isLoading}
          className={`
            h-7 rounded-lg bg-amber-100 shadow-lg shadow-amber-200/50
            hover:shadow-xl transition-shadow duration-200
            disabled:opacity-50 disabled:cursor-not-allowed
            relative overflow-hidden flex items-center justify-center w-full
          `}
          title="Warm White"
        >
          <span className="text-amber-900 text-xs font-medium">Warm</span>
          {isLoading && (
            <div className="absolute inset-0 bg-black/10">
              <div className="w-full h-0.5 bg-white/20">
                <div className="h-full bg-white/40 animate-[loading_1s_ease-in-out_infinite]" style={{ width: '100%' }}></div>
              </div>
            </div>
          )}
        </button>
        <button
          onClick={() => onWhiteSelect('cold')}
          disabled={isLoading}
          className={`
            h-7 rounded-lg bg-blue-50 shadow-lg shadow-blue-100/50
            hover:shadow-xl transition-shadow duration-200
            disabled:opacity-50 disabled:cursor-not-allowed
            relative overflow-hidden flex items-center justify-center w-full
          `}
          title="Cold White"
        >
          <span className="text-blue-900 text-xs font-medium">Cold</span>
          {isLoading && (
            <div className="absolute inset-0 bg-black/10">
              <div className="w-full h-0.5 bg-white/20">
                <div className="h-full bg-white/40 animate-[loading_1s_ease-in-out_infinite]" style={{ width: '100%' }}></div>
              </div>
            </div>
          )}
        </button>
      </div>
      <div className="h-px bg-gray-200 dark:bg-gray-700"></div>
      <div className="grid grid-cols-3 gap-1.5">
        {colorOptions.map((color) => (
          <button
            key={color.name}
            onClick={() => onColorSelect(color.rgb)}
            disabled={isLoading}
            className={`
              aspect-square rounded-lg ${color.className} ${color.shadowColor}
              shadow-lg hover:shadow-xl transition-shadow duration-200
              disabled:opacity-50 disabled:cursor-not-allowed
              relative overflow-hidden
            `}
            title={color.name}
          >
            {isLoading && (
              <div className="absolute inset-0 bg-black/10">
                <div className="w-full h-0.5 bg-white/20">
                  <div className="h-full bg-white/40 animate-[loading_1s_ease-in-out_infinite]" style={{ width: '100%' }}></div>
                </div>
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}