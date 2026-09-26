import React from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function Table({ className, children, ...props }: React.TableHTMLAttributes<HTMLTableElement>) {
  return (
    <div className="w-full overflow-x-auto">
      <table className={twMerge(clsx("w-full text-left text-sm text-slate-700", className))} {...props}>
        {children}
      </table>
    </div>
  );
}

export function TableHeader({ className, children, ...props }: React.HTMLAttributes<HTMLTableSectionElement>) {
  return (
    <thead className={twMerge(clsx("bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500 border-b border-slate-200", className))} {...props}>
      {children}
    </thead>
  );
}

export function TableBody({ className, children, ...props }: React.HTMLAttributes<HTMLTableSectionElement>) {
  return (
    <tbody className={twMerge(clsx("divide-y divide-slate-100", className))} {...props}>
      {children}
    </tbody>
  );
}

export function TableRow({ className, children, ...props }: React.HTMLAttributes<HTMLTableRowElement>) {
  return (
    <tr className={twMerge(clsx("hover:bg-slate-50/70 transition-colors", className))} {...props}>
      {children}
    </tr>
  );
}

export function TableHead({ className, children, ...props }: React.ThHTMLAttributes<HTMLTableCellElement>) {
  return (
    <th className={twMerge(clsx("px-5 py-3.5", className))} {...props}>
      {children}
    </th>
  );
}

export function TableCell({ className, children, ...props }: React.TdHTMLAttributes<HTMLTableCellElement>) {
  return (
    <td className={twMerge(clsx("px-5 py-4 align-middle", className))} {...props}>
      {children}
    </td>
  );
}
