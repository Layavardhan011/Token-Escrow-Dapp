import { PropsWithChildren, ReactNode } from "react";

interface ICardProps extends PropsWithChildren {
  title: string;
  subtitle?: string;
  className?: string;
  headerAction?: ReactNode;
}

export const Card = ({
  className = "",
  title,
  subtitle,
  children,
  headerAction,
}: ICardProps) => {
  return (
    <div
      className={`glass-panel rounded-2xl p-6 transition-all duration-300 shadow-xl ${className}`}
    >
      {(title || subtitle || headerAction) && (
        <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-800/80">
          <div>
            <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400 inline-block shadow-[0_0_8px_rgba(35,247,221,0.8)]"></span>
              {title}
            </h3>
            {subtitle && (
              <p className="text-xs text-slate-400 mt-0.5 font-normal">
                {subtitle}
              </p>
            )}
          </div>
          {headerAction && <div>{headerAction}</div>}
        </div>
      )}
      <div className="w-full">{children}</div>
    </div>
  );
};
