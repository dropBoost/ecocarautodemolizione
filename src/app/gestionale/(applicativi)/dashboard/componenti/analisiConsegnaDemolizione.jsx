"use client";

import { TrendingDown, TrendingUp } from "lucide-react";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { useEffect, useState } from "react";

export const description = "An area chart with icons";

const chartConfig = {
  giorni: {
    label: "Ritiri",
    color: "var(--chart-1)",
    icon: TrendingDown,
  },
  totale: {
    label: "Demolizioni",
    color: "#95c11f",
    icon: TrendingUp,
  },
};

function toDateOnly(isoString) {
  if (!isoString) return null;
  return isoString.split("T")[0]; // YYYY-MM-DD
}
function toDateRome(isoString) {
  if (!isoString) return null;

  const d = new Date(isoString);
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Rome",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(d);

  const y = parts.find(p => p.type === "year")?.value;
  const m = parts.find(p => p.type === "month")?.value;
  const day = parts.find(p => p.type === "day")?.value;

  return `${y}-${m}-${day}`; // YYYY-MM-DD
}
function addDays(yyyy_mm_dd, days) {
  const [y, m, d] = yyyy_mm_dd.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  dt.setUTCDate(dt.getUTCDate() + days);
  const yy = dt.getUTCFullYear();
  const mm = String(dt.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(dt.getUTCDate()).padStart(2, "0");
  return `${yy}-${mm}-${dd}`;
}

function dateRange(from, to) {
  const out = [];
  let cur = from;
  while (cur <= to) {
    out.push(cur);
    cur = addDays(cur, 1);
  }
  return out;
}

function countByDay(rows, dateField) {
  return (rows ?? []).reduce((acc, x) => {
    const giorno = toDateRome(x?.[dateField]); // ✅ Roma
    if (!giorno) return acc;
    acc[giorno] = (acc[giorno] || 0) + 1;
    return acc;
  }, {});
}

export default function AnalisiConsegnaDemolizione() {
  const [chartRows, setChartRows] = useState([]);
  const [loading, setLoading] = useState(true);

  // TODO: rendili dinamici
  const from = "2026-01-01";
  const to = "2026-01-31";

  useEffect(() => {
    (async () => {
      setLoading(true);

      const params = new URLSearchParams({ from, to });

      const [resDem, resRit] = await Promise.all([
        fetch(`/api/analisiDemolizioni?${params.toString()}`, { cache: "no-store" }),
        fetch(`/api/analisiRitiri?${params.toString()}`, { cache: "no-store" }),
      ]);

      const [jsonDem, jsonRit] = await Promise.all([resDem.json(), resRit.json()]);

      if (!resDem.ok) console.error("ERRORE analisiDemolizioni:", jsonDem);
      if (!resRit.ok) console.error("ERRORE analisiRitiri:", jsonRit);

      // ✅ conta per giorno
      const demolizioniCounts = countByDay(
        jsonDem?.data ?? [],
        "created_at_certificato_demolizione"
      );

      // ⚠️ cambia il campo se nei ritiri la data si chiama diversamente
      const ritiriCounts = countByDay(
        jsonRit?.data ?? [],
        "created_at_veicolo_ritirato"
      );

      // ✅ range continuo con 0 sui giorni mancanti
      const rows = dateRange(from, to).map((giorno) => ({
        giorno,
        totale: demolizioniCounts[giorno] || 0, // 👈 "totale" = demolizioni (Area dataKey="totale")
        giorni: ritiriCounts[giorno] || 0,      // 👈 "giorni" = ritiri (Area dataKey="giorni")
      }));

      setChartRows(rows);
      setLoading(false);
    })();
  }, [from, to]);
  console.log(chartRows)
  return (
    <Card>
      <CardHeader>
        <CardTitle>RITIRI / DEMOLIZIONI</CardTitle>
        <CardDescription>
          {loading ? "Caricamento..." : "Dati aggiornati"}
        </CardDescription>
      </CardHeader>

      <CardContent>
        <ChartContainer config={chartConfig}>
          <AreaChart
            accessibilityLayer
            data={chartRows}
            margin={{
              left: 12,
              right: 12,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="giorno"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => value.slice(8, 10)}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="line" />}
            />

            {/* 🔥 NON CAMBIO la tua grafica: stessi Area, stessi dataKey.
                Sistemiamo solo le variabili colore per farle funzionare con shadcn */}
            <Area
              dataKey="giorni"
              type="natural"
              fill="var(--color-giorni)"
              fillOpacity={0.4}
              stroke="var(--color-giorni)"
              stackId="a"
            />
            <Area
              dataKey="totale"
              type="natural"
              fill="var(--color-totale)"
              fillOpacity={0.4}
              stroke="var(--color-totale)"
              stackId="a"
            />

            <ChartLegend content={<ChartLegendContent />} />
          </AreaChart>
        </ChartContainer>
      </CardContent>

      <CardFooter>
        <div className="flex w-full items-start gap-2 text-sm">
          <div className="grid gap-2">
            <div className="flex items-center gap-2 leading-none font-medium">
              {loading ? "Loading..." : "OK"} <TrendingUp className="h-4 w-4" />
            </div>
            <div className="text-muted-foreground flex items-center gap-2 leading-none">
              {from} - {to}
            </div>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}
