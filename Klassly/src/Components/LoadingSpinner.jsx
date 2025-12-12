export default function LoadingSpinner({ fullScreen, size = "md" }) {
  const sizeClasses = {
    sm: { width: 20, border: 2 },
    small: { width: 20, border: 2 },
    md: { width: 32, border: 3 },
    medium: { width: 32, border: 3 },
    lg: { width: 48, border: 4 },
    large: { width: 48, border: 4 },
  }

  const { width, border } = sizeClasses[size] || sizeClasses.md

  const spinner = (
    <div
      style={{
        width,
        height: width,
        border: `${border}px solid var(--border)`,
        borderTopColor: "var(--primary)",
        borderRadius: "50%",
        animation: "spin 0.8s linear infinite",
      }}
    />
  )

  if (fullScreen) {
    return (
      <div
        style={{
          position: "fixed",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "var(--background)",
          zIndex: 50,
        }}
      >
        {spinner}
      </div>
    )
  }

  return spinner
}
