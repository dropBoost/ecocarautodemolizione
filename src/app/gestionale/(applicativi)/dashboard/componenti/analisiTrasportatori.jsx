"use client"

import { Bar, BarChart, CartesianGrid, LabelList, XAxis, YAxis } from "recharts"
import { useEffect, useMemo, useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

export const description = "Trasporti per autista (mese selezionato)"

const chartConfig = {
  trasportatore: {
    label: "Trasportatore",
    color: "#222222",
  },
  trasporti: {
    label: "Trasporti",
    color: "#95c11f",
  },
}

export function AnalisiTrasportatori({ dataA, setCaricamentoDati }) {
  const [chartRows, setChartRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [totaleTrasporti, setTotaleTrasporti] = useState(0)

  // dataA = { mese:"02", anno:"2026" }
  const { from, to } = useMemo(() => {
    const anno = dataA?.anno || ""
    const mese = dataA?.mese || ""

    if (!anno || !mese) return { from: "", to: "" }

    // ultimo giorno del mese (corretto)
    const lastDay = new Date(Number(anno), Number(mese), 0).getDate()

    return {
      from: `${anno}-${mese}-01`,
      to: `${anno}-${mese}-${String(lastDay).padStart(2, "0")}`,
    }
  }, [dataA?.anno, dataA?.mese])

  useEffect(() => {
    if (!from || !to) return

    let ignore = false

    ;(async () => {
      setLoading(true)
      setCaricamentoDati?.(true)

      try {
        const params = new URLSearchParams({ from, to })
        const res = await fetch(`/api/analisiTrasportatori?${params.toString()}`, { cache: "no-store" })
        const json = await res.json()

        if (!res.ok) {
          console.error("ERRORE Trasportatori:", json)
          if (!ignore) {
            setChartRows([])
            setTotaleTrasporti(0)
            setLoading(false)
            setCaricamentoDati?.(false)
          }
          return
        }

        const data = json?.data ?? []

        // ✅ totale trasporti nel range (numero record)
        const totale = data.length

        // ✅ raggruppa per autista/trasportatore
        const grouped = data.reduce((acc, row) => {
          const a = row?.uuid_autista_ctv
          if (!a) return acc

          const key = a.uuid_autista_ctv || `${a.nome_autista}-${a.cognome_autista}`

          if (!acc[key]) {
            acc[key] = {
              trasportatore: `${a.nome_autista ?? ""} ${a.cognome_autista ?? ""}`.trim() || "Senza nome",
              trasporti: 0,
            }
          }

          acc[key].trasporti += 1
          return acc
        }, {})

        // ✅ trasforma in array + ordina (più trasporti sopra)
        const rows = Object.values(grouped).sort((a, b) => b.trasporti - a.trasporti)

        if (!ignore) {
          setChartRows(rows)
          setTotaleTrasporti(totale)
          setLoading(false)
          setCaricamentoDati?.(false)
        }
      } catch (e) {
        console.error(e)
        if (!ignore) {
          setChartRows([])
          setTotaleTrasporti(0)
          setLoading(false)
          setCaricamentoDati?.(false)
        }
      }
    })()

    return () => {
      ignore = true
    }
  }, [from, to, setCaricamentoDati])

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-light">
          Trasporti: <span className="text-brand font-bold">{totaleTrasporti}</span>
        </CardTitle>

        <CardDescription>
          {dataA?.mese && dataA?.anno ? `${dataA.mese}/${dataA.anno}` : "Seleziona mese/anno"}
        </CardDescription>

        <CardDescription className="text-[0.7rem]">
          {loading ? "Caricamento..." : "Dati aggiornati"}
        </CardDescription>
      </CardHeader>

      {loading ? (
        <CardContent className="h-full">Caricamento dati...</CardContent>
      ) : (
        <CardContent>
          <ChartContainer config={chartConfig}>
            <BarChart accessibilityLayer data={chartRows} layout="vertical" margin={{ right: 16 }}>
              <CartesianGrid horizontal={false} />

              {/* Nomi trasportatori (nascosto, li mostriamo con LabelList se vuoi) */}
              <YAxis
                dataKey="trasportatore"
                type="category"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
                hide
                tickFormatter={(value) => String(value ?? "").slice(0, 30)}
              />

              <XAxis dataKey="trasporti" type="number" hide />

              <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="line" />} />

              <Bar dataKey="trasporti" layout="vertical" fill="var(--color-trasporti)" radius={4}>


                {/* Numero trasporti a destra */}
                <LabelList
                  dataKey="trasporti"
                  position="right"
                  offset={8}
                  className="fill-foreground"
                  fontSize={12}
                />
              </Bar>
            </BarChart>
          </ChartContainer>
        </CardContent>
      )}

      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="text-muted-foreground leading-none">Classifica trasportatori</div>
      </CardFooter>
    </Card>
  )
}
