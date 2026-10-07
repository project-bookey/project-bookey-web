/** Bookey 워드마크 — 앱과 같은 그림. 어두운 화면에는 밝은 판, 밝은 화면에는 남색 판. 원본은 3:1. */
export function Wordmark({ width = 96, className = '' }: { width?: number; className?: string }) {
  const height = Math.round(width / 3);
  return (
    <picture className={className}>
      <source srcSet="/brand/wordmark-on-dark.png" media="(prefers-color-scheme: dark)" />
      <img src="/brand/wordmark-on-light.png" alt="Bookey" width={width} height={height} style={{ width, height }} />
    </picture>
  );
}
