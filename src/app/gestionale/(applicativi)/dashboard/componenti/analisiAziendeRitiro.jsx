"use client"

import { Bar, BarChart, CartesianGrid, LabelList, XAxis, YAxis } from "recharts"
import { useEffect, useMemo, useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

export const description = "A line chart"

const chartConfig = {
  azienda: {
    label: "Azienda",
    color: "#222222",
  },
  ritiri: {
    label: "Ritiri",
    color: "#95c11f",
  },
  label: {
    color: "#222222",
  },
}


export function AnalisiAziendaRitiro({ dataA, setCaricamentoDati }) {

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


  useEffect(() => {
    if (!from || !to) return

    let ignore = false

    ;(async () => {
      setLoading(true)

      try {
        const params = new URLSearchParams({ from, to })
        const res = await fetch(`/api/analisiAziendeRitiro?${params.toString()}`, { cache: "no-store" })
        const json = await res.json()

        if (!res.ok) {
          console.error("ERRORE AziendeRitiro:", json)
          if (!ignore) {
            setChartRows([])
            setTotaleRitiri(0)
            setLoading(false)
          }
          return
        }

        const data = json?.data ?? []

        // ✅ Totale ritiri nel range (numero record)
        const totale = data.length

        // ✅ Raggruppa per azienda
        const grouped = data.reduce((acc, row) => {
          const az = row.uuid_azienda_ritiro_veicoli
          if (!az) return acc

          const key = az.uuid_azienda_ritiro_veicoli || az.ragione_sociale_arv // fallback

          if (!acc[key]) {
            acc[key] = {
              azienda: az.ragione_sociale_arv,
              citta: az.citta_operativa_arv,
              provincia: az.provincia_operativa_arv,
              ritiri: 0,
            }
          }

          acc[key].ritiri += 1
          return acc
        }, {})

        // ✅ Trasforma in array + ordina (più ritiri sopra)
        const rows = Object.values(grouped).sort((a, b) => b.ritiri - a.ritiri)

        if (!ignore) {
          setChartRows(rows)
          setTotaleRitiri(totale)
          setLoading(false)
        }
      } catch (e) {
        console.error(e)
        if (!ignore) {
          setChartRows([])
          setTotaleRitiri(0)
          setLoading(false)
        }
      }
    })()

    return () => {
      ignore = true
    }
  }, [from, to])
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-light">Pratiche Approvate: <span className="text-brand font-bold">{totaleRitiri}</span></CardTitle>
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
          <BarChart
            accessibilityLayer
            data={chartRows}
            layout="vertical"
            margin={{ right: 16 }}
          >
            <CartesianGrid horizontal={false} />

            <YAxis
              dataKey="azienda"
              type="category"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              hide
              tickFormatter={(value) => String(value ?? "").slice(0, 30)}
            />

            <XAxis dataKey="ritiri" type="number" hide />

            <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="line" />} />

            <Bar
              dataKey="ritiri"
              layout="vertical"
              fill="var(--color-ritiri)"
              radius={4}
            >
              <LabelList
                dataKey="ritiri"
                position="right"
                offset={8}
                className="fill-foreground"
                fontSize={12}
              />
            </Bar>
          </BarChart>
        </ChartContainer>
      </CardContent>
      }

      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="text-muted-foreground leading-none">
          Classifica Aziende Ritiro
        </div>
      </CardFooter>
    </Card>
  )
}
