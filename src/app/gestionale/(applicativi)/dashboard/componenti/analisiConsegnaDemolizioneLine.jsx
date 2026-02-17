"use client"

import { CartesianGrid, Line, LineChart, XAxis } from "recharts"
import { useEffect, useMemo, useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

export const description = "A line chart"

const chartConfig = {
  demolizioni: {
    label: "Demolizioni",
    color: "#333333",
  },
  ritiri: {
    label: "Ritiri",
    color: "#95c11f",
  },
}

export function AnalisiConsegnaDemolizioneLine({ dataA, setCaricamentoDati  }) {

  const [chartRows, setChartRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [totaleDemolizioni, setTotaleDemolizioni] = useState(0)
  const [totaleRitiri, setTotaleRitiri] = useState(0)

  // dataA = { mese:"02", anno:"2026" }
  const { from, to } = useMemo(() => {
    const anno = dataA?.anno || ""
    const mese = dataA?.mese || ""

    if (!anno || !mese) return { from: "", to: "" }

    // ultimo giorno del mese (in modo corretto)
    const lastDay = new Date(Number(anno), Number(mese), 0).getDate()

    return {
      from: `${anno}-${mese}-01`,
      to: `${anno}-${mese}-${String(lastDay).padStart(2, "0")}`,
    }
  }, [dataA?.anno, dataA?.mese])

  function toDateRome(isoString) {
    if (!isoString) return null

    const d = new Date(isoString)
    const parts = new Intl.DateTimeFormat("en-CA", {
      timeZone: "Europe/Rome",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).formatToParts(d)

    const y = parts.find((p) => p.type === "year")?.value
    const m = parts.find((p) => p.type === "month")?.value
    const day = parts.find((p) => p.type === "day")?.value

    return `${y}-${m}-${day}` // YYYY-MM-DD
  }

  function addDays(yyyy_mm_dd, days) {
    const [y, m, d] = yyyy_mm_dd.split("-").map(Number)
    const dt = new Date(Date.UTC(y, m - 1, d))
    dt.setUTCDate(dt.getUTCDate() + days)
    const yy = dt.getUTCFullYear()
    const mm = String(dt.getUTCMonth() + 1).padStart(2, "0")
    const dd = String(dt.getUTCDate()).padStart(2, "0")
    return `${yy}-${mm}-${dd}`
  }

  function dateRange(from, to) {
    const out = []
    let cur = from
    while (cur <= to) {
      out.push(cur)
      cur = addDays(cur, 1)
    }
    return out
  }

  function countByDay(rows, dateField) {
    return (rows ?? []).reduce((acc, x) => {
      const giorno = toDateRome(x?.[dateField])
      if (!giorno) return acc
      acc[giorno] = (acc[giorno] || 0) + 1
      return acc
    }, {})
  }

  useEffect(() => {
    if (!from || !to) return

    let ignore = false

    ;(async () => {
      setLoading(true)

      const params = new URLSearchParams({ from, to })

      const [resDem, resRit] = await Promise.all([
        fetch(`/api/analisiDemolizioni?${params.toString()}`, { cache: "no-store" }),
        fetch(`/api/analisiRitiri?${params.toString()}`, { cache: "no-store" }),
      ])

      const [jsonDem, jsonRit] = await Promise.all([resDem.json(), resRit.json()])

      if (!resDem.ok) console.error("ERRORE analisiDemolizioni:", jsonDem)
      if (!resRit.ok) console.error("ERRORE analisiRitiri:", jsonRit)

      const demolizioniCounts = countByDay(jsonDem?.data ?? [], "created_at_certificato_demolizione")
      const ritiriCounts = countByDay(jsonRit?.data ?? [], "created_at_veicolo_ritirato")

      const rows = dateRange(from, to).map((giorno) => ({
        giorno,
        demolizioni: demolizioniCounts[giorno] || 0,
        ritiri: ritiriCounts[giorno] || 0,
      }))

      const totaleDemolizioni = rows.reduce((acc, r) => acc + (r.demolizioni || 0), 0)
      const totaleRitiri = rows.reduce((acc, r) => acc + (r.ritiri || 0), 0)

      setTotaleDemolizioni(totaleDemolizioni)
      setTotaleRitiri(totaleRitiri)

      if (!ignore) {
        setChartRows(rows)
        setLoading(false)
      }
    })()

    return () => {
      ignore = true
    }
  }, [from, to])

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-light">Pratiche Inserite: <span className="text-brand font-bold">{totaleRitiri}</span> Demolizioni Effettuate: <span className="text-brand font-bold">{totaleDemolizioni}</span></CardTitle>
        <CardDescription>
          {dataA?.mese && dataA?.anno ? `${dataA.mese}/${dataA.anno}` : "Seleziona mese/anno"}
        </CardDescription>
        <CardDescription className="text-[0.7rem]">
          {loading ? "Caricamento..." : "Dati aggiornati"}
        </CardDescription>
      </CardHeader>
      
      {loading ? 
      <CardContent className="h-full">
        "Caricamento Dati"
      </CardContent> :
      <CardContent>
        <ChartContainer config={chartConfig}>
          <LineChart
            accessibilityLayer
            data={chartRows}
            margin={{ left: 12, right: 12 }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="giorno"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => value.slice(8, 10)}
            />
            <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />

            <Line
              dataKey="demolizioni"
              type="monotone"
              stroke="var(--color-demolizioni)"
              strokeWidth={2}
              dot={false}
            />
            <Line
              dataKey="ritiri"
              type="monotone"
              stroke="var(--color-ritiri)"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
      }

      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="text-muted-foreground leading-none">
          Ritiri e Demolizioni Effettuate
        </div>
      </CardFooter>
    </Card>
  )
}
