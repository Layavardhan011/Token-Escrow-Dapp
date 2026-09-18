interface ITableProps {
  header: Array<string>;
  rows: Array<JSX.Element[]>;
}

export const Table = ({ header, rows }: ITableProps) => {
  return (
    <div className="w-full overflow-x-auto rounded-xl border border-slate-800 bg-slate-900/60">
      <table className="w-full min-w-max table-auto text-left">
        <thead>
          <tr className="border-b border-slate-800 bg-slate-800/60">
            {header.map((head, idx) => (
              <th
                key={idx}
                className="py-3 px-4 text-[11px] font-bold uppercase tracking-wider text-slate-400"
              >
                {head}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800/60">
          {rows.map((row, rowIdx) => (
            <tr
              key={rowIdx}
              className="hover:bg-slate-800/30 transition-colors duration-150"
            >
              {row.map((element, cellIdx) => (
                <td key={cellIdx} className="py-3.5 px-4 text-xs text-slate-200">
                  {element}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
