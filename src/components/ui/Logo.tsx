interface LogoProps {
  size?: number;
  className?: string;
}

export function Logo({ size = 72, className }: LogoProps) {
  return (
    <img
      src="/images/Logo_2.png"
      alt="Mythrix"
      width={size}
      height={size}
      className={`object-contain ${className ?? ""}`}
      style={{ borderRadius: "30%" }}
      draggable={false}
    />
  );
}
