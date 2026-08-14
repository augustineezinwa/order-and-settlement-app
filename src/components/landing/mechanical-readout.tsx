"use client";

/**
 * Adding-machine digit-wheel readout: each numeral is a strip of 0-9 that
 * rolls to the current value on a CSS transform transition — no JS
 * animation library, just a translateY driven by the digit's value.
 * Non-numeral characters ($ , .) render statically between wheels.
 */
export function MechanicalReadout({
  value,
  className = "",
}: {
  value: string;
  className?: string;
}) {
  return (
    <span className={`inline-flex items-baseline ${className}`} aria-label={value} role="img">
      {value.split("").map((char, i) =>
        /\d/.test(char) ? (
          <DigitWheel key={i} digit={Number(char)} />
        ) : (
          <span key={i} aria-hidden="true" className="inline-block px-[0.02em]">
            {char}
          </span>
        ),
      )}
    </span>
  );
}

function DigitWheel({ digit }: { digit: number }) {
  return (
    <span
      aria-hidden="true"
      className="relative inline-block h-[1em] w-[0.62em] overflow-hidden align-baseline"
    >
      <span
        className="absolute inset-x-0 top-0 flex flex-col transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]"
        style={{ transform: `translateY(-${digit}em)` }}
      >
        {Array.from({ length: 10 }, (_, n) => (
          <span key={n} className="flex h-[1em] items-center justify-center leading-none">
            {n}
          </span>
        ))}
      </span>
    </span>
  );
}
