"use client"

import * as React from "react"
import { GridFourIcon, CaretUpIcon, CaretDownIcon } from "@phosphor-icons/react"
import type { ColumnDef, SortingState } from "@tanstack/react-table"
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Table as UITable,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

type Appointment = {
  id: string
  patient: string
  doctor: string
  time: string
  type: string
  status: "Confirmed" | "Pending" | "Completed" | "Cancelled"
}

const tableData: Appointment[] = [
  {
    id: "APT-001",
    patient: "Jordan Lewis",
    doctor: "Dr. H. Carter",
    time: "09:30 AM",
    type: "Consultation",
    status: "Confirmed",
  },
  {
    id: "APT-002",
    patient: "Hana Putri",
    doctor: "Dr. M. Santoso",
    time: "10:00 AM",
    type: "Follow-up",
    status: "Pending",
  },
  {
    id: "APT-003",
    patient: "Liam Chen",
    doctor: "Dr. R. Nguyen",
    time: "01:15 PM",
    type: "Lab Review",
    status: "Completed",
  },
  {
    id: "APT-004",
    patient: "Aisyah Rahman",
    doctor: "Dr. N. Ibrahim",
    time: "03:45 PM",
    type: "Consultation",
    status: "Cancelled",
  },
  {
    id: "APT-005",
    patient: "Mateo Silva",
    doctor: "Dr. L. Ortega",
    time: "05:10 PM",
    type: "Follow-up",
    status: "Confirmed",
  },
]

const statusClass = (status: Appointment["status"]) => {
  switch (status) {
    case "Confirmed":
      return "bg-green-100 text-green-700"
    case "Pending":
      return "bg-yellow-100 text-yellow-700"
    case "Completed":
      return "bg-blue-100 text-blue-700"
    case "Cancelled":
      return "bg-red-100 text-red-700"
    default:
      return "bg-muted text-foreground"
  }
}

const columns: ColumnDef<Appointment>[] = [
  {
    accessorKey: "patient",
    header: "Patient",
  },
  {
    accessorKey: "doctor",
    header: "Doctor",
  },
  {
    accessorKey: "time",
    header: "Time",
  },
  {
    accessorKey: "type",
    header: "Type",
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const value = row.getValue("status") as Appointment["status"]
      return (
        <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-medium ${statusClass(value)}`}>
          {value}
        </span>
      )
    },
  },
]

const DataTable = () => {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [globalFilter, setGlobalFilter] = React.useState("")

  const table = useReactTable({
    data: tableData,
    columns,
    state: {
      sorting,
      globalFilter,
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  })

  return (
    <div className="space-y-4">
      <Input
        value={globalFilter}
        onChange={(event) => setGlobalFilter(event.target.value)}
        placeholder="Search patients..."
        className="max-w-sm"
      />

      <div className="rounded-2xl border border-accent/15 overflow-hidden">
        <UITable>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="hover:bg-transparent">
                {headerGroup.headers.map((header) => {
                  const sorted = header.column.getIsSorted()
                  return (
                    <TableHead key={header.id} className="px-4">
                      {header.isPlaceholder ? null : (
                        <button
                          onClick={() => header.column.toggleSorting(sorted === "asc")}
                          className="flex items-center gap-1 font-medium"
                        >
                          {flexRender(header.column.columnDef.header, header.getContext())}
                          {sorted === "asc" ? <CaretUpIcon size={14} weight="fill" /> : null}
                          {sorted === "desc" ? <CaretDownIcon size={14} weight="fill" /> : null}
                        </button>
                      )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="px-4 py-3">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="px-4 py-10 text-center">
                  No results found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </UITable>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm text-accent">{table.getFilteredRowModel().rows.length} result(s).</p>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
            Previous
          </Button>
          <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
            Next
          </Button>
        </div>
      </div>
    </div>
  )
}

const Table = ({ title }: { title: string }) => {
  return (
    <main className="border border-accent/15 min-h-screen p-4 rounded-2xl bg-white relative">
      <div className="flex items-center gap-x-2">
        <div className="w-5 h-5 bg-primary rounded-full flex items-center justify-center">
          <GridFourIcon size={10} className="text-white" weight="fill" />
        </div>
        <p className="font-medium tracking-tight">{title}</p>
      </div>
      <div className="mt-4">
        <DataTable />
      </div>
    </main>
  )
}

export default Table
